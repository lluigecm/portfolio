import type { CSSProperties } from "react";
import { type Circle, circles, type Grid, isEdge, paint, random, sway } from "@/lib/pixels";
import { Pixels } from "./Pixels";

/*
 * Moitas na frente dos morros: contorno escuro, luz no alto à esquerda, sombra
 * na base, textura de folhas e algumas flores. Cada moita tem dois quadros
 * (o de cima com o topo um pixel para o lado) que se alternam, como se o
 * vento balançasse; globals.css faz a troca, cada uma no seu tempo.
 */
const COLORS = {
  k: "#1a1a2e",
  g: "var(--bush)",
  l: "var(--bush-light)",
  d: "var(--bush-dark)",
  f: "var(--pink)",
  y: "var(--yellow)",
};

type Flower = [x: number, y: number, color: "f" | "y"];

function bush(width: number, height: number, list: Circle[], flowers: Flower[], seed: number): [Grid, Grid] {
  const shape = circles(width, height, list);
  const next = random(seed);
  // Cada pixel pertence ao círculo em que está mais para dentro.
  const owner = (x: number, y: number) => {
    let best: { c: Circle; depth: number } | null = null;
    for (const c of list) {
      const depth = c.r - Math.hypot(x + 0.5 - c.x, y + 0.5 - c.y);
      if (depth >= 0 && (!best || depth > best.depth)) best = { c, depth };
    }
    return best?.c;
  };

  const art = paint(shape, (x, y) => {
    if (isEdge(shape, x, y)) return "k";
    const c = owner(x, y);
    if (!c) return "g";
    const dx = x + 0.5 - c.x;
    const dy = y + 0.5 - c.y;
    // Brilho redondo no alto à esquerda de cada tufo, sombra na metade de baixo.
    if (Math.hypot(dx + c.r * 0.38, dy + c.r * 0.38) <= c.r * 0.42) return "l";
    if (dy > c.r * 0.4 || y >= height - 2) return next() < 0.15 ? "g" : "d";
    return next() < 0.07 ? "d" : "g";
  });
  const flowered = art.map((row, y) =>
    [...row].map((ch, x) => flowers.find(([fx, fy]) => fx === x && fy === y)?.[2] ?? ch).join(""),
  );
  return [flowered, sway(flowered, Math.floor(height * 0.45))];
}

// Uma faixa de 150 × 16 pixels (600 × 64 px), repetida lado a lado.
const BUSHES = [
  { x: 3, ...shape(24, 13, [{ x: 6.5, y: 8.5, r: 5 }, { x: 12, y: 6.5, r: 6 }, { x: 17.5, y: 8.5, r: 5 }], [[11, 4, "f"], [17, 6, "y"]], 3) },
  { x: 38, ...shape(15, 9, [{ x: 5, y: 5.5, r: 4 }, { x: 10, y: 5, r: 4.3 }], [], 7) },
  {
    x: 66,
    ...shape(
      32,
      15,
      [
        { x: 7, y: 10, r: 5 },
        { x: 13.5, y: 7.5, r: 7 },
        { x: 21, y: 8, r: 6.5 },
        { x: 26.5, y: 10.5, r: 4.5 },
      ],
      [[12, 4, "y"], [20, 5, "f"], [25, 8, "y"]],
      11,
    ),
  },
  { x: 108, ...shape(13, 8, [{ x: 6.5, y: 4.8, r: 4.5 }], [], 17) },
  { x: 127, ...shape(20, 11, [{ x: 6, y: 7, r: 4.6 }, { x: 11.5, y: 5.6, r: 5.3 }, { x: 15, y: 7.5, r: 4.2 }], [[10, 3, "f"]], 23) },
];

function shape(width: number, height: number, list: Circle[], flowers: Flower[], seed: number) {
  const [a, b] = bush(width, height, list, flowers, seed);
  return { a, b, y: 16 - height, delay: -(seed % 7) * 0.23 };
}

export function BushStrip() {
  return (
    <svg viewBox="0 0 150 16" shapeRendering="crispEdges">
      {BUSHES.map(({ x, y, a, b, delay }) => (
        <g key={x} className="bush" style={{ animationDelay: `${delay}s` } as CSSProperties}>
          <Pixels className="f1" grid={a} colors={COLORS} x={x} y={y} />
          <Pixels className="f2" grid={b} colors={COLORS} x={x} y={y} />
        </g>
      ))}
    </svg>
  );
}
