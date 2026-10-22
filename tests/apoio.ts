import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/*
 * WCAG AA, menos o contraste de cores: as cores seguem o modelo à risca, e
 * algumas combinações dele ficam abaixo de 4,5:1 (amarelo e turquesa sobre o
 * creme no tema claro, branco sobre o rosa nos dois temas).
 */
export async function checkA11y(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).disableRules(["color-contrast"]).analyze();
  return results.violations;
}

/** Espera o React assumir a página: antes disso, cliques e rolagem não têm efeito. */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const walker = document.querySelector("[data-testid=walker]");
    return !!walker && Object.keys(walker).some((key) => key.startsWith("__react"));
  });
}
