const tones: Record<string, string> = {
  Completed: "bg-dash-success-soft text-dash-success",
  Approved: "bg-dash-success-soft text-dash-success",
  Submitted: "bg-dash-success-soft text-dash-success",
  Received: "bg-dash-success-soft text-dash-success",
  "In Progress": "bg-dash-secondary-soft text-dash-secondary",
  "Under Review": "bg-dash-secondary-soft text-dash-secondary",
  Active: "bg-dash-success-soft text-dash-success",
  Reorganizing: "bg-dash-gold-soft text-dash-gold-ink",
  Pending: "bg-dash-gold-soft text-dash-gold-ink",
  "Returned for Revision": "bg-dash-gold-soft text-dash-gold-ink",
  "Needs Attention": "bg-dash-gold-soft text-dash-gold-ink",
  Overdue: "bg-flag-red/10 text-flag-red",
  Urgent: "bg-flag-red/10 text-flag-red",
  High: "bg-dash-gold-soft text-dash-gold-ink",
  Normal: "bg-ground-muted text-ink-secondary",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tones[status] ?? "bg-ground-muted text-ink-secondary"}`}
    >
      {status}
    </span>
  );
}
