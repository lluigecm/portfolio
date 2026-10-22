import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os testes E2E montam o site numa pasta separada.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
