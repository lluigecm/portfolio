import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { waitForHydration } from "./apoio";

test.use({ locale: "pt-BR" });
const text = content.pt;

const goTo = (page: Page, id: string) =>
  page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ behavior: "instant" }), id);
const opacity = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).opacity);

test("a TV liga ao abrir o site, sem bloquear cliques, e some", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\btv\b/);
  const tv = page.locator(".tv-liga");
  expect(await tv.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  // O bot cai por cima de tudo e some ao pousar no lugar do de baixo.
  await expect(tv).toBeHidden();
  await expect(page.locator(".queda")).toBeHidden();
  await expect.poll(() => opacity(page, "[data-testid=walker] .px")).toBe("1");
});

test("cada bloco fica escondido até chegar na tela e então entra", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  const panel = page.locator("#exp .panel");
  await expect(panel).not.toHaveClass(/entrou/);
  expect(await opacity(page, "#exp .panel")).toBe("0");

  await goTo(page, "exp");
  await expect(panel).toHaveClass(/entrou/);
  await expect(panel).not.toHaveClass(/pronto/);
  await expect.poll(() => opacity(page, "#exp .panel")).toBe("1");
  await expect.poll(() => opacity(page, "#exp .cp li")).toBe("1");
});

test("na volta da troca de idioma, a página chega pronta e sem TV", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await waitForHydration(page);
  await expect(page.locator("html")).not.toHaveClass(/\btv\b/);
  await expect(page.locator("html")).toHaveAttribute("data-volta", "1");
  expect(await page.locator(".entra:not(.pronto)").count()).toBe(0);
  expect(await opacity(page, "#proj .cart")).toBe("1");

  // Só a volta da troca: recarregar de novo liga a TV.
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\btv\b/);
});

test("a fala do bot se digita", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await goTo(page, "sobre");
  const fala = page.locator("[data-testid=bubble] .fala");
  await expect(fala).toHaveText(text.bubble.sobre);
  expect(await fala.evaluate((el) => el.style.getPropertyValue("--n"))).toBe(String(text.bubble.sobre.length));
});

test("a fase do chefe estoura um confete, que some depois", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await goTo(page, "contato");
  await expect(page.locator(".confete i")).toHaveCount(72);
  await expect(page.locator(".confete")).toHaveCount(0, { timeout: 6000 });
});

test("com movimento reduzido, sem TV, sem entradas e sem confete", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);
  await expect(page.locator(".tv-liga")).toBeHidden();
  expect(await opacity(page, "#proj .cart")).toBe("1");
  await goTo(page, "contato");
  await expect(page.getByTestId("bubble")).toHaveText(text.bubble.contato);
  await expect(page.locator(".confete")).toHaveCount(0);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("tudo aparece parado, sem a TV", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\btv\b/);
    await expect(page.locator(".tv-liga")).toBeHidden();
    for (const selector of ["#sobre .sign", "#exp .panel", "#proj .cart", ".inv li", "#contato .btn"]) {
      expect(await opacity(page, selector)).toBe("1");
    }
  });
});
