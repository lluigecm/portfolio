import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { waitForEntrances, waitForHydration } from "./apoio";

test.use({ locale: "pt-BR" });
const labels = content.pt.ui.sound;

test("efeitos e música começam ligados, cada um com o seu botão, e a escolha fica salva", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const effects = page.getByRole("button", { name: labels.effects });
  const music = page.getByRole("button", { name: labels.music });
  await expect(effects).toHaveAttribute("aria-pressed", "true");
  await expect(music).toHaveAttribute("aria-pressed", "true");

  await music.click();
  await expect(music).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await waitForHydration(page);
  await expect(music).toHaveAttribute("aria-pressed", "false");
  await expect(effects).toHaveAttribute("aria-pressed", "true");
});

test("a música começa no primeiro toque na página e para no botão", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const html = page.locator("html");
  // Antes de um gesto do visitante, o navegador não deixa tocar nada.
  expect(await html.getAttribute("data-musica")).toBeNull();

  await page.locator(".hint").click();
  await expect(html).toHaveAttribute("data-musica", "ligada");
  await page.getByRole("button", { name: labels.music }).click();
  await expect(html).toHaveAttribute("data-musica", "desligada");
});

test("a fala do bot não toca som", async ({ page, isMobile }) => {
  test.skip(isMobile, "sem mouse no celular");
  await page.goto("/");
  await waitForHydration(page);
  await page.locator(".cart").first().evaluate((cart) => cart.scrollIntoView({ behavior: "instant", block: "center" }));
  await waitForEntrances(page);
  // Registra todo efeito pedido ao motor (lib/som.ts) a partir daqui.
  await page.evaluate(() => {
    const heard: string[] = [];
    Object.assign(window, { heard });
    window.addEventListener("som-efeito", (event) => heard.push((event as CustomEvent<string>).detail));
  });
  await page.locator(".cart").nth(1).hover();
  await expect(page.getByTestId("bubble")).toHaveText(content.pt.projects.falas.mygather);
  expect(await page.evaluate(() => (window as unknown as { heard: string[] }).heard)).toEqual([]);
});

test("a HUD com os botões de som cabe a 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await waitForHydration(page);
  const hud = await page.locator(".hud").evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(hud.scroll).toBeLessThanOrEqual(hud.client);
  await expect(page.locator(".hud .theme-btn")).toBeInViewport({ ratio: 1 });
});
