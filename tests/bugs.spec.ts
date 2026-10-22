import { expect, test, type Page } from "@playwright/test";
import { waitForHydration } from "./apoio";

// Rolagem por script: o WebKit de celular não tem roda do mouse.
const scrollBy = (page: Page, top: number) =>
  page.evaluate((top) => window.scrollBy({ top, behavior: "instant" }), top);

test("rolar bastante traz um bug; o bot pisa nele e o placar ganha 100", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await expect(page.locator(".bug")).toHaveCount(0);

  await scrollBy(page, 1900);
  await expect(page.locator(".bug")).toHaveCount(1);
  // O bug corre junto com o chão: rolar mais o traz até o bot.
  await scrollBy(page, 1500);
  await expect(page.locator(".bug.achatado")).toHaveCount(1, { timeout: 8000 });
  await expect(page.locator(".bug .mais")).toHaveText("+100");
  const y = await page.evaluate(() => window.scrollY);
  await expect(page.getByTestId("score")).toHaveText(String(Math.floor(y / 9) + 100).padStart(4, "0"));
  await expect(page.locator(".bug")).toHaveCount(0, { timeout: 4000 });
});

test("com movimento reduzido, nenhum bug aparece", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);
  await scrollBy(page, 4000);
  await page.waitForTimeout(300);
  await expect(page.locator(".bug")).toHaveCount(0);
});
