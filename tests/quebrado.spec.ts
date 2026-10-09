import { expect, test } from "@playwright/test";

// Teste quebrado de propósito para validar o bloqueio de merge (etapa 2).
// Esta branch não deve entrar na main.
test("falha de propósito", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Outro nome");
});
