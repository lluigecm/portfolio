import { content } from "@/content";
import type { Locale } from "@/types/content";
import { LanguageButtons } from "./LanguageButtons";
import { Score } from "./Score";
import { SoundButtons } from "./SoundButtons";
import { ThemeButton } from "./ThemeButton";

/* HUD fixa no topo: nome, nível, placar de bugs, idioma, som (efeitos e música) e dia ou noite. */
export function Hud({ locale }: { locale: Locale }) {
  const { hud: text, ui } = content[locale];
  // Em telas estreitas fica só a primeira palavra: "BUGS 0042".
  const [first, ...rest] = text.score.split(" ");
  return (
    <header className="hud">
      <span className="px">LUIGE</span>
      <span className="lvl">{text.lvl}</span>
      <span className="score">
        {first}
        <span className="score-rest"> {rest.join(" ")}</span> <Score />
      </span>
      <div className="r">
        <LanguageButtons current={locale} />
        <SoundButtons labels={ui.sound} />
        <ThemeButton labels={ui.theme} />
      </div>
    </header>
  );
}
