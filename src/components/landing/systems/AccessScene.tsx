"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { accessRoles } from "@/data/systems-content";

/** Interactive: choose a user level to see which system it works in. */
export default function AccessScene() {
  const [activeId, setActiveId] = useState(accessRoles[0].id);
  const role = accessRoles.find((r) => r.id === activeId) ?? accessRoles[0];
  const tiles = [
    {
      key: "barangay",
      label: "Barangay Information System",
      on: role.barangay,
    },
    { key: "municipal", label: "Municipal System", on: role.municipal },
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5 sm:p-6">
      <div
        role="group"
        aria-label="Choose a user level"
        className="mx-auto flex w-full max-w-[520px] flex-wrap gap-2"
      >
        {accessRoles.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={r.id === activeId}
            onClick={() => setActiveId(r.id)}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-[14px] font-semibold motion-reduce:transition-none transition-colors ${
              r.id === activeId
                ? "border-brand bg-brand text-on-brand"
                : "border-rule bg-panel text-ink hover:bg-ground-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-[520px] gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <motion.div
            key={t.key}
            animate={{ scale: t.on ? 1 : 0.97 }}
            className={`rounded-xl border-2 p-4 ${t.on ? "border-brand bg-panel shadow-md" : "border-dashed border-rule bg-transparent"}`}
          >
            <p className="font-display text-[15px] font-bold">{t.label}</p>
            <p
              className={`mt-1 text-[13px] font-medium ${t.on ? "text-brand" : "text-ink-secondary"}`}
            >
              {t.on
                ? role.id === "superadmin"
                  ? "Manages"
                  : "Works here"
                : "Not part of this role"}
            </p>
          </motion.div>
        ))}
      </div>
      <p
        aria-live="polite"
        className="mx-auto max-w-[520px] text-center text-[14px] text-ink-secondary"
      >
        {role.summary}
      </p>
    </div>
  );
}
