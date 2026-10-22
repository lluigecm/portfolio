"use client";

import { useEffect, useRef } from "react";

/* Placar da HUD: um bug a cada 9 px rolados, sem nunca descer (até 9999). */
export function Score() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let max = 0;
    function onScroll() {
      const bugs = Math.min(9999, Math.floor(window.scrollY / 9));
      if (bugs > max && ref.current) {
        max = bugs;
        ref.current.textContent = String(bugs).padStart(4, "0");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <span ref={ref} data-testid="score">
      0000
    </span>
  );
}
