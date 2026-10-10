import { expect, test, type Page } from "@playwright/test";
import { contrast, type Rgb } from "./cores";

// Contrastes exigidos pela especificação (seção 5.2), conferidos nos dois temas
// para todos os tokens, mesmo os que ainda não aparecem na página.
const TEXT = ["--grafite", "--lapis", "--ambar"];
const BACKGROUNDS = ["--papel", "--superficie"];
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

    test("pares de texto atendem AA", async ({ page }) => {
      const tokens = await resolveTokens(page, [...TEXT, ...BACKGROUNDS]);
      for (const fg of TEXT) {
        for (const bg of BACKGROUNDS) {
          const ratio = contrast(tokens[fg], tokens[bg]);
          expect(ratio, `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test("o âmbar tem folga de 5:1 sobre os fundos", async ({ page }) => {
      const tokens = await resolveTokens(page, ["--ambar", ...BACKGROUNDS]);
      for (const bg of BACKGROUNDS) {
        const ratio = contrast(tokens["--ambar"], tokens[bg]);
        expect(ratio, `--ambar sobre ${bg}`).toBeGreaterThanOrEqual(5);
      }
    });

    test("níveis 1 a 4 do gráfico têm 3:1 contra o papel, em ordem crescente", async ({
      page,
    }) => {
      const tokens = await resolveTokens(page, [...CHART_LEVELS, "--papel"]);
      const ratios = CHART_LEVELS.map((level) => contrast(tokens[level], tokens["--papel"]));

      ratios.forEach((ratio, i) => {
        expect(ratio, `${CHART_LEVELS[i]} sobre --papel`).toBeGreaterThanOrEqual(3);
      });
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i], `${CHART_LEVELS[i]} mais forte que o nível anterior`).toBeGreaterThan(
          ratios[i - 1],
        );
      }
    });
  });
}
