import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

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
