import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { projects } from "../src/content/projects";
import { contrast, parseRgb } from "./cores";
import { checkA11y } from "./a11y";

const LOCALES = [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const;

const video = (page: Page) => page.locator('[data-project="mygather"] video');
const isPaused = (page: Page) => video(page).evaluate((el: HTMLVideoElement) => el.paused);

test.describe("vídeo do MyGather", () => {
  test("toca sozinho, sem som, e pausa e volta pelo teclado", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    await expect.poll(() => isPaused(page)).toBe(false);
    expect(await video(page).evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);

    const pause = page.getByRole("button", { name: content.en.ui.video.pause });
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => isPaused(page)).toBe(true);

    const play = page.getByRole("button", { name: content.en.ui.video.play });
    await expect(play).toBeFocused();
    await page.keyboard.press("Space");
    await expect.poll(() => isPaused(page)).toBe(false);
  });

  test("com prefers-reduced-motion, não toca sozinho e mostra a capa", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const videoRequests: string[] = [];
    page.on("request", (request) => {
      if (/\.(webm|mp4)$/.test(request.url())) videoRequests.push(request.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Confirmação negativa: dá tempo para a hidratação, que é quem daria o play.
    await page.waitForTimeout(1000);

    expect(await isPaused(page)).toBe(true);
    expect(videoRequests).toEqual([]);
    await expect(video(page)).toHaveAttribute("poster", "/projects/mygather-capa.webp");
    await expect(video(page)).not.toHaveAttribute("autoplay");

    // Quem pediu menos movimento ainda pode tocar o vídeo pelo botão.
    await page.getByRole("button", { name: content.en.ui.video.play }).click();
    await expect.poll(() => isPaused(page)).toBe(false);
  });

  test("tem dimensões reservadas, para não deslocar o layout", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const box = await video(page).boundingBox();
    expect(box!.height).toBeGreaterThan(0);
    expect(box!.width / box!.height).toBeCloseTo(882 / 472, 1);
  });
});

test("a mídia carrega de public/, sem chamadas a outros sites", async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on("request", (request) => origins.add(new URL(request.url()).origin));

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect.poll(() => isPaused(page)).toBe(false);
  await page.waitForLoadState("networkidle");

  expect([...origins]).toEqual([new URL(baseURL!).origin]);

  const source = await video(page).evaluate((el: HTMLVideoElement) => new URL(el.currentSrc).pathname);
  expect(source).toBe("/projects/mygather.webm");

  for (const project of projects) {
    if (project.media.kind !== "video") continue;
    for (const file of [project.media.webm, project.media.mp4, project.media.poster]) {
      const response = await page.request.get(file);
      expect(response.status(), file).toBe(200);
    }
  }
});

for (const [locale, browserLocale] of LOCALES) {
  const text = content[locale];

  test.describe(`mídia em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("textos alternativos e crédito da arte", async ({ page }) => {
      // Parado, o botão mostra "reproduzir"; tocando, "pausar".
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(video(page)).toHaveAttribute("aria-label", text.projects.mygather.mediaAlt);
      await expect(page.locator('[data-project="mygather"]')).toContainText(
        text.projects.mygather.credit!,
      );
      await expect(
        page.locator('[data-project="autohealing"]').getByRole("img", {
          name: text.projects.autohealing.mediaAlt,
        }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: text.ui.video.play })).toBeVisible();
    });

    test("o diagrama usa os textos do idioma", async ({ page }) => {
      await page.goto("/");
      const lines = await page.locator('[data-project="autohealing"] svg text').allTextContents();
      const { yes, no, ...boxes } = text.diagram;
      expect(lines.sort()).toEqual([...Object.values(boxes).flat(), yes, no].sort());
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test.describe(`a 360 px, tema ${colorScheme}`, () => {
        test.use({ viewport: { width: 360, height: 780 } });

        test("o diagrama é legível", async ({ page }) => {
          await page.emulateMedia({ colorScheme });
          await page.goto("/");
          await page.evaluate(() => document.fonts.ready);

          const svg = page.locator('[data-project="autohealing"] svg[role="img"]');
          await svg.scrollIntoViewIfNeeded();
          const report = await svg.evaluate((el: SVGSVGElement) => {
            const scale = el.getBoundingClientRect().width / el.viewBox.baseVal.width;
            const fontSize = parseFloat(el.getAttribute("font-size")!) * scale;

            const overflow: string[] = [];
            for (const node of el.querySelectorAll<SVGGElement>("[data-node]")) {
              const shape = node.querySelector("rect, polygon")!.getBoundingClientRect();
              const diamond = node.dataset.shape === "diamond";
              for (const line of node.querySelectorAll("text")) {
                const box = line.getBoundingClientRect();
                const corners = [
                  [box.left, box.top],
                  [box.right, box.top],
                  [box.left, box.bottom],
                  [box.right, box.bottom],
                ];
                const inside = corners.every(([x, y]) => {
                  if (!diamond) {
                    return x >= shape.left && x <= shape.right && y >= shape.top && y <= shape.bottom;
                  }
                  // Dentro do losango: |dx|/meia-largura + |dy|/meia-altura <= 1.
                  const dx = Math.abs(x - (shape.left + shape.width / 2)) / (shape.width / 2);
                  const dy = Math.abs(y - (shape.top + shape.height / 2)) / (shape.height / 2);
                  return dx + dy <= 1;
                });
                if (!inside) overflow.push(`${node.dataset.node}: ${line.textContent}`);
              }
            }

            const style = (selector: string) => getComputedStyle(el.querySelector(selector)!);
            const figure = getComputedStyle(el.closest("figure")!);
            const root = document.documentElement;
            return {
              fontSize,
              overflow,
              pageOverflow: root.scrollWidth - root.clientWidth,
              colors: {
                text: style("text").fill,
                box: style("rect").fill,
                border: style("rect").stroke,
                decision: style("polygon").stroke,
                arrow: style("line").stroke,
                background: figure.backgroundColor,
              },
            };
          });

          expect(report.fontSize, "texto do diagrama em px").toBeGreaterThanOrEqual(12);
          expect(report.overflow).toEqual([]);
          expect(report.pageOverflow).toBe(0);

          const c = Object.fromEntries(
            Object.entries(report.colors).map(([key, css]) => [key, parseRgb(css)]),
          ) as Record<keyof typeof report.colors, ReturnType<typeof parseRgb>>;
          expect(contrast(c.text, c.box), "texto sobre a caixa").toBeGreaterThanOrEqual(4.5);
          // Bordas e setas são parte da informação (WCAG 1.4.11): 3:1.
          expect(contrast(c.border, c.background), "borda sobre o fundo").toBeGreaterThanOrEqual(3);
          expect(contrast(c.arrow, c.background), "seta sobre o fundo").toBeGreaterThanOrEqual(3);
          expect(contrast(c.decision, c.background), "decisão sobre o fundo").toBeGreaterThanOrEqual(3);

          expect(await checkA11y(page)).toEqual([]);
        });
      });
    }
  });
}
