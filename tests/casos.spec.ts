import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { LOG_FIELDS, originalSelector, recoveryCases } from "../src/content/recovery-cases";
import { checkA11y } from "./a11y";
import { contrast, parseRgb } from "./cores";

// Casos reais do protótipo do TCC no card do auto-healing (seções 5.5 e 6.3).

const LOCALES = [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const;

const card = (page: Page) => page.locator('[data-project="autohealing"]');
const panel = (page: Page, id: string) => card(page).locator(`[data-caso="${id}"]`);

/*
 * Elementos do diagrama em âmbar, separados pela saída que percorrem. O âmbar
 * de referência é o do losango da decisão, que é âmbar desde sempre.
 */
const highlighted = (page: Page) =>
  card(page)
    .locator("svg")
    .evaluate((svg) => {
      const amber = getComputedStyle(svg.querySelector('[data-node="decision"] polygon')!).stroke;
      const found: Record<string, string[]> = {};
      for (const el of svg.querySelectorAll<SVGElement>("rect[data-path], line[data-path], text[data-path]")) {
        const style = getComputedStyle(el);
        const color = el.tagName === "text" ? style.fill : style.stroke;
        if (color !== amber) continue;
        const key = el.dataset.path!;
        (found[key] ??= []).push(el.tagName);
      }
      return found;
    });

for (const [locale, browserLocale] of LOCALES) {
  const text = content[locale].recoveryCases;

  test.describe(`casos do TCC em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("sem caso escolhido, o diagrama fica como sempre e nenhum caso aparece", async ({ page }) => {
      await page.goto("/");
      const group = card(page).getByRole("group", { name: text.legend });
      await expect(group).toBeVisible();
      await expect(group.getByRole("radio")).toHaveCount(recoveryCases.length);
      for (const { id } of recoveryCases) {
        await expect(group.getByRole("radio", { name: text.cases[id].label })).not.toBeChecked();
        await expect(panel(page, id)).toBeHidden();
      }
      expect(await highlighted(page)).toEqual({});
    });

    for (const { id, path, log, source } of recoveryCases) {
      const item = text.cases[id];

      test(`"${item.label}" mostra o caso e destaca o caminho`, async ({ page }) => {
        await page.goto("/");
        // Espera o preenchimento do gráfico acabar, para medir só o que a escolha provoca.
        await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
        await card(page).getByRole("radio", { name: item.label }).check();

        const shown = panel(page, id);
        await expect(shown).toBeVisible();
        await expect(shown).toContainText(item.summary);
        await expect(shown).toContainText(item.outcome);
        await expect(shown.locator("dd code").first()).toHaveText(originalSelector(log));
        for (const other of recoveryCases.filter((c) => c.id !== id)) {
          await expect(panel(page, other.id)).toBeHidden();
        }

        // O trecho mostrado é a linha do arquivo, só com os campos escolhidos.
        const excerpt = JSON.parse(await shown.locator("pre").innerText());
        const entry = JSON.parse(log);
        expect(Object.keys(excerpt)).toEqual([...LOG_FIELDS]);
        for (const field of LOG_FIELDS) expect(excerpt[field]).toEqual(entry[field]);
        await expect(shown.getByRole("link", { name: text.logLink })).toHaveAttribute("href", source);

        // Em âmbar: o trecho comum e a saída do caso, nunca a outra saída.
        const other = path === "replaced" ? "fails" : "replaced";
        const found = await highlighted(page);
        expect(found["replaced fails"]?.length).toBeGreaterThan(0);
        expect(found[path]?.sort()).toEqual(["line", "rect", "text"]);
        expect(found[other]).toBeUndefined();

        // Troca de estado, sem animação (seção 5.5).
        expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      });
    }
  });
}

test.describe("idioma dos trechos", () => {
  test.use({ locale: "pt-BR" });

  test("texto em inglês do site testado vem marcado na página em português", async ({ page }) => {
    await page.goto("/");
    await card(page).getByRole("radio", { name: content.pt.recoveryCases.cases["price-removed"].label }).check();
    await expect(panel(page, "price-removed").getByText("In stock (19 available)")).toHaveAttribute("lang", "en");
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false, locale: "en-US" });

  test("escolher um caso funciona do mesmo jeito", async ({ page }) => {
    const { id, path } = recoveryCases[1];
    await page.goto("/");
    await card(page).getByRole("radio", { name: content.en.recoveryCases.cases[id].label }).check();
    await expect(panel(page, id)).toBeVisible();
    expect(Object.keys(await highlighted(page))).toContain(path);
  });
});

test("as setas do teclado trocam de caso", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "no iPhone não há teclado; o Chromium confere");
  await page.goto("/");
  const [first, second] = recoveryCases;
  const radios = card(page).getByRole("radio");
  await radios.first().focus();
  await page.keyboard.press("Space");
  await expect(panel(page, first.id)).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeChecked();
  await expect(panel(page, second.id)).toBeVisible();
  await expect(panel(page, first.id)).toBeHidden();
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`a 360 px, tema ${colorScheme}`, () => {
    test.use({ viewport: { width: 360, height: 780 }, locale: "pt-BR" });

    test("o caso mais longo cabe, com contraste e sem violações", async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      // O caso com mais texto e o trecho de log mais largo.
      const id = "rating-removed";
      await card(page).getByRole("radio", { name: content.pt.recoveryCases.cases[id].label }).check();
      await expect(panel(page, id)).toBeVisible();

      const report = await card(page).evaluate((el) => {
        const figure = el.querySelector("figure")!;
        const line = el.querySelector<SVGLineElement>('line[data-path="replaced"]')!;
        const root = document.documentElement;
        return {
          pageOverflow: root.scrollWidth - root.clientWidth,
          figureOverflow: figure.scrollWidth - figure.clientWidth,
          stroke: getComputedStyle(line).stroke,
          background: getComputedStyle(figure).backgroundColor,
        };
      });
      expect(report.pageOverflow).toBe(0);
      expect(report.figureOverflow).toBe(0);
      // O caminho destacado é informação (WCAG 1.4.11): 3:1 sobre o fundo.
      expect(contrast(parseRgb(report.stroke), parseRgb(report.background))).toBeGreaterThanOrEqual(3);
      expect(await checkA11y(page)).toEqual([]);
    });
  });
}
