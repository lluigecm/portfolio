import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { HTML_LANG, isLocale, LOCALES } from "@/lib/locale";
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

export const metadata: Metadata = {
  title: "Luige | Test Automation Developer",
};

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
