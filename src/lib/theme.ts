export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "lgu-theme";
/** Fired on window whenever the theme choice changes in this tab. */
export const THEME_EVENT = "lgu-theme-change";

/**
 * Runs in <head> before the first paint, so the page never flashes the wrong theme.
 * Keep it dependency-free and in sync with applyTheme below.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function resolveDark(choice: ThemeChoice) {
  return choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(choice: ThemeChoice) {
  const dark = resolveDark(choice);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function saveTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* private mode: the choice still applies for this page */
  }
  // Briefly animate colors so the switch feels smooth (see .theme-anim in portal.css).
  const root = document.documentElement;
  root.classList.add("theme-anim");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-anim"), 300);
  window.dispatchEvent(new Event(THEME_EVENT));
}
