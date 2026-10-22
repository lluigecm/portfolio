import { stats } from "@/content/game";
import type { Content } from "@/types/content";

/* Ficha do jogador: texto e barras de status, que enchem ao entrar na fase (Scene). */
export function About({ text }: { text: Content["about"] }) {
  const bars: [string, number | "MAX", boolean][] = [
    [text.automation, stats.automation, false],
    ["Playwright", stats.playwright, false],
    ["RPA", stats.rpa, true],
    [text.coffee, "MAX", true],
  ];

  return (
    <div className="panel about">
      <div>
        {text.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="stats" aria-label="Status" data-fala={text.statsFala}>
        <li>
          <span>HP</span>
          <b>{text.hp}</b>
        </li>
        {bars.map(([label, value, pink]) => (
          <BarRows key={label} label={label} value={value} pink={pink} />
        ))}
      </ul>
    </div>
  );
}

function BarRows({ label, value, pink }: { label: string; value: number | "MAX"; pink: boolean }) {
  const width = value === "MAX" ? 100 : value;
  return (
    <>
      <li>
        <span>{label}</span>
        <b>{value}</b>
      </li>
      <li>
        <div className={pink ? "bar pink" : "bar"}>
          <i data-w={`${width}%`} />
        </div>
      </li>
    </>
  );
}
