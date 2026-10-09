import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test } from "@playwright/test";

// Critério da etapa 3: nenhuma cor escrita direto nos componentes.
// As cores só podem existir em src/app/globals.css (os tokens).
const TOKENS_FILE = join("src", "app", "globals.css");
const COLOR_LITERAL =
  /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/gi;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

test("cores só existem nos tokens", () => {
  const offenders = sourceFiles("src")
    .filter((file) => relative(".", file) !== TOKENS_FILE)
    .flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(COLOR_LITERAL)].map(
        (match) => `${file}: ${match[0]}`,
      ),
    );
  expect(offenders).toEqual([]);
});
