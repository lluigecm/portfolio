import type { ReactNode } from "react";
import type { LevelId } from "@/types/content";

interface Props {
  id: LevelId;
  /** Placa acima do título, ex.: "WORLD 1-1". */
  sign: string;
  title: string;
  boss?: boolean;
  children: ReactNode;
}

/* Uma fase: placa, título e conteúdo. O bot comenta cada fase ao chegar nela (Scene). */
export function Level({ id, sign, title, boss, children }: Props) {
  return (
    <section className={boss ? "level boss" : "level"} id={id} aria-labelledby={`${id}-h`}>
      <div className={boss ? "sign boss-sign" : "sign"}>{sign}</div>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}
