import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { palette } from "../src/lib/palette";
import { siteUrl } from "../src/lib/site";

// O site de teste (porta 3000) é montado com SITE_URL=https://luige.example.
const BASE = "https://luige.example";

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute("content");

/** Largura e altura de um PNG, lidas do cabeçalho IHDR. */
function pngSize(buffer: Buffer) {
  expect(buffer.subarray(1, 4).toString()).toBe("PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const [locale, browserLocale, ogLocale, ogAlternate] of [
  ["pt", "pt-BR", "pt_BR", "en_US"],
  ["en", "en-US", "en_US", "pt_BR"],
] as const) {
  const text = content[locale];

  test.describe(`prévia de link em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("a aba mostra o título certo", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(text.meta.title);
    });

    test("Open Graph e Twitter Card completos", async ({ page }) => {
      await page.goto("/");
      expect(await meta(page, "description")).toBe(text.meta.description);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(BASE);

      expect(await meta(page, "og:type")).toBe("website");
      expect(await meta(page, "og:url")).toBe(BASE);
      expect(await meta(page, "og:site_name")).toBe(text.hero.name);
      expect(await meta(page, "og:title")).toBe(text.meta.title);
      expect(await meta(page, "og:description")).toBe(text.meta.description);
      expect(await meta(page, "og:locale")).toBe(ogLocale);
      expect(await meta(page, "og:locale:alternate")).toBe(ogAlternate);
      expect(await meta(page, "og:image")).toMatch(new RegExp(`^${BASE}/${locale}/opengraph-image/`));
      expect(await meta(page, "og:image:width")).toBe("1200");
      expect(await meta(page, "og:image:height")).toBe("630");
      expect(await meta(page, "og:image:alt")).toBe(`${text.hero.name}, ${text.hero.title}`);

      expect(await meta(page, "twitter:card")).toBe("summary_large_image");
      expect(await meta(page, "twitter:title")).toBe(text.meta.title);
      expect(await meta(page, "twitter:description")).toBe(text.meta.description);
      expect(await meta(page, "twitter:image")).toMatch(new RegExp(`^${BASE}/${locale}/twitter-image/`));
    });

    test("as imagens de prévia existem, em PNG de 1200 × 630", async ({ page }) => {
      await page.goto("/");
      for (const key of ["og:image", "twitter:image"]) {
        // A URL aponta para o endereço público; o teste busca o mesmo caminho localmente.
        const url = new URL((await meta(page, key))!);
        const response = await page.request.get(url.pathname + url.search);
        expect(response.status(), key).toBe(200);
        expect(response.headers()["content-type"]).toBe("image/png");
        expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 });
      }
    });
  });
}

test("favicon e ícone do iPhone próprios", async ({ page }) => {
  await page.goto("/");
  const icon = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(icon).toMatch(/^\/icon\.svg/);
  const svg = await page.request.get(icon!);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");

  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  const png = await page.request.get(apple!);
  expect(png.status()).toBe(200);
  expect(pngSize(await png.body())).toEqual({ width: 180, height: 180 });

  // O favicon padrão do Next saiu do projeto.
  expect((await page.request.get("/favicon.ico")).status()).toBe(404);
});

test("as cores das imagens geradas são as dos tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf("}", css.indexOf(selector)));
  const token = (source: string, name: string) =>
    source.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1].toLowerCase();

  const light = block(":root {");
  const dark = block(':root[data-theme="dark"] {');
  for (const name of ["papel", "grafite", "lapis", "linha", "ambar"] as const) {
    expect(palette.light[name], name).toBe(token(light, name));
  }
  // Escala do gráfico: nível 0 = linha, nível 2 = âmbar (seção 5.2).
  expect(palette.light.grafico).toEqual([
    token(light, "linha"),
    token(light, "grafico-1"),
    token(light, "ambar"),
    token(light, "grafico-3"),
    token(light, "grafico-4"),
  ]);
  for (const name of ["papel", "grafite", "ambar"] as const) {
    expect(palette.dark[name], `${name} (escuro)`).toBe(token(dark, name));
  }

  const iconColors = readFileSync("src/app/icon.svg", "utf8").match(/#[0-9a-f]{6}/gi) ?? [];
  const known = new Set(Object.values(palette).flatMap((theme) => Object.values(theme).flat()));
  for (const color of iconColors) expect(known, `cor ${color} do favicon`).toContain(color.toLowerCase());
});

test("endereço base: SITE_URL, depois o da Vercel, depois o local", () => {
  expect(siteUrl({ SITE_URL: "https://luige.dev" }).href).toBe("https://luige.dev/");
  expect(
    siteUrl({ SITE_URL: "https://luige.dev", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }).href,
  ).toBe("https://luige.dev/");
  expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "portfolio.vercel.app" }).href).toBe(
    "https://portfolio.vercel.app/",
  );
  expect(siteUrl({}).href).toBe("http://localhost:3000/");
});
