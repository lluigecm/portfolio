import { expect, test } from "@playwright/test";
import { content } from "../src/content";
import { profile } from "../src/content/profile";
import { checkA11y } from "./apoio";

test.use({ locale: "pt-BR" });
const text = content.pt;

test("a página inicial carrega", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Luige");
  await expect(page.locator(".hero h1")).toContainText("LUIGE");
  await expect(page.getByRole("link", { name: "▶ PRESS START" })).toHaveAttribute("href", "#mapa");
});

test("as fases aparecem na ordem do mapa, cada uma com a sua placa", async ({ page }) => {
  await page.goto("/");
  const levels = page.locator("section.level");
  await expect(levels).toHaveCount(6);
  expect(await levels.evaluateAll((all) => all.map((s) => s.id))).toEqual([
    "sobre",
    "exp",
    "proj",
    "stack",
    "edu",
    "contato",
  ]);
  await expect(page.locator(".sign")).toHaveText([
    "WORLD 1-1",
    "WORLD 1-2",
    "WORLD 1-3",
    "WORLD 1-4",
    "WORLD 1-5",
    "BOSS STAGE",
  ]);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    text.map.title,
    text.about.title,
    text.experience.title,
    text.projects.title,
    text.stack.title,
    text.education.title,
    text.contact.title,
  ]);
});

test("cada nó do mapa leva à sua fase", async ({ page }) => {
  await page.goto("/");
  const nodes = page.locator(".map a");
  await expect(nodes.locator(".node")).toHaveText(["1-1", "1-2", "1-3", "1-4", "1-5", "BOSS"]);
  for (const href of await nodes.evaluateAll((all) => all.map((a) => a.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  await page.locator('.map a[href="#proj"]').click();
  await expect(page.locator("#proj")).toBeInViewport();
});

test("cartuchos, inventário e contato apontam para os endereços reais", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cart")).toHaveCount(2);
  await expect(page.locator(".cart").first()).toHaveAttribute(
    "href",
    "https://github.com/lluigecm/autohealing-e2e-tests",
  );
  await expect(page.locator(".cart").nth(1)).toHaveAttribute("href", "https://github.com/lluigecm/MyGather");

  await expect(page.locator(".inv [role=listitem]")).toHaveCount(10);
  await expect(page.locator(".slot.main")).toHaveCount(4);

  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", profile.linkedin);
  await expect(page.getByRole("link", { name: "E-mail" })).toHaveAttribute("href", `mailto:${profile.email}`);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`sem violações de acessibilidade no tema ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/");
    expect(await checkA11y(page)).toEqual([]);
  });
}
