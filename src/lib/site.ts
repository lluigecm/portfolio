/*
 * Endereço público do site, base das URLs absolutas da prévia de link.
 * Ordem: SITE_URL (configurável, para o domínio próprio), depois o endereço de
 * produção que a Vercel informa no build, depois o servidor local.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): URL {
  if (env.SITE_URL) return new URL(env.SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}
