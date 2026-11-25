"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import Icon from "@/components/dashboard/ui/Icon";
import { hrefOf, navSections, routes } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import { brand } from "@/lib/brand";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  permissions: string[];
  user: { name: string; position: string };
  /** Counts shown on menu items, keyed by item id (documents, submissions, announcements). */
  badges: Record<string, number>;
  onNavigate: () => void;
  onExpand: () => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
};

/** A white, floating menu card. Collapses to an icon rail on desktop and slides in as a drawer on phones. */
export default function Sidebar({
  collapsed,
  mobileOpen,
  permissions,
  user,
  badges,
  onNavigate,
  onExpand,
  onToggleCollapse,
  onLogout,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Set<string>>(
    () =>
      new Set(
        navSections
          .flatMap((s) => s.items)
          .filter((i) => i.children && pathname.startsWith(hrefOf(i)))
          .map((i) => i.id),
      ),
  );
  const hide = collapsed ? "lg:hidden" : "";
  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const row =
    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors motion-reduce:transition-none";
  const rowTone = (active: boolean) =>
    active
      ? "bg-brand/10 font-semibold text-brand"
      : "font-medium text-ink hover:bg-ground-muted";
  const centered = collapsed ? "lg:justify-center lg:px-0" : "";

  const Badge = ({ count }: { count?: number }) =>
    count ? (
      <span
        className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white ${collapsed ? "lg:absolute lg:right-1.5 lg:top-0.5 lg:ml-0 lg:h-4 lg:min-w-4 lg:px-1 lg:text-[10px]" : ""}`}
      >
        {count}
        <span className="visually-hidden"> pending</span>
      </span>
    ) : null;

  return (
    <aside
      aria-label="Main navigation"
      className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col rounded-r-3xl border border-rule/70 bg-panel shadow-[0_20px_60px_rgb(22_25_31/0.18)] transition-[transform,width] duration-200 motion-reduce:transition-none lg:sticky lg:inset-auto lg:top-4 lg:z-20 lg:m-4 lg:h-[calc(100dvh-2rem)] lg:translate-x-0 lg:self-start lg:rounded-3xl lg:shadow-[0_8px_30px_rgb(22_25_31/0.06)] ${collapsed ? "lg:w-[84px]" : "lg:w-[264px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div
        className={`flex items-center justify-between gap-2 px-4 pb-3 pt-5 ${collapsed ? "lg:flex-col lg:gap-3" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <div className={`min-w-0 leading-tight ${hide}`}>
            <p className="truncate font-display text-[17px] font-bold tracking-[-0.02em]">
              {brand.name}
            </p>
            <p className="truncate text-[12px] text-ink-secondary">
              Barangay Secretary
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-ground-muted hover:text-ink lg:flex"
        >
          <Icon name={collapsed ? "chevronsRight" : "chevronsLeft"} />
        </button>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-ground-muted lg:hidden"
        >
          <Icon name="close" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {navSections.map((section, index) => (
          <div
            key={section.title}
            className={index === 0 ? "" : "mt-3 border-t border-rule pt-3"}
          >
            <p
              className={`mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary ${hide}`}
            >
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const href = hrefOf(item);
                const hasKids = !!item.children?.length;
                const active = hasKids
                  ? pathname.startsWith(href)
                  : pathname === href;
                const isOpen = open.has(item.id);
                const listId = `nav-${item.id}`;

                if (!hasKids) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`${row} ${rowTone(active)} ${centered}`}
                      >
                        <Icon name={item.icon} />
                        <span className={hide}>{item.label}</span>
                        <Badge count={badges[item.id]} />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        if (collapsed) {
                          onExpand();
                          setOpen((s) => new Set(s).add(item.id));
                        } else toggle(item.id);
                      }}
                      className={`${row} ${rowTone(active && !isOpen)} ${active && isOpen ? "font-semibold text-brand" : ""} ${centered}`}
                    >
                      <Icon name={item.icon} />
                      <span className={`flex-1 text-left ${hide}`}>
                        {item.label}
                      </span>
                      <span className={hide}>
                        <Badge count={badges[item.id]} />
                      </span>
                      <Icon
                        name="chevronDown"
                        className={`h-4 w-4 text-ink-secondary transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""} ${hide}`}
                      />
                      {collapsed && badges[item.id] ? (
                        <span
                          aria-hidden="true"
                          className="absolute right-2 top-1.5 hidden h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white lg:block"
                        />
                      ) : null}
                    </button>
                    {isOpen && (
                      <ul
                        id={listId}
                        className={`ml-[22px] mt-1 space-y-0.5 border-l border-rule pl-3 ${hide}`}
                      >
                        {item.children!.map((c) => {
                          const childHref = hrefOf(item, c);
                          const childActive = pathname === childHref;
                          if (!can(permissions, c.requires)) {
                            return (
                              <li
                                key={c.slug}
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-secondary"
                              >
                                <Icon name="lock" className="h-3.5 w-3.5" />
                                {c.label}
                                <span className="rounded bg-ground-muted px-1.5 text-[11px]">
                                  Restricted
                                </span>
                              </li>
                            );
                          }
                          return (
                            <li key={c.slug}>
                              <Link
                                href={childHref}
                                onClick={onNavigate}
                                aria-current={childActive ? "page" : undefined}
                                className={`block rounded-lg px-3 py-1.5 text-[13px] transition-colors motion-reduce:transition-none ${childActive ? "bg-brand/10 font-semibold text-brand" : "text-ink-secondary hover:bg-ground-muted hover:text-ink"}`}
                              >
                                {c.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-rule p-3">
        <Link
          href={routes.accountProfile}
          onClick={onNavigate}
          title={collapsed ? user.name : undefined}
          className={`flex items-center gap-3 rounded-xl p-2 hover:bg-ground-muted ${collapsed ? "lg:justify-center" : ""}`}
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[13px] font-bold text-brand"
          >
            {initials}
          </span>
          <span className={`min-w-0 flex-1 leading-tight ${hide}`}>
            <span className="block truncate text-[13px] font-semibold">
              {user.name}
            </span>
            <span className="block truncate text-[12px] text-ink-secondary">
              {user.position}
            </span>
          </span>
          <Icon
            name="chevronRight"
            className={`h-4 w-4 text-ink-secondary ${hide}`}
          />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`${row} mt-1 text-ink-secondary hover:bg-flag-red/10 hover:text-flag-red ${centered}`}
        >
          <Icon name="logout" />
          <span className={hide}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
