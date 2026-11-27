"use client";
import { useState } from "react";
import Icon from "./Icon";

type Field = { key: string; label: string; placeholder?: string; width?: string };

/** Repeating rows of inputs named `${name}.${i}.${field}`. Empty rows are ignored by the server. */
export default function RowsEditor({ name, label, fields, initial, addLabel = "Add row", max = 12 }: { name: string; label: string; fields: Field[]; initial: Record<string, string>[]; addLabel?: string; max?: number }) {
  const [rows, setRows] = useState(() => (initial.length ? initial : [{}]).map((r, i) => ({ id: i, values: r })));
  const [next, setNext] = useState(rows.length);
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p className="text-[13px] font-semibold">{label}</p>
      {rows.map((row, i) => (
        <div key={row.id} className="flex flex-wrap items-end gap-2 rounded-xl bg-ground-muted/60 p-2">
          {fields.map((f) => (
            <label key={f.key} className={`min-w-[140px] flex-1 ${f.width ?? ""}`}>
              <span className="mb-1 block text-[12px] font-medium text-ink-secondary">{f.label}</span>
              <input name={`${name}.${i}.${f.key}`} defaultValue={row.values[f.key] ?? ""} placeholder={f.placeholder} className="field" />
            </label>
          ))}
          <button type="button" aria-label={`Remove row ${i + 1}`} onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))} className="btn btn-ghost btn-sm mb-1 px-2 text-dash-danger">
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => {
            setRows((r) => [...r, { id: next, values: {} }]);
            setNext((n) => n + 1);
          }}
          className="btn btn-soft btn-sm"
        >
          <Icon name="plus" className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}
