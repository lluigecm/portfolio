import { expect, test, type Page } from "@playwright/test";
import { contrast, type Rgb } from "./cores";

// Contrastes exigidos pela especificação (seção 5.2), conferidos nos dois temas
// para todos os tokens, mesmo os que ainda não aparecem na página.
const TEXT = ["--texto", "--secundario", "--destaque"];
const PANELS = ["--painel", "--painel-2"];
const CHART_LEVELS = ["--grafico-1", "--grafico-2", "--grafico-3", "--grafico-4"];
// O navegador resolve cada token para rgb(), qualquer que seja a escrita no CSS.
async function resolveTokens(page: Page, names: string[]) {
  const tokens = await page.evaluate((names) => {
    const probe = document.createElement("div");
    document.body.append(probe);
    const resolved = Object.fromEntries(
      names.map((name) => {
        probe.style.color = `var(${name})`;
        const rgb = getComputedStyle(probe).color.match(/\d+/g)!.slice(0, 3);
        return [name, rgb.map(Number)];
      }),
    );
    probe.remove();
    return resolved;
  }, names);
  return tokens as Record<string, Rgb>;
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`tema ${colorScheme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
    });

    test("todo texto atende AA sobre os dois painéis", async ({ page }) => {
      const tokens = await resolveTokens(page, [...TEXT, ...PANELS]);
      for (const fg of TEXT) {
        for (const bg of PANELS) {
          const ratio = contrast(tokens[fg], tokens[bg]);
          expect(ratio, `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test("o destaque de texto tem folga de 5:1 sobre os painéis", async ({ page }) => {
      const tokens = await resolveTokens(page, ["--destaque", ...PANELS]);
      for (const bg of PANELS) {
        const ratio = contrast(tokens["--destaque"], tokens[bg]);
        expect(ratio, `--destaque sobre ${bg}`).toBeGreaterThanOrEqual(5);
      }
    });

    test("a linha tem 4:1 e o foco 3:1 sobre os painéis", async ({ page }) => {
      const tokens = await resolveTokens(page, ["--linha", "--foco", ...PANELS]);
      for (const bg of PANELS) {
        expect(contrast(tokens["--linha"], tokens[bg]), `--linha sobre ${bg}`).toBeGreaterThanOrEqual(4);
        expect(contrast(tokens["--foco"], tokens[bg]), `--foco sobre ${bg}`).toBeGreaterThanOrEqual(3);
      }
    });

    test("a tinta atende AA sobre o amarelo e o teal", async ({ page }) => {
      const tokens = await resolveTokens(page, ["--tinta", "--amarelo", "--teal"]);
      for (const bg of ["--amarelo", "--teal"]) {
        expect(contrast(tokens["--tinta"], tokens[bg]), `--tinta sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("níveis 1 a 4 do gráfico têm 3:1 contra o painel, em ordem crescente", async ({
      page,
    }) => {
      const tokens = await resolveTokens(page, [...CHART_LEVELS, "--painel"]);
      const ratios = CHART_LEVELS.map((level) => contrast(tokens[level], tokens["--painel"]));

      ratios.forEach((ratio, i) => {
        expect(ratio, `${CHART_LEVELS[i]} sobre --painel`).toBeGreaterThanOrEqual(3);
      });
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i], `${CHART_LEVELS[i]} mais forte que o nível anterior`).toBeGreaterThan(
          ratios[i - 1],
        );
      }
    });
  });
}
