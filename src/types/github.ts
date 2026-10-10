/** Dados que a API do GitHub acrescenta a cada card de projeto (regra 12: sem estrelas). */
export interface RepoStats {
  /** Linguagens do repositório, da mais usada para a menos usada. */
  languages: string[];
  /** Último push no repositório (ISO 8601). */
  pushedAt: string;
}
