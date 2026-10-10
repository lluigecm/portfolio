import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { calendarDays, expectedTotal, USERS } from "./github-fixtures.mjs";
import { checkA11y } from "./a11y";

// O site de teste (porta 3000) usa a API falsa: o total esperado vem dos mesmos dados.
const TOTAL = expectedTotal();
const DAYS = calendarDays(USERS.personal);
const FIRST = DAYS[0].date;
const LAST = DAYS[DAYS.length - 1].date;

const chart = (page: Page) => page.getByTestId("contribution-chart");
const cells = (page: Page) => chart(page).locator("rect[data-date]");

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  const caption = content[locale].hero.chartCaption(TOTAL);

  test.describe(`gráfico em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("mostra a soma das duas contas, com a legenda aprovada", async ({ page }) => {
      await page.goto("/");
      await expect(chart(page).locator("figcaption")).toHaveText(caption);
      // Total formatado no idioma: 1.234 em PT, 1,234 em EN.
      expect(caption).toContain(new Intl.NumberFormat(browserLocale).format(TOTAL));
    });

    test("leitores de tela recebem a alternativa textual", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("figure", { name: caption })).toBeVisible();
      await expect(page.getByRole("region", { name: caption })).toBeVisible();
      await expect(chart(page).locator("svg")).toHaveAttribute("aria-hidden", "true");
      expect(await checkA11y(page)).toEqual([]);
    });
  });
}

test("o total da legenda bate com a soma exibida no gráfico", async ({ page }) => {
  await page.goto("/");
  const counts = await cells(page).evaluateAll((rects) =>
    rects.map((rect) => Number(rect.getAttribute("data-count"))),
  );
  expect(counts).toHaveLength(DAYS.length);
  expect(counts.reduce((sum, count) => sum + count, 0)).toBe(TOTAL);

  // Dia a dia: cada célula é a soma das duas contas naquela data.
  const personal = calendarDays(USERS.personal);
  const work = calendarDays(USERS.work);
  const expected = personal.map((day, i) => day.contributionCount + work[i].contributionCount);
  expect(counts).toEqual(expected);
});

test("usa a escala de âmbar: nível 0 só para dias sem contribuição", async ({ page }) => {
  await page.goto("/");
  const levels = await cells(page).evaluateAll((rects) =>
    rects.map((rect) => ({
      count: Number(rect.getAttribute("data-count")),
      level: Number(rect.getAttribute("class")!.match(/fill-grafico-(\d)/)![1]),
    })),
  );
  for (const { count, level } of levels) {
    expect(level === 0, `contagem ${count} no nível ${level}`).toBe(count === 0);
  }
  expect(new Set(levels.map(({ level }) => level))).toEqual(new Set([0, 1, 2, 3, 4]));
});

test("no desktop, o gráfico ocupa a largura toda sem rolar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const region = chart(page).getByRole("region");
  const sizes = await region.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  const main = await page.locator("main").boundingBox();
  const box = await region.boundingBox();
  // Largura total da coluna de conteúdo (main menos o recuo lateral de 24 px de cada lado).
  expect(Math.round(box!.width)).toBe(Math.round(main!.width - 48));
});

test.describe("no celular", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("rola dentro do próprio espaço, começando pelos meses recentes", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "a página não rola na horizontal").toBe(0);

    const region = chart(page).getByRole("region");
    const sizes = await region.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll, "o gráfico rola").toBeGreaterThan(sizes.client);

    const area = (await region.boundingBox())!;
    const last = (await cells(page).and(page.locator(`[data-date="${LAST}"]`)).boundingBox())!;
    const first = (await cells(page).and(page.locator(`[data-date="${FIRST}"]`)).boundingBox())!;
    expect(last.x + last.width, "dia mais recente à vista").toBeLessThanOrEqual(area.x + area.width + 1);
    expect(last.x, "dia mais recente à vista").toBeGreaterThanOrEqual(area.x);
    expect(first.x + first.width, "dia mais antigo fora da vista").toBeLessThan(area.x);
  });

  test("a área rola pelo teclado", async ({ page }) => {
    await page.goto("/");
    const region = chart(page).getByRole("region");
    await region.focus();
    const before = await region.evaluate((el) => el.scrollLeft);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).not.toBe(before);
  });
});

// Ajuste pós-etapa 9: rótulos de mês legíveis (mínimo de 12 px, como no
// diagrama do TCC), inteiros dentro do gráfico e sem se sobrepor.
for (const viewport of [
  { width: 360, height: 780 },
  { width: 1280, height: 900 },
]) {
  test(`rótulos de mês legíveis a ${viewport.width} px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const report = await chart(page)
      .locator("svg")
      .evaluate((svg: SVGSVGElement) => {
        const box = svg.getBoundingClientRect();
        const scale = box.width / svg.viewBox.baseVal.width;
        const labels = [...svg.querySelectorAll("text")].map((text) => {
          const rect = text.getBoundingClientRect();
          return { text: text.textContent, left: rect.left, right: rect.right };
        });
        return {
          fontSize: parseFloat(svg.getAttribute("font-size")!) * scale,
          labels,
          svg: { left: box.left, right: box.right },
        };
      });

    expect(report.labels.length).toBeGreaterThanOrEqual(12);
    expect(report.fontSize, "tamanho dos rótulos em px").toBeGreaterThanOrEqual(12);
    for (const [i, label] of report.labels.entries()) {
      expect(label.left, `${label.text} dentro do gráfico`).toBeGreaterThanOrEqual(report.svg.left - 0.5);
      expect(label.right, `${label.text} dentro do gráfico`).toBeLessThanOrEqual(report.svg.right + 0.5);
      if (i > 0) {
        expect(label.left, `${label.text} sem sobrepor o anterior`).toBeGreaterThan(report.labels[i - 1].right);
      }
    }
  });
}
