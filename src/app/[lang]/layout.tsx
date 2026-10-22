import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Press_Start_2P } from "next/font/google";
import { notFound } from "next/navigation";
import { content } from "@/content";
import { HTML_LANG, isLocale, languageSwitchScript, LOCALES, OG_LOCALE } from "@/lib/locale";
import { siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "../globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-plex-mono",
});

// Títulos, HUD, placas e balão (seção 5.3). latin-ext cobre os acentos do português.
// A reserva calculada pelo next/font sai bem mais estreita que esta fonte pixelada,
// e a troca deslocava o layout; a reserva calibrada fica em globals.css. O nome
// não pode ter palavra começando com dígito ("2P"): o next/font o escreve sem aspas.
const pressStart = Press_Start_2P({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-press-start",
  adjustFontFallback: false,
  fallback: ["Reserva Press Start", "monospace"],
});

/*
 * Título, descrição e prévia de link por idioma (seção 6.7). A URL é sempre "/":
 * as duas versões vivem no mesmo endereço (regra 7). A imagem de prévia vem de
 * opengraph-image.tsx e twitter-image.tsx.
 */
export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const { meta, hero } = content[locale];
  const other = locale === "pt" ? "en" : "pt";

  return {
    metadataBase: siteUrl(),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: hero.name,
      title: meta.title,
      description: meta.description,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[other],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

// Uma versão pré-renderizada por idioma; o proxy escolhe qual servir em "/".
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    // O script do tema altera data-theme antes da hidratação; a diferença é esperada.
    <html
      lang={HTML_LANG[lang]}
      className={`${plexSans.variable} ${plexMono.variable} ${pressStart.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + languageSwitchScript }} />
      </head>
      <body className="bg-painel-2 font-sans text-base text-texto antialiased">
        {children}
      </body>
    </html>
  );
}
