"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  createSoundEngine,
  type Effect,
  playEffect,
  setSoundPref,
  type SoundEngine,
  soundPrefs,
  subscribeToSoundPrefs,
} from "@/lib/som";

interface Props {
  labels: { effects: string; music: string };
}

const SPEAKER = ["..#....", ".##..#.", "###...#", "###.#.#", "###...#", ".##..#.", "..#...."];
const NOTE = ["..#####", "..#...#", "..#...#", "..#...#", "###.###", "###.###", "......."];

function Icon({ rows }: { rows: string[] }) {
  return (
    <svg viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
      )}
    </svg>
  );
}

/* Cliques em coisas do jogo e o som de cada uma. */
const CLICK_SOUNDS: [string, Effect][] = [
  [".start", "moeda"],
  [".btns .btn", "moeda"],
  [".map a", "seleciona"],
  [".cart", "seleciona"],
  [".slot", "equipa"],
];

/*
 * Efeitos sonoros e música na HUD, cada um com o seu botão, ligados por padrão.
 * O som começa no primeiro clique, toque ou tecla na página (lib/som.ts).
 */
export function SoundButtons({ labels }: Props) {
  const prefs = useSyncExternalStore(subscribeToSoundPrefs, soundPrefs, () => "11");
  const effects = prefs[0] === "1";
  const music = prefs[1] === "1";
  const engine = useRef<SoundEngine | null>(null);

  useEffect(() => {
    const saved = soundPrefs();
    const sound = createSoundEngine({ effects: saved[0] === "1", music: saved[1] === "1" });
    engine.current = sound;
    function onClick(event: MouseEvent) {
      const target = event.target as Element;
      const match = CLICK_SOUNDS.find(([selector]) => target.closest?.(selector));
      if (match) playEffect(match[1]);
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      sound.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => engine.current?.setEffects(effects), [effects]);
  useEffect(() => engine.current?.setMusic(music), [music]);

  return (
    <>
      <button
        type="button"
        className="som-btn"
        aria-pressed={effects}
        aria-label={labels.effects}
        title={labels.effects}
        onClick={() => setSoundPref("effects", !effects)}
      >
        <Icon rows={SPEAKER} />
      </button>
      <button
        type="button"
        className="som-btn"
        aria-pressed={music}
        aria-label={labels.music}
        title={labels.music}
        onClick={() => setSoundPref("music", !music)}
      >
        <Icon rows={NOTE} />
      </button>
    </>
  );
}
