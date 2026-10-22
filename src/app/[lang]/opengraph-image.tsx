import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { content } from "@/content";
import { isLocale } from "@/lib/locale";
import { palette } from "@/lib/palette";
import type { Locale } from "@/types/content";

/*
 * Imagem de prévia (Open Graph e Twitter Card), uma por idioma: a tela de
 * título do site. Gerada no build, sem buscar nada na rede: a Press Start 2P
 * vem do pacote @fontsource (o gerador não lê WOFF2).
 */
const size = { width: 1200, height: 630 };

// Lida uma vez, no carregamento do módulo. Caminho literal, para o rastreamento
// de arquivos do Next levar a fonte junto para o servidor.
const pressStart = await readFile(
  join(process.cwd(), "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff"),
);

const alt = (locale: Locale) => content[locale].meta.title;

export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : "en";
  return [{ id: "card", alt: alt(locale), size, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { hero, hud } = content[isLocale(lang) ? lang : "en"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(${palette.sky}, ${palette.sky2} 70%, ${palette.horizon})`,
          fontFamily: "Press Start 2P",
        }}
      >
        <div
          style={{
            fontSize: 150,
            color: "#fff",
            textShadow: `8px 8px 0 ${palette.sky}, 16px 16px 0 ${palette.pink}`,
          }}
        >
          {hero.name.toUpperCase()}
        </div>
        <div style={{ marginTop: 48, fontSize: 28, color: palette.teal }}>{hud.lvl}</div>
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            padding: "24px 32px",
            fontSize: 28,
            color: "#1a1a2e",
            background: palette.yellow,
            border: "6px solid #1a1a2e",
            boxShadow: "10px 10px 0 #1a1a2e",
          }}
        >
          {/* O ▶ não existe na Press Start 2P: vai desenhado, em pixels. */}
          <svg width="28" height="28" viewBox="0 0 7 7" style={{ marginRight: 24 }}>
            <path d="M0 0h2v1h2v1h2v1h1v1H6v1H4v1H2v1H0Z" fill="#1a1a2e" />
          </svg>
          {hero.start.replace("▶", "").trim()}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Press Start 2P", data: pressStart, weight: 400, style: "normal" }] },
  );
}
