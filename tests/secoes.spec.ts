import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content";
import { profile } from "../src/content/profile";
import { checkA11y } from "./a11y";

/*
 * Abaixo de 1024 px os links das seções ficam recolhidos num <details> na HUD
 * (seção 5.4). Abre a lista quando o botão dela está na tela.
 */
async function openSections(page: Page) {
  const summary = page.locator("header summary");
  if ((await summary.isVisible()) && !(await page.locator("header details").getAttribute("open"))) {
    await summary.click();
  }
}

// O título da seção fica inteiro abaixo da HUD fixa depois de seguir o link.
async function headingBelowHud(page: Page, name: string) {
  const heading = page.getByRole("heading", { level: 2, name });
  await expect(heading).toBeInViewport();
  const [hud, box] = await Promise.all([
    page.locator("header").boundingBox(),
    heading.boundingBox(),
  ]);
  expect(box!.y, `${name} abaixo da HUD`).toBeGreaterThanOrEqual(hud!.y + hud!.height);
}

const SECTIONS = ["experience", "projects", "stack", "education", "contact"] as const;

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  const text = content[locale];

  test.describe(`página em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("todas as seções estão presentes, com os textos aprovados", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(text.hero.name);
      await expect(page.getByText(text.hero.title, { exact: true })).toBeVisible();
      await expect(page.getByText(text.hero.intro)).toBeVisible();

      const headings = page.getByRole("heading", { level: 2 });
      await expect(headings).toHaveText(SECTIONS.map((id) => text.ui.nav[id]));
      for (const id of SECTIONS) {
        await expect(page.locator(`section#${id}`)).toBeVisible();
      }

      await expect(page.getByText(text.experience.companyDescription)).toBeVisible();
      for (const role of text.experience.roles) {
        await expect(page.getByRole("heading", { name: role.title })).toBeVisible();
        await expect(page.getByText(role.period)).toBeVisible();
        await expect(page.getByText(role.description)).toBeVisible();
      }
      for (const project of Object.values(text.projects)) {
        await expect(page.getByRole("heading", { name: project.title })).toBeVisible();
        await expect(page.getByText(project.description)).toBeVisible();
      }
      for (const group of text.stack) {
        await expect(page.locator("#stack").getByText(group.label, { exact: true })).toBeVisible();
      }
      await expect(page.getByRole("heading", { name: text.education.degree })).toBeVisible();
      await expect(page.getByText(text.education.institution)).toBeVisible();
      await expect(page.getByText(text.contact.text)).toBeVisible();
    });

    test("contato com e-mail em mailto: e link do LinkedIn", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("link", { name: text.contact.email })).toHaveAttribute(
        "href",
        `mailto:${profile.email}`,
      );
      await expect(page.getByRole("link", { name: text.contact.linkedin })).toHaveAttribute(
        "href",
        profile.linkedin,
      );
      // Regra 21: o endereço nunca aparece como texto puro.
      expect(await page.locator("body").innerText()).not.toContain(profile.email);
    });

    test("os links do cabeçalho levam às seções certas", async ({ page }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: text.ui.navLabel });
      for (const id of SECTIONS) {
        await openSections(page);
        await nav.getByRole("link", { name: text.ui.nav[id], exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        await headingBelowHud(page, text.ui.nav[id]);
      }
      await expect(page.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute(
        "href",
        profile.github,
      );
    });

    test("sem violações de acessibilidade", async ({ page }) => {
      await page.goto("/");
      expect(await checkA11y(page)).toEqual([]);
    });
  });
}

// O Safari só leva o Tab a links se o visitante ligar essa preferência, e no
// iPhone não há Tab: a navegação por teclado é conferida no Chromium.
const TAB_SKIPS_LINKS_ON_SAFARI = "Tab do Safari não passa por links por padrão";

test("navegação completa por teclado, com foco sempre visível", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", TAB_SKIPS_LINKS_ON_SAFARI);
  await page.goto("/");
  const focusable = await page.evaluate(() => {
    // Só o que está na tela: os casos do TCC escondem os links dos casos não escolhidos.
    const shown = (el: Element) => el.getClientRects().length > 0;
    // Inclui a área rolável do gráfico, que recebe foco para rolar pelo teclado.
    const single = [...document.querySelectorAll('a[href], button, [tabindex="0"]')].filter(shown);
    // Um grupo de opções (radio) é uma parada só do Tab; as setas trocam a opção.
    const radios = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(shown);
    return single.length + new Set(radios.map((radio) => radio.name)).size;
  });

  const visited = new Set<string>();
  for (let i = 0; i < focusable + 2; i++) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const radioGroup = el instanceof HTMLInputElement && el.type === "radio" ? el.name : null;
      return {
        id: radioGroup
          ? `INPUT radio ${radioGroup}`
          : `${el.tagName} ${el.getAttribute("href") ?? el.getAttribute("aria-label") ?? el.getAttribute("aria-labelledby")}`,
        outline: `${style.outlineStyle} ${style.outlineWidth}`,
        visible: box.width > 0 && box.height > 0,
      };
    });
    if (focus.id.startsWith("BODY")) continue;
    visited.add(focus.id);
    expect(focus.outline, `${focus.id} sem foco visível`).toBe("solid 2px");
    expect(focus.visible, `${focus.id} invisível com foco`).toBe(true);
  }
  // Todos os elementos focáveis da página são alcançados pelo Tab.
  expect(visited.size).toBe(focusable);
});

test("o link de pular vai direto ao conteúdo", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", TAB_SKIPS_LINKS_ON_SAFARI);
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#content$/);
});

test.describe("princípios de design (seção 5.1)", () => {
  test("nenhuma animação de entrada além do preenchimento do gráfico", async ({ page }) => {
    // Seção 5.5: o preenchimento do gráfico é o único momento orquestrado da página.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const others = await page.evaluate(() =>
      document
        .getAnimations()
        .map((animation) => (animation.effect as KeyframeEffect | null)?.target)
        .filter((target) => !(target instanceof Element && target.closest(".grafico-semana")))
        .map((target) => (target instanceof Element ? target.outerHTML.slice(0, 60) : String(target))),
    );
    expect(others).toEqual([]);
  });

  test("mono só em código de verdade", async ({ page }) => {
    await page.goto("/");
    const monoOutsideCode = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => getComputedStyle(el).fontFamily.includes("Plex Mono"))
        .filter((el) => !el.closest("code"))
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(monoOutsideCode).toEqual([]);
  });

  test("sem numeração, caixa alta nem pontos médios", async ({ page }) => {
    await page.goto("/");
    const found = await page.evaluate(() => {
      const all = [...document.querySelectorAll("body *")];
      const label = (el: Element, pseudo = "") => `${el.outerHTML.slice(0, 60)}${pseudo}`;

      // Texto gerado por CSS (::before/::after) não aparece no innerText.
      const generated = all.flatMap((el) =>
        (["::before", "::after", "::marker"] as const).flatMap((pseudo) => {
          const style = getComputedStyle(el, pseudo);
          const text = style.content.match(/^"(.*)"$/)?.[1] ?? "";
          return { el, pseudo, style, text };
        }),
      );

      return {
        numbered: all
          .filter((el) => el.matches("ol, ul") && getComputedStyle(el).listStyleType !== "none")
          .map((el) => label(el)),
        uppercase: [
          ...all.filter((el) => getComputedStyle(el).textTransform === "uppercase").map((el) => label(el)),
          ...generated
            .filter(({ text, style }) => text && style.textTransform === "uppercase")
            .map(({ el, pseudo }) => label(el, pseudo)),
        ],
        middleDot: [
          ...(document.body.innerText.includes("·") ? ["texto da página"] : []),
          ...generated.filter(({ text }) => /[·•]/.test(text)).map(({ el, pseudo }) => label(el, pseudo)),
        ],
        // Numeração gerada por CSS: contadores ou texto como "01", "1.", "02 /".
        generatedNumbers: generated
          .filter(({ style, text }) => /counter/.test(style.content) || /^\s*\d+\s*[./)]?\s*$/.test(text))
          .map(({ el, pseudo }) => label(el, pseudo)),
      };
    });
    expect(found).toEqual({ numbered: [], uppercase: [], middleDot: [], generatedNumbers: [] });
  });
});

// Exceção do princípio 5.1.2: uma placa por seção, decorativa, no idioma da página.
for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  test.describe(`placas em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("uma por seção, na ordem, invisível ao leitor de tela", async ({ page }) => {
      await page.goto("/");
      for (const [i, id] of SECTIONS.entries()) {
        const signs = page.locator(`section#${id} [data-ui="placa"]`);
        await expect(signs).toHaveCount(1);
        await expect(signs).toHaveText(`${content[locale].ui.world} 1-${i + 1}`);
        await expect(signs).toHaveAttribute("aria-hidden", "true");
      }
      // O topo não tem placa.
      await expect(page.locator('[data-ui="placa"]')).toHaveCount(SECTIONS.length);
    });
  });
}

test("caixa alta e numeração de fase só na placa, na HUD e no balão", async ({ page }) => {
  await page.goto("/");
  const found = await page.evaluate(() => {
    // Siglas que existem no conteúdo da seção 6.
    const ACRONYMS = new Set(["UESC"]);
    const allowed = 'header, [data-ui="placa"], [data-ui="balao"], code, pre';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const offenders: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement!;
      if (parent.closest(allowed) || !parent.checkVisibility()) continue;
      const text = node.textContent ?? "";
      const caps = (text.match(/\b[A-ZÀ-Ý]{4,}\b/g) ?? []).filter((word) => !ACRONYMS.has(word));
      const stage = text.match(/\b\d+-\d+\b/g) ?? [];
      if (caps.length || stage.length) offenders.push(`${parent.tagName}: ${[...caps, ...stage].join(" ")}`);
    }
    return offenders;
  });
  expect(found).toEqual([]);
});

test.describe("celular", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("sem rolagem horizontal, com idioma e tema visíveis", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    await expect(page.getByRole("button", { name: /Ver em português/ })).toBeInViewport();
    await expect(page.getByRole("button", { name: /theme/ })).toBeInViewport();
    await openSections(page);
    for (const id of SECTIONS) {
      await expect(page.getByRole("link", { name: content.en.ui.nav[id], exact: true })).toBeVisible();
    }
  });
});

// Ajuste pós-etapa 6: no celular, o cabeçalho não pode empurrar a apresentação
// para baixo da primeira tela.
for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  test.describe(`cabeçalho a 360 px em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale, viewport: { width: 360, height: 780 } });

    test("cabe em no máximo duas linhas, sem rolagem lateral", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      // Todas as linhas da HUD: links e botões na tela, o botão das seções e o contador.
      const rows = await page.locator("header a, header button, header summary, header p").evaluateAll((elements) => {
        const centers = elements
          .filter((el) => el.checkVisibility())
          .map((el) => el.getBoundingClientRect())
          .map((box) => box.top + box.height / 2)
          .sort((a, b) => a - b);
        // Elementos com centros a menos de 12 px de distância estão na mesma linha.
        return centers.filter((center, i) => i === 0 || center - centers[i - 1] > 12).length;
      });
      expect(rows).toBeLessThanOrEqual(2);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);

      await expect(page.getByText(content[locale].hero.intro)).toBeInViewport();
      await openSections(page);
      for (const id of SECTIONS) {
        await expect(
          page.getByRole("link", { name: content[locale].ui.nav[id], exact: true }),
        ).toBeInViewport();
      }
    });
  });
}

// Seção 6.4: categorias e itens da Stack, na ordem da especificação. "Web"
// entra na publicação (etapa 12), com o mesmo rótulo nos dois idiomas.
const STACK = {
  pt: ["Linguagens", "Automação e testes", "Web", "Computação paralela"],
  en: ["Languages", "Testing and automation", "Web", "Parallel computing"],
  items: ["Python, TypeScript, C, C++", "Playwright, Robot Framework", "Next.js, Node.js", "MPI, OpenMP"],
};

for (const [locale, browserLocale] of [
  ["pt", "pt-BR"],
  ["en", "en-US"],
] as const) {
  test.describe(`stack em ${locale.toUpperCase()}`, () => {
    test.use({ locale: browserLocale });

    test("segue a seção 6.4, com a categoria Web", async ({ page }) => {
      await page.goto("/");
      const stack = page.locator("#stack");
      await expect(stack.locator("dt")).toHaveText(STACK[locale]);
      // Cada item numa casa do inventário, na ordem da 6.4.
      const items = await stack
        .locator("dd")
        .evaluateAll((groups) => groups.map((dd) => [...dd.querySelectorAll("li")].map((li) => li.textContent).join(", ")));
      expect(items).toEqual(STACK.items);
    });
  });
}
