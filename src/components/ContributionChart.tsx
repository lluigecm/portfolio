import type { CSSProperties } from "react";
import type { Content } from "@/types/content";
import type { ContributionDay, Contributions } from "@/types/github";

/*
 * Gráfico de contribuições do GitHub (contas pessoal e de trabalho somadas), em
 * pixel art: uma coluna por semana, de domingo a sábado, quadrados retos na
 * escala de verdes do tema. Passar o mouse num dia faz o bot dizer quantas
 * contribuições teve. No celular, rola na horizontal dentro do próprio painel,
 * começando pelos meses mais recentes. As semanas entram uma a uma quando o
 * gráfico aparece na tela (globals.css). Medidas em unidades do viewBox.
 */
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const MONTH_ROW = 20;
const FONT = 16;
// Rótulos nas últimas semanas são alinhados pela direita, para não sair do gráfico.
const RIGHT_ALIGNED_WEEKS = 2;
// Rótulos de mês a menos de 3 semanas um do outro se sobreporiam.
const MIN_WEEKS_BETWEEN_MONTHS = 3;

interface Props {
  contributions: Contributions;
  text: Content["chart"];
}

export function ContributionChart({ contributions, text }: Props) {
  const weeks = toWeeks(contributions.days);
  const level = levelScale(contributions.days);
  const labels = monthLabels(weeks);
  const width = weeks.length * STEP - GAP;
  const height = MONTH_ROW + 7 * STEP - GAP;
  const caption = text.caption(contributions);

  return (
    <figure className="panel chart entra" data-testid="contribution-chart">
      <h3>{text.title}</h3>
      <div role="region" tabIndex={0} aria-labelledby="contribution-caption" className="chart-scroll">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${width} ${height}`}
          fontSize={FONT}
          shapeRendering="crispEdges"
          // Nunca menor que o tamanho natural: no celular, rola em vez de encolher.
          style={{ minWidth: width }}
        >
          <g className="chart-months">
            {labels.map(({ week, date }) => (
              <text
                key={date}
                x={week >= weeks.length - RIGHT_ALIGNED_WEEKS ? width : week * STEP}
                y={FONT - 2}
                textAnchor={week >= weeks.length - RIGHT_ALIGNED_WEEKS ? "end" : "start"}
              >
                {text.month(date)}
              </text>
            ))}
          </g>
          {weeks.map((week, w) => (
            <g key={w} className="semana" style={{ "--semana": w } as CSSProperties}>
              {week.map((day, d) => {
                if (!day) return null;
                const dayLevel = level(day.count);
                return (
                  <rect
                    key={day.date}
                    x={w * STEP}
                    y={MONTH_ROW + d * STEP}
                    width={CELL}
                    height={CELL}
                    data-date={day.date}
                    data-count={day.count}
                    data-level={dayLevel}
                    data-fala={text.day(day.date, day.count)}
                    className={`n${dayLevel}`}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      <figcaption id="contribution-caption">{caption}</figcaption>
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
