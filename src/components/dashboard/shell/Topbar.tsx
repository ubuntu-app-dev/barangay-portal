"use client";
import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import { WORKSPACES, type WorkspaceKey } from "@/config/workspaces";
import type { AppNotification } from "@/types/dashboard";
import Breadcrumbs from "./Breadcrumbs";
import GlobalSearch from "./GlobalSearch";
import NotificationCenter from "./NotificationCenter";
import UserMenu from "./UserMenu";

type Props = {
  ws: WorkspaceKey;
  user: { name: string; position: string };
  scopeLabel: string;
  permissions: string[];
  notifications: AppNotification[];
  onToggleSidebar: () => void;
  onLogout: () => void;
};

export default function Topbar({
  ws,
  user,
  scopeLabel,
  permissions,
  notifications,
  onToggleSidebar,
  onLogout,
}: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-rule/50 bg-dash-canvas/80 px-3 backdrop-blur-md sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel text-ink shadow-sm hover:bg-white lg:hidden"
      >
        <Icon name="menu" />
      </button>
      <Breadcrumbs ws={ws} />
      <div className="flex min-w-[220px] flex-1 justify-end sm:justify-center md:justify-end lg:justify-center">
        <GlobalSearch ws={ws} permissions={permissions} />
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-dash-primary/15 bg-dash-primary-soft px-3 py-1 text-[12px] font-semibold text-dash-primary 2xl:inline-flex">
        <Icon name="mapPin" className="h-3.5 w-3.5" />
        {scopeLabel}
      </span>
      {WORKSPACES[ws].links.help && (
        <Link
          href={WORKSPACES[ws].links.help!}
          aria-label="Help and Support"
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-ground-muted sm:flex"
        >
          <Icon name="help" />
        </Link>
      )}
      <NotificationCenter ws={ws} items={notifications} />
      <UserMenu ws={ws} name={user.name} position={user.position} onLogout={onLogout} />
    </header>
  );
}
