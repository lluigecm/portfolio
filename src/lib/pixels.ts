/*
 * Pixel art desenhada por código: cada desenho é uma grade de letras (uma
 * letra por pixel, "." vazio), e cada letra vira uma cor na hora de desenhar.
 * Moitas, nuvens, Lua e Sol saem de círculos sobrepostos, com sorteios de
 * semente fixa, então o desenho é o mesmo no servidor e no navegador.
 */
export type Grid = string[];

export interface Circle {
  x: number;
  y: number;
  r: number;
}

/** Sorteio com semente fixa (mulberry32). */
export function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grade com "#" onde algum círculo cobre o centro do pixel. */
export function circles(width: number, height: number, list: Circle[]): Grid {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      list.some((c) => (x + 0.5 - c.x) ** 2 + (y + 0.5 - c.y) ** 2 <= c.r ** 2) ? "#" : ".",
    ).join(""),
  );
}

const filled = (grid: Grid, x: number, y: number) => grid[y]?.[x] !== undefined && grid[y][x] !== ".";

/** Pixel preenchido na borda do desenho (algum vizinho vazio). */
export function isEdge(grid: Grid, x: number, y: number) {
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => !filled(grid, x + dx, y + dy));
}

/** Troca cada pixel preenchido pela letra que `paint` escolher. */
export function paint(grid: Grid, letter: (x: number, y: number) => string): Grid {
  return grid.map((row, y) => [...row].map((ch, x) => (ch === "." ? "." : letter(x, y))).join(""));
}

/** Desloca as linhas acima de `split` um pixel para a direita: o quadro do balanço. */
export function sway(grid: Grid, split: number): Grid {
  return grid.map((row, y) => (y < split ? `.${row.slice(0, -1)}` : row));
}

export interface Run {
  x: number;
  y: number;
  width: number;
  letter: string;
}

/** Pixels vizinhos da mesma cor viram um retângulo só, para o SVG ficar leve. */
export function runs(grid: Grid): Run[] {
  const out: Run[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const letter = row[x];
      let end = x + 1;
      while (row[end] === letter) end++;
      if (letter !== ".") out.push({ x, y, width: end - x, letter });
      x = end;
    }
  });
  return out;
}
