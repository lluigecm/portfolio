import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

// Meta da especificação (seção 7): WCAG AA.
const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function checkA11y(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  return results.violations;
}
