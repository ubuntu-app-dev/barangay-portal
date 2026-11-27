import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import { ActionForm, SubmitButton } from "@/components/dashboard/ui/form";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { formatDateTime } from "@/lib/dashboard/format";
import type { StaffSession } from "@/lib/auth/staff";
import { changePassword, savePreferences, signOutOtherDevices, updateAccount } from "@/server/actions/account";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { PasswordForm, PreferencesForm, ProfileForm } from "./AccountForms";

const ROLE_LABEL = { BARANGAY_SECRETARY: "Barangay Secretary", MUNICIPAL_PERSONNEL: "Municipal Personnel", MUNICIPAL_ADMIN: "Municipal IT Admin", SUPERADMIN: "Superadmin" } as const;

/** The same settings pages for every role. */
export async function AccountSettings({ u }: { u: StaffSession }) {
  const row = await db.user.findUniqueOrThrow({ where: { id: u.id } });
  const scope = u.barangay ? `${u.barangay.name}, ${u.barangay.municipality}` : u.municipality ? `${u.municipality.name}, ${u.municipality.province}` : "All municipalities";
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" icon="user" title="Account Profile" description="Your details as a user of LGU Connect." />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ProfileForm action={updateAccount} v={{ firstName: row.firstName, middleName: row.middleName ?? "", lastName: row.lastName, suffix: row.suffix ?? "", email: row.email ?? "", phone: row.phone ?? "", username: row.username, position: row.position ?? "" }} />
        <Card title="Access" icon="key">
          <DetailList
            columns={1}
            rows={[
              ["Role", ROLE_LABEL[u.role]],
              ["Scope", scope],
              ...(u.office ? ([["Office", u.office.name]] as [string, string][]) : []),
              ["Special access", u.permissions.includes("vawc:view") ? "VAWC records" : "None"],
              ["Last sign-in", row.lastLoginAt ? formatDateTime(row.lastLoginAt.toISOString()) : null],
              ["Password changed", row.passwordChangedAt ? formatDateTime(row.passwordChangedAt.toISOString()) : "Never"],
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

export async function PasswordSettings({ u }: { u: StaffSession }) {
  const [sessions, settings] = await Promise.all([db.session.findMany({ where: { userId: u.id, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }), getSettings()]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" icon="key" title="Change Password" description={u.role === "SUPERADMIN" ? "Use a password you do not use anywhere else." : "Use a password you do not use anywhere else. Forgot it? Your administrator can reset it."} />
      {u.mustChangePassword && <p className="rounded-xl bg-dash-gold-soft px-4 py-3 text-[14px] font-medium text-dash-gold-ink">Your administrator asked you to set a new password.</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <PasswordForm action={changePassword} minLength={settings.passwordMinLength} />
        <Card title="Signed-in devices" icon="globe" description={`${sessions.length} active session${sessions.length === 1 ? "" : "s"}`}>
          <ul className="mb-4 space-y-2 text-[13px]">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl bg-ground-muted/70 px-3 py-2">
                <p className="truncate font-medium">{s.userAgent?.replace(/\(.*?\)/g, "").slice(0, 60) || "Unknown browser"}</p>
                <p className="text-ink-secondary">
                  Since {formatDateTime(s.createdAt.toISOString())}
                  {s.ip ? ` · ${s.ip}` : ""}
                </p>
              </li>
            ))}
          </ul>
          {sessions.length > 1 && (
            <ActionForm action={signOutOtherDevices}>
              <SubmitButton variant="secondary" pendingText="Signing out…" className="w-full">
                Sign out other devices
              </SubmitButton>
            </ActionForm>
          )}
        </Card>
      </div>
    </div>
  );
}

export async function PreferenceSettings({ u }: { u: StaffSession }) {
  const row = await db.user.findUniqueOrThrow({ where: { id: u.id }, select: { preferences: true } });
  const prefs = (row.preferences && typeof row.preferences === "object" ? row.preferences : {}) as Record<string, boolean>;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" icon="bell" title="Notification Preferences" description="Choose what you want to be told about." />
      <PreferencesForm action={savePreferences} v={prefs} role={u.role} />
    </div>
  );
}
