import type { NextConfig } from "next";
import { assertProductionEnv } from "./src/lib/production-env";

// O build de produção na Vercel falha aqui se faltar token ou usuário do GitHub.
assertProductionEnv();

const nextConfig: NextConfig = {
  // Os testes E2E montam versões separadas do site (API falsa, API fora do ar).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Dados do GitHub (cards e gráfico): renovação a cada hora (regra 3) e
    // expiração longa, para os últimos dados válidos continuarem no ar mesmo
    // com a API fora por dias (regra 14). Os testes encurtam a renovação.
    github: {
      stale: 60 * 5,
      revalidate: Number(process.env.GITHUB_REVALIDATE_SECONDS) || 60 * 60,
      expire: 60 * 60 * 24 * 365,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
