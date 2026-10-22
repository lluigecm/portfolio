import { content } from "@/content";
import { profile } from "@/content/profile";
import { getContributions } from "@/lib/github";
import type { Locale } from "@/types/content";
import { HudMenu } from "./HudMenu";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export const SECTIONS = ["experience", "projects", "stack", "education", "contact"] as const;

/** Botões e links da HUD: borda grossa, cantos retos, alvo de 40 px. */
export const hudControl =
  "inline-flex h-10 min-w-10 items-center justify-center border-2 border-linha bg-painel px-2";

/*
 * HUD (seção 5.4): cabeçalho fixo no topo, em Press Start 2P. Primeira linha:
 * nome, links das seções (recolhidos abaixo de 1024 px), idioma, tema e GitHub.
 * Segunda linha: o contador de contribuições, com o mesmo total da legenda do
 * gráfico; some junto com ele quando o GitHub não responde (regra 14).
 */
export async function Header({ locale }: { locale: Locale }) {
  const text = content[locale];
  const other: Locale = locale === "pt" ? "en" : "pt";
  const contributions = await getContributions();

  const links = SECTIONS.map((id) => ({ href: `#${id}`, label: text.ui.nav[id] }));

  return (
    <header className="sticky top-0 z-30 border-b-4 border-linha bg-painel-2 font-display text-xs">
      <div className="mx-auto max-w-5xl px-3 py-2 md:px-6">
        <div className="flex items-center gap-x-3 lg:gap-x-6">
          <a href="#top" className="py-2 text-destaque">
            {text.hero.name}
          </a>

          <nav aria-label={text.ui.navLabel} className="hidden lg:block">
            <ul className="flex gap-x-5">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="inline-block py-2 hover:text-destaque">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <HudMenu label={text.ui.hud.menu} navLabel={text.ui.navLabel} links={links} />
            <LanguageToggle target={other} label={content[other].ui.viewInThisLanguage} />
            <ThemeToggle labels={text.ui.theme} />
            <a href={profile.github} className={hudControl}>
              GitHub
            </a>
          </div>
        </div>

        {contributions && (
          <p data-testid="hud-contador" className="pb-1">
            {text.ui.hud.contributions(contributions.total)}
          </p>
        )}
      </div>
    </header>
  );
}
