import type { CSSProperties } from "react";
import { circles, type Grid, isEdge, paint } from "@/lib/pixels";
import { Pixels } from "./Pixels";

/*
 * Céu fixo atrás da página: Lua à noite, Sol de dia (globals.css escolhe qual
 * aparece) e nuvens atravessando a tela devagar.
 */

// Lua cheia com crateras, sombreada à direita.
const CRATERS = new Set(["5,5", "6,5", "5,6", "10,9", "11,9", "10,10", "11,10", "6,11", "11,4"]);
const MOON: Grid = paint(circles(16, 16, [{ x: 8, y: 8, r: 7.5 }]), (x, y) => {
  if (CRATERS.has(`${x},${y}`)) return "c";
  return (x - 4) ** 2 + (y - 5) ** 2 > 60 ? "s" : "m";
});

// Sol: miolo redondo e raios em dois quadros, que se alternam.
const SUN_SHAPE = circles(24, 24, [{ x: 12, y: 12, r: 5.5 }]);
const SUN: Grid = paint(SUN_SHAPE, (x, y) => (isEdge(SUN_SHAPE, x, y) ? "o" : x + y < 20 ? "h" : "y"));
function rays(offset: number): Grid {
  const cells = new Set<string>();
  for (const k of [0, 1]) {
    const near = 4 - offset - k;
    for (const c of [11, 12]) {
      cells.add(`${c},${near}`).add(`${c},${23 - near}`).add(`${near},${c}`).add(`${23 - near},${c}`);
    }
    const d = 6 - offset - k;
    cells.add(`${d},${d}`).add(`${23 - d},${d}`).add(`${d},${23 - d}`).add(`${23 - d},${23 - d}`);
  }
  return Array.from({ length: 24 }, (_, y) =>
    Array.from({ length: 24 }, (_, x) => (cells.has(`${x},${y}`) ? "o" : ".")).join(""),
  );
}
// Nuvens: blocos redondos, com a base sombreada.
function cloud(width: number, height: number, list: Parameters<typeof circles>[2]): Grid {
  const shape = circles(width, height, list);
  return paint(shape, (x, y) => (y >= height - 2 || (isEdge(shape, x, y) && y > height / 2) ? "s" : "w"));
}
const CLOUD_BIG = cloud(26, 9, [
  { x: 6, y: 6.5, r: 3 },
  { x: 11, y: 4.5, r: 4.5 },
  { x: 17, y: 5, r: 4 },
  { x: 21, y: 7, r: 2.5 },
  { x: 13, y: 7.5, r: 2 },
]);
const CLOUD_SMALL = cloud(16, 7, [
  { x: 5, y: 5, r: 2.5 },
  { x: 9, y: 3.8, r: 3.5 },
  { x: 12.5, y: 5.2, r: 2.3 },
]);

const CLOUDS = [
  { grid: CLOUD_BIG, top: "14%", duration: 95, delay: -10 },
  { grid: CLOUD_SMALL, top: "24%", duration: 70, delay: -42 },
  { grid: CLOUD_BIG, top: "36%", duration: 120, delay: -75 },
  { grid: CLOUD_SMALL, top: "9%", duration: 85, delay: -60 },
  { grid: CLOUD_SMALL, top: "46%", duration: 110, delay: -20 },
];

export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <svg className="moon" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Pixels grid={MOON} colors={{ m: "#fff1c9", s: "#e2d59f", c: "#cfc08a" }} />
      </svg>
      <svg className="sun" viewBox="0 0 24 24" shapeRendering="crispEdges">
        <Pixels className="ray-a" grid={rays(0)} colors={{ o: "#ff9f1c" }} />
        <Pixels className="ray-b" grid={rays(1)} colors={{ o: "#ff9f1c" }} />
        <Pixels grid={SUN} colors={{ o: "#ff9f1c", y: "#ffd23f", h: "#fff1c9" }} />
      </svg>
      {CLOUDS.map(({ grid, top, duration, delay }, i) => (
        <svg
          key={i}
          className="cloud"
          viewBox={`0 0 ${grid[0].length} ${grid.length}`}
          width={grid[0].length * 4}
          height={grid.length * 4}
          shapeRendering="crispEdges"
          style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` } as CSSProperties}
        >
          <Pixels grid={grid} colors={{ w: "var(--cloud)", s: "var(--cloud-shade)" }} />
        </svg>
      ))}
    </div>
  );
}
