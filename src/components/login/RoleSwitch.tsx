"use client";
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { MunicipalRoleIcon, SecretaryRoleIcon, SuperadminRoleIcon } from "@/components/icons/roles";
import { loginRoles } from "@/data/login-content";
import type { LoginRole } from "@/types/login";

const icons: Record<LoginRole, ComponentType<{ className?: string }>> = {
  secretary: SecretaryRoleIcon,
  municipal: MunicipalRoleIcon,
  superadmin: SuperadminRoleIcon,
};

/** Real radio inputs (arrow keys work natively) with a pill that slides to the chosen role. */
export default function RoleSwitch({ value, onChange }: { value: LoginRole; onChange: (role: LoginRole) => void }) {
  return (
    <fieldset className="grid grid-cols-3 gap-1 rounded-2xl bg-ground-muted p-1">
      <legend className="visually-hidden">Sign in as</legend>
      {loginRoles.map((r) => {
        const Icon = icons[r.id];
        const on = value === r.id;
        return (
          <label key={r.id} className="relative cursor-pointer rounded-xl has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
            <input type="radio" name="role" value={r.id} checked={on} onChange={() => onChange(r.id)} className="visually-hidden" />
            {on && <motion.span layoutId="role-pill" className="absolute inset-0 rounded-xl bg-panel shadow-md" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className={`relative flex flex-col items-center gap-1 px-1 py-3 text-center text-[13px] font-semibold leading-tight ${on ? "text-brand" : "text-ink-secondary"}`}>
              <Icon className="h-6 w-6" />
              {r.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
