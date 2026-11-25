import Card from "@/components/dashboard/ui/Card";
import type { BarangayProfile } from "@/types/profile";
import { ContactItem, HotlineList, OfficeHours } from "../ContactBlocks";

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export default function ContactView({ profile }: { profile: BarangayProfile }) {
  const c = profile.contact;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Barangay Hall" className="lg:col-span-2">
        <ul className="grid gap-3 md:grid-cols-2">
          <ContactItem wide icon="mapPin" label="Address" value={c.address} />
          <ContactItem icon="phone" label="Landline" value={c.landline} href={telHref(c.landline)} />
          <ContactItem icon="phone" label="Mobile" value={c.mobile} href={telHref(c.mobile)} />
          <ContactItem icon="mail" label="Email" value={c.email} href={`mailto:${c.email}`} />
          <ContactItem icon="globe" label="Facebook page" value={c.facebook} />
        </ul>
      </Card>
      <Card title="Office Hours"><OfficeHours hours={c.hours} /></Card>
      <Card title="Emergency Hotlines" className="lg:col-span-3"><HotlineList hotlines={c.hotlines} /></Card>
    </div>
  );
}
