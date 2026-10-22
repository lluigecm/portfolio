export type Locale = "pt" | "en";

/** Ids das fases, iguais às âncoras do modelo. */
export type LevelId = "sobre" | "exp" | "proj" | "stack" | "edu" | "contato";

export type ProjectId = "autohealing" | "mygather";

export interface MapNode {
  name: string;
  meta: string;
}

export interface Role {
  title: string;
  when: string;
  bullets: string[];
  /** Checkpoint atual: marcador amarelo piscando. */
  now?: boolean;
}

/** Todos os textos do site num idioma. PT e EN têm a mesma forma. */
export interface Content {
  meta: {
    title: string;
    description: string;
  };
  ui: {
    /** Link que pula a HUD e vai direto ao conteúdo (teclado). */
    skipToContent: string;
  };
  hud: {
    lvl: string;
    score: string;
  };
  hero: {
    name: string;
    /** Frase de abertura; `bold` aparece em amarelo. */
    tag: { before: string; bold: string; after: string };
    start: string;
    hint: string;
  };
  map: {
    title: string;
    nodes: Record<LevelId, MapNode>;
  };
  about: {
    title: string;
    paragraphs: string[];
    hp: string;
    automation: string;
    coffee: string;
  };
  experience: {
    title: string;
    roles: Role[];
  };
  projects: {
    title: string;
    descriptions: Record<ProjectId, string>;
    go: string;
  };
  stack: {
    title: string;
  };
  education: {
    title: string;
    degree: string;
    when: string;
    description: string;
  };
  contact: {
    title: string;
    text: string;
    foot: string;
  };
  /** Fala do bot ao chegar em cada fase. */
  bubble: Record<LevelId, string>;
}
