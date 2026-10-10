import "server-only";
import { Octokit } from "@octokit/rest";
import { cacheLife } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { ContributionDay, Contributions, RepoStats } from "@/types/github";

/*
 * Toda chamada ao GitHub fica aqui (regras 1 a 4). Roda só no servidor; o
 * resultado entra nas páginas pré-renderizadas e se renova a cada hora
 * (perfil "github" em next.config.ts).
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

/*
 * Regra 14, igual para cards e gráfico:
 * - No build, uma falha devolve null: o build passa e o componente fica sem os
 *   dados (cards só com textos, gráfico oculto).
 * - Numa renovação em produção, a falha é lançada. A renovação inteira falha e
 *   o Next continua servindo a última página gerada com sucesso, ou seja, os
 *   últimos dados válidos. Na visita seguinte, tenta de novo.
 */
function onFailure(what: string, error: unknown): null {
  const message = `GitHub indisponível (${what}): ${(error as Error).message}`;
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    console.warn(message);
    return null;
  }
  throw new Error(message, { cause: error });
}

/** Linguagens e data do último push de um repositório ("dono/nome"). */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  "use cache";
  cacheLife("github");

  const [owner, name] = repo.split("/");
  try {
    const github = client();
    const [{ data: info }, { data: languages }] = await Promise.all([
      github.rest.repos.get({ owner, repo: name }),
      github.rest.repos.listLanguages({ owner, repo: name }),
    ]);
    return {
      languages: Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, MAX_LANGUAGES)
        .map(([language]) => language),
      pushedAt: info.pushed_at ?? info.updated_at,
    };
  } catch (error) {
    return onFailure(repo, error);
  }
}

const CALENDAR_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

interface CalendarResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
    };
  } | null;
}

/** Calendário de um usuário: os últimos 12 meses, como no perfil do GitHub. */
async function getCalendar(login: string): Promise<ContributionDay[]> {
  const response = await client().graphql<CalendarResponse>(CALENDAR_QUERY, { login });
  if (!response.user) throw new Error(`usuário não encontrado: ${login}`);
  return response.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
  );
}

/**
 * Contribuições das contas pessoal e de trabalho, somadas dia a dia (regra 13).
 * Se uma das contas falhar, nada é exibido: um gráfico parcial contradiria a legenda.
 */
export async function getContributions(): Promise<Contributions | null> {
  "use cache";
  cacheLife("github");

  try {
    const logins = [process.env.GITHUB_PERSONAL_USER, process.env.GITHUB_WORK_USER];
    if (logins.some((login) => !login)) throw new Error("usuários do GitHub não configurados");

    const calendars = await Promise.all(logins.map((login) => getCalendar(login!)));
    const byDate = new Map<string, number>();
    for (const day of calendars.flat()) {
      byDate.set(day.date, (byDate.get(day.date) ?? 0) + day.count);
    }

    const days = [...byDate]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return { days, total: days.reduce((sum, day) => sum + day.count, 0) };
  } catch (error) {
    return onFailure("contribuições", error);
  }
}
