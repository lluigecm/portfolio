import type { CSSProperties, ReactNode } from "react";
import type { LevelId } from "@/types/content";

interface Props {
  id: LevelId;
  /** Placa acima do título, ex.: "WORLD 1-1". */
  sign: string;
  title: string;
  boss?: boolean;
  children: ReactNode;
}

/*
 * Uma fase: placa, título e conteúdo. O bot comenta cada fase ao chegar nela
 * (Scene); a placa cai e o título se digita (--n letras) ao entrarem na tela.
 */
export function Level({ id, sign, title, boss, children }: Props) {
  return (
    <section className={boss ? "level boss" : "level"} id={id} aria-labelledby={`${id}-h`}>
      <div className={boss ? "sign boss-sign entra" : "sign entra"}>{sign}</div>
      <h2 id={`${id}-h`} className="entra" style={{ "--n": title.length } as CSSProperties}>
        {title}
      </h2>
      {children}
    </section>
  );
}
