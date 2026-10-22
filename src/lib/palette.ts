/*
 * Cores para imagens geradas no build (prévia de link e ícones), que não
 * enxergam as variáveis CSS. Os valores repetem os tokens de globals.css;
 * tests/seo.spec.ts confere que continuam iguais.
 */
export const palette = {
  light: {
    painel: "#fffdf4",
    "painel-2": "#f0ecd6",
    texto: "#1a1a2e",
    secundario: "#3a4a7a",
    linha: "#1a1a2e",
    destaque: "#9c1c5c",
    grafico: ["#f0ecd6", "#4a944a", "#3a7f3c", "#2a6230", "#1b4422"],
  },
  dark: {
    painel: "#121a52",
    texto: "#fff8e7",
    destaque: "#ffd23f",
  },
} as const;
