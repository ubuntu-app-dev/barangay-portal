"use client";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { GeoOption, GeoStatus } from "@/types/geo";

type Props = {
  label: string;
  placeholder: string;
  options: GeoOption[];
  value: GeoOption | null;
  onChange: (option: GeoOption) => void;
  status: GeoStatus;
  onRetry: () => void;
  autoFocus?: boolean;
};

// "Dasmarinas" should find "Dasmariñas".
const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Searchable combobox (ARIA 1.2 pattern): type to filter, arrows to move, Enter to choose, Escape to close. */
export default function GeoSelect({ label, placeholder, options, value, onChange, status, onRetry, autoFocus = false }: Props) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedOnce = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const ready = status === "ready";

  const matches = useMemo(() => {
    const q = fold(query.trim());
    return q ? options.filter((o) => fold(o.name).includes(q)) : options;
  }, [options, query]);

  // Once the data arrives, move focus here (only for steps that appear after a choice).
  useEffect(() => {
    if (autoFocus && ready && !focusedOnce.current) {
      focusedOnce.current = true;
      inputRef.current?.focus();
    }
  }, [autoFocus, ready]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const choose = (option: GeoOption) => {
    onChange(option);
    close();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + matches.length) % Math.max(matches.length, 1));
    } else if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  const shownPlaceholder = status === "loading" ? "Loading…" : open && value ? value.name : placeholder;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-semibold">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          disabled={!ready}
          value={open ? query : (value?.name ?? "")}
          placeholder={shownPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={close}
          onKeyDown={onKeyDown}
          className={`h-12 w-full rounded-xl border bg-panel pl-4 pr-11 text-[15px] placeholder:text-ink-secondary disabled:cursor-not-allowed disabled:bg-ground-muted ${value ? "border-brand" : "border-rule"}`}
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-secondary">
          {value ? (
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3.2 3L13 4.5" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
          )}
        </span>
        {status === "loading" && <span aria-hidden="true" className="shimmer absolute inset-x-3 bottom-0 h-0.5 rounded-full" />}

        {open && matches.length > 0 && (
          <ul id={listId} role="listbox" aria-label={label} className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-rule bg-panel p-1 shadow-xl">
            {matches.map((o, i) => (
              <li
                key={o.code}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={value?.code === o.code}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-[15px] ${i === active ? "bg-brand/10" : ""} ${value?.code === o.code ? "font-semibold text-brand" : ""}`}
              >
                {o.name}
              </li>
            ))}
          </ul>
        )}
        {open && matches.length === 0 && (
          <p role="status" className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-rule bg-panel px-4 py-3 text-[14px] text-ink-secondary shadow-xl">No matches for &ldquo;{query}&rdquo;</p>
        )}
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 flex flex-wrap items-center gap-x-3 text-[14px] text-flag-red">
          Couldn&rsquo;t load the list.
          <button type="button" onClick={onRetry} className="font-semibold underline">Try again</button>
        </p>
      )}
    </div>
  );
}
