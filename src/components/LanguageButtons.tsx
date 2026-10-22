"use client";

import { HTML_LANG, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES } from "@/lib/locale";
import type { Locale } from "@/types/content";

/*
 * PT / EN na HUD. O idioma vive no cookie: o servidor entrega a página já no
 * idioma escolhido, e o recarregamento mantém a posição da rolagem.
 */
function switchTo(target: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  window.location.reload();
}

export function LanguageButtons({ current }: { current: Locale }) {
  return (
    <div className="r" role="group" aria-label="Idioma / Language">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={HTML_LANG[locale]}
          aria-pressed={locale === current}
          onClick={() => locale !== current && switchTo(locale)}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
