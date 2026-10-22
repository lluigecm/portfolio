import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { checkA11y } from "./apoio";

// Este site de teste (porta 3001) foi montado com a API do GitHub recusando
// conexão: prova também que o build passa com a API fora do ar.

test("com a API fora do ar e sem cache, o gráfico não aparece", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#sobre .about")).toBeVisible();
  await expect(page.getByTestId("contribution-chart")).toHaveCount(0);
  await expect(page.locator("#contribution-caption")).toHaveCount(0);
});

test("com a API fora do ar, o resto da página continua normal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(content.en.hero.name);
  await expect(page.locator("section.level")).toHaveCount(6);
  await expect(page.locator(".cart")).toHaveCount(2);
  expect(await checkA11y(page)).toEqual([]);
});
