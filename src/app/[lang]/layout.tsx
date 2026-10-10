import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { content } from "@/content";
import { HTML_LANG, isLocale, LOCALES, OG_LOCALE } from "@/lib/locale";
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
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-papel font-sans text-base text-grafite antialiased">
        {children}
      </body>
    </html>
  );
}
