import { expect, test } from "@playwright/test";
import { checkA11y } from "./a11y";

test("a página inicial carrega", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Luige");
});

test("a página inicial não tem violações de acessibilidade", async ({ page }) => {
  await page.goto("/");
  expect(await checkA11y(page)).toEqual([]);
});
