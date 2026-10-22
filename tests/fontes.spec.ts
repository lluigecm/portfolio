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

test("a Press Start 2P carrega e nunca fica abaixo de 14 px", async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const report = await page.evaluate(() => ({
      loaded: [...document.fonts].some(
        (font) => font.family.includes("Press Start 2P") && font.status === "loaded",
      ),
      // Elementos com texto próprio na Press Start 2P e o tamanho de cada um.
      small: [...document.querySelectorAll("body *")]
        .filter((el) => [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim()))
        .map((el) => ({ el, style: getComputedStyle(el) }))
        .filter(({ style }) => style.fontFamily.includes("Press Start 2P"))
        .filter(({ style }) => parseFloat(style.fontSize) < 14)
        .map(({ el, style }) => `${el.tagName} ${style.fontSize}: ${el.textContent!.trim().slice(0, 30)}`),
      used: [...document.querySelectorAll("h1, h2, h3")].every((el) =>
        getComputedStyle(el).fontFamily.includes("Press Start 2P"),
      ),
    }));
    expect(report, `${width} px`).toEqual({ loaded: true, small: [], used: true });
  }
});

test("a reserva da Press Start 2P é a calibrada, com as mesmas medidas", async ({ page }) => {
  // Uma pilha de fontes inválida (ex.: nome sem aspas começando com dígito) faz o
  // navegador descartar a declaração e os títulos caírem na Plex sem aviso.
  await page.goto("/");
  const stack = await page.evaluate(() => getComputedStyle(document.querySelector("h1")!).fontFamily);
  expect(stack).toMatch(/^"?Press Start 2P"?, "?Reserva Press Start"?/);

  // Como a original: cada caractere avança 1 em e o texto ocupa 1 em acima da
  // linha de base e nada abaixo dela (a 16 px: 16, 16 e 0). Se a altura não
  // bater, o texto desce quando a fonte chega, mesmo com a largura certa.
  const metrics = await page.evaluate(() => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = '16px "Reserva Press Start"';
    const text = ctx.measureText("MMMMMMMMMM");
    return { advance: text.width / 10, ascent: text.fontBoundingBoxAscent, descent: text.fontBoundingBoxDescent };
  });
  expect(metrics.advance).toBeCloseTo(16, 0);
  expect(metrics.ascent).toBeCloseTo(16, 0);
  expect(metrics.descent).toBeCloseTo(0, 0);
});

test("a fonte de reserva é calibrada para a Plex", async ({ page }) => {
  // O next/font gera uma fonte de reserva com as métricas da Plex
  // (size-adjust e afins); é ela que evita o salto quando a Plex chega.
  await page.goto("/");
  const stack = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  // O WebKit escreve a pilha sem aspas; o Chromium, com aspas.
  expect(stack).toMatch(/^"?IBM Plex Sans"?, "?IBM Plex Sans Fallback"?/);

  const fallback = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .map((rule) => rule.cssText)
      .find((css) => css.startsWith("@font-face") && /font-family: "?IBM Plex Sans Fallback"?;/.test(css)),
  );
  expect(fallback).toContain("size-adjust");
});

const FALLBACKS = ["IBM Plex Sans Fallback", "IBM Plex Sans Reserva"];

test("as duas reservas têm a mesma calibração", async ({ page }) => {
  // A segunda reserva (globals.css) copia os números que o next/font gera para a Arial.
  await page.goto("/");
  const descriptors = await page.evaluate((families) => {
    const faces = [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule);
    return families.map((family) => {
      const face = faces.find((rule) => rule.style.getPropertyValue("font-family").includes(family));
      return ["ascent-override", "descent-override", "line-gap-override", "size-adjust"].map(
        (name) => parseFloat(face?.style.getPropertyValue(name) ?? "NaN").toFixed(2),
      );
    });
  }, FALLBACKS);
  expect(descriptors[1]).toEqual(descriptors[0]);
});

test("há uma reserva calibrada disponível neste sistema", async ({ page }) => {
  // Arial (Windows, macOS, iOS) ou Liberation Sans/Roboto (Linux, Android).
  await page.goto("/");
  const available = await page.evaluate(async (families) => {
    const result: Record<string, boolean> = {};
    for (const family of families) {
      try {
        result[family] = (await document.fonts.load(`16px "${family}"`)).length > 0;
      } catch {
        result[family] = false;
      }
    }
    return result;
  }, FALLBACKS);
  console.log("Reservas disponíveis:", JSON.stringify(available));
  expect(Object.values(available).some(Boolean), JSON.stringify(available)).toBe(true);
});

// A página completa (etapa 6) tem texto suficiente para deslocar; o celular
// quebra mais linhas, então mede nas duas larguras.
for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 900 },
]) {
  test(`a troca de fonte não desloca o layout (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize(viewport);
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
}
