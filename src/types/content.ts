import type { ContributionTotals } from "./github";

export type Locale = "pt" | "en";

/** Ids das fases, iguais às âncoras do modelo. */
export type LevelId = "sobre" | "exp" | "proj" | "stack" | "edu" | "contato";

export type ProjectId = "autohealing" | "mygather";

export type ItemId =
  | "playwright"
  | "typescript"
  | "python"
  | "robot"
  | "java"
  | "c"
  | "next"
  | "mpi"
  | "git"
  | "cicd";

/** Texto de um item do inventário. */
export interface ItemText {
  category: string;
  description: string;
}

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
  /** Fala do bot ao passar o mouse no checkpoint. */
  fala: string;
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
    /** Botão de dia e noite: rótulo antes de saber o tema e para cada destino. */
    theme: { toggle: string; toDay: string; toNight: string };
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
    /** Fala do bot ao passar o mouse no botão de começar. */
    startFala: string;
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
    /** Fala do bot ao passar o mouse nas barras de status. */
    statsFala: string;
  };
  /** Gráfico de contribuições do GitHub, na fase "Sobre". */
  chart: {
    title: string;
    /** Legenda com os totais já formatados no idioma. */
    caption: (totals: ContributionTotals) => string;
    /** Rótulo curto do mês no topo do gráfico. */
    month: (date: string) => string;
    /** Fala do bot sobre um dia do gráfico. */
    day: (date: string, count: number) => string;
  };
  experience: {
    title: string;
    roles: Role[];
  };
  projects: {
    title: string;
    descriptions: Record<ProjectId, string>;
    /** Fala do bot ao passar o mouse em cada cartucho. */
    falas: Record<ProjectId, string>;
    go: string;
  };
  stack: {
    title: string;
    /** Instrução acima do inventário. */
    hint: string;
    /** Rótulo do quadro com o item escolhido. */
    selected: string;
    items: Record<ItemId, ItemText>;
  };
  education: {
    title: string;
    degree: string;
    when: string;
    description: string;
    fala: string;
  };
  contact: {
    title: string;
    text: string;
    foot: string;
    linkedinFala: string;
    emailFala: string;
  };
  /** Fala do bot ao chegar em cada fase. */
  bubble: Record<LevelId, string>;
}
