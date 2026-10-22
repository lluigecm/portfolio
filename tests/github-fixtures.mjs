// Dados fixos da API falsa do GitHub (tests/mock-github.mjs), compartilhados com os testes.

// Estrelas e linguagens continuam aqui de propósito: os testes provam que o site
// não as mostra (regra 12). As linguagens que não estão nas tags não aparecem em
// nenhum texto do site, para o teste não confundir com conteúdo legítimo.
export const REPOS = {
  "lluigecm/autohealing-e2e-tests": {
    info: { stargazers_count: 7, pushed_at: "2026-09-15T12:00:00Z" },
    languages: { TypeScript: 9000, JavaScript: 1000, Dockerfile: 50 },
  },
  "lluigecm/MyGather": {
    info: { stargazers_count: 1234, pushed_at: "2026-08-01T12:00:00Z" },
    languages: { TypeScript: 50000, HTML: 4000, Shell: 3000, JavaScript: 100 },
  },
};

// Usuários que os sites de teste recebem em GITHUB_PERSONAL_USER e GITHUB_WORK_USER.
export const USERS = { personal: "teste-pessoal", work: "teste-trabalho" };

// 53 semanas completas, de domingo a sábado, como o calendário do GitHub.
const FIRST_DAY = Date.UTC(2025, 9, 5); // 2025-10-05, um domingo
const DAYS = 371;

const COUNT = {
  [USERS.personal]: (i) => (i % 7 === 3 ? 0 : (i * 5) % 4),
  [USERS.work]: (i) => (i % 11 === 0 ? 6 : i % 3 === 0 ? 1 : 0),
};

/** Dias de um usuário. `bonus` soma contribuições ao último dia (dados "novos"). */
export function calendarDays(login, bonus = 0) {
  return Array.from({ length: DAYS }, (_, i) => ({
    date: new Date(FIRST_DAY + i * 86_400_000).toISOString().slice(0, 10),
    contributionCount: COUNT[login](i) + (i === DAYS - 1 ? bonus : 0),
  }));
}

// Contribuições em repositórios privados que o token não enxerga. Só a conta de
// trabalho tem; a pessoal recebe um valor de propósito, que o site deve ignorar.
const RESTRICTED = { [USERS.personal]: 40, [USERS.work]: 250 };

const sum = (days) => days.reduce((total, day) => total + day.contributionCount, 0);

/** Totais que a legenda deve exibir; `bonus` vai para a conta pessoal (dados "novos"). */
export function expectedTotals(bonus = 0) {
  const personal = sum(calendarDays(USERS.personal, bonus));
  const work = sum(calendarDays(USERS.work));
  return { total: personal + work, personal, work, workPrivate: RESTRICTED[USERS.work] };
}

/** Resposta GraphQL no formato do GitHub, em semanas. */
export function calendarResponse(login, bonus = 0) {
  const days = calendarDays(login, bonus);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push({ contributionDays: days.slice(i, i + 7) });
  return {
    data: {
      user: {
        contributionsCollection: {
          restrictedContributionsCount: RESTRICTED[login],
          contributionCalendar: { weeks },
        },
      },
    },
  };
}
