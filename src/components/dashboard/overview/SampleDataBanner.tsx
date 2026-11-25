import Icon from "@/components/dashboard/ui/Icon";

/** Shown whenever the figures come from sample data, so nobody mistakes them for barangay records. */
export default function SampleDataBanner() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl border border-dash-gold/50 bg-dash-gold-soft px-4 py-3 text-[14px] text-dash-gold-ink">
      <Icon name="info" className="mt-0.5 h-4 w-4" />
      <p><strong>Sample data.</strong> These figures are placeholders for UI prototyping. They are not records of this barangay.</p>
    </div>
  );
}
