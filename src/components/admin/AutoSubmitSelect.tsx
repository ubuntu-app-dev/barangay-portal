"use client";
import type { ReactNode } from "react";

/** A select inside a GET form that submits the form when changed (the form still has a button without JS). */
export default function AutoSubmitSelect({ name, defaultValue, children, label }: { name: string; defaultValue?: string; children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="field">
        {children}
      </select>
    </label>
  );
}
