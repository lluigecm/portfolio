import "server-only";
import { Octokit } from "@octokit/rest";
import { cacheLife } from "next/cache";
import type { RepoStats } from "@/types/github";

/*
 * Toda chamada ao GitHub fica aqui (regras 1 a 4). Roda só no servidor; o
 * resultado entra nas páginas pré-renderizadas e se renova a cada hora.
 */

// Configurável para os testes apontarem para uma API falsa ou fora do ar.
const API_URL = process.env.GITHUB_API_URL || "https://api.github.com";
const TIMEOUT_MS = 8000;
const MAX_LANGUAGES = 3;

function client() {
  return new Octokit({
    baseUrl: API_URL,
    auth: process.env.GITHUB_TOKEN || undefined,
    request: { signal: AbortSignal.timeout(TIMEOUT_MS) },
  });
}

/**
 * Estrelas, linguagens e data do último push de um repositório ("dono/nome").
 * Regra 14: se a API falhar, devolve null e o card fica só com os textos próprios.
 */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  "use cache";
  cacheLife("hours");

  const [owner, name] = repo.split("/");
  try {
    const github = client();
    const [{ data: info }, { data: languages }] = await Promise.all([
      github.rest.repos.get({ owner, repo: name }),
      github.rest.repos.listLanguages({ owner, repo: name }),
    ]);
    return {
      stars: info.stargazers_count,
      languages: Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, MAX_LANGUAGES)
        .map(([language]) => language),
      pushedAt: info.pushed_at ?? info.updated_at,
    };
  } catch (error) {
    console.warn(`GitHub indisponível para ${repo}:`, (error as Error).message);
    return null;
  }
}
