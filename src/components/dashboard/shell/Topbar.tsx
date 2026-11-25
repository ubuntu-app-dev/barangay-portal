"use client";
import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import { routes } from "@/config/navigation";
import type { AppNotification } from "@/types/dashboard";
import Breadcrumbs from "./Breadcrumbs";
import GlobalSearch from "./GlobalSearch";
import NotificationCenter from "./NotificationCenter";
import UserMenu from "./UserMenu";

type Props = {
  user: { name: string; position: string };
  barangayName: string;
  permissions: string[];
  notifications: AppNotification[];
  onToggleSidebar: () => void;
  onLogout: () => void;
};

export default function Topbar({
  user,
  barangayName,
  permissions,
  notifications,
  onToggleSidebar,
  onLogout,
}: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-ground-muted/85 px-3 backdrop-blur sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel text-ink shadow-sm hover:bg-white lg:hidden"
      >
        <Icon name="menu" />
      </button>
      <Breadcrumbs />
      <div className="flex flex-1 justify-end sm:justify-center md:justify-end lg:justify-center">
        <GlobalSearch permissions={permissions} />
      </div>
      <span className="hidden items-center gap-1.5 rounded-full bg-dash-primary-soft px-3 py-1 text-[12px] font-semibold text-dash-primary xl:inline-flex">
        <Icon name="mapPin" className="h-3.5 w-3.5" />
        {barangayName}
      </span>
      <Link
        href={routes.help}
        aria-label="Help and Support"
        className="hidden h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-ground-muted sm:flex"
      >
        <Icon name="help" />
      </Link>
      <NotificationCenter items={notifications} />
      <UserMenu name={user.name} position={user.position} onLogout={onLogout} />
    </header>
  );
}
