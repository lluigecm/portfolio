/*
 * Som do site: a trilha do motion/ em loop e os efeitos do jogo, em Web Audio.
 * Os navegadores só liberam áudio depois de um gesto do visitante (clique,
 * toque ou tecla); até lá, nada toca. Efeitos e música ligam e desligam
 * separados, ligados por padrão, e a escolha fica salva no navegador.
 */

/* ---------- preferências ---------- */

const KEYS = { effects: "som-efeitos", music: "som-musica" } as const;
const PREFS_EVENT = "som-prefs";
export type SoundKind = keyof typeof KEYS;

function read(kind: SoundKind) {
  try {
    return localStorage.getItem(KEYS[kind]) !== "0";
  } catch {
    return true;
  }
}

/** "11": efeitos e música ligados (string, para o useSyncExternalStore comparar). */
export function soundPrefs() {
  return `${read("effects") ? 1 : 0}${read("music") ? 1 : 0}`;
}

export function setSoundPref(kind: SoundKind, on: boolean) {
  try {
    localStorage.setItem(KEYS[kind], on ? "1" : "0");
  } catch {
    // Armazenamento bloqueado: a escolha vale só para esta visita.
  }
  window.dispatchEvent(new Event(PREFS_EVENT));
}

export function subscribeToSoundPrefs(listener: () => void) {
  window.addEventListener(PREFS_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(PREFS_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/* ---------- efeitos pedidos pelo resto do site ---------- */

export type Effect =
  | "pulo"
  | "pisao"
  | "moeda"
  | "entra"
  | "confete"
  | "dia"
  | "noite"
  | "seleciona"
  | "equipa";

const EFFECT_EVENT = "som-efeito";

/** Pede um efeito; o motor (SoundButtons) toca se os efeitos estiverem ligados. */
export function playEffect(name: Effect) {
  window.dispatchEvent(new CustomEvent(EFFECT_EVENT, { detail: name }));
}

/* ---------- síntese ---------- */

const BPM = 150;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const STEP = BEAT / 4;
const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function midi(name: string) {
  const [, letter, accidental, octave] = /^([A-G])(#?)(\d)$/.exec(name)!;
  return 12 * (Number(octave) + 1) + NOTE[letter] + (accidental ? 1 : 0);
}
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/* Onda de pulso (a "quadrada" dos videogames de 8 bits) com a largura escolhida. */
const pulses = new WeakMap<BaseAudioContext, Map<number, PeriodicWave>>();
function pulse(ctx: BaseAudioContext, duty: number) {
  let cache = pulses.get(ctx);
  if (!cache) pulses.set(ctx, (cache = new Map()));
  let wave = cache.get(duty);
  if (!wave) {
    const n = 48;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      real[k] = (2 / (k * Math.PI)) * Math.sin(2 * Math.PI * k * duty);
      imag[k] = (2 / (k * Math.PI)) * (1 - Math.cos(2 * Math.PI * k * duty));
    }
    wave = ctx.createPeriodicWave(real, imag);
    cache.set(duty, wave);
  }
  return wave;
}

const noises = new WeakMap<BaseAudioContext, AudioBuffer>();
function noise(ctx: BaseAudioContext) {
  let buffer = noises.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 99;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x7fffffff) * 2 - 1;
    }
    noises.set(ctx, buffer);
  }
  return buffer;
}

interface Tone {
  wave: number | OscillatorType;
  volume: number;
  attack?: number;
  release?: number;
  /** Fração do volume que sobra até o fim da nota. */
  sustain?: number;
  slideTo?: number;
}

function tone(ctx: BaseAudioContext, out: AudioNode, t: number, duration: number, freq: number, o: Tone) {
  const osc = ctx.createOscillator();
  if (typeof o.wave === "number") osc.setPeriodicWave(pulse(ctx, o.wave));
  else osc.type = o.wave;
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + duration);
  const gain = ctx.createGain();
  const attack = o.attack ?? 0.004;
  const release = o.release ?? 0.04;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(o.volume, t + attack);
  gain.gain.linearRampToValueAtTime(o.volume * (o.sustain ?? 0.7), t + Math.max(attack, duration));
  gain.gain.linearRampToValueAtTime(0, t + duration + release);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + duration + release + 0.02);
}

function hiss(ctx: BaseAudioContext, out: AudioNode, t: number, duration: number, volume: number, filter: BiquadFilterType, freq: number) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const band = ctx.createBiquadFilter();
  band.type = filter;
  band.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(band).connect(gain).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + duration + 0.02);
}

/* ---------- a trilha: o tema principal do motion, 16 compassos em loop ---------- */
/*
 * Cada instrumento é uma voz só, com um oscilador para a música inteira e as
 * notas como automação de frequência e volume: a renderização custa por nó, e
 * assim são uns dez em vez de mais de mil.
 */

const CHORDS: Record<string, number[]> = { C: [48, 52, 55], G: [43, 47, 50], Am: [45, 48, 52], F: [41, 45, 48] };
const PROGRESSION = ["C", "G", "Am", "F", "C", "G", "F", "G", "Am", "F", "C", "G", "Am", "F", "G", "G"];
const MELODY = [
  "C5:2 E5:2 G5:2 C6:4 B5:2 G5:2 E5:2",
  "D5:2 G5:2 B5:4 A5:2 G5:2 D5:4",
  "E5:4 A5:2 C6:2 B5:2 A5:2 E5:4",
  "F5:2 A5:2 C6:4 D6:2 C6:2 A5:4",
  "G5:2 C6:2 E6:4 D6:2 C6:2 G5:4",
  "B5:2 D6:2 G6:4 E6:2 D6:2 B5:4",
  "A5:2 C6:2 F6:4 E6:2 C6:2 A5:2 C6:2",
  "D6:3 C6:1 B5:4 G5:8",
  "A5:6 G5:2 E5:4 C5:4",
  "F5:6 E5:2 F5:4 A5:4",
  "G5:6 E5:2 C6:4 E6:4",
  "D6:6 C6:2 B5:4 G5:4",
  "A5:4 C6:4 E6:4 D6:2 C6:2",
  "C6:4 A5:4 F5:4 A5:2 C6:2",
  "B5:4 D6:4 G6:6 F6:2",
  "E6:2 D6:2 B5:2 G5:2 D6:8",
];
const SONG = PROGRESSION.length * BAR;
/** Rabo do eco no fim, somado ao começo para o loop não ter emenda. */
const TAIL = 1.5;

/** Voz monofônica: cada nota ocupa o seu espaço e silencia antes da próxima. */
function voice(ctx: BaseAudioContext, out: AudioNode, wave: number | OscillatorType) {
  const osc = ctx.createOscillator();
  if (typeof wave === "number") osc.setPeriodicWave(pulse(ctx, wave));
  else osc.type = wave;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(out);
  osc.start(0);
  return (t: number, slot: number, freq: number, volume: number, sustain = 0.7, slideTo?: number) => {
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + slot * 0.8);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.004);
    gain.gain.linearRampToValueAtTime(volume * sustain, t + slot * 0.85);
    gain.gain.linearRampToValueAtTime(0, t + slot * 0.97);
  };
}

/** Batidas de ruído filtrado: cada uma decai até a próxima, no máximo em `decay`. */
function noiseHits(ctx: BaseAudioContext, source: AudioNode, out: AudioNode, filter: BiquadFilterType, freq: number) {
  const band = ctx.createBiquadFilter();
  band.type = filter;
  band.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(band).connect(gain).connect(out);
  const hits: [number, number][] = [];
  return {
    hit: (t: number, volume: number) => hits.push([t, volume]),
    schedule(decay: number) {
      hits.sort((a, b) => a[0] - b[0]);
      hits.forEach(([t, volume], i) => {
        const next = hits[i + 1]?.[0] ?? Infinity;
        gain.gain.setValueAtTime(volume, t);
        gain.gain.linearRampToValueAtTime(0, Math.min(t + decay, next - 0.002));
      });
    },
  };
}

export async function renderSong(sampleRate: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.ceil((SONG + TAIL) * sampleRate), sampleRate);
  const mix = ctx.createGain();
  mix.gain.value = 0.5;
  mix.connect(ctx.destination);
  // Eco no lead, como no vídeo.
  const leadBus = ctx.createGain();
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 3 * STEP;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  leadBus.connect(mix);
  leadBus.connect(echo).connect(feedback).connect(echo);
  feedback.connect(mix);

  const bass = voice(ctx, mix, "triangle");
  const arp = voice(ctx, mix, 0.125);
  const lead = voice(ctx, leadBus, 0.25);
  const kick = voice(ctx, mix, "sine");
  const snareTone = voice(ctx, mix, "triangle");
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noise(ctx);
  noiseSource.loop = true;
  noiseSource.start(0);
  const snare = noiseHits(ctx, noiseSource, mix, "bandpass", 2400);
  const hat = noiseHits(ctx, noiseSource, mix, "highpass", 7000);

  PROGRESSION.forEach((name, bar) => {
    const t0 = bar * BAR;
    const [root, third, fifth] = CHORDS[name];
    // Baixo em colcheias, oitavando.
    [0, 12, 0, 12, 0, 12, 7, 12].forEach((offset, i) => bass(t0 + i * 2 * STEP, 2 * STEP, hz(root + offset), 0.5, 0.85));
    // Arpejo em semicolcheias.
    const chord = [root + 12, third + 12, fifth + 12, root + 24];
    [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 3].forEach((k, i) => arp(t0 + i * STEP, STEP, hz(chord[k]), 0.07, 0.35));
    // Bateria: bumbo, caixa, chimbal e uma virada a cada quatro compassos.
    const fill = bar % 4 === 3;
    for (let i = 0; i < 16; i++) {
      const t = t0 + i * STEP;
      if (i === 0 || i === 8 || (bar % 2 === 1 && i === 10)) kick(t, 2 * STEP, 160, 0.9, 0.05, 42);
      if (i === 4 || i === 12) {
        snare.hit(t, 0.35);
        snareTone(t, STEP, 200, 0.3, 0.2, 140);
      }
      if (fill && i > 12) snare.hit(t, 0.35 * (0.5 + (i - 12) * 0.15));
      if (i % 2 === 0) hat.hit(t, 0.12 * (i % 4 ? 0.7 : 1));
    }
    // Melodia.
    let t = t0;
    for (const token of MELODY[bar].split(" ")) {
      const [note, steps] = token.split(":");
      const slot = Number(steps) * STEP;
      lead(t, slot, hz(midi(note)), 0.2, 0.62);
      t += slot;
    }
  });
  snare.schedule(0.15);
  hat.schedule(0.04);

  const rendered = await ctx.startRendering();
  // O rabo vai para o começo: o loop emenda sem clique nem corte de eco.
  const length = Math.round(SONG * sampleRate);
  const song = ctx.createBuffer(1, length, sampleRate);
  const data = rendered.getChannelData(0);
  const out = song.getChannelData(0);
  for (let i = 0; i < length; i++) out[i] = data[i] + (i + length < data.length ? data[i + length] : 0);
  return song;
}

/* ---------- efeitos ---------- */

function effect(ctx: AudioContext, out: AudioNode, name: Effect) {
  const t = ctx.currentTime + 0.01;
  const blip = (at: number, freq: number, volume = 0.08, duration = 0.04, wave = 0.5) =>
    tone(ctx, out, at, duration, freq, { wave, volume, attack: 0.002, sustain: 0.6, release: 0.02 });
  const coin = (at: number) => {
    blip(at, 987.8, 0.09, 0.07);
    tone(ctx, out, at + 0.07, 0.22, 1318.5, { wave: 0.5, volume: 0.09, attack: 0.002, sustain: 0.1, release: 0.08 });
  };
  const arpeggio = (notes: number[]) =>
    notes.forEach((m, i) => tone(ctx, out, t + i * 0.05, 0.08, hz(m), { wave: 0.125, volume: 0.06, sustain: 0.6, release: 0.08 }));

  switch (name) {
    case "pulo":
      tone(ctx, out, t, 0.15, 260, { wave: 0.25, volume: 0.12, sustain: 0.8, slideTo: 900 });
      break;
    case "pisao":
      tone(ctx, out, t, 0.12, 380, { wave: 0.5, volume: 0.16, sustain: 0.9, slideTo: 70 });
      hiss(ctx, out, t, 0.1, 0.2, "lowpass", 3000);
      coin(t + 0.12);
      break;
    case "moeda":
      coin(t);
      break;
    case "entra":
      tone(ctx, out, t, 0.06, 520, { wave: 0.25, volume: 0.05, sustain: 0.7, slideTo: 830 });
      break;
    case "confete":
      for (let i = 0; i < 10; i++) blip(t + i * 0.06 + Math.random() * 0.03, 1800 + Math.random() * 1600, 0.03, 0.03, 0.25);
      break;
    case "dia":
      arpeggio([84, 88, 91, 96, 100]);
      break;
    case "noite":
      arpeggio([100, 96, 91, 88, 84]);
      break;
    case "seleciona":
      blip(t, 660, 0.07);
      blip(t + 0.06, 990, 0.07);
      break;
    case "equipa":
      blip(t, 880, 0.06);
      blip(t + 0.05, 1320, 0.055);
      break;
  }
}

/* ---------- motor ---------- */

export interface SoundEngine {
  setEffects(on: boolean): void;
  setMusic(on: boolean): void;
  dispose(): void;
}

/*
 * Liga o motor: espera o primeiro gesto para criar o AudioContext, toca os
 * efeitos pedidos por playEffect e a trilha em loop. Em aba escondida, pausa.
 * Marca data-musica no <html> ("ligada" ou "desligada") depois do primeiro gesto.
 */
export function createSoundEngine(initial: { effects: boolean; music: boolean }): SoundEngine {
  let effectsOn = initial.effects;
  let musicOn = initial.music;
  let ctx: AudioContext | undefined;
  let fx: GainNode | undefined;
  let musicGain: GainNode | undefined;
  let loop: AudioBufferSourceNode | undefined;
  let song: Promise<AudioBuffer> | undefined;
  let lastEntrance = 0;
  let unlocked = false;
  const root = document.documentElement;

  function mark() {
    if (unlocked) root.dataset.musica = musicOn ? "ligada" : "desligada";
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      const Context =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      ctx = new Context();
      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
      fx = ctx.createGain();
      fx.connect(master);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(master);
      void ctx.resume();
    } catch {
      // Sem áudio no navegador: o site segue mudo.
      ctx = undefined;
    }
    mark();
    if (musicOn) startMusic();
  }

  function startMusic() {
    if (!ctx || !musicGain || loop) return;
    const context = ctx;
    const gain = musicGain;
    song ??= renderSong(context.sampleRate);
    song.then((buffer) => {
      if (!musicOn || loop || context !== ctx) return;
      loop = context.createBufferSource();
      loop.buffer = buffer;
      loop.loop = true;
      loop.connect(gain);
      loop.start();
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.32, context.currentTime + 1.2);
    }, () => {
      // Sem OfflineAudioContext: só os efeitos tocam.
    });
  }

  function stopMusic() {
    if (!ctx || !musicGain || !loop) return;
    const old = loop;
    loop = undefined;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    old.stop(ctx.currentTime + 0.35);
  }

  function onEffect(event: Event) {
    const name = (event as CustomEvent<Effect>).detail;
    if (!ctx || !fx || !effectsOn) return;
    // Várias entradas juntas soam como uma só.
    if (name === "entra") {
      if (ctx.currentTime - lastEntrance < 0.15) return;
      lastEntrance = ctx.currentTime;
    }
    effect(ctx, fx, name);
  }

  function onVisibility() {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  }

  const gestures = ["pointerdown", "keydown", "touchend"] as const;
  gestures.forEach((type) => window.addEventListener(type, unlock, { capture: true }));
  window.addEventListener(EFFECT_EVENT, onEffect);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setEffects(on) {
      effectsOn = on;
    },
    setMusic(on) {
      musicOn = on;
      mark();
      if (on) startMusic();
      else stopMusic();
    },
    dispose() {
      gestures.forEach((type) => window.removeEventListener(type, unlock, { capture: true }));
      window.removeEventListener(EFFECT_EVENT, onEffect);
      document.removeEventListener("visibilitychange", onVisibility);
      void ctx?.close();
      ctx = undefined;
      delete root.dataset.musica;
    },
  };
}
