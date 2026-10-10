// Contraste WCAG entre duas cores rgb (0 a 255).
export type Rgb = [number, number, number];

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Converte "rgb(1, 2, 3)" no formato que o navegador devolve. */
export function parseRgb(css: string): Rgb {
  const [r, g, b] = css.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
  return [r, g, b];
}
