export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
export const THEME_EVENT = "tema";

/*
 * Roda no <head>, antes da primeira pintura: aplica a escolha salva, se houver.
 * Sem escolha, o CSS segue o sistema (noite, a não ser que o sistema peça claro).
 */
export const themeScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const systemLight = () => window.matchMedia("(prefers-color-scheme: light)");

export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return systemLight().matches ? "light" : "dark";
}

export function subscribeToTheme(listener: () => void) {
  const query = systemLight();
  query.addEventListener("change", listener);
  window.addEventListener(THEME_EVENT, listener);
  return () => {
    query.removeEventListener("change", listener);
    window.removeEventListener(THEME_EVENT, listener);
  };
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Armazenamento bloqueado: a escolha vale só para esta visita.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}
