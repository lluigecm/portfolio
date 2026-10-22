import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { calendarDays, expectedTotals, USERS } from "./github-fixtures.mjs";
import { checkA11y } from "./a11y";

// O site de teste (porta 3000) usa a API falsa: os totais esperados vêm dos mesmos dados.
const TOTALS = expectedTotals();
const TOTAL = TOTALS.total;
const DAYS = calendarDays(USERS.personal);
const FIRST = DAYS[0].date;
const LAST = DAYS[DAYS.length - 1].date;

const chart = (page: Page) => page.getByTestId("contribution-chart");
const cells = (page: Page) => chart(page).locator("rect[data-date]");

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  const caption = content[locale].hero.chartCaption(TOTALS);
  const format = new Intl.NumberFormat(browserLocale).format;

  test.describe(`gráfico em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("mostra a soma das duas contas, com a legenda aprovada", async ({ page }) => {
      await page.goto("/");
      await expect(chart(page).locator("figcaption")).toHaveText(caption);
      // Totais formatados no idioma (1.234 em PT, 1,234 em EN): o geral, o de cada
      // conta e as privadas só da conta de trabalho.
      for (const value of [TOTAL, TOTALS.work, TOTALS.workPrivate, TOTALS.personal]) {
        expect(caption).toContain(format(value));
      }
      expect(TOTALS.personal + TOTALS.work).toBe(TOTAL);
    });

    test("sem contribuições privadas, a legenda não fala delas", async () => {
      const without = content[locale].hero.chartCaption({ ...TOTALS, workPrivate: 0 });
      expect(without).not.toContain(format(TOTALS.workPrivate));
      expect(without).not.toMatch(/privad|private/i);
      expect(without).toContain(format(TOTALS.work));
    });

    test("o contador da HUD mostra o mesmo total da legenda", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("hud-contador")).toHaveText(
        content[locale].ui.hud.contributions(TOTAL),
      );
      expect(content[locale].ui.hud.contributions(TOTAL)).toContain(format(TOTAL));
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
  // Largura toda do painel do gráfico (a área de conteúdo, sem bordas e recuos).
  const widths = await region.evaluate((el) => {
    const panel = el.closest('[data-ui="painel"]')!;
    const style = getComputedStyle(panel);
    const content = panel.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return { region: Math.round(el.getBoundingClientRect().width), content: Math.round(content) };
  });
  expect(widths.region).toBe(widths.content);
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
