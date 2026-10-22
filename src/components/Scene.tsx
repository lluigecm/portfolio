"use client";

import { useEffect, useRef } from "react";
import type { LevelId } from "@/types/content";
import { BushStrip } from "./Bushes";

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

function shadow(frame: string[]) {
  return frame
    .flatMap((row, r) =>
      [...row].map((ch, c) => (ch === "." ? null : `${c * 4}px ${r * 4}px 0 ${COLORS[ch]}`)),
    )
    .filter(Boolean)
    .join(",");
}

const SHADOW_A = shadow(FRAME_A);
const SHADOW_B = shadow(FRAME_B);

/** Morros em degraus; três cópias lado a lado para o paralaxe dar a volta. */
function Hills() {
  return (
    <svg viewBox="0 0 600 120" preserveAspectRatio="none" shapeRendering="crispEdges">
      <path fill="var(--hill)" d="M0 120V70h20V50h20V36h20V26h20V18h20V26h20V36h20V50h20V70h20V90h20V120Z" />
      <path fill="var(--hill2)" d="M200 120V80h30V60h30V46h30V40h30V46h30V60h30V80h30V120Z" />
      <path fill="var(--hill)" d="M430 120V74h20V54h20V40h20V32h20V40h20V54h20V74h20V120Z" />
      <rect fill="var(--hill)" x="0" y="100" width="600" height="20" />
    </svg>
  );
}

/** Faixas de moitas lado a lado: cobrem telas de até 3000 px mesmo deslocadas. */
const BUSH_STRIPS = 6;
const BUSH_STRIP_WIDTH = 600;

/*
 * Chão fixo no rodapé da tela. Rolar a página faz o bot andar (dois quadros,
 * virando para trás quando a rolagem sobe), os morros e as moitas correrem em
 * velocidades diferentes, e cada fase que entra na tela ganha uma fala do bot e
 * enche as suas barras de status. Passar o mouse (ou o foco) num card com
 * data-fala também faz o bot falar, e clicar nele faz ele pular. As setas ← e →
 * rolam a página como um controle.
 */
export function Scene({ lines }: { lines: Record<LevelId, string> }) {
  const hillsRef = useRef<HTMLDivElement>(null);
  const bushesRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hills = hillsRef.current!;
    const bushes = bushesRef.current!;
    const ground = groundRef.current!;
    const walker = walkerRef.current!;
    const sprite = spriteRef.current!;
    const bubble = bubbleRef.current!;
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
      hills.style.transform = `translateX(${-((y * 0.25) % (hills.offsetWidth / 3))}px)`;
      bushes.style.transform = `translateX(${-((y * 0.45) % BUSH_STRIP_WIDTH)}px)`;
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
      bubble.textContent = line;
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const line = lines[entry.target.id as LevelId];
          if (line) say(line);
          entry.target.querySelectorAll<HTMLElement>(".bar i").forEach((bar) => {
            bar.style.width = bar.dataset.w ?? "";
          });
        }
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll(".level").forEach((level) => observer.observe(level));

    // Uma fala por card: só fala de novo depois de sair dele.
    let speaker: Element | null = null;
    function onPoint(event: Event) {
      const card = (event.target as Element).closest?.("[data-fala]") ?? null;
      if (card === speaker) return;
      speaker = card;
      if (card) say(card.getAttribute("data-fala")!);
    }

    let jumpTimer: ReturnType<typeof setTimeout> | undefined;
    function onJump() {
      if (reduce || sprite.classList.contains("jump")) return;
      sprite.classList.add("jump");
      jumpTimer = setTimeout(() => sprite.classList.remove("jump"), 600);
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mouseover", onPoint);
      document.removeEventListener("focusin", onPoint);
      walker.removeEventListener("click", onJump);
      observer.disconnect();
      clearTimeout(idleTimer);
      clearTimeout(bubbleTimer);
      clearTimeout(jumpTimer);
    };
  }, [lines]);

  return (
    <div className="scene" aria-hidden="true">
      <div className="hills" ref={hillsRef}>
        <Hills />
        <Hills />
        <Hills />
      </div>
      <div className="bushes" ref={bushesRef}>
        {Array.from({ length: BUSH_STRIPS }, (_, i) => (
          <BushStrip key={i} />
        ))}
      </div>
      <div className="ground" ref={groundRef} />
      <div className="walker idle" ref={walkerRef} data-testid="walker">
        <span className="px" ref={spriteRef} style={{ boxShadow: SHADOW_A }} />
      </div>
      <div className="bubble" ref={bubbleRef} data-testid="bubble" />
    </div>
  );
}
