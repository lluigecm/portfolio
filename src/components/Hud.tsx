import { content } from "@/content";
import type { Locale } from "@/types/content";
import { LanguageButtons } from "./LanguageButtons";
import { Score } from "./Score";

/* HUD fixa no topo: nome, nível, placar de bugs e troca de idioma. */
export function Hud({ locale }: { locale: Locale }) {
  const text = content[locale].hud;
  return (
    <header className="hud">
      <span className="px">LUIGE</span>
      <span className="lvl">{text.lvl}</span>
      <span className="score">
        {text.score} <Score />
      </span>
      <LanguageButtons current={locale} />
    </header>
  );
}
