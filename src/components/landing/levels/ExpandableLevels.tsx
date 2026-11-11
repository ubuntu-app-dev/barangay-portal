"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MunicipalRoleIcon,
  SecretaryRoleIcon,
  SuperadminRoleIcon,
} from "@/components/icons/icon";
import { StaggerItem, StaggerList } from "@/components/motion";
import { levels } from "@/data/levels-content";
import { ROUTES } from "@/lib/routes";
import type { LevelId } from "@/types/levels";

const icons: Record<LevelId, ComponentType<{ className?: string }>> = {
  secretary: SecretaryRoleIcon,
  municipal: MunicipalRoleIcon,
  superadmin: SuperadminRoleIcon,
};

/**
 * Compact cards that expand into a detail dialog (shared-layout transition, as in the
 * Vengeance UI expandable bento). Cards are real buttons; the dialog traps focus,
 * closes on Escape or an outside click, and returns focus to the card that opened it.
 */
export default function ExpandableLevels() {
  const uid = useId();
  const [activeId, setActiveId] = useState<LevelId | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = levels.find((l) => l.id === activeId) ?? null;
  const ActiveIcon = active ? icons[active.id] : null;

  const close = useCallback(() => {
    setActiveId(null);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable =
        dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [activeId, close]);

  return (
    <>
      <StaggerList className="mt-10 grid gap-4 md:grid-cols-3">
        {levels.map((l) => {
          const Icon = icons[l.id];
          return (
            <StaggerItem key={l.id}>
              <motion.button
                type="button"
                layoutId={`card-${l.id}-${uid}`}
                aria-haspopup="dialog"
                onClick={(e) => {
                  trigger.current = e.currentTarget;
                  setActiveId(l.id);
                }}
                style={{ borderRadius: 12 }}
                className="flex h-full w-full items-start gap-4 border border-rule border-t-4 border-t-brand bg-panel p-5 text-left shadow-[0_1px_2px_rgb(22_25_31/0.04),0_10px_24px_rgb(22_25_31/0.06)] transition-shadow hover:shadow-[0_16px_32px_rgb(22_25_31/0.12)] motion-reduce:transition-none"
              >
                <motion.span
                  layoutId={`icon-${l.id}-${uid}`}
                  style={{ borderRadius: 12 }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center bg-brand/10 text-brand"
                >
                  <Icon />
                </motion.span>
                <span className="block">
                  <span className="block text-[13px] font-semibold text-brand">
                    {l.level}
                  </span>
                  <span className="block font-display text-lg font-bold tracking-[-0.02em]">
                    {l.name}
                  </span>
                  <span className="mt-1 block text-[14px] text-ink-secondary">
                    {l.scope}
                  </span>
                  <span className="mt-3 block text-[13px] font-semibold text-brand">
                    View details <span aria-hidden="true">&rarr;</span>
                  </span>
                </span>
              </motion.button>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <AnimatePresence>
        {active && (
          <motion.div
            key="overlay"
            aria-hidden="true"
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && ActiveIcon && (
          <div
            key="wrap"
            className="pointer-events-none fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${uid}-title`}
              layoutId={`card-${active.id}-${uid}`}
              style={{ borderRadius: 12 }}
              className="pointer-events-auto flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden border border-rule bg-panel shadow-2xl"
            >
              <div className="relative flex h-36 shrink-0 items-center justify-center bg-brand/10">
                <motion.span
                  layoutId={`icon-${active.id}-${uid}`}
                  style={{ borderRadius: 16 }}
                  className="flex h-20 w-20 items-center justify-center bg-panel text-brand shadow-md"
                >
                  <ActiveIcon className="h-10 w-10" />
                </motion.span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close details"
                  className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-panel text-ink shadow"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-none stroke-current"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <p className="text-[13px] font-semibold text-brand">
                  {active.level}
                </p>
                <h3
                  id={`${uid}-title`}
                  className="mt-1 font-display text-2xl font-bold tracking-[-0.02em]"
                >
                  {active.name}
                </h3>
                <p className="text-[14px] text-ink-secondary">{active.scope}</p>
                <p className="mt-4 text-[15px]">{active.summary}</p>
                <ul className="mt-5 space-y-2 border-t border-rule pt-5 text-[15px]">
                  {active.tasks.map((t) => (
                    <li key={t} className="flex gap-2">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className="mt-1 h-4 w-4 shrink-0 fill-none stroke-brand"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 8.5 3.2 3L13 4.5" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-[13px] font-semibold text-brand">
                    Works in: {active.system}
                  </span>
                  <Link href={ROUTES.login} className="btn btn-primary">
                    Sign in
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
