import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { notFound } from "next/navigation";
import { content } from "@/content";
import { HTML_LANG, isLocale, LOCALES, OG_LOCALE } from "@/lib/locale";
import { siteUrl } from "@/lib/site";
import { introScript } from "@/lib/intro";
import { themeScript } from "@/lib/theme";
import "../globals.css";

// Fontes do modelo: Press Start 2P nos títulos e na HUD, VT323 no corpo.
// Servidas pelo próprio site; até carregarem, a reserva é a Courier New.
const pressStart = Press_Start_2P({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-press-start",
  adjustFontFallback: false,
  fallback: ["Courier New", "monospace"],
});

const vt323 = VT323({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-vt323",
  adjustFontFallback: false,
  fallback: ["Courier New", "monospace"],
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
    // Os scripts do tema e da abertura alteram o <html> antes da hidratação; a diferença é esperada.
    <html lang={HTML_LANG[lang]} className={`${pressStart.variable} ${vt323.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
