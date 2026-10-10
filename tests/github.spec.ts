import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// O site de teste (porta 3000) é montado contra a API falsa de tests/mock-github.mjs.
const EXPECTED = {
  pt: {
    autohealing: ["Estrelas", "7", "Linguagens", "TypeScript, JavaScript", "Atualizado em", "15 de set. de 2026"],
    mygather: ["Estrelas", "1.234", "Linguagens", "TypeScript, HTML, CSS", "Atualizado em", "1 de ago. de 2026"],
  },
  en: {
    autohealing: ["Stars", "7", "Languages", "TypeScript, JavaScript", "Updated", "Sep 15, 2026"],
    mygather: ["Stars", "1,234", "Languages", "TypeScript, HTML, CSS", "Updated", "Aug 1, 2026"],
  },
};

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  test.describe(`cards em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("mostram estrelas, linguagens e última atualização vindas da API", async ({ page }) => {
      await page.goto("/");
      for (const [id, facts] of Object.entries(EXPECTED[locale])) {
        const stats = page.locator(`[data-project="${id}"] [data-testid="repo-stats"]`);
        await expect(stats.locator("dt, dd")).toHaveText(facts);
      }
    });
  });
}

test("o link do repositório usa a fonte mono", async ({ page }) => {
  await page.goto("/");
  const code = page.locator('[data-project="mygather"] code');
  await expect(code).toHaveText("lluigecm/MyGather");
  expect(await code.evaluate((el) => getComputedStyle(el).fontFamily)).toContain("IBM Plex Mono");
});

// Regra 5: o token nunca chega ao navegador. Varre tudo o que os builds entregam:
// arquivos estáticos (JS, CSS) e as páginas pré-renderizadas (HTML e RSC).
test("o token não aparece em nenhum arquivo entregue ao navegador", () => {
  const token = readToken();
  const patterns = [/gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/];

  const builds = [".next", ".next-e2e", ".next-api-fora"].filter((dir) => existsSync(dir));
  const files = builds.flatMap((dir) => [
    ...walk(join(dir, "static")),
    ...walk(join(dir, "server", "app")).filter((file) => /\.(html|rsc|body|meta)$/.test(file)),
  ]);
  expect(files.length).toBeGreaterThan(0);

  const leaks = files.filter((file) => {
    const text = readFileSync(file, "utf8");
    return (token && text.includes(token)) || patterns.some((pattern) => pattern.test(text));
  });
  expect(leaks).toEqual([]);
});

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// O token real fica no .env.local (local) ou nas variáveis da Vercel; no CI não há token.
function readToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (!existsSync(".env.local")) return "";
  const line = readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("GITHUB_TOKEN="));
  return line?.slice("GITHUB_TOKEN=".length).trim() ?? "";
}
