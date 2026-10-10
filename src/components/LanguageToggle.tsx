"use client";

import { HTML_LANG, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/locale";
import type { Locale } from "@/types/content";

interface Props {
  /** Idioma para o qual o botão troca. */
  target: Locale;
  /** Rótulo no idioma de destino, ex.: "Ver em português". */
  label: string;
}

export function LanguageToggle({ target, label }: Props) {
  const code = target.toUpperCase();

  function switchLanguage() {
    // O servidor lê o cookie e já entrega a página no outro idioma. Recarrega a
    // página inteira porque o idioma define o <html>; o script do tema reaplica
    // o tema antes da pintura.
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      lang={HTML_LANG[target]}
      // O nome acessível contém o texto visível (WCAG 2.5.3).
      aria-label={`${label} (${code})`}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-md px-2 text-sm font-semibold text-grafite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambar"
    >
      {code}
    </button>
  );
}
