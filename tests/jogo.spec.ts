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

  // Rolagem por script: com o mouse em cima de um card, a fala seria a do card.
  const goTo = (id: string) =>
    page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ behavior: "instant" }), id);
  await goTo("sobre");
  await expect(bubble).toHaveText(text.bubble.sobre);
  await expect(bubble).toHaveClass(/show/);
  await expect(page.locator("#sobre .bar i").first()).toHaveAttribute("style", /width: 92%/);
  // A barra ocupa a linha toda e enche 92% dela.
  await expect
    .poll(() =>
      page.locator("#sobre .bar").first().evaluate((bar) => {
        const fill = bar.querySelector("i")!.getBoundingClientRect().width;
        return Math.round((fill / bar.clientWidth) * 100);
      }),
    )
    .toBe(92);

  await goTo("contato");
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

test("o inventário equipa o item escolhido e mostra os detalhes", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const info = page.getByTestId("item-info");
  const slots = page.locator(".slot");
  await expect(slots.first()).toHaveAttribute("aria-pressed", "true");
  await expect(info).toContainText(text.stack.items.playwright.description);

  await page.getByRole("button", { name: /Robot/ }).click();
  await expect(slots.nth(3)).toHaveAttribute("aria-pressed", "true");
  await expect(slots.first()).toHaveAttribute("aria-pressed", "false");
  await expect(info).toContainText("Robot Framework");
  await expect(info).toContainText(text.stack.items.robot.description);

  // As setas trocam de item sem rolar a página.
  const y = await scrollY(page);
  await page.keyboard.press("ArrowRight");
  await expect(slots.nth(4)).toHaveAttribute("aria-pressed", "true");
  await expect(slots.nth(4)).toBeFocused();
  await expect(info).toContainText(text.stack.items.java.description);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(slots.nth(2)).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(300);
  expect(await scrollY(page)).toBe(y);
});

test("passar o mouse num card faz o bot comentar", async ({ page, isMobile }) => {
  test.skip(isMobile, "sem mouse no celular");
  await page.goto("/");
  await waitForHydration(page);
  await page.locator(".cart").first().scrollIntoViewIfNeeded();
  await page.locator(".cart").nth(1).hover();
  await expect(page.getByTestId("bubble")).toHaveText(text.projects.falas.mygather);
  await expect(page.getByTestId("bubble")).toHaveClass(/show/);
});

test("clicar no bot faz ele pular", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const sprite = page.locator("[data-testid=walker] .px");
  await page.getByTestId("walker").click();
  await expect(sprite).toHaveClass(/jump/);
  await expect(sprite).not.toHaveClass(/jump/);
});

test("o botão de dia e noite troca o céu e a escolha fica salva", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await waitForHydration(page);
  await expect(page.locator(".moon")).toBeVisible();
  await expect(page.locator(".sun")).toBeHidden();

  await page.getByRole("button", { name: text.ui.theme.toDay }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".sun")).toBeVisible();
  await expect(page.locator(".moon")).toBeHidden();
  await expect(page.locator("body")).toHaveCSS("color", "rgb(26, 26, 46)");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".sun")).toBeVisible();
  await page.getByRole("button", { name: text.ui.theme.toNight }).click();
  await expect(page.locator(".moon")).toBeVisible();
});

test("o céu tem nuvens e as moitas balançam", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cloud")).toHaveCount(5);
  const sway = await page.locator(".bush .f2").first().evaluate((el) =>
    el.getAnimations().map((a) => (a as CSSAnimation).animationName),
  );
  expect(sway).toContain("sway-b");
});
