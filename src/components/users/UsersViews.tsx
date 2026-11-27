import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import ChangeHistory from "@/components/dashboard/ui/ChangeHistory";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar, { type FilterDef } from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import type { Role } from "@/generated/prisma/enums";
import type { StaffSession } from "@/lib/auth/staff";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { createUser, setUserStatus, unlockUser, updateUser } from "@/server/actions/users";
import { flat, type SearchParams } from "@/server/params";
import { assignmentOptions, getManagedUser, listUsers, manageableRoles, ROLE_LABEL, STATUS_LABEL } from "@/server/queries/users";
import ResetPassword from "./ResetPassword";
import UserForm from "./UserForm";

const scopeOf = (u: { role: Role; barangay?: { name: string; municipality?: { name: string } } | null; office?: { name: string } | null; municipality?: { name: string } | null }) =>
  u.role === "BARANGAY_SECRETARY" ? `Barangay ${u.barangay?.name ?? "?"}${u.barangay?.municipality ? `, ${u.barangay.municipality.name}` : ""}` : u.role === "SUPERADMIN" ? "All municipalities" : [u.office?.name, u.municipality?.name].filter(Boolean).join(" · ");

/** Account list for an IT admin (own municipality) or the superadmin (everyone, or a role subset). */
export async function UsersList({ actor, sp, base, title, description, roles }: { actor: StaffSession; sp: SearchParams; base: string; title: string; description: string; roles?: Role[] }) {
  const [list, opts] = await Promise.all([listUsers(actor, sp, roles), assignmentOptions(actor)]);
  const roleOptions = (roles ?? manageableRoles(actor)).map((r) => ({ value: r, label: ROLE_LABEL[r] }));
  const filters: FilterDef[] = [
    ...(roleOptions.length > 1 ? [{ name: "role", label: "Role", options: roleOptions }] : []),
    { name: "status", label: "Status", options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })) },
    ...(actor.role === "MUNICIPAL_ADMIN" ? [{ name: "barangay", label: "Barangay", options: opts.barangays }] : [{ name: "municipality", label: "Municipality", options: opts.municipalities }]),
    { name: "locked", label: "Lock", options: [{ value: "1", label: "Locked out now" }] },
  ];
  const now = new Date();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" icon="users" title={title} description={description}>
        <Link href={`${base}/new`} className="btn btn-primary">
          <Icon name="userPlus" className="h-4 w-4" /> New account
        </Link>
      </PageHeader>
      <Card title={`${formatNumber(list.total)} account${list.total === 1 ? "" : "s"}`} icon="users">
        <ListToolbar placeholder="Search name, username, or email" filters={filters} />
        <Table
          caption="Accounts"
          rows={list.rows}
          rowKey={(u) => u.id}
          empty={{ icon: "users", title: "No accounts found", text: "Try a different search, or create an account." }}
          cols={[
            { key: "n", header: "Name", cell: (u) => <Cell2 title={`${u.lastName}, ${u.firstName}`} sub={u.username} href={`${base}/${u.id}`} /> },
            { key: "r", header: "Role and scope", cell: (u) => <Cell2 title={ROLE_LABEL[u.role]} sub={scopeOf(u)} /> },
            { key: "l", header: "Last sign-in", cell: (u) => <span className="text-[13px] text-ink-secondary">{u.lastLoginAt ? formatDateTime(u.lastLoginAt.toISOString()) : "Never"}</span>, optional: true },
            {
              key: "s",
              header: "Status",
              cell: (u) => (
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={STATUS_LABEL[u.status]} />
                  {u.lockedUntil && u.lockedUntil > now && <StatusBadge status="Locked" />}
                  {u.mustChangePassword && <span className="rounded-full bg-dash-gold-soft px-2 py-0.5 text-[11px] font-semibold text-dash-gold-ink">Temp password</span>}
                  {u.permissions.includes("vawc:view") && <span className="rounded-full bg-dash-danger-soft px-2 py-0.5 text-[11px] font-semibold text-dash-danger">VAWC</span>}
                </div>
              ),
            },
            { key: "go", header: "", className: "text-right", cell: (u) => <RowLink href={`${base}/${u.id}`} label="Manage" /> },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={base} />
      </Card>
    </div>
  );
}

export async function NewUser({ actor, base, roles }: { actor: StaffSession; base: string; roles?: Role[] }) {
  const opts = await assignmentOptions(actor);
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: base, label: "Accounts" }} icon="userPlus" title="New account" description="Accounts are personal: never share one between people." />
      <UserForm action={createUser} mode="create" roles={(roles ?? manageableRoles(actor)).map((r) => ({ value: r, label: ROLE_LABEL[r] }))} {...opts} cancelHref={base} />
    </div>
  );
}

export async function UserDetail({ actor, id, base, roles }: { actor: StaffSession; id: string; base: string; roles?: Role[] }) {
  const [u, opts] = await Promise.all([getManagedUser(actor, id, roles), assignmentOptions(actor)]);
  const locked = !!u.lockedUntil && u.lockedUntil > new Date();
  const self = u.id === actor.id;
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: base, label: "Accounts" }} eyebrow={ROLE_LABEL[u.role]} title={`${u.firstName} ${u.lastName}`} description={`${u.username} · ${scopeOf(u)}`}>
        {!self && <ResetPassword id={u.id} username={u.username} />}
        {locked && <ActionDialog trigger="Unlock" triggerClassName="btn btn-secondary btn-sm" title={`Unlock ${u.username}?`} description="Clears the failed attempts so they can sign in again." action={unlockUser} hidden={{ id: u.id }} confirmLabel="Unlock" icon="lock" />}
        {!self &&
          (u.status === "ACTIVE" ? (
            <ActionDialog trigger="Suspend" triggerClassName="btn btn-secondary btn-sm text-dash-danger" title={`Suspend ${u.username}?`} description="They are signed out everywhere and cannot sign in until reactivated. Their records stay." action={setUserStatus} hidden={{ id: u.id, status: "SUSPENDED" }} confirmLabel="Suspend" tone="danger" icon="lock" reason={{ label: "Reason", required: true }} />
          ) : (
            <ActionDialog trigger="Reactivate" triggerClassName="btn btn-primary btn-sm" title={`Reactivate ${u.username}?`} action={setUserStatus} hidden={{ id: u.id, status: "ACTIVE" }} confirmLabel="Reactivate" icon="checkCircle" />
          ))}
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <UserForm
          action={updateUser}
          mode="edit"
          roles={[{ value: u.role, label: ROLE_LABEL[u.role] }]}
          {...opts}
          cancelHref={base}
          v={{
            id: u.id,
            role: u.role,
            firstName: u.firstName,
            middleName: u.middleName ?? "",
            lastName: u.lastName,
            position: u.position ?? "",
            email: u.email ?? "",
            phone: u.phone ?? "",
            barangayCode: u.barangayCode ?? "",
            officeId: u.officeId ?? "",
            municipalityCode: u.municipalityCode ?? "",
            vawc: u.permissions.includes("vawc:view"),
          }}
        />
        <div className="space-y-6">
          <Card title="Account status" icon="key" actions={<StatusBadge status={STATUS_LABEL[u.status]} />}>
            <DetailList
              columns={1}
              rows={[
                ["Last sign-in", u.lastLoginAt ? formatDateTime(u.lastLoginAt.toISOString()) : "Never"],
                ["Signed in on", `${u.sessions} device${u.sessions === 1 ? "" : "s"}`],
                ["Password", u.mustChangePassword ? "Temporary (must change)" : u.passwordChangedAt ? `Changed ${formatDateTime(u.passwordChangedAt.toISOString())}` : "Set at creation"],
                ["Lockout", locked ? `Locked until ${formatDateTime(u.lockedUntil!.toISOString())}` : `${u.failedLogins} failed attempt${u.failedLogins === 1 ? "" : "s"}`],
                ["Created", formatDateTime(u.createdAt.toISOString())],
              ]}
            />
            {u.status !== "DEACTIVATED" && !self && (
              <div className="mt-4 border-t border-rule pt-3">
                <ActionDialog trigger="Deactivate permanently" triggerClassName="btn btn-ghost btn-sm text-dash-danger" title={`Deactivate ${u.username}?`} description="For people who left the post. The account stays for the records but cannot sign in." action={setUserStatus} hidden={{ id: u.id, status: "DEACTIVATED" }} confirmLabel="Deactivate" tone="danger" icon="xCircle" reason={{ label: "Reason", placeholder: "For example, end of term", required: true }} />
              </div>
            )}
          </Card>
          <Card title="Recent activity" icon="history">
            <ChangeHistory rows={u.activity} />
          </Card>
        </div>
      </div>
    </div>
  );
}
