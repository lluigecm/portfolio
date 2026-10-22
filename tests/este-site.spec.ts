import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { projects, type CodeMedia } from "../src/content/projects";

// Card "Este site": o que a suíte de testes do portfólio prova (seção 6.3).

const project = projects.find(({ id }) => id === "portfolio")!;
const media = project.media as CodeMedia;
const blob = (file: string) => `https://github.com/${project.repo}/blob/main/${file}`;

test("o trecho de teste do card é cópia literal do arquivo", () => {
  expect(media.kind).toBe("code");
  expect(readFileSync(media.file, "utf8")).toContain(media.excerpt);
});

test("cada prova aponta para um arquivo de teste que existe", () => {
  for (const locale of ["pt", "en"] as const) {
    const proofs = content[locale].projects.portfolio.proofs!;
    expect(proofs.length).toBeGreaterThan(0);
    for (const { file } of proofs) expect(existsSync(file), file).toBe(true);
  }
  // PT e EN citam os mesmos testes, na mesma ordem.
  const files = (locale: "pt" | "en") => content[locale].projects.portfolio.proofs!.map((p) => p.file);
  expect(files("en")).toEqual(files("pt"));
});

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  const text = content[locale].projects.portfolio;

  test.describe(`card deste site em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("mostra o que os testes provam, com o link de cada um e do CI", async ({ page }) => {
      await page.goto("/");
      const card = page.locator('[data-project="portfolio"]');
      await expect(card.getByRole("heading", { name: text.title })).toBeVisible();

      const items = card.getByRole("listitem");
      await expect(items).toHaveCount(text.proofs!.length);
      for (const [i, { text: proof, file }] of text.proofs!.entries()) {
        await expect(items.nth(i)).toContainText(proof);
        await expect(items.nth(i).getByRole("link", { name: file })).toHaveAttribute("href", blob(file));
      }
      await expect(card.getByRole("link", { name: text.ciLabel! })).toHaveAttribute("href", project.ci!);

      // A mídia é o trecho do teste, com o arquivo de origem na legenda.
      const figure = card.locator("figure");
      expect(await figure.locator("pre").innerText()).toBe(media.excerpt);
      await expect(figure.locator("figcaption")).toContainText(text.mediaAlt);
      await expect(figure.locator("figcaption code")).toHaveText(media.file);
      // O arquivo do trecho é um dos testes da lista, que já tem o link.
      expect(text.proofs!.map((p) => p.file)).toContain(media.file);
    });
  });
}

test.describe("a 360 px", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("o trecho de código rola no próprio espaço, também pelo teclado", async ({ page }) => {
    await page.goto("/");
    const pre = page.locator('[data-project="portfolio"] pre');
    const report = await pre.evaluate((el) => ({
      scrolls: el.scrollWidth > el.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(report).toEqual({ scrolls: true, page: 0 });
    await expect(pre).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("region", { name: content.en.projects.portfolio.mediaAlt })).toBeVisible();
  });
});
