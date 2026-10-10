import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { profile } from "../src/content/profile";
import { checkA11y } from "./a11y";

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
        await expect(page.getByText(group.label, { exact: true })).toBeVisible();
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
        await nav.getByRole("link", { name: text.ui.nav[id], exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        await expect(page.getByRole("heading", { level: 2, name: text.ui.nav[id] })).toBeInViewport();
      }
      await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", profile.github);
    });

    test("sem violações de acessibilidade", async ({ page }) => {
      await page.goto("/");
      expect(await checkA11y(page)).toEqual([]);
    });
  });
}

test("navegação completa por teclado, com foco sempre visível", async ({ page }) => {
  await page.goto("/");
  const focusable = await page
    .locator("a[href], button")
    .evaluateAll((elements) => elements.length);

  const visited = new Set<string>();
  for (let i = 0; i < focusable + 2; i++) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        id: `${el.tagName} ${el.getAttribute("href") ?? el.getAttribute("aria-label")}`,
        outline: `${style.outlineStyle} ${style.outlineWidth}`,
        visible: box.width > 0 && box.height > 0,
      };
    });
    if (focus.id.startsWith("BODY")) continue;
    visited.add(focus.id);
    expect(focus.outline, `${focus.id} sem foco visível`).toBe("solid 2px");
    expect(focus.visible, `${focus.id} invisível com foco`).toBe(true);
  }
  // Todos os links e botões da página são alcançados pelo Tab.
  expect(visited.size).toBe(focusable);
});

test("o link de pular vai direto ao conteúdo", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#content$/);
});

test.describe("princípios de design (seção 5.1)", () => {
  test("sem animações de entrada", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
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
      return {
        numbered: all
          .filter((el) => el.matches("ol, ul") && getComputedStyle(el).listStyleType !== "none")
          .map((el) => el.outerHTML.slice(0, 60)),
        uppercase: all
          .filter((el) => getComputedStyle(el).textTransform === "uppercase")
          .map((el) => el.outerHTML.slice(0, 60)),
        middleDot: document.body.innerText.includes("·"),
      };
    });
    expect(found).toEqual({ numbered: [], uppercase: [], middleDot: false });
  });
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
    for (const id of SECTIONS) {
      await expect(page.getByRole("link", { name: content.en.ui.nav[id], exact: true })).toBeVisible();
    }
  });
});
