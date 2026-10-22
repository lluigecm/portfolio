import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { missingProductionEnv } from "../src/lib/production-env";

// Ajuste pós-etapa 9: erro de configuração derruba o build de produção; quedas
// da API seguem a regra 14 (testadas em api-fora-do-ar e renovacao).

const COMPLETE = { GITHUB_TOKEN: "x", GITHUB_PERSONAL_USER: "a", GITHUB_WORK_USER: "b" };

test.describe("variáveis exigidas no build", () => {
  test("produção na Vercel exige token e usuários", () => {
    expect(missingProductionEnv({ VERCEL_ENV: "production", ...COMPLETE })).toEqual([]);
    expect(missingProductionEnv({ VERCEL_ENV: "production" })).toEqual([
      "GITHUB_TOKEN",
      "GITHUB_PERSONAL_USER",
      "GITHUB_WORK_USER",
    ]);
    expect(
      missingProductionEnv({ VERCEL_ENV: "production", ...COMPLETE, GITHUB_TOKEN: "  " }),
    ).toEqual(["GITHUB_TOKEN"]);
  });

  test("preview, local e testes não exigem nada", () => {
    expect(missingProductionEnv({ VERCEL_ENV: "preview" })).toEqual([]);
    expect(missingProductionEnv({ VERCEL_ENV: "development" })).toEqual([]);
    expect(missingProductionEnv({})).toEqual([]);
  });

  test("o build de produção sem token falha com mensagem clara", () => {
    // Falha ao carregar o next.config.ts, antes de compilar: leva poucos segundos.
    const distDir = ".next-producao-sem-token";
    const result = spawnSync("npx next build", {
      shell: true,
      encoding: "utf8",
      timeout: 120_000,
      env: { ...process.env, VERCEL_ENV: "production", GITHUB_TOKEN: "", NEXT_DIST_DIR: distDir },
    });
    rmSync(distDir, { recursive: true, force: true });

    expect(result.status).not.toBe(0);
    const output = result.stdout + result.stderr;
    expect(output).toContain("Build de produção interrompido: faltam variáveis de ambiente:");
    expect(output).toContain("GITHUB_TOKEN");
    expect(output).toContain("Settings → Environment Variables");
  });
});
