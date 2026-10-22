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

/*
 * Clica no botão de tema e confere a troca na própria página, no mesmo instante:
 * as animações de Lua, Sol e brilho, e a cor do céu na metade da transição
 * (pausada e levada a 700 ms). Fora da página, a ida e volta do teste num CI
 * lento chegava depois da troca terminar.
 */
const switchTheme = (page: Page, label: string) =>
  page.evaluate((label) => {
    const root = document.documentElement;
    document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
    const names = (selector: string) =>
      document.querySelector(selector)!.getAnimations().map((a) => (a as CSSAnimation).animationName);
    const transition = document.getAnimations().find((a) => (a as CSSTransition).transitionProperty === "--sky");
    transition?.pause();
    if (transition) transition.currentTime = 700;
    const midway = getComputedStyle(root).getPropertyValue("--sky").trim();
    transition?.play();
    return { classes: root.className, moon: names(".moon"), sun: names(".sun"), glow: names(".brilho"), midway };
  }, label);

test("para o dia: o céu clareia aos poucos, a Lua desce e o Sol nasce", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await waitForHydration(page);
  expect(await sky(page)).toBe(NIGHT_SKY);

  const during = await switchTheme(page, text.ui.theme.toDay);
  expect(during.classes).toContain("amanhece");
  expect(during.moon).toContain("astro-desce");
  expect(during.sun).toContain("astro-sobe");
  expect(during.glow).toContain("brilho");
  // No meio do caminho, o céu não é nem o da noite nem o do dia.
  expect([NIGHT_SKY, DAY_SKY]).not.toContain(during.midway);

  await expect(page.locator("html")).not.toHaveClass(/amanhece/);
  expect(await sky(page)).toBe(DAY_SKY);
  await expect(page.locator(".moon")).toBeHidden();
  await expect(page.locator(".sun")).toBeVisible();
});

test("para a noite: o Sol se põe pelo entardecer e a Lua nasce", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await waitForHydration(page);
  const during = await switchTheme(page, text.ui.theme.toNight);
  expect(during.classes).toContain("anoitece");
  expect(during.sun).toContain("astro-desce");
  expect(during.moon).toContain("astro-sobe");
  expect([NIGHT_SKY, DAY_SKY]).not.toContain(during.midway);

  await expect(page.locator("html")).not.toHaveClass(/anoitece/);
  expect(await sky(page)).toBe(NIGHT_SKY);
  await expect(page.locator(".sun")).toBeHidden();
  await expect(page.locator(".moon")).toBeVisible();
});

test("com movimento reduzido, o tema troca na hora", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);
  const during = await switchTheme(page, text.ui.theme.toDay);
  expect(during.midway).toBe(DAY_SKY);
  expect(during.sun).toEqual([]);
  await expect(page.locator(".moon")).toBeHidden();
});
