import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

const MOCK_API = "http://localhost:4010";
// Porta 9 (discard): a conexão é recusada na hora, como uma API fora do ar.
const DOWN_API = "http://127.0.0.1:9";

// Cada versão do site de teste é montada e servida a partir da própria pasta.
function site(port: number, distDir: string, apiUrl: string) {
  return {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: {
      NEXT_DIST_DIR: distDir,
      GITHUB_API_URL: apiUrl,
      // Nenhum token vai para a API falsa; os testes não dependem do GitHub real.
      GITHUB_TOKEN: "",
    },
  };
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /api-fora-do-ar\.spec\.ts/,
    },
    {
      name: "api-fora-do-ar",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3001" },
      testMatch: /api-fora-do-ar\.spec\.ts/,
    },
  ],
  // Testes rodam contra builds de produção, sem depender do GitHub real.
  webServer: [
    {
      command: "node tests/mock-github.mjs",
      url: MOCK_API,
      reuseExistingServer: !isCI,
    },
    site(3000, ".next-e2e", MOCK_API),
    site(3001, ".next-api-fora", DOWN_API),
  ],
});
