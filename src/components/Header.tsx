import { content } from "@/content";
import { profile } from "@/content/profile";
import type { Locale } from "@/types/content";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export const SECTIONS = ["experience", "projects", "stack", "education", "contact"] as const;

export function Header({ locale }: { locale: Locale }) {
  const text = content[locale];
  const other: Locale = locale === "pt" ? "en" : "pt";

  return (
    <header className="border-b border-linha">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-1 px-6 py-3">
        <a href="#top" className="py-2 font-semibold">
          {text.hero.name}
        </a>

        {/*
          No celular os links descem para uma segunda linha, menores e distribuídos
          pela largura, para caber em uma linha a partir de 360 px; os botões ficam visíveis.
        */}
        <nav aria-label={text.ui.navLabel} className="order-last w-full md:order-none md:w-auto">
          <ul className="flex flex-wrap justify-between gap-x-2 text-xs md:justify-start md:gap-x-5 md:text-sm">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-block py-2 text-lapis hover:text-grafite">
                  {text.ui.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle target={other} label={content[other].ui.viewInThisLanguage} />
          <ThemeToggle labels={text.ui.theme} />
          <a
            href={profile.github}
            className="inline-block px-2 py-2 text-sm text-lapis hover:text-grafite"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
