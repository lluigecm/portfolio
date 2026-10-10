import type { DiagramText } from "@/types/content";

/*
 * Metade da recuperação da figura de arquitetura do TCC (regra 20), redesenhada
 * em coluna para caber a 360 px: falha do seletor → heurísticas → score →
 * decisão (em âmbar) → seletor substituído ou falha normal; o log sai da decisão.
 * Medidas em unidades do viewBox; a largura máxima no CSS mantém o texto
 * perto do tamanho do corpo no desktop.
 */
const WIDTH = 340;
const FONT = 16;
const LINE = 20;
const PADDING = 12;
const GAP = 28;
const MARGIN = 4;
const CENTER = WIDTH / 2;

const DIAMOND = { width: 180, height: 96 };
// As saídas ficam embaixo das pontas laterais do losango.
const BRANCH = { left: CENTER - DIAMOND.width / 2, right: CENTER + DIAMOND.width / 2 };
const OUTCOME_WIDTH = 2 * (BRANCH.left - MARGIN);

const boxHeight = (lines: string[]) => lines.length * LINE + 2 * PADDING;

interface Props {
  text: DiagramText;
  alt: string;
}

export function RecoveryDiagram({ text, alt }: Props) {
  const selector = { y: MARGIN, height: boxHeight(text.selectorFails) };
  const heuristics = { y: selector.y + selector.height + GAP, height: boxHeight(text.heuristics) };
  const score = { y: heuristics.y + heuristics.height + GAP, height: boxHeight(text.score) };
  const decision = { y: score.y + score.height + GAP, height: DIAMOND.height };
  const middle = decision.y + DIAMOND.height / 2;
  const bottom = decision.y + DIAMOND.height;
  const outcomeHeight = Math.max(boxHeight(text.replaced), boxHeight(text.fails));
  const outcomes = { y: bottom + GAP, height: outcomeHeight };
  const note = { y: outcomes.y + outcomes.height + GAP, height: boxHeight(text.note) };
  const height = note.y + note.height + MARGIN;

  const fullWidth = { x: MARGIN, width: WIDTH - 2 * MARGIN };
  const diamond = [
    [CENTER, decision.y],
    [BRANCH.right, middle],
    [CENTER, bottom],
    [BRANCH.left, middle],
  ]
    .map((point) => point.join(","))
    .join(" ");

  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox={`0 0 ${WIDTH} ${height}`}
      fontSize={FONT}
      className="mx-auto block h-auto w-full max-w-[22rem] fill-grafite"
    >
      <defs>
        <marker
          id="recovery-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10z" className="fill-lapis" />
        </marker>
      </defs>

      <g className="stroke-lapis" strokeWidth={1.5} markerEnd="url(#recovery-arrow)">
        <Arrow x1={CENTER} y1={selector.y + selector.height} x2={CENTER} y2={heuristics.y} />
        <Arrow x1={CENTER} y1={heuristics.y + heuristics.height} x2={CENTER} y2={score.y} />
        <Arrow x1={CENTER} y1={score.y + score.height} x2={CENTER} y2={decision.y} />
        <Arrow x1={BRANCH.left} y1={middle} x2={BRANCH.left} y2={outcomes.y} />
        <Arrow x1={BRANCH.right} y1={middle} x2={BRANCH.right} y2={outcomes.y} />
        <Arrow x1={CENTER} y1={bottom} x2={CENTER} y2={note.y} strokeDasharray="4 4" />
      </g>

      <Box node="selector" lines={text.selectorFails} {...fullWidth} {...selector} />
      <Box node="heuristics" lines={text.heuristics} {...fullWidth} {...heuristics} />
      <Box node="score" lines={text.score} {...fullWidth} {...score} />

      <g data-node="decision" data-shape="diamond">
        <polygon points={diamond} className="fill-superficie stroke-ambar" strokeWidth={2} />
        <Lines lines={text.decision} x={CENTER} y={middle - (text.decision.length * LINE) / 2} />
      </g>

      {/* Rótulos das saídas, do lado de dentro, longe das pontas do losango. */}
      <g className="fill-lapis">
        <text x={BRANCH.left + 8} y={middle + GAP} dominantBaseline="central">
          {text.yes}
        </text>
        <text x={BRANCH.right - 8} y={middle + GAP} dominantBaseline="central" textAnchor="end">
          {text.no}
        </text>
      </g>

      <Box node="replaced" lines={text.replaced} x={MARGIN} width={OUTCOME_WIDTH} {...outcomes} />
      <Box
        node="fails"
        lines={text.fails}
        x={WIDTH - MARGIN - OUTCOME_WIDTH}
        width={OUTCOME_WIDTH}
        {...outcomes}
      />
      <Box node="note" lines={text.note} {...fullWidth} {...note} dashed />
    </svg>
  );
}

function Arrow(props: { x1: number; y1: number; x2: number; y2: number; strokeDasharray?: string }) {
  // Encurta 1 unidade para a ponta da seta não invadir a borda da caixa.
  return <line {...props} y2={props.y2 - 1} />;
}

interface BoxProps {
  node: string;
  lines: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  dashed?: boolean;
}

function Box({ node, lines, x, y, width, height, dashed }: BoxProps) {
  const top = y + (height - lines.length * LINE) / 2;
  return (
    <g data-node={node} data-shape="rect">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        className="fill-superficie stroke-lapis"
        strokeWidth={1.5}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <Lines lines={lines} x={x + width / 2} y={top} />
    </g>
  );
}

function Lines({ lines, x, y }: { lines: string[]; x: number; y: number }) {
  return lines.map((line, i) => (
    <text key={i} x={x} y={y + LINE * (i + 0.5)} textAnchor="middle" dominantBaseline="central">
      {line}
    </text>
  ));
}
