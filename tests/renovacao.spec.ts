import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { expectedTotal } from "./github-fixtures.mjs";

// Este site de teste (porta 3002) renova os dados do GitHub a cada 2 s, em vez
// de 1 hora, contra uma API falsa que o teste controla (tests/mock-github.mjs).
const API = "http://localhost:4011";
const REVALIDATE_MS = 2000;
const NEW_DATA_BONUS = 100;

const caption = (total: number) => content.en.hero.chartCaption(total);
const shownCaption = (page: Page) =>
  page.getByTestId("contribution-chart").locator("figcaption").textContent();

async function setApi(page: Page, mode: "dados" | "falha" | "novos") {
  await page.request.post(`${API}/__estado`, { data: mode });
}
const graphqlRequests = async (page: Page) =>
  (await (await page.request.get(`${API}/__estado`)).json()).graphql as number;

test.describe.configure({ mode: "serial" });

test.afterAll(async ({ request }) => {
  await request.post(`${API}/__estado`, { data: "dados" });
});

test("se a renovação falhar, continuam valendo os últimos dados válidos", async ({ page }) => {
  await setApi(page, "dados");
  await page.goto("/");
  expect(await shownCaption(page)).toBe(caption(expectedTotal()));

  await setApi(page, "falha");
  const before = await graphqlRequests(page);
  await page.waitForTimeout(REVALIDATE_MS + 500);

  // A visita depois do prazo dispara a renovação em segundo plano, que falha.
  await page.reload();
  await expect.poll(() => graphqlRequests(page), { timeout: 10_000 }).toBeGreaterThan(before);
  await page.waitForTimeout(1000);

  for (let visit = 0; visit < 3; visit++) {
    await page.reload();
    expect(await shownCaption(page)).toBe(caption(expectedTotal()));
  }
});

test("quando a API volta, o gráfico se atualiza sozinho, sem novo build", async ({ page }) => {
  await setApi(page, "novos");
  await page.waitForTimeout(REVALIDATE_MS + 500);

  // Cada visita depois do prazo dispara uma renovação; a seguinte já vê o resultado.
  await expect
    .poll(
      async () => {
        await page.goto("/");
        return shownCaption(page);
      },
      { timeout: 20_000, intervals: [1000] },
    )
    .toBe(caption(expectedTotal(NEW_DATA_BONUS)));
});
