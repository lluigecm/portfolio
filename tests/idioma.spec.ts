import { expect, test } from "@playwright/test";
import { localeFromAcceptLanguage } from "../src/lib/locale";
import { checkA11y } from "./a11y";

const TITLE = { pt: "Desenvolvedor de Automação de Testes", en: "Test Automation Developer" };

test.describe("navegador em português", () => {
  test.use({ locale: "pt-BR" });

  test("abre em PT", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByText(TITLE.pt)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ativar tema escuro" })).toBeVisible();
  });

  test("sem violações de acessibilidade em PT", async ({ page }) => {
    await page.goto("/");
    expect(await checkA11y(page)).toEqual([]);
  });
});

test.describe("navegador em alemão", () => {
  test.use({ locale: "de-DE" });

  test("abre em EN", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText(TITLE.en)).toBeVisible();
  });
});

test.describe("troca manual", () => {
  test.use({ locale: "en-US" });

  test("trocar o idioma, recarregar e a escolha continua", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.getByRole("button", { name: /Ver em português/ }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByText(TITLE.pt)).toBeVisible();
    await expect(page).toHaveURL("/");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByText(TITLE.pt)).toBeVisible();

    // E volta para o inglês, mesmo com o navegador em inglês.
    await page.getByRole("button", { name: /View in English/ }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    await expect(page.getByText(TITLE.en)).toBeVisible();
  });

  test("a escolha salva prevalece sobre o idioma do navegador", async ({ page, context }) => {
    await context.addCookies([{ name: "lang", value: "pt", url: "http://localhost:3000" }]);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("o botão funciona pelo teclado e mantém o tema", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: /theme/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: /Ver em português/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  });

  test("/pt e /en acessados direto voltam para /", async ({ page }) => {
    for (const path of ["/pt", "/en"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/");
    }
  });
});

test.describe("escolha pelo Accept-Language", () => {
  const cases: [string | null, string][] = [
    ["pt-BR,pt;q=0.9,en;q=0.8", "pt"],
    ["pt-PT", "pt"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,de;q=0.9", "en"],
    ["de-DE,de;q=0.9,pt;q=0.8", "pt"],
    ["en;q=0.5,pt;q=0.8", "pt"],
    ["pt;q=0,en", "en"],
    ["", "en"],
    [null, "en"],
  ];
  for (const [header, expected] of cases) {
    test(`${JSON.stringify(header)} → ${expected}`, () => {
      expect(localeFromAcceptLanguage(header)).toBe(expected);
    });
  }
});
