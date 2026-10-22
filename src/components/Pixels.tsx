import { type Grid, runs } from "@/lib/pixels";

interface Props {
  grid: Grid;
  /** Cor de cada letra da grade. */
  colors: Record<string, string>;
  /** Posição do desenho, em pixels da grade. */
  x?: number;
  y?: number;
  className?: string;
}

/* Uma grade de pixel art como grupo de retângulos, dentro de um <svg> com shapeRendering="crispEdges". */
export function Pixels({ grid, colors, x = 0, y = 0, className }: Props) {
  return (
    <g className={className} transform={x || y ? `translate(${x} ${y})` : undefined}>
      {runs(grid).map((run) => (
        <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height={1} fill={colors[run.letter]} />
      ))}
    </g>
  );
}
