import { expect, test } from "@playwright/test";
import { checkA11y } from "./a11y";

test("a página inicial carrega", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Luige");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`sem violações de acessibilidade no tema ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    expect(await checkA11y(page)).toEqual([]);
  });
}
