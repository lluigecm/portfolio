import "server-only";
import { Octokit } from "@octokit/rest";
import { cacheLife } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { ContributionDay, Contributions, RepoStats } from "@/types/github";

/*
 * Toda chamada ao GitHub fica aqui (regras 1 a 4). Roda só no servidor; o
 * resultado entra nas páginas pré-renderizadas e se renova a cada 15 minutos
 * (perfil "github" em next.config.ts).
 */

// Configurável para os testes apontarem para uma API falsa ou fora do ar.
const API_URL = process.env.GITHUB_API_URL || "https://api.github.com";
const TIMEOUT_MS = 8000;

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

/** Data do último push de um repositório ("dono/nome"). */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  "use cache";
  cacheLife("github");

  const [owner, name] = repo.split("/");
  try {
    const { data: info } = await client().rest.repos.get({ owner, repo: name });
    return { pushedAt: info.pushed_at ?? info.updated_at };
  } catch (error) {
    return onFailure(repo, error);
  }
}

const CALENDAR_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        restrictedContributionsCount
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
      restrictedContributionsCount: number;
      contributionCalendar: {
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
    };
  } | null;
}

interface Calendar {
  days: ContributionDay[];
  /**
   * Contribuições que o dono do token não pode ver: as feitas em repositórios
   * privados, quando o usuário as mostra no perfil. O calendário já as conta.
   */
  restricted: number;
}

/** Calendário de um usuário: os últimos 12 meses, como no perfil do GitHub. */
async function getCalendar(login: string): Promise<Calendar> {
  const response = await client().graphql<CalendarResponse>(CALENDAR_QUERY, { login });
  if (!response.user) throw new Error(`usuário não encontrado: ${login}`);
  const collection = response.user.contributionsCollection;
  return {
    days: collection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
    ),
    restricted: collection.restrictedContributionsCount,
  };
}

const sum = (days: ContributionDay[]) => days.reduce((total, day) => total + day.count, 0);

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

    const [personal, work] = await Promise.all(logins.map((login) => getCalendar(login!)));
    const byDate = new Map<string, number>();
    for (const day of [...personal.days, ...work.days]) {
      byDate.set(day.date, (byDate.get(day.date) ?? 0) + day.count);
    }

    const days = [...byDate]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Totais pela soma dos dias, para a legenda sempre fechar com o gráfico. As
    // privadas são só da conta de trabalho: as da pessoal o token enxerga.
    return {
      days,
      total: sum(days),
      personal: sum(personal.days),
      work: sum(work.days),
      workPrivate: work.restricted,
    };
  } catch (error) {
    return onFailure("contribuições", error);
  }
}
