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

/**
 * Saves the choice and applies it. With `origin` (the switch's center, in viewport pixels),
 * the new theme is revealed as a circle growing from that point, using the View Transitions
 * API where the browser has it; otherwise the colors cross-fade. No motion with reduced motion.
 */
export function saveTheme(choice: ThemeChoice, origin?: { x: number; y: number }) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* private mode: the choice still applies for this page */
  }
  const root = document.documentElement;
  const notify = () => window.dispatchEvent(new Event(THEME_EVENT));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (update: () => void) => { ready: Promise<void> };
  };

  if (origin && !reduce && doc.startViewTransition) {
    const { x, y } = origin;
    // Radius that reaches the farthest corner of the screen.
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = doc.startViewTransition(() => {
      applyTheme(choice);
      notify();
    });
    t.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    return;
  }

  // Fallback: briefly animate colors (see .theme-anim in portal.css).
  if (!reduce) root.classList.add("theme-anim");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-anim"), 300);
  notify();
}
