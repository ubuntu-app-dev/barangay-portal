"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logout } from "@/lib/auth/logout";
import { ROUTES } from "@/lib/routes";
import type { AppNotification, Session } from "@/types/dashboard";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  user: Session["user"];
  barangay: Session["barangay"];
  permissions: string[];
  notifications: AppNotification[];
  badges: Record<string, number>;
  children: ReactNode;
};

/** The frame around every dashboard page: collapsible sidebar, sticky top bar, and the page itself. */
export default function DashboardShell({
  user,
  barangay,
  permissions,
  notifications,
  badges,
  children,
}: Props) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const signOut = async () => {
    await logout();
    router.push(ROUTES.login);
  };

  return (
    <div className="dash min-h-dvh bg-ground-muted">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <div className="flex">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          permissions={permissions}
          user={user}
          badges={badges}
          onNavigate={() => setMobileOpen(false)}
          onExpand={() => setCollapsed(false)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onLogout={signOut}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            user={user}
            barangayName={barangay.name}
            permissions={permissions}
            notifications={notifications}
            onToggleSidebar={() => setMobileOpen((o) => !o)}
            onLogout={signOut}
          />
          <main id="main" className="flex-1 p-4 sm:p-6 lg:pl-2">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
