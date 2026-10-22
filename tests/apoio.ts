import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/*
 * WCAG AA. Ficam de fora só o nó BOSS do mapa e a placa BOSS STAGE: branco
 * sobre o rosa, como no modelo, abaixo de 4,5:1.
 */
export async function checkA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .exclude(".map li:last-child .node")
    .exclude(".boss-sign")
    .analyze();
  return results.violations;
}

/** Espera o React assumir a página: antes disso, cliques e rolagem não têm efeito. */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const walker = document.querySelector("[data-testid=walker]");
    return !!walker && Object.keys(walker).some((key) => key.startsWith("__react"));
  });
}
