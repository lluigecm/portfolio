"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { playEffect } from "@/lib/som";
import type { LevelId } from "@/types/content";
import { BushStrip } from "./Bushes";
import { HillStrip } from "./Hills";
import { BUG_EVENT } from "./Score";

/* Bot de 16 × 16 pixels (4 px cada), desenhado com box-shadow em dois quadros de passo. */
const COLORS: Record<string, string> = {
  k: "#1a1a2e",
  t: "var(--teal)",
  y: "var(--yellow)",
  w: "#ffffff",
  p: "var(--pink)",
};

const FRAME_A = [
  ".......kk.......",
  ".......ky.......",
  "......kkkk......",
  "....kkttttkk....",
  "...kttttttttk...",
  "...ktwwkkwwtk...",
  "...ktwkkkkwtk...",
  "...kttttttttk...",
  "...ktkpkkpktk...",
  "....kkttttkk....",
  "..kkkttttttkkk..",
  ".kt.kttttttk.tk.",
  ".kk.kttttttk.kk.",
  "....kttttttk....",
  "....kkk..kkk....",
  "....kkk..kkk....",
];

const FRAME_B = [...FRAME_A.slice(0, 13), "....kttttttk....", "...kkk....kkk...", "..kkk......kkk.."];

function shadow(frame: string[], colors = COLORS) {
  return frame
    .flatMap((row, r) =>
      [...row].map((ch, c) => (ch === "." ? null : `${c * 4}px ${r * 4}px 0 ${colors[ch]}`)),
    )
    .filter(Boolean)
    .join(",");
}

const SHADOW_A = shadow(FRAME_A);
const SHADOW_B = shadow(FRAME_B);

/* Bug, o inimigo do placar: 13 × 10 pixels, dois quadros de passo e achatado. */
const BUG_COLORS: Record<string, string> = { k: "#1a1a2e", r: "var(--red)", d: "#b3263a", w: "#fff", h: "#ff9a9a" };
const BUG_A = shadow(
  [
    "..k.......k..",
    "...k.....k...",
    "....kkkkk....",
    "...kwkkkwk...",
    "..kkkkkkkkk..",
    "k.krhrkrrrk.k",
    ".kkrrrkrrrkk.",
    "..krrdkdrrk..",
    ".kkrrrkrrrkk.",
    "k..kkkkkkk..k",
  ],
  BUG_COLORS,
);
const BUG_B = shadow(
  [
    "...k.....k...",
    "...k.....k...",
    "....kkkkk....",
    "...kwkkkwk...",
    "..kkkkkkkkk..",
    ".kkrhrkrrrkk.",
    "k.krrrkrrrk.k",
    "..krrdkdrrk..",
    "k.krrrkrrrk.k",
    ".k.kkkkkkk.k.",
  ],
  BUG_COLORS,
);
const BUG_FLAT = shadow(
  [".............", ".............", ".............", ".............", ".............", ".............",
    "..kkkkkkkkk..", ".kkwkkkkkwkk.", "kkrrrrkrrrrkk", "kkkkkkkkkkkkk"],
  BUG_COLORS,
);
/** Px rolados para baixo entre um bug e outro, velocidade dele e o tempo do pulo até o pisão. */
const BUG_EVERY = 1800;
const BUG_SPEED = 150;
const STOMP_MS = 540;
/** Distância até o bot em que ele pula: o bug anda isso até o pouso. */
const STOMP_LEAD = (BUG_SPEED * STOMP_MS) / 1000;

/** Faixas de morros e de moitas lado a lado: cobrem telas de até 3000 px mesmo deslocadas. */
const STRIPS = 6;
const STRIP_WIDTH = 600;

const CONFETTI = 72;
const CONFETTI_COLORS = ["var(--yellow)", "var(--pink)", "var(--teal)", "#fff", "var(--grass)"];

/* Explosão de confete em pixels no centro da tela; some sozinha. */
function burst() {
  const box = document.createElement("div");
  box.className = "confete";
  box.setAttribute("aria-hidden", "true");
  const width = Math.min(window.innerWidth, 1100);
  for (let i = 0; i < CONFETTI; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const speed = 0.45 + Math.random() * 0.55;
    const bit = document.createElement("i");
    bit.style.setProperty("--dx", `${Math.round(Math.cos(angle) * speed * width * 0.55)}px`);
    bit.style.setProperty("--dy", `${Math.round(Math.sin(angle) * speed * window.innerHeight * 0.45)}px`);
    bit.style.setProperty("--d", `${(Math.random() * 0.25).toFixed(2)}s`);
    bit.style.setProperty("--f", `${(0.18 + Math.random() * 0.2).toFixed(2)}s`);
    bit.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    if (i % 3 === 0) bit.className = "g";
    box.append(bit);
  }
  document.body.append(box);
  return box;
}

/*
 * Chão fixo no rodapé da tela. Rolar a página faz o bot andar (dois quadros,
 * virando para trás quando a rolagem sobe), os morros e as moitas correrem em
 * velocidades diferentes, e cada fase que entra na tela ganha uma fala do bot e
 * enche as suas barras de status. Passar o mouse (ou o foco) num card com
 * data-fala também faz o bot falar, e clicar nele faz ele pular. As setas ← e →
 * rolam a página como um controle.
 *
 * Entradas: cada bloco .entra anima quando chega na tela (globals.css). O que já
 * está na tela quando o JavaScript chega, e tudo na volta da troca de idioma,
 * fica pronto na hora, sem animação. A fase do chefe estoura um confete.
 *
 * Bugs: a cada tanto de rolagem para baixo, um bug entra pela direita e anda
 * até o bot (correndo junto com o chão quando a página rola); o bot pula e
 * pisa nele, e o placar ganha 100 (Score). Com movimento reduzido, sem bugs.
 */
export function Scene({ lines }: { lines: Record<LevelId, string> }) {
  const hillsRef = useRef<HTMLDivElement>(null);
  const bushesRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bugsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hills = hillsRef.current!;
    const bushes = bushesRef.current!;
    const ground = groundRef.current!;
    const walker = walkerRef.current!;
    const sprite = spriteRef.current!;
    const bubble = bubbleRef.current!;
    const bugs = bugsRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lastY = window.scrollY;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let acc = 0;

    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (reduce) return;
      // O bug corre junto com o chão, mas uma rolagem rápida não o passa por baixo do bot.
      if (bug && !bug.stomped) bug.x = Math.max(walker.offsetLeft + STOMP_LEAD, bug.x - dy * 0.6);
      if (dy > 0) {
        bugTravel += dy;
        if (bugTravel > BUG_EVERY && !bug) {
          bugTravel = 0;
          spawnBug();
        }
      }
      hills.style.transform = `translateX(${-((y * 0.25) % STRIP_WIDTH)}px)`;
      bushes.style.transform = `translateX(${-((y * 0.45) % STRIP_WIDTH)}px)`;
      ground.style.backgroundPosition = `0 0,${-(y * 0.6)}px 0`;
      walker.classList.toggle("flip", dy < 0);
      walker.classList.remove("idle");
      acc += Math.abs(dy);
      if (acc > 28) {
        acc = 0;
        frame ^= 1;
        sprite.style.boxShadow = frame ? SHADOW_B : SHADOW_A;
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        walker.classList.add("idle");
        sprite.style.boxShadow = SHADOW_A;
      }, 160);
    }

    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    function say(line: string) {
      // A fala se digita (globals.css): um elemento novo recomeça a animação.
      const fala = document.createElement("span");
      fala.className = "fala";
      fala.style.setProperty("--n", String(line.length));
      fala.textContent = line;
      bubble.replaceChildren(fala);
      playEffect("fala", line.length);
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
    }

    const back = document.documentElement.dataset.volta === "1";
    let confetti: HTMLElement | undefined;
    let confettiTimer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const line = lines[entry.target.id as LevelId];
          if (line) say(line);
          const boss = entry.target.id === "contato" && !entry.target.querySelector(".pronto");
          if (boss && !reduce && !confetti) {
            confetti = burst();
            playEffect("confete");
            confettiTimer = setTimeout(() => confetti?.remove(), 3500);
          }
          entry.target.classList.add("visto");
          // Só as barras de status (data-w); a do item equipado é do React e não pode ser apagada.
          entry.target.querySelectorAll<HTMLElement>(".bar i[data-w]").forEach((bar) => {
            bar.style.width = bar.dataset.w!;
          });
        }
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll(".level").forEach((level) => observer.observe(level));

    const entrance = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("entrou");
          entrance.unobserve(entry.target);
          playEffect("entra");
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".entra").forEach((block) => {
      const { top, bottom } = block.getBoundingClientRect();
      if (back || reduce || (top < window.innerHeight && bottom > 0)) block.classList.add("entrou", "pronto");
      else entrance.observe(block);
    });

    // Uma fala por card: só fala de novo depois de sair dele.
    let speaker: Element | null = null;
    function onPoint(event: Event) {
      const card = (event.target as Element).closest?.("[data-fala]") ?? null;
      if (card === speaker) return;
      speaker = card;
      if (card) say(card.getAttribute("data-fala")!);
    }

    let jumpTimer: ReturnType<typeof setTimeout> | undefined;
    function jump() {
      playEffect("pulo");
      sprite.classList.remove("jump");
      void sprite.offsetWidth;
      sprite.classList.add("jump");
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(() => sprite.classList.remove("jump"), 600);
    }
    function onJump() {
      if (reduce || sprite.classList.contains("jump")) return;
      jump();
    }

    let bugTravel = 0;
    let bug: { el: HTMLElement; px: HTMLElement; x: number; stomped: boolean } | null = null;
    let bugFrame = 0;
    let bugTimers: ReturnType<typeof setTimeout>[] = [];
    let lastTime = 0;
    function spawnBug() {
      const el = document.createElement("div");
      el.className = "bug";
      const px = document.createElement("span");
      px.className = "px";
      px.style.boxShadow = BUG_A;
      el.append(px);
      bugs.append(el);
      bug = { el, px, x: window.innerWidth + 20, stomped: false };
      lastTime = performance.now();
      bugFrame = requestAnimationFrame(walkBug);
    }
    function walkBug(now: number) {
      if (!bug || bug.stomped) return;
      bug.x -= (BUG_SPEED * Math.min(50, now - lastTime)) / 1000;
      lastTime = now;
      bug.px.style.boxShadow = Math.floor(now / 120) % 2 ? BUG_B : BUG_A;
      bug.el.style.transform = `translateX(${Math.round(bug.x)}px)`;
      // Pula quando o bug está a um pulo de distância: pousa em cima dele.
      if (bug.x <= walker.offsetLeft + STOMP_LEAD) stomp(bug);
      else bugFrame = requestAnimationFrame(walkBug);
    }
    function stomp(target: NonNullable<typeof bug>) {
      jump();
      const land = performance.now() + STOMP_MS;
      // O bug segue andando até o bot pousar.
      const follow = (now: number) => {
        target.x -= (BUG_SPEED * Math.min(50, now - lastTime)) / 1000;
        lastTime = now;
        target.px.style.boxShadow = Math.floor(now / 120) % 2 ? BUG_B : BUG_A;
        target.el.style.transform = `translateX(${Math.round(target.x)}px)`;
        if (now < land) bugFrame = requestAnimationFrame(follow);
      };
      bugFrame = requestAnimationFrame(follow);
      target.stomped = true;
      bugTimers.push(
        setTimeout(() => {
          cancelAnimationFrame(bugFrame);
          target.px.style.boxShadow = BUG_FLAT;
          target.el.classList.add("achatado");
          const points = document.createElement("span");
          points.className = "mais";
          points.textContent = "+100";
          target.el.append(points);
          for (let i = 0; i < 8; i++) {
            const bit = document.createElement("i");
            bit.className = "caco";
            const angle = Math.PI * (0.1 + (0.8 * i) / 7);
            bit.style.setProperty("--dx", `${Math.round(Math.cos(angle) * 46)}px`);
            bit.style.setProperty("--dy", `${-Math.round(Math.sin(angle) * 52)}px`);
            bit.style.background = i % 2 ? "var(--red)" : "#1a1a2e";
            target.el.append(bit);
          }
          window.dispatchEvent(new Event(BUG_EVENT));
          playEffect("pisao");
        }, STOMP_MS),
        setTimeout(() => {
          target.el.remove();
          if (bug === target) bug = null;
        }, STOMP_MS + 900),
      );
    }

    function onKey(event: KeyboardEvent) {
      // O inventário usa as setas para trocar de item.
      if (event.defaultPrevented) return;
      if (event.key === "ArrowRight") window.scrollBy({ top: 120, behavior: "smooth" });
      if (event.key === "ArrowLeft") window.scrollBy({ top: -120, behavior: "smooth" });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("mouseover", onPoint);
    document.addEventListener("focusin", onPoint);
    walker.addEventListener("click", onJump);
    // Página pronta: o gráfico passa a esperar a fase aparecer para entrar, e os
    // testes sabem que as escutas acima já estão ativas.
    document.documentElement.classList.add("jogo");
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mouseover", onPoint);
      document.removeEventListener("focusin", onPoint);
      walker.removeEventListener("click", onJump);
      observer.disconnect();
      entrance.disconnect();
      confetti?.remove();
      clearTimeout(confettiTimer);
      clearTimeout(idleTimer);
      clearTimeout(bubbleTimer);
      clearTimeout(jumpTimer);
      cancelAnimationFrame(bugFrame);
      bugTimers.forEach(clearTimeout);
      bugTimers = [];
      bug?.el.remove();
    };
  }, [lines]);

  return (
    <>
      {/* Na abertura, o bot cai do céu por cima de tudo e pousa no lugar do de baixo. */}
      <div className="queda" aria-hidden="true">
        <span className="px" style={{ boxShadow: SHADOW_B }} />
      </div>
      <div className="scene" aria-hidden="true">
        <div className="hills" ref={hillsRef}>
          {Array.from({ length: STRIPS }, (_, i) => (
            <HillStrip key={i} />
          ))}
        </div>
        <div className="bushes" ref={bushesRef}>
          {Array.from({ length: STRIPS }, (_, i) => (
            <BushStrip key={i} />
          ))}
        </div>
        <div className="ground" ref={groundRef} />
        <div className="bichos" ref={bugsRef} />
        <div className="walker idle" ref={walkerRef} data-testid="walker">
          {/* O corpo recebe a aterrissagem da abertura; o sprite, o pulo. Separados, um não reinicia o outro. */}
          <span className="corpo">
            <span className="px" ref={spriteRef} style={{ boxShadow: SHADOW_A }} />
          </span>
        </div>
        <div className="poeira">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>
        <div className="bubble" ref={bubbleRef} data-testid="bubble" />
      </div>
    </>
  );
}
