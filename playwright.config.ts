import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

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
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Safari no iPhone: muitos visitantes abrem o link pelo app do LinkedIn no celular.
    { name: "webkit-celular", use: { ...devices["iPhone 13"] } },
  ],
  // Os testes rodam contra o build de produção.
  webServer: {
    command: "npm run build && npm run start -- -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      // Endereço público fictício, para conferir as URLs absolutas da prévia de link.
      SITE_URL: "https://luige.example",
    },
  },
});
