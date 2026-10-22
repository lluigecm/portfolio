import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/*
 * WCAG AA. Ficam de fora só o nó BOSS do mapa e a placa BOSS STAGE: branco
 * sobre o rosa, como no modelo, abaixo de 4,5:1.
 */
export async function checkA11y(page: Page) {
  // Sem animações: no meio da piscada do PRESS TO START, o texto fica a 25% de
  // opacidade e o contraste medido não é o real.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .exclude(".map li:last-child .node")
    .exclude(".boss-sign")
    .analyze();
  return results.violations;
}

/**
 * Espera a página ficar interativa. A classe "jogo" entra no <html> no efeito da
 * cena, no mesmo passo em que as escutas de rolagem, teclado e mouse; os outros
 * componentes já hidrataram nesse momento.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("jogo"));
}
