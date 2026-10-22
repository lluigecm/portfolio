import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { waitForHydration } from "./apoio";

test.use({ locale: "pt-BR" });
const text = content.pt;

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);
// Rolagem por script: o WebKit de celular não tem roda do mouse.
const scrollBy = (page: Page, top: number) =>
  page.evaluate((top) => window.scrollBy({ top, behavior: "instant" }), top);

test("o placar conta bugs ao rolar e nunca diminui", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const score = page.getByTestId("score");
  await expect(score).toHaveText("0000");

  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await expect(score).toHaveText("0100");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
  await expect(score).toHaveText("0100");
});

test("o bot anda, vira para trás ao subir e volta a ficar parado", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const walker = page.getByTestId("walker");
  await expect(walker).toHaveClass(/idle/);

  await scrollBy(page, 600);
  await expect(page.locator(".hills")).toHaveAttribute("style", /translateX\(-150px\)/);
  await expect(walker).not.toHaveClass(/flip/);
  await expect(walker).toHaveClass(/idle/);

  await scrollBy(page, -300);
  await expect(walker).toHaveClass(/flip/);
});

test("cada fase ganha uma fala do bot e as barras enchem", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const bubble = page.getByTestId("bubble");
  await expect(bubble).not.toHaveClass(/show/);

  await page.locator('.map a[href="#sobre"]').click();
  await expect(bubble).toHaveText(text.bubble.sobre);
  await expect(bubble).toHaveClass(/show/);
  await expect(page.locator("#sobre .bar i").first()).toHaveAttribute("style", /width: 92%/);

  await page.locator('.map a[href="#contato"]').click();
  await expect(bubble).toHaveText(text.bubble.contato);
});

test("as setas → e ← rolam a página como um controle", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => scrollY(page)).toBe(120);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => scrollY(page)).toBe(0);
});

test("o nome termina de se digitar com o cursor no fim", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const typed = page.locator(".hero .typed");
  await expect.poll(() => typed.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(typed).toHaveText("LUIGE");
  const cursor = await page.locator(".hero .cursor").boundingBox();
  const name = await typed.boundingBox();
  expect(Math.abs(cursor!.x - (name!.x + name!.width))).toBeLessThan(2);
});

test("com movimento reduzido, nada se anima", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);
  const running = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === "running").length,
  );
  expect(running).toBe(0);

  await scrollBy(page, 600);
  await page.waitForTimeout(100);
  await expect(page.getByTestId("walker")).toHaveClass(/idle/);
  await expect(page.locator(".hills")).not.toHaveAttribute("style", /translate/);
});
