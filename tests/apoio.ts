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

/**
 * Espera as entradas das fases terminarem (Scene, globals.css): um cartucho que
 * ainda cai ou uma casa do inventário que ainda cresce muda de lugar debaixo do
 * mouse e do foco.
 */
export async function waitForEntrances(page: Page) {
  await page.waitForFunction(() => {
    // Logo depois de rolar, a cena ainda não marcou os blocos novos: antes de
    // esperar as animações, todo bloco já na tela (acima da linha de entrada,
    // a 92% da altura) tem de ter entrado.
    const pending = [...document.querySelectorAll(".entra:not(.entrou)")].some((block) => {
      const { top, bottom } = block.getBoundingClientRect();
      return top < window.innerHeight * 0.9 && bottom > 0;
    });
    const moving = document.getAnimations().some((a) => {
      const target = (a.effect as KeyframeEffect | null)?.target;
      return a.playState === "running" && a.effect?.getTiming().iterations !== Infinity && target?.closest(".entra");
    });
    return !pending && !moving;
  });
}
