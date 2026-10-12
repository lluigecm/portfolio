export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Tipo da View Transition da troca de tema; o CSS dá a ela uma duração própria.
const THEME_TRANSITION = "tema";

/*
 * Roda no <head>, antes da primeira pintura: aplica a escolha salva, se houver.
 * Sem escolha salva, nada é aplicado e o CSS segue o tema do sistema.
 */
export const themeScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return systemDark().matches ? "dark" : "light";
}

const listeners = new Set<() => void>();

export function subscribeToTheme(listener: () => void) {
  const query = systemDark();
  listeners.add(listener);
  query.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", listener);
  };
}

export function setTheme(theme: Theme) {
  // A escolha é salva na hora: a mudança visual abaixo pode acontecer um quadro
  // depois, e um recarregamento nesse intervalo não pode perdê-la.
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Armazenamento bloqueado: a troca vale só para esta visita.
  }
  const apply = () => {
    document.documentElement.dataset.theme = theme;
    listeners.forEach((listener) => listener());
  };

  /*
   * Esmaecimento entre a página antes e depois da troca (seção 5.5): o
   * navegador anima duas imagens só com opacidade, na placa de vídeo, em vez
   * de repintar as cores de cada elemento a cada quadro (o que pesava mais
   * quanto maior a tela). Sem o recurso, ou com movimento reduzido, a troca é
   * instantânea.
   */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || typeof document.startViewTransition !== "function") return apply();
  try {
    document.startViewTransition({ update: apply, types: [THEME_TRANSITION] });
  } catch {
    // Navegadores com View Transitions, mas ainda sem tipos.
    document.startViewTransition(apply);
  }
}
