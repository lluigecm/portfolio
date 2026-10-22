import type { CSSProperties } from "react";
import { stats } from "@/content/game";
import type { Content } from "@/types/content";

/* Ficha do jogador: texto e barras de status, que enchem ao entrar na fase (Scene). As linhas entram em sequência. */
export function About({ text }: { text: Content["about"] }) {
  const bars: [string, number | "MAX", boolean][] = [
    [text.automation, stats.automation, false],
    ["Playwright", stats.playwright, false],
    ["RPA", stats.rpa, true],
    [text.coffee, "MAX", true],
  ];

  return (
    <div className="panel about entra">
      <div>
        {text.paragraphs.map((paragraph, i) => (
          <p key={paragraph} style={{ "--i": i } as CSSProperties}>
            {paragraph}
          </p>
        ))}
      </div>
      <ul className="stats" aria-label="Status" data-fala={text.statsFala}>
        <li style={{ "--i": 0 } as CSSProperties}>
          <span>HP</span>
          <b>{text.hp}</b>
        </li>
        {bars.map(([label, value, pink], i) => (
          <BarRows key={label} label={label} value={value} pink={pink} index={1 + i * 2} />
        ))}
      </ul>
    </div>
  );
}

interface BarProps {
  label: string;
  value: number | "MAX";
  pink: boolean;
  /** Posição da primeira das duas linhas, para a entrada em sequência. */
  index: number;
}

function BarRows({ label, value, pink, index }: BarProps) {
  const width = value === "MAX" ? 100 : value;
  return (
    <>
      <li style={{ "--i": index } as CSSProperties}>
        <span>{label}</span>
        <b>{value}</b>
      </li>
      <li style={{ "--i": index + 1 } as CSSProperties}>
        <div className={pink ? "bar pink" : "bar"}>
          <i data-w={`${width}%`} />
        </div>
      </li>
    </>
  );
}
