import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import type { BarangayProfile } from "@/types/profile";
import { ContactItem, HotlineList, OfficeHours } from "../ContactBlocks";

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
export const CONTACT_EDIT_HREF = "/dashboard/barangay-profile/barangay-contact-details/edit";

export default function ContactView({ profile, canEdit }: { profile: BarangayProfile; canEdit: boolean }) {
  const c = profile.contact;
  const edit = canEdit ? (
    <Link href={CONTACT_EDIT_HREF} className="btn btn-soft btn-sm">
      <Icon name="edit" className="h-3.5 w-3.5" /> Edit
    </Link>
  ) : undefined;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Barangay Hall" icon="building" className="lg:col-span-2" actions={edit}>
        <ul className="grid gap-3 md:grid-cols-2">
          <ContactItem wide icon="mapPin" label="Address" value={c.address || "Not set"} />
          <ContactItem icon="phone" label="Landline" value={c.landline || "Not set"} href={c.landline ? telHref(c.landline) : undefined} />
          <ContactItem icon="phone" label="Mobile" value={c.mobile || "Not set"} href={c.mobile ? telHref(c.mobile) : undefined} />
          <ContactItem icon="mail" label="Email" value={c.email || "Not set"} href={c.email ? `mailto:${c.email}` : undefined} />
          <ContactItem icon="globe" label="Facebook page" value={c.facebook || "Not set"} />
        </ul>
      </Card>
      <Card title="Office Hours" icon="clock" actions={edit}>
        {c.hours.length ? <OfficeHours hours={c.hours} /> : <p className="text-[14px] text-ink-secondary">Not set.</p>}
      </Card>
      <Card title="Emergency Hotlines" icon="phone" className="lg:col-span-3" actions={edit}>
        {c.hotlines.length ? <HotlineList hotlines={c.hotlines} /> : <EmptyState icon="phone" title="No hotlines yet" text="Add emergency numbers residents can call." />}
      </Card>
    </div>
  );
}
