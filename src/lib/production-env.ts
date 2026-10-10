/*
 * Variáveis sem as quais o build de produção não pode sair (regra 5).
 *
 * Erro de configuração não é queda da API: a regra 14 esconde o gráfico quando
 * o GitHub falha, mas não pode esconder um deploy mal configurado. Por isso o
 * build de produção na Vercel para aqui, antes de compilar. Builds de preview,
 * locais e de teste (sem VERCEL_ENV=production) seguem sem exigir o token.
 *
 * Chamado pelo next.config.ts; sem dependências do Next para rodar ali.
 */
export const REQUIRED_IN_PRODUCTION = [
  "GITHUB_TOKEN",
  "GITHUB_PERSONAL_USER",
  "GITHUB_WORK_USER",
] as const;

export function missingProductionEnv(env: Record<string, string | undefined>): string[] {
  if (env.VERCEL_ENV !== "production") return [];
  return REQUIRED_IN_PRODUCTION.filter((name) => !env[name]?.trim());
}

export function assertProductionEnv(env: Record<string, string | undefined> = process.env) {
  const missing = missingProductionEnv(env);
  if (missing.length === 0) return;
  throw new Error(
    [
      `Build de produção interrompido: faltam variáveis de ambiente: ${missing.join(", ")}.`,
      "Cadastre-as na Vercel em Settings → Environment Variables, marcando o ambiente",
      "Production, e faça um novo deploy (Redeploy). Sem elas, o gráfico e os cards",
      "sairiam sem os dados do GitHub.",
    ].join("\n"),
  );
}
