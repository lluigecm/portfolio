export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Classe aplicada só durante a troca, para a transição não rodar no carregamento.
const SWITCHING_CLASS = "trocando-tema";
const TRANSITION_MS = 250;

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
  const root = document.documentElement;
  root.classList.add(SWITCHING_CLASS);
  root.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Armazenamento bloqueado: a troca vale só para esta visita.
  }
  listeners.forEach((listener) => listener());
  window.setTimeout(() => root.classList.remove(SWITCHING_CLASS), TRANSITION_MS);
}
