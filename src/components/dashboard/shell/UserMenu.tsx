"use client";
import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import Popover from "@/components/dashboard/ui/Popover";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { WORKSPACES, type WorkspaceKey } from "@/config/workspaces";

type Props = { ws: WorkspaceKey; name: string; position: string; onLogout: () => void };

export default function UserMenu({ ws, name, position, onLogout }: Props) {
  const l = WORKSPACES[ws].links;
  const links: { label: string; href: string; icon: IconName }[] = [
    { label: "My Profile", href: l.account, icon: "user" },
    { label: "Notification Settings", href: l.preferences, icon: "settings" },
    { label: "Change Password", href: l.password, icon: "key" },
  ];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <Popover
      label="Account menu"
      buttonClassName="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ground-muted"
      button={
        <>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-fill text-[13px] font-bold text-white"
          >
            {initials}
          </span>
          <span className="hidden whitespace-nowrap text-left leading-tight md:block">
            <span className="block text-[13px] font-semibold">{name}</span>
            <span className="block text-[12px] text-ink-secondary">
              {position}
            </span>
          </span>
          <Icon name="chevronDown" className="hidden h-4 w-4 md:block" />
        </>
      }
      panelClassName="w-64 p-2"
    >
      {(close) => (
        <div>
          <div className="px-3 py-2">
            <p className="text-[14px] font-semibold">{name}</p>
            <p className="text-[12px] text-ink-secondary">{position}</p>
          </div>
          <ul className="border-t border-rule pt-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] hover:bg-ground-muted"
                >
                  <Icon name={l.icon} className="h-4 w-4 text-ink-secondary" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-rule px-3 py-2">
            <span className="text-[14px]">Theme</span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => {
              close();
              onLogout();
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-rule px-3 py-2 pt-3 text-left text-[14px] font-semibold text-flag-red hover:bg-ground-muted"
          >
            <Icon name="logout" className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </Popover>
  );
}
