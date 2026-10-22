"use client";

import { HTML_LANG, LANGUAGE_SWITCH_KEY, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/locale";
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
    // O servidor lê o cookie e já entrega a página no outro idioma. Carrega a
    // página inteira de novo porque o idioma define o <html>; o script do tema
    // reaplica o tema antes da pintura (regra 11c).
    //
    // Navegação, e não reload: só navegações têm a transição entre documentos
    // (seção 5.5, efeito 3). Sem o #fragmento, senão seria só um salto dentro
    // da mesma página e o idioma não mudaria.
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    try {
      // A página nova chega com o gráfico pronto (languageSwitchScript).
      sessionStorage.setItem(LANGUAGE_SWITCH_KEY, String(Date.now()));
    } catch {
      // Armazenamento bloqueado: o gráfico só se preenche de novo.
    }
    window.location.replace(window.location.pathname + window.location.search);
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      lang={HTML_LANG[target]}
      // O nome acessível contém o texto visível (WCAG 2.5.3).
      aria-label={`${label} (${code})`}
      className="inline-flex h-10 min-w-10 items-center justify-center border-2 border-linha bg-painel px-2 text-texto active:translate-x-px active:translate-y-px"
    >
      {code}
    </button>
  );
}
