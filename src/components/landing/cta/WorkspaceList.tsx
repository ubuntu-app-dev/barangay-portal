import type { ComponentType } from "react";
import {
  MunicipalRoleIcon,
  SecretaryRoleIcon,
  SuperadminRoleIcon,
} from "@/components/icons/icon";
import { StaggerItem, StaggerList } from "@/components/motion";
import { levels } from "@/data/levels-content";
import type { LevelId } from "@/types/levels";

const icons: Record<LevelId, ComponentType<{ className?: string }>> = {
  secretary: SecretaryRoleIcon,
  municipal: MunicipalRoleIcon,
  superadmin: SuperadminRoleIcon,
};

/** Who signs in, and to which system. Informational, not links. */
export default function WorkspaceList() {
  return (
    <StaggerList className="grid gap-3">
      {levels.map((l) => {
        const Icon = icons[l.id];
        return (
          <StaggerItem key={l.id}>
            <div className="flex items-center gap-4 rounded-panel border border-on-field-secondary/20 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-flag-gold text-ink">
                <Icon className="h-6 w-6" />
              </span>
              <span className="block">
                <span className="block font-display text-lg font-bold tracking-[-0.02em]">
                  {l.name}
                </span>
                <span className="block text-[14px] text-on-field-secondary">
                  {l.system}
                </span>
              </span>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
