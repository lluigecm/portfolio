import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Atrasa as fontes para que a página pinte primeiro com a fonte de reserva
  // e a troca aconteça depois, como numa conexão lenta.
  await page.route("**/*.woff2", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
});

test("as fontes Plex carregam", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((font) => font.status === "loaded")
      .map((font) => font.family),
  );
  expect(loaded.some((family) => family.includes("IBM Plex Sans"))).toBe(true);
});

test("a fonte de reserva é calibrada para a Plex", async ({ page }) => {
  // O next/font gera uma fonte de reserva com as métricas da Plex
  // (size-adjust e afins); é ela que evita o salto quando a Plex chega.
  await page.goto("/");
  const stack = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(stack).toMatch(/^"IBM Plex Sans", "IBM Plex Sans Fallback"/);

  const fallback = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .map((rule) => rule.cssText)
      .find((css) => css.startsWith("@font-face") && css.includes('"IBM Plex Sans Fallback"')),
  );
  expect(fallback).toContain("size-adjust");
});

test("a troca de fonte não desloca o layout", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            value: number;
            hadRecentInput: boolean;
          }[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 500);
      }),
  );
  expect(cls).toBeLessThan(0.01);
});
