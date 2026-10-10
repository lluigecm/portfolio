/*
 * Cores para imagens geradas no build (prévia de link e ícones), que não
 * enxergam as variáveis CSS. Os valores repetem os tokens de globals.css;
 * tests/seo.spec.ts confere que continuam iguais.
 */
export const palette = {
  light: {
    papel: "#f3f4f5",
    grafite: "#1f2328",
    lapis: "#5c636b",
    linha: "#d9dce0",
    ambar: "#a84e08",
    grafico: ["#d9dce0", "#c3672c", "#a84e08", "#8c3e00", "#753301"],
  },
  dark: {
    papel: "#16181b",
    grafite: "#e6e8eb",
    ambar: "#e0a458",
  },
} as const;
