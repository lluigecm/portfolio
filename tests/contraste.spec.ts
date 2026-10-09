import { expect, test } from "@playwright/test";

// Todo par de texto da paleta precisa de contraste AA (4,5:1) nos dois temas,
// mesmo os que ainda não aparecem na página.
const TEXT = ["--grafite", "--lapis", "--ambar"];
const BACKGROUNDS = ["--papel", "--superficie"];

type Rgb = [number, number, number];

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`pares de texto atendem AA no tema ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    // O navegador resolve cada token para rgb(), qualquer que seja a escrita no CSS.
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
    }, [...TEXT, ...BACKGROUNDS]);

    for (const fg of TEXT) {
      for (const bg of BACKGROUNDS) {
        const ratio = contrast(tokens[fg] as Rgb, tokens[bg] as Rgb);
        expect(ratio, `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
