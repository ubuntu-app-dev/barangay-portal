"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useFieldError } from "./form";
import Icon from "./Icon";

export type PickerOption = { value: string; label: string; sub?: string };

type Props = {
  name: string;
  label: string;
  type: "resident" | "household";
  initial?: PickerOption | null;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  onChange?: (o: PickerOption | null) => void;
};

/**
 * Searchable picker for residents or households of the signed-in barangay. Sends the chosen id under `name`.
 * Keyboard: type to search, arrow keys to move, Enter to choose, Escape to close.
 */
export default function RecordPicker({ name, label, type, initial = null, placeholder = "Type a name or number", hint, required, className = "", onChange }: Props) {
  const id = useId();
  const error = useFieldError(name);
  const listId = `${id}-list`;
  const [value, setValue] = useState<PickerOption | null>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PickerOption[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/lookup?type=${type}&q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (res.ok) {
          setItems(await res.json());
          setActive(0);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open, type]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const choose = (o: PickerOption | null) => {
    setValue(o);
    onChange?.(o);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
        {label}
        {required && <span aria-hidden="true" className="ml-0.5 text-dash-danger">*</span>}
      </label>
      <input type="hidden" name={name} value={value?.value ?? ""} />
      {value && !open ? (
        <div className="field flex items-center justify-between gap-2" aria-invalid={error ? true : undefined}>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{value.label}</span>
            {value.sub && <span className="block truncate text-[12px] text-ink-secondary">{value.sub}</span>}
          </span>
          <span className="flex shrink-0 gap-1">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)} id={id}>
              Change
            </button>
            {!required && (
              <button type="button" className="btn btn-ghost btn-sm px-2" aria-label={`Clear ${label}`} onClick={() => choose(null)}>
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        </div>
      ) : (
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
          <input
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (items[active]) choose(items[active]);
              } else if (e.key === "Escape") setOpen(false);
            }}
            className="field pl-9"
          />
        </div>
      )}
      {open && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-40 mt-1.5 max-h-72 overflow-auto rounded-xl border border-rule bg-panel p-1 shadow-pop">
          {loading && items.length === 0 ? (
            <li className="px-3 py-3 text-[13px] text-ink-secondary">Searching…</li>
          ) : items.length === 0 ? (
            <li className="px-3 py-3 text-[13px] text-ink-secondary">No matches. Check the spelling or register the {type} first.</li>
          ) : (
            items.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={i === active}
                onPointerDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
                onPointerEnter={() => setActive(i)}
                className={`cursor-pointer rounded-lg px-3 py-2 ${i === active ? "bg-dash-primary-soft" : ""}`}
              >
                <span className="block text-[14px] font-semibold">{o.label}</span>
                {o.sub && <span className="block text-[12px] text-ink-secondary">{o.sub}</span>}
              </li>
            ))
          )}
        </ul>
      )}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-dash-danger">
          <Icon name="alert" className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] text-ink-secondary">{hint}</p>
      ) : null}
    </div>
  );
}
