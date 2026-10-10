import { defineConfig, devices } from "@playwright/test";
import { USERS } from "./tests/github-fixtures.mjs";

const isCI = !!process.env.CI;

const MOCK_API = "http://localhost:4010";
// API falsa controlada pelo teste de renovação (dados, falha, dados novos).
const CONTROLLED_API = "http://localhost:4011";
// Porta 9: o fetch do Node a bloqueia como "porta proibida" (bad port) antes de
// tentar conectar. O erro é imediato, como o de uma API fora do ar.
const DOWN_API = "http://127.0.0.1:9";

// Cada versão do site de teste é montada e servida a partir da própria pasta.
function site(port: number, distDir: string, apiUrl: string, env: Record<string, string> = {}) {
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
      GITHUB_PERSONAL_USER: USERS.personal,
      GITHUB_WORK_USER: USERS.work,
      ...env,
    },
  };
}

function mockApi(url: string) {
  return {
    command: `node tests/mock-github.mjs ${new URL(url).port}`,
    url,
    reuseExistingServer: !isCI,
  };
}

const desktop = devices["Desktop Chrome"];

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
      use: { ...desktop },
      testIgnore: /(api-fora-do-ar|renovacao)\.spec\.ts/,
    },
    {
      name: "api-fora-do-ar",
      use: { ...desktop, baseURL: "http://localhost:3001" },
      testMatch: /api-fora-do-ar\.spec\.ts/,
    },
    {
      name: "renovacao",
      use: { ...desktop, baseURL: "http://localhost:3002" },
      testMatch: /renovacao\.spec\.ts/,
    },
  ],
  // Testes rodam contra builds de produção, sem depender do GitHub real.
  webServer: [
    mockApi(MOCK_API),
    mockApi(CONTROLLED_API),
    // Endereço público fictício, para conferir as URLs absolutas da prévia de link.
    site(3000, ".next-e2e", MOCK_API, { SITE_URL: "https://luige.example" }),
    site(3001, ".next-api-fora", DOWN_API),
    // Renovação a cada 2 s em vez de 1 hora, para o teste não esperar.
    site(3002, ".next-renovacao", CONTROLLED_API, { GITHUB_REVALIDATE_SECONDS: "2" }),
  ],
});
