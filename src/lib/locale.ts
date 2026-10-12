import type { Locale } from "@/types/content";

export const LOCALES: readonly Locale[] = ["pt", "en"];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie funcional com a escolha manual de idioma (não é rastreamento). */
export const LOCALE_COOKIE = "lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Valor do atributo lang do <html> para cada idioma. */
export const HTML_LANG: Record<Locale, string> = { pt: "pt-BR", en: "en" };

/*
 * Na troca de idioma, o gráfico chega pronto, sem repetir o preenchimento
 * (seção 5.5, efeito 1): o botão deixa esta marca (com o horário) antes de
 * navegar, e o script abaixo, no <head> da página nova, a consome antes de
 * qualquer estilo ser calculado. A marca só vale por alguns segundos, para uma
 * troca interrompida não afetar a visita seguinte.
 */
export const LANGUAGE_SWITCH_KEY = "troca-de-idioma";
const LANGUAGE_SWITCH_MAX_AGE_MS = 10_000;

export const languageSwitchScript = `try{var s=sessionStorage.getItem("${LANGUAGE_SWITCH_KEY}");if(s){sessionStorage.removeItem("${LANGUAGE_SWITCH_KEY}");if(Date.now()-Number(s)<${LANGUAGE_SWITCH_MAX_AGE_MS})document.documentElement.classList.add("grafico-pronto")}}catch(e){}`;

/** Idioma no formato do Open Graph (og:locale). */
export const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US" };

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * Escolhe o idioma pelo cabeçalho Accept-Language: o primeiro idioma suportado,
 * na ordem de preferência do navegador. Sem nenhum suportado, inglês.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const preferences = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: q ? Number(q.trim().slice(2)) : 1,
        index,
      };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  return preferences.map(({ language }) => language).find(isLocale) ?? DEFAULT_LOCALE;
}
