"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WORKSPACES, type WorkspaceKey } from "@/config/workspaces";
import { useEffect, useState, type ReactNode } from "react";
import { logout } from "@/lib/auth/logout";
import { ROUTES } from "@/lib/routes";
import type { AppNotification } from "@/types/dashboard";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  ws: WorkspaceKey;
  user: { name: string; position: string; mustChangePassword: boolean };
  /** Barangay or municipality name in the top bar. */
  scopeLabel: string;
  /** System-wide notice set by the superadmin. */
  banner?: string;
  permissions: string[];
  notifications: AppNotification[];
  badges: Record<string, number>;
  children: ReactNode;
};

/** The frame around every dashboard page: collapsible sidebar, sticky top bar, and the page itself. */
export default function DashboardShell({
  ws,
  user,
  scopeLabel,
  banner,
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
          ws={ws}
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
            ws={ws}
            user={user}
            scopeLabel={scopeLabel}
            permissions={permissions}
            notifications={notifications}
            onToggleSidebar={() => setMobileOpen((o) => !o)}
            onLogout={signOut}
          />
          <main id="main" className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-6 lg:pl-2">
            {banner && (
              <p role="note" className="no-print mb-5 flex items-center gap-2.5 rounded-xl border border-dash-secondary/25 bg-dash-secondary-soft px-4 py-3 text-[14px] font-medium text-dash-secondary">
                {banner}
              </p>
            )}
            {user.mustChangePassword && (
              <p className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dash-gold/40 bg-dash-gold-soft px-4 py-3 text-[14px] font-medium text-dash-gold-ink">
                Your administrator set a temporary password. Please change it now.
                <Link href={WORKSPACES[ws].links.password} className="btn btn-sm bg-dash-gold text-ink">
                  Change password
                </Link>
              </p>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
