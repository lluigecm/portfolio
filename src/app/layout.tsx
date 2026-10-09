import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { themeScript } from "@/lib/theme";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // O script do tema altera data-theme antes da hidratação; a diferença é esperada.
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-papel font-sans text-base text-grafite antialiased">
        {children}
      </body>
    </html>
  );
}
