/**
 * Dados que a API do GitHub acrescenta a cada card de projeto. Regra 12: só a
 * data do último push; sem estrelas nem linguagens (a stack vem das tags).
 */
export interface RepoStats {
  /** Último push no repositório (ISO 8601). */
  pushedAt: string;
}

export interface ContributionDay {
  /** Data no formato AAAA-MM-DD. */
  date: string;
  count: number;
}

/** Calendário de contribuições das duas contas, somado dia a dia (regra 13). */
export interface Contributions {
  /** Dias em ordem cronológica, cobrindo os últimos 12 meses. */
  days: ContributionDay[];
  /** Soma de todos os dias exibidos. */
  total: number;
}
