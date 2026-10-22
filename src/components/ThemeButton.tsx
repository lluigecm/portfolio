"use client";

import { useSyncExternalStore } from "react";
import { type Theme, currentTheme, setTheme, subscribeToTheme } from "@/lib/theme";

interface Props {
  labels: { toggle: string; toDay: string; toNight: string };
}

const SUN = ["...#...", ".#.#.#.", "..###..", "#######", "..###..", ".#.#.#.", "...#..."];
const MOON = ["..####.", ".###...", "###....", "###....", "###....", ".###...", "..####."];

function Icon({ rows, className }: { rows: string[]; className: string }) {
  return (
    <svg className={className} viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
      )}
    </svg>
  );
}

/*
 * Dia e noite na HUD. O ícone mostra o modo para o qual o botão leva (globals.css
 * escolhe qual, pelo tema em vigor), então aparece certo antes do JavaScript.
 */
export function ThemeButton({ labels }: Props) {
  const theme = useSyncExternalStore<Theme | null>(subscribeToTheme, currentTheme, () => null);
  const label = theme === null ? labels.toggle : theme === "dark" ? labels.toDay : labels.toNight;

  return (
    <button
      type="button"
      className="theme-btn"
      aria-label={label}
      title={label}
      onClick={() => setTheme(currentTheme() === "dark" ? "light" : "dark")}
    >
      <Icon rows={SUN} className="ico-sun" />
      <Icon rows={MOON} className="ico-moon" />
    </button>
  );
}
