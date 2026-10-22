import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("a imagem do CI usa a mesma versão do Playwright do projeto", () => {
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const version = lock.packages["node_modules/@playwright/test"].version;
  expect(ci).toContain(`mcr.microsoft.com/playwright:v${version}-noble`);
});
