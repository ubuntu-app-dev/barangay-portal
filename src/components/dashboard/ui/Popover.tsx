"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  label: string;
  button: ReactNode;
  buttonClassName?: string;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
};

/** A button that opens a panel. Closes on Escape (focus returns to the button), outside click, or via close(). */
export default function Popover({ label, button, buttonClassName = "", panelClassName = "", children }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button ref={buttonRef} type="button" aria-label={label} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} className={buttonClassName}>
        {button}
      </button>
      {open && (
        <div id={panelId} className={`absolute right-0 top-full z-50 mt-2 rounded-xl border border-rule bg-panel shadow-xl ${panelClassName}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
