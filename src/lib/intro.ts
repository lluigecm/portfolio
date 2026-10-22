const SKIP_KEY = "sem-tv";

/*
 * Roda no <head>, antes da primeira pintura. Toda visita abre com a TV ligando
 * (classe "tv" no <html>), menos a volta da troca de idioma: aí a página chega
 * pronta (data-volta), sem TV e sem as entradas das fases. Sem JavaScript, nada
 * disso acontece e o site aparece parado.
 */
export const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem("${SKIP_KEY}")){sessionStorage.removeItem("${SKIP_KEY}");d.dataset.volta="1"}else d.classList.add("tv")}catch(e){document.documentElement.classList.add("tv")}`;

/** Chamado antes de recarregar na troca de idioma: a próxima página não liga a TV. */
export function skipNextIntro() {
  try {
    sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    // Armazenamento bloqueado: a TV liga de novo, sem prejuízo.
  }
}
