import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { waitForHydration } from "./apoio";

test.use({ locale: "pt-BR" });
const text = content.pt;

// Cor do céu, como o navegador a calcula naquele instante (cor registrada com @property).
const sky = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sky").trim());
const NIGHT_SKY = "rgb(12, 20, 69)";
const DAY_SKY = "rgb(108, 198, 255)";

const animations = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName));

test("para o dia: o céu clareia aos poucos, a Lua desce e o Sol nasce", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await waitForHydration(page);
  expect(await sky(page)).toBe(NIGHT_SKY);

  await page.getByRole("button", { name: text.ui.theme.toDay }).click();
  await expect(page.locator("html")).toHaveClass(/amanhece/);
  expect(await animations(page, ".moon")).toContain("astro-desce");
  expect(await animations(page, ".sun")).toContain("astro-sobe");
  expect(await animations(page, ".brilho")).toContain("brilho");
  // No meio do caminho, o céu não é nem o da noite nem o do dia.
  await expect.poll(async () => ![NIGHT_SKY, DAY_SKY].includes(await sky(page))).toBe(true);

  await expect(page.locator("html")).not.toHaveClass(/amanhece/);
  expect(await sky(page)).toBe(DAY_SKY);
  await expect(page.locator(".moon")).toBeHidden();
  await expect(page.locator(".sun")).toBeVisible();
});

test("para a noite: o Sol se põe pelo entardecer e a Lua nasce", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await waitForHydration(page);
  await page.getByRole("button", { name: text.ui.theme.toNight }).click();
  await expect(page.locator("html")).toHaveClass(/anoitece/);
  expect(await animations(page, ".sun")).toContain("astro-desce");
  expect(await animations(page, ".moon")).toContain("astro-sobe");

  await expect(page.locator("html")).not.toHaveClass(/anoitece/);
  expect(await sky(page)).toBe(NIGHT_SKY);
  await expect(page.locator(".sun")).toBeHidden();
  await expect(page.locator(".moon")).toBeVisible();
});

test("com movimento reduzido, o tema troca na hora", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);
  await page.getByRole("button", { name: text.ui.theme.toDay }).click();
  expect(await sky(page)).toBe(DAY_SKY);
  expect(await animations(page, ".sun")).toEqual([]);
  await expect(page.locator(".moon")).toBeHidden();
});
