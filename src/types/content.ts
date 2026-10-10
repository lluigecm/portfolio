export type Locale = "pt" | "en";

export type ProjectId = "autohealing" | "mygather";

export interface ProjectText {
  title: string;
  /** Selo opcional, ex.: "TCC, em andamento". */
  badge?: string;
  description: string;
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
    /** Link que pula o cabeçalho e vai direto ao conteúdo (teclado). */
    skipToContent: string;
    /** Nome da navegação entre seções, para leitores de tela. */
    navLabel: string;
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
