"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_EVENT, applyTheme, readTheme, saveTheme, type ThemeChoice } from "@/lib/theme";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * Light / Dark / System switch. "System" follows the device setting and updates live
 * when it changes. `onDark` styles it for blue panels.
 */
export default function ThemeToggle({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  const choice = useSyncExternalStore(subscribe, readTheme, () => "system" as ThemeChoice);

  // Follow the device while "System" is chosen.
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => applyTheme("system");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [choice]);

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border p-0.5 ${
        onDark ? "border-white/25 bg-white/10" : "border-rule bg-ground-muted"
      } ${className}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const on = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => saveTheme(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              on
                ? onDark
                  ? "bg-white text-[#0038a8] shadow-sm"
                  : "bg-panel text-brand shadow-sm"
                : onDark
                  ? "text-white/75 hover:text-white"
                  : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
