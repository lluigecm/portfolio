import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { content } from "@/content";
import { isLocale } from "@/lib/locale";
import { palette } from "@/lib/palette";
import type { Locale } from "@/types/content";

/*
 * Imagem de prévia (Open Graph e Twitter Card, seção 6.7): nome e título no
 * visual Grafite, uma por idioma. Gerada no build, sem buscar nada na rede:
 * a IBM Plex vem do pacote @fontsource (o gerador não lê WOFF2).
 */
const size = { width: 1200, height: 630 };
const colors = palette.light;

// Lidas uma vez, no carregamento do módulo (com Cache Components, ler arquivo
// dentro da função conta como acesso não cacheado). Caminhos literais, para o
// rastreamento de arquivos do Next levar as fontes junto para o servidor.
const [regular, semibold] = await Promise.all([
  readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff")),
  readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff")),
]);

const alt = (locale: Locale) => `${content[locale].hero.name}, ${content[locale].hero.title}`;

export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : "en";
  return [{ id: "card", alt: alt(locale), size, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { hero } = content[isLocale(lang) ? lang : "en"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: colors.papel,
          fontFamily: "IBM Plex Sans",
        }}
      >
        <div style={{ fontSize: 144, fontWeight: 600, color: colors.grafite, letterSpacing: -3 }}>
          {hero.name}
        </div>
        <div style={{ marginTop: 8, fontSize: 52, color: colors.lapis }}>{hero.title}</div>
        {/* A escala de âmbar do gráfico de contribuições, a peça marcante do site. */}
        <div style={{ display: "flex", gap: 10, marginTop: 72 }}>
          {colors.grafico.map((color) => (
            <div key={color} style={{ width: 36, height: 36, borderRadius: 6, background: color }} />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Sans", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
