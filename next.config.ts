import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os testes E2E montam versões separadas do site (API falsa, API fora do ar).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
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
