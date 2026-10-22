import { devices, expect, test, type Page } from "@playwright/test";

/*
 * Movimento (seção 5.5). Efeito 1: preenchimento do gráfico; efeito 2: relevo
 * sob o mouse; efeito 3: transição na troca de idioma. Com
 * prefers-reduced-motion, nenhum dos três acontece.
 */

const MAX_TOTAL_MS = 700;
const EASE_OUT = "cubic-bezier(0, 0, 0.2, 1)";
// Parâmetros do relevo (seção 5.5): nível 4 sob o cursor.
const MAX_LIFT = 0.65;
const MAX_SCALE = 1.21;

const svg = (page: Page) => page.locator("#contribution-svg");

/** Espera o preenchimento terminar e o relevo ser ligado. */
async function reliefReady(page: Page) {
  await expect(svg(page)).toHaveClass(/grafico-relevo/);
}

/** Posição de cada célula na tela: base, largura, nível e centro no SVG. */
const cellBoxes = (page: Page) =>
  svg(page).evaluate((element: SVGSVGElement) =>
    [...element.querySelectorAll<SVGRectElement>("rect[data-level]")].map((rect) => {
      const box = rect.getBoundingClientRect();
      return {
        date: rect.dataset.date!,
        level: Number(rect.dataset.level),
        bottom: box.bottom,
        width: box.width,
        cx: rect.x.baseVal.value + rect.width.baseVal.value / 2,
        cy: rect.y.baseVal.value + rect.height.baseVal.value / 2,
        transform: rect.style.transform,
      };
    }),
  );

/** Uma célula de nível 4 perto do meio do gráfico, para pôr o cursor em cima. */
async function hoverStrongCell(page: Page) {
  const target = page.locator('#contribution-svg rect[data-level="4"]').nth(20);
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  return target.getAttribute("data-date");
}

test.describe("efeito 1: preenchimento do gráfico", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("só opacidade, curva de entrada, uma vez, das semanas antigas às recentes, em até 700 ms", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const weeks = await page.locator(".grafico-semana").evaluateAll((groups) =>
      groups.map((group) => {
        const style = getComputedStyle(group);
        return {
          name: style.animationName,
          duration: parseFloat(style.animationDuration) * 1000,
          delay: parseFloat(style.animationDelay) * 1000,
          easing: style.animationTimingFunction,
          iterations: style.animationIterationCount,
        };
      }),
    );
    expect(weeks.length).toBeGreaterThan(50);

    const keyframes = await page.evaluate(() => {
      const rule = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .find((r): r is CSSKeyframesRule => r instanceof CSSKeyframesRule && r.name === "grafico-preencher");
      return rule ? [...rule.cssRules].flatMap((frame) => [...(frame as CSSKeyframeRule).style]) : null;
    });
    expect(keyframes, "propriedades animadas").toEqual(["opacity"]);

    expect(new Set(weeks.map((week) => week.name))).toEqual(new Set(["grafico-preencher"]));
    expect(new Set(weeks.map((week) => week.easing))).toEqual(new Set([EASE_OUT]));
    expect(new Set(weeks.map((week) => week.iterations)), "uma vez").toEqual(new Set(["1"]));

    const delays = weeks.map((week) => week.delay);
    expect(delays, "da semana mais antiga para a mais recente").toEqual([...delays].sort((a, b) => a - b));
    expect(delays[0]).toBe(0);
    expect(delays.at(-1)).toBeGreaterThan(delays[0]);

    const total = Math.max(...weeks.map((week) => week.delay + week.duration));
    expect(total, "duração total em ms").toBeLessThanOrEqual(MAX_TOTAL_MS);

    // Uma vez por carregamento: ao terminar, nenhuma animação continua ativa.
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});

test.describe("efeito 2: relevo no gráfico", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  // O relevo é só para mouse; em tela de toque (projeto webkit-celular) vale o teste próprio abaixo.
  const mouseOnly = (isMobile: boolean) => test.skip(isMobile, "relevo só com mouse");

  test("sobe na proporção do nível; dias vazios não se mexem", async ({ page, isMobile }) => {
    mouseOnly(isMobile);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await reliefReady(page);
    const before = new Map((await cellBoxes(page)).map((cell) => [cell.date, cell]));

    const hovered = await hoverStrongCell(page);
    const after = await cellBoxes(page);
    const center = after.find((cell) => cell.date === hovered)!;

    const rise = (date: string) => before.get(date)!.bottom - after.find((cell) => cell.date === date)!.bottom;

    // Parâmetros do protótipo: nível 4 sob o cursor sobe 0,65 × a célula e cresce 1,21×.
    const cellSize = before.get(hovered!)!.width;
    expect(rise(hovered!) / cellSize, "elevação máxima").toBeCloseTo(MAX_LIFT, 1);
    expect(center.width / cellSize, "ampliação máxima").toBeCloseTo(MAX_SCALE, 1);

    // A uma mesma distância do cursor, nível maior sobe mais.
    const byDistance = new Map<number, { level: number; rise: number }[]>();
    for (const cell of after) {
      const distance = Math.round(Math.hypot(cell.cx - center.cx, cell.cy - center.cy) * 100);
      byDistance.set(distance, [...(byDistance.get(distance) ?? []), { level: cell.level, rise: rise(cell.date) }]);
    }
    let compared = 0;
    for (const group of byDistance.values()) {
      for (const a of group) {
        for (const b of group) {
          // Só deslocamentos visíveis: perto da borda do raio, frações de pixel
          // se perdem no arredondamento da tela.
          if (a.level > b.level && a.rise > 0.5) {
            expect(a.rise, `nível ${a.level} contra nível ${b.level}`).toBeGreaterThan(b.rise);
            compared++;
          }
        }
      }
    }
    expect(compared, "pares comparados").toBeGreaterThan(10);

    // Dias sem contribuição praticamente não se mexem.
    const emptyRises = after.filter((cell) => cell.level === 0).map((cell) => Math.abs(rise(cell.date)));
    expect(Math.max(...emptyRises), "maior deslocamento de dia vazio, em px").toBeLessThan(0.1);

    // Ao sair do gráfico, tudo volta.
    await page.mouse.move(5, 5);
    await expect.poll(async () => (await cellBoxes(page)).filter((cell) => cell.transform).length).toBe(0);
  });

  test("em tela de toque, nenhuma célula é transformada", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 7"], reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    const box = (await page.locator('#contribution-svg rect[data-level="4"]').last().boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
    expect((await cellBoxes(page)).filter((cell) => cell.transform)).toEqual([]);
    await context.close();
  });

  test("só começa depois do fim do preenchimento", async ({ page, isMobile }) => {
    mouseOnly(isMobile);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // Injeção: preenchimento de 4 s, para dar tempo de passar o mouse durante ele.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = ".grafico-semana { animation-duration: 4s !important; }";
        document.head.append(style);
      });
    });
    await page.goto("/");
    await hoverStrongCell(page);
    expect((await cellBoxes(page)).filter((cell) => cell.transform), "durante o preenchimento").toEqual([]);

    await reliefReady(page);
    await hoverStrongCell(page);
    await page.mouse.move(5, 5);
    await hoverStrongCell(page);
    expect((await cellBoxes(page)).filter((cell) => cell.transform).length, "depois").toBeGreaterThan(0);
  });
});

test.describe("efeito 3: transição na troca de idioma", () => {
  test.use({ locale: "en-US", viewport: { width: 1280, height: 900 } });

  /** Registra, em cada documento novo, se houve transição e o painel no primeiro quadro. */
  async function recordNavigation(page: Page) {
    await page.addInitScript(() => {
      window.addEventListener("pagereveal", (event) => {
        const transition = (event as Event & { viewTransition: unknown }).viewTransition;
        sessionStorage.setItem("transicao", String(!!transition));
      });
      requestAnimationFrame(() => {
        const painel = getComputedStyle(document.documentElement).getPropertyValue("--painel");
        sessionStorage.setItem("painel-primeiro-quadro", painel.trim());
      });
    });
  }
  const recorded = (page: Page) =>
    page.evaluate(() => ({
      transition: sessionStorage.getItem("transicao"),
      painel: sessionStorage.getItem("painel-primeiro-quadro"),
      lang: document.documentElement.lang,
    }));
  const switchToPortuguese = (page: Page) => page.getByRole("button", { name: /Ver em português/ }).click();

  test("com suporte, a troca tem transição; tema e idioma certos antes da pintura", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
    await recordNavigation(page);
    await page.goto("/");
    const supported = await page.evaluate(() => "CSSViewTransitionRule" in window);
    test.skip(!supported, "navegador sem View Transitions entre documentos");

    await page.getByRole("button", { name: /theme/ }).click(); // escolhe o tema escuro
    await switchToPortuguese(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    expect(await recorded(page)).toEqual({ transition: "true", painel: "#121a52", lang: "pt-BR" });
  });

  test("sem suporte, a troca continua funcionando, com tema e idioma certos", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
    // Injeção: tira o @view-transition do CSS, como num navegador que não o conhece.
    await page.route("**/*.css", async (route) => {
      const response = await route.fetch();
      const css = (await response.text()).replace(/@view-transition\s*\{[^}]*\}/g, "");
      await route.fulfill({ response, body: css });
    });
    await recordNavigation(page);
    await page.goto("/");
    await page.getByRole("button", { name: /theme/ }).click();
    await switchToPortuguese(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    expect(await recorded(page)).toEqual({ transition: "false", painel: "#121a52", lang: "pt-BR" });
  });
});

test.describe("efeito 1 na troca de idioma", () => {
  test.use({ locale: "en-US", viewport: { width: 1280, height: 900 } });

  test("o gráfico chega pronto, sem repetir o preenchimento; recarregar preenche de novo", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // Em cada documento, no primeiro quadro: semanas não opacas e animações de preenchimento.
    await page.addInitScript(() => {
      requestAnimationFrame(() => {
        const weeks = [...document.querySelectorAll(".grafico-semana")];
        const visits = JSON.parse(sessionStorage.getItem("primeiros-quadros") ?? "[]");
        visits.push({
          weeks: weeks.length,
          transparent: weeks.filter((week) => getComputedStyle(week).opacity !== "1").length,
          fills: document
            .getAnimations()
            .filter((animation) => (animation as CSSAnimation).animationName === "grafico-preencher").length,
        });
        sessionStorage.setItem("primeiros-quadros", JSON.stringify(visits));
      });
    });
    const visits = () => page.evaluate(() => JSON.parse(sessionStorage.getItem("primeiros-quadros") ?? "[]"));

    await page.goto("/");
    await expect.poll(async () => (await visits()).length).toBe(1);
    const [load] = await visits();
    expect(load.fills, "carregamento normal: preenche").toBeGreaterThan(50);

    await page.getByRole("button", { name: /Ver em português/ }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect.poll(async () => (await visits()).length).toBe(2);
    const [, afterSwitch] = await visits();
    expect(afterSwitch.weeks).toBeGreaterThan(50);
    expect(afterSwitch.transparent, "semanas não opacas no primeiro quadro após a troca").toBe(0);
    expect(afterSwitch.fills, "preenchimentos após a troca").toBe(0);

    await page.reload();
    await expect.poll(async () => (await visits()).length).toBe(3);
    const [, , reloaded] = await visits();
    expect(reloaded.fills, "recarregar: preenche de novo").toBeGreaterThan(50);
  });
});

test.describe("com prefers-reduced-motion", () => {
  test.use({ viewport: { width: 1280, height: 900 }, locale: "en-US" });

  test("nenhum dos três efeitos acontece, e o gráfico aparece pronto", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.addInitScript(() => {
      window.addEventListener("pagereveal", (event) => {
        sessionStorage.setItem("transicao", String(!!(event as Event & { viewTransition: unknown }).viewTransition));
      });
      // Efeito 1: no primeiro quadro, nenhuma célula está transparente.
      requestAnimationFrame(() => {
        const groups = [...document.querySelectorAll(".grafico-semana")];
        sessionStorage.setItem(
          "transparentes",
          String(groups.filter((group) => getComputedStyle(group).opacity !== "1").length),
        );
      });
    });
    await page.goto("/");

    expect(await page.evaluate(() => document.getAnimations().length), "efeito 1").toBe(0);
    expect(await page.evaluate(() => sessionStorage.getItem("transparentes")), "gráfico pronto").toBe("0");

    // Efeito 2: o mouse sobre o gráfico não transforma nada.
    await page.waitForTimeout(800);
    await hoverStrongCell(page);
    expect((await cellBoxes(page)).filter((cell) => cell.transform), "efeito 2").toEqual([]);

    // Efeito 3: a troca de idioma acontece sem transição.
    await page.getByRole("button", { name: /Ver em português/ }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    expect(await page.evaluate(() => sessionStorage.getItem("transicao")), "efeito 3").not.toBe("true");
  });
});

test("nenhuma sombra e nenhuma curva elástica ou linear", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  // Com mouse, confere também durante o relevo.
  if (!isMobile) {
    await reliefReady(page);
    await hoverStrongCell(page);
  }

  const report = await page.evaluate(() => {
    const css = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).map((rule) => rule.cssText).join("\n");
    // Curvas com valores fora de [0, 1] no eixo do tempo de progresso = elástica/overshoot.
    const elastic = [...css.matchAll(/cubic-bezier\(([^)]*)\)/g)]
      .map((match) => match[1].split(",").map(Number))
      .filter(([, y1, , y2]) => y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1)
      .map((values) => values.join(","));
    const linear = [...css.matchAll(/(?:transition|animation)[a-z-]*:[^;}]*\blinear\b/g)].map((m) => m[0]);
    const shadows = [...document.querySelectorAll("*")]
      .map((el) => ({ el, style: getComputedStyle(el) }))
      .filter(({ style }) => style.boxShadow !== "none" || style.textShadow !== "none" || /drop-shadow/.test(style.filter))
      .map(({ el }) => el.outerHTML.slice(0, 60));
    return { elastic, linear, shadows };
  });
  expect(report).toEqual({ elastic: [], linear: [], shadows: [] });
});
