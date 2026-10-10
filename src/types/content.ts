export type Locale = "pt" | "en";

export type ProjectId = "autohealing" | "mygather";

export interface ProjectText {
  title: string;
  /** Selo opcional, ex.: "TCC, em andamento". */
  badge?: string;
  description: string;
  /** Texto alternativo da mídia do card. */
  mediaAlt: string;
  /** Crédito da arte, quando a licença exige (regra 19). */
  credit?: string;
}

/**
 * Textos do diagrama de recuperação do TCC (seção 6.3). Cada texto já vem
 * quebrado em linhas, porque o SVG não quebra linha sozinho.
 */
export interface DiagramText {
  selectorFails: string[];
  heuristics: string[];
  score: string[];
  decision: string[];
  /** Rótulos das duas saídas da decisão. */
  yes: string;
  no: string;
  replaced: string[];
  fails: string[];
  note: string[];
}

export interface Role {
  title: string;
  period: string;
  description: string;
}

/** Todos os textos do site num idioma (PROJETO.md, seção 6). PT e EN têm a mesma forma. */
export interface Content {
  meta: {
    title: string;
    description: string;
  };
  ui: {
    /** Rótulo para trocar *para* este idioma, escrito neste idioma. */
    viewInThisLanguage: string;
    theme: {
      toDark: string;
      toLight: string;
      /** Antes da hidratação, quando o tema atual ainda é desconhecido. */
      toggle: string;
    };
    /** Botão de pausa do vídeo do card (regra 18). */
    video: {
      pause: string;
      play: string;
    };
    /** Link que pula o cabeçalho e vai direto ao conteúdo (teclado). */
    skipToContent: string;
    /** Nome da navegação entre seções, para leitores de tela. */
    navLabel: string;
    /** Rótulos dos dados que a API do GitHub acrescenta aos cards. */
    repo: {
      stars: string;
      languages: string;
      updated: string;
      /** Número de estrelas, formatado no idioma. */
      count: (value: number) => string;
      /** Data do último push, formatada no idioma. */
      date: (iso: string) => string;
    };
    nav: {
      experience: string;
      projects: string;
      stack: string;
      education: string;
      contact: string;
    };
  };
  hero: {
    name: string;
    title: string;
    intro: string;
    /** Legenda do gráfico, com o total já formatado no idioma. */
    chartCaption: (total: number) => string;
  };
  experience: {
    company: string;
    companyDescription: string;
    roles: Role[];
  };
  projects: Record<ProjectId, ProjectText>;
  diagram: DiagramText;
  stack: { label: string; items: string[] }[];
  education: {
    degree: string;
    institution: string;
    thesis: string;
  };
  contact: {
    text: string;
    email: string;
    linkedin: string;
  };
}
