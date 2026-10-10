import type { Content } from "@/types/content";
import type { ContributionDay, Contributions } from "@/types/github";

/*
 * Gráfico de contribuições, a peça marcante do site (princípio 5.1.1): uma
 * coluna por semana, de domingo a sábado, na escala de âmbar da seção 5.2.
 * No celular, rola na horizontal dentro do próprio espaço, começando pelos
 * meses mais recentes (flex-row-reverse inicia a rolagem pela direita).
 * Medidas em unidades do viewBox.
 */
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const MONTH_ROW = 20;
// No celular o SVG fica no tamanho natural (1 unidade = 1 px): 12 px é o piso
// de legibilidade, o mesmo do diagrama do TCC.
const FONT = 12;
// Rótulos nas últimas semanas são alinhados pela direita, para não sair do gráfico.
const RIGHT_ALIGNED_WEEKS = 2;
// Rótulos de mês a menos de 3 semanas um do outro se sobreporiam.
const MIN_WEEKS_BETWEEN_MONTHS = 3;

const LEVEL_CLASS = [
  "fill-grafico-0",
  "fill-grafico-1",
  "fill-grafico-2",
  "fill-grafico-3",
  "fill-grafico-4",
];

interface Props {
  contributions: Contributions;
  caption: string;
  month: Content["hero"]["chartMonth"];
}

export function ContributionChart({ contributions, caption, month }: Props) {
  const weeks = toWeeks(contributions.days);
  const level = levelScale(contributions.days);
  const labels = monthLabels(weeks);
  const width = weeks.length * STEP - GAP;
  const height = MONTH_ROW + 7 * STEP - GAP;

  return (
    <figure className="mt-12" data-testid="contribution-chart">
      <div
        role="region"
        tabIndex={0}
        aria-labelledby="contribution-caption"
        className="flex flex-row-reverse overflow-x-auto"
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${width} ${height}`}
          fontSize={FONT}
          // Nunca menor que o tamanho natural: no celular, rola em vez de encolher.
          style={{ minWidth: width }}
          className="block h-auto w-full shrink-0"
        >
          <g className="fill-lapis">
            {labels.map(({ week, date }) => (
              <text
                key={date}
                x={week >= weeks.length - RIGHT_ALIGNED_WEEKS ? width : week * STEP}
                y={FONT}
                textAnchor={week >= weeks.length - RIGHT_ALIGNED_WEEKS ? "end" : "start"}
              >
                {month(date)}
              </text>
            ))}
          </g>
          {weeks.map((week, w) =>
            week.map(
              (day, d) =>
                day && (
                  <rect
                    key={day.date}
                    x={w * STEP}
                    y={MONTH_ROW + d * STEP}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    data-date={day.date}
                    data-count={day.count}
                    className={LEVEL_CLASS[level(day.count)]}
                  />
                ),
            ),
          )}
        </svg>
      </div>
      <figcaption id="contribution-caption" className="mt-3 text-sm text-lapis">
        {caption}
      </figcaption>
    </figure>
  );
}

const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

/** Agrupa os dias em semanas de domingo a sábado; a primeira semana pode começar incompleta. */
function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  const weeks: (ContributionDay | null)[][] = [];
  for (const day of days) {
    const d = weekday(day.date);
    if (weeks.length === 0 || d === 0) weeks.push(Array(7).fill(null));
    weeks[weeks.length - 1][d] = day;
  }
  return weeks;
}

/**
 * Nível 0 para dias sem contribuição; 1 a 4 pelos quartis dos dias com
 * contribuição, como no GitHub, para um dia excepcional não apagar o resto.
 */
function levelScale(days: ContributionDay[]) {
  const counts = days
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);
  const quartile = (q: number) => counts[Math.floor((counts.length - 1) * q)] ?? 0;
  const limits = [quartile(0.25), quartile(0.5), quartile(0.75)];
  return (count: number) => (count === 0 ? 0 : 1 + limits.filter((limit) => count > limit).length);
}

/** Um rótulo na semana em que cada mês começa. */
function monthLabels(weeks: (ContributionDay | null)[][]) {
  const labels: { week: number; date: string }[] = [];
  weeks.forEach((week, index) => {
    const first = week.find((day) => day !== null)!;
    const startsMonth = index === 0 || week.some((day) => day?.date.endsWith("-01"));
    if (!startsMonth) return;
    const date = index === 0 ? first.date : week.find((day) => day?.date.endsWith("-01"))!.date;
    labels.push({ week: index, date });
  });
  // Descarta o primeiro rótulo (mês parcial) se o seguinte estiver perto demais.
  if (labels.length > 1 && labels[1].week - labels[0].week < MIN_WEEKS_BETWEEN_MONTHS) {
    labels.shift();
  }
  return labels;
}
