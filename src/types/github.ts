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

/** Totais que a legenda do gráfico mostra (seção 6.1). */
export interface ContributionTotals {
  /** Soma de todos os dias exibidos. */
  total: number;
  /** Soma dos dias de cada conta; as duas juntas dão o total. */
  personal: number;
  work: number;
  /**
   * Contribuições da conta de trabalho em repositórios privados, que o GitHub
   * conta no calendário sem mostrar os detalhes. Já estão dentro de `work`.
   * Zero quando a conta não mostra as contribuições privadas no perfil.
   */
  workPrivate: number;
}

/** Calendário de contribuições das duas contas, somado dia a dia (regra 13). */
export interface Contributions extends ContributionTotals {
  /** Dias em ordem cronológica, cobrindo os últimos 12 meses. */
  days: ContributionDay[];
}
