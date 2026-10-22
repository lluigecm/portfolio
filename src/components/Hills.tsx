import { type Circle, circles, type Grid, isEdge, paint, random } from "@/lib/pixels";
import { Pixels } from "./Pixels";

/*
 * Morros do fundo: duas fileiras de colinas redondas (a de trás mais escura),
 * em pixels de 4 px, com a borda de cima clara e pontinhos de textura. A faixa
 * tem 150 × 30 pixels (600 × 120 px) e emenda com ela mesma, para repetir.
 */
const WIDTH = 150;
const HEIGHT = 30;

/** Colinas que passam da borda da faixa reaparecem do outro lado. */
function wrapped(list: Circle[]): Circle[] {
  return list.flatMap((c) => [c, { ...c, x: c.x - WIDTH }, { ...c, x: c.x + WIDTH }]);
}

function row(list: Circle[], base: number, letters: { fill: string; edge: string; dot: string }, seed: number): Grid {
  const shape = circles(WIDTH, HEIGHT, wrapped(list)).map((line, y) => (y >= base ? "#".repeat(WIDTH) : line));
  const next = random(seed);
  return paint(shape, (x, y) => {
    // Só a borda de cima clareia: os lados encostam nas outras colinas.
    if (isEdge(shape, x, y) && !(shape[y - 1]?.[x] === "#")) return letters.edge;
    return next() < 0.05 ? letters.dot : letters.fill;
  });
}

const BACK = row(
  [
    { x: 22, y: 31, r: 28 },
    { x: 74, y: 35, r: 31 },
    { x: 126, y: 32, r: 27 },
  ],
  26,
  { fill: "a", edge: "b", dot: "c" },
  5,
);

const FRONT = row(
  [
    { x: 46, y: 36, r: 22 },
    { x: 101, y: 35, r: 19 },
    { x: 146, y: 38, r: 21 },
  ],
  HEIGHT,
  { fill: "d", edge: "e", dot: "f" },
  9,
);

const COLORS = {
  a: "var(--hill)",
  b: "var(--hill-edge)",
  c: "var(--hill-dot)",
  d: "var(--hill2)",
  e: "var(--hill2-edge)",
  f: "var(--hill2-dot)",
};

export function HillStrip() {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} shapeRendering="crispEdges">
      <Pixels grid={BACK} colors={COLORS} />
      <Pixels grid={FRONT} colors={COLORS} />
    </svg>
  );
}
