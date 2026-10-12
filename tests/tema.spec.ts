import { expect, test, type Page } from "@playwright/test";
import { checkA11y } from "./a11y";

// Papel (fundo) de cada tema, como o navegador o resolve (seção 5.2).
const PAPEL = { light: "rgb(243, 244, 245)", dark: "rgb(22, 24, 27)" };

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const toggle = (page: Page) => page.getByRole("button", { name: /theme/i });

test("com o sistema escuro e nenhuma escolha salva, a página abre escura", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  expect(await background(page)).toBe(PAPEL.dark);
  await expect(toggle(page)).toHaveAccessibleName("Switch to light theme");
});

test("com o sistema claro e nenhuma escolha salva, a página abre clara", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await background(page)).toBe(PAPEL.light);
  await expect(toggle(page)).toHaveAccessibleName("Switch to dark theme");
});

test("alternar o tema, recarregar e o tema escolhido continua", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle(page)).toHaveAccessibleName("Switch to light theme");
  await expect.poll(() => background(page)).toBe(PAPEL.dark);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await background(page)).toBe(PAPEL.dark);

  // E volta: a escolha do claro também fica salva, mesmo com o sistema escuro.
  await page.emulateMedia({ colorScheme: "dark" });
  await toggle(page).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await background(page)).toBe(PAPEL.light);
});

test("o botão funciona pelo teclado", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  // Chega ao botão só com Tab, passando pelos elementos anteriores do cabeçalho.
  for (let i = 0; i < 15 && !(await toggle(page).evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(toggle(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("o tema salvo já vale no primeiro quadro, antes de qualquer pintura", async ({ page }) => {
  // Sistema claro e escolha salva escura: o pior caso para a piscada.
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    // requestAnimationFrame roda antes da primeira pintura.
    requestAnimationFrame(() => {
      (window as unknown as { firstFrame: string }).firstFrame = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--papel");
    });
  });
  await page.goto("/");
  const firstFrame = await page.evaluate(
    () => (window as unknown as { firstFrame: string }).firstFrame,
  );
  expect(firstFrame).toMatch(/#16181b/i);
});

test("a troca esmaece só com opacidade, sem animar cores, e não esmaece com movimento reduzido", async ({
  page,
}) => {
  // Seção 5.5: só transform e opacity. A troca é uma View Transition (duas imagens
  // esmaecidas na placa de vídeo), e não uma transição de cores em cada elemento.
  const COLOR_PROPERTIES = /color|fill|stroke|background|border|outline|shadow/i;
  const animationsOnToggle = () =>
    page.evaluate(async () => {
      document.querySelector<HTMLButtonElement>('button[aria-label*="theme"]')!.click();
      // A transição começa alguns quadros depois do clique (foto do antes, troca, foto do depois).
      const isSnapshot = (effect: KeyframeEffect | null) =>
        /^::view-transition-(old|new)\(root\)$/.test(effect?.pseudoElement ?? "");
      let all: Animation[] = [];
      for (let frame = 0; frame < 20; frame++) {
        all = document.getAnimations();
        if (all.some((animation) => isSnapshot(animation.effect as KeyframeEffect))) break;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      const ignored = ["offset", "computedOffset", "easing", "composite"];
      const propertiesOf = (animation: Animation) =>
        animation instanceof CSSTransition
          ? [animation.transitionProperty]
          : ((animation.effect as KeyframeEffect | null)?.getKeyframes() ?? []).flatMap((frame) =>
              Object.keys(frame).filter((key) => !ignored.includes(key)),
            );
      const snapshots = all.filter((animation) => isSnapshot(animation.effect as KeyframeEffect));
      return {
        // Fotos distintas (antes e depois); cada uma tem mais de uma animação do navegador.
        snapshots: new Set(snapshots.map((animation) => (animation.effect as KeyframeEffect).pseudoElement)).size,
        durations: [...new Set(snapshots.map((animation) => animation.effect!.getTiming().duration))],
        snapshotProperties: [...new Set(snapshots.flatMap(propertiesOf))],
        allProperties: [...new Set(all.flatMap(propertiesOf))],
      };
    });

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  const animated = await animationsOnToggle();
  expect(animated.snapshots, "esmaecimento entre antes e depois").toBe(2);
  expect(animated.durations, "duração em ms").toEqual([200]);
  // mix-blend-mode é a mistura das duas fotos, posta pelo próprio navegador (não é cor nem movimento).
  expect(
    animated.snapshotProperties.filter((property) => property !== "mixBlendMode"),
    "propriedades do esmaecimento",
  ).toEqual(["opacity"]);
  expect(
    animated.allProperties.filter((property) => COLOR_PROPERTIES.test(property)),
    "propriedades de cor animadas",
  ).toEqual([]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect((await animationsOnToggle()).snapshots, "com movimento reduzido").toBe(0);
});

test("sem violações de acessibilidade depois de trocar o tema", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await toggle(page).click();
  await expect.poll(() => background(page)).toBe(PAPEL.dark);
  expect(await checkA11y(page)).toEqual([]);
});
