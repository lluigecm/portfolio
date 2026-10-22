export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
export const THEME_EVENT = "tema";
/** Duração do nascer e do pôr do sol (globals.css), com folga. */
const SKY_CHANGE_MS = 1800;

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

let skyTimer: ReturnType<typeof setTimeout> | undefined;

/*
 * Troca o tema. Durante a troca, o <html> ganha "amanhece" ou "anoitece": o
 * céu passa de uma cor à outra, a Lua desce e o Sol sobe (ou o contrário, pelo
 * entardecer). Com movimento reduzido, o CSS ignora as classes e a troca é na hora.
 */
export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("amanhece", "anoitece");
  root.classList.add(theme === "light" ? "amanhece" : "anoitece");
  clearTimeout(skyTimer);
  skyTimer = setTimeout(() => root.classList.remove("amanhece", "anoitece"), SKY_CHANGE_MS);
  root.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Armazenamento bloqueado: a escolha vale só para esta visita.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}
