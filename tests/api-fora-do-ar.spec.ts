import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { checkA11y } from "./a11y";

// Este site de teste (porta 3001) foi montado com a API do GitHub recusando
// conexão: prova também que o build passa com a API fora do ar (regra 14).

test("com a API fora do ar, os cards aparecem só com os textos próprios", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  for (const [id, project] of Object.entries(content.en.projects)) {
    const card = page.locator(`[data-project="${id}"]`);
    await expect(card.getByRole("heading", { name: project.title })).toBeVisible();
    await expect(card.getByText(project.description)).toBeVisible();
    await expect(card.locator("code")).toBeVisible();
    await expect(card.locator('[data-testid="repo-stats"]')).toHaveCount(0);
  }
});

test("com a API fora do ar, o resto da página continua normal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(content.en.hero.name);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  expect(await checkA11y(page)).toEqual([]);
});

test("com a API fora do ar e sem cache, o gráfico não aparece", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("contribution-chart")).toHaveCount(0);
  await expect(page.locator("figcaption#contribution-caption")).toHaveCount(0);
});
