import { expect, test, type Page } from "@playwright/test";
import { checkA11y } from "./a11y";

// Papel (fundo) de cada tema, como o navegador o resolve (seção 5.2).
const PAPEL = { light: "rgb(243, 244, 245)", dark: "rgb(22, 24, 27)" };

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const toggle = (page: Page) => page.getByRole("button", { name: /theme/i });

test("com o sistema escuro e nenhuma escolha salva, a página abre escura", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  expect(await background(page)).toBe(PAPEL.dark);
  await expect(toggle(page)).toHaveAccessibleName("Switch to light theme");
});

test("com o sistema claro e nenhuma escolha salva, a página abre clara", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await background(page)).toBe(PAPEL.light);
  await expect(toggle(page)).toHaveAccessibleName("Switch to dark theme");
});

test("alternar o tema, recarregar e o tema escolhido continua", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle(page)).toHaveAccessibleName("Switch to light theme");
  await expect.poll(() => background(page)).toBe(PAPEL.dark);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await background(page)).toBe(PAPEL.dark);

  // E volta: a escolha do claro também fica salva, mesmo com o sistema escuro.
  await page.emulateMedia({ colorScheme: "dark" });
  await toggle(page).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await background(page)).toBe(PAPEL.light);
});

test("o botão funciona pelo teclado", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  // Chega ao botão só com Tab, passando pelos elementos anteriores do cabeçalho.
  for (let i = 0; i < 15 && !(await toggle(page).evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(toggle(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("o tema salvo já vale no primeiro quadro, antes de qualquer pintura", async ({ page }) => {
  // Sistema claro e escolha salva escura: o pior caso para a piscada.
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    // requestAnimationFrame roda antes da primeira pintura.
    requestAnimationFrame(() => {
      (window as unknown as { firstFrame: string }).firstFrame = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--papel");
    });
  });
  await page.goto("/");
  const firstFrame = await page.evaluate(
    () => (window as unknown as { firstFrame: string }).firstFrame,
  );
  expect(firstFrame).toMatch(/#16181b/i);
});

test("a troca tem transição, que some com prefers-reduced-motion", async ({ page }) => {
  const durationAfterToggle = async () => {
    await toggle(page).click();
    return page.evaluate(() => getComputedStyle(document.body).transitionDuration);
  };

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  await page.goto("/");
  expect(await page.evaluate(() => getComputedStyle(document.body).transitionDuration)).toBe(
    "0s",
  );
  expect(await durationAfterToggle()).toBe("0.2s");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(await durationAfterToggle()).toBe("0s");
});

test("sem violações de acessibilidade depois de trocar o tema", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await toggle(page).click();
  await expect.poll(() => background(page)).toBe(PAPEL.dark);
  expect(await checkA11y(page)).toEqual([]);
});
