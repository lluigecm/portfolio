import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage } from "@/lib/locale";

/*
 * Bilíngue na mesma URL (regras 7 e 8): "/" é reescrita internamente para a
 * versão pré-renderizada do idioma, sem mudar o endereço do visitante.
 * Ordem: escolha salva no cookie, depois o idioma do navegador, depois inglês.
 */
export function proxy(request: NextRequest) {
  // /pt e /en são só caminhos internos; acessados direto, voltam para "/".
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved)
    ? saved
    : localeFromAcceptLanguage(request.headers.get("accept-language"));

  return NextResponse.rewrite(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: ["/", "/pt", "/en"],
};
