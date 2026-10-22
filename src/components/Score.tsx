"use client";

import { useEffect, useRef } from "react";

/** Disparado pela cena quando o bot pisa num bug. */
export const BUG_EVENT = "bug-pisado";
const BUG_POINTS = 100;

/*
 * Placar da HUD: um bug a cada 9 px rolados, sem nunca descer, mais 100 por bug
 * que o bot pisa (Scene). Até 9999. O número pula quando ganha os 100.
 */
export function Score() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let max = 0;
    let bonus = 0;
    const show = () => {
      if (ref.current) ref.current.textContent = String(Math.min(9999, max + bonus)).padStart(4, "0");
    };
    function onScroll() {
      const bugs = Math.floor(window.scrollY / 9);
      if (bugs > max) {
        max = bugs;
        show();
      }
    }
    function onBug() {
      bonus += BUG_POINTS;
      show();
      const score = ref.current;
      if (!score) return;
      score.classList.remove("pulsa");
      void score.offsetWidth;
      score.classList.add("pulsa");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(BUG_EVENT, onBug);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(BUG_EVENT, onBug);
    };
  }, []);

  return (
    <span ref={ref} className="pontos" data-testid="score">
      0000
    </span>
  );
}
