const GOOD = "bg-dash-success-soft text-dash-success";
const INFO = "bg-dash-secondary-soft text-dash-secondary";
const WARN = "bg-dash-gold-soft text-dash-gold-ink";
const BAD = "bg-dash-danger-soft text-dash-danger";
const MUTED = "bg-ground-muted text-ink-secondary";

const tones: Record<string, string> = {
  Completed: GOOD,
  Approved: GOOD,
  Submitted: INFO,
  Received: GOOD,
  Active: GOOD,
  Released: GOOD,
  "Ready for Release": GOOD,
  Valid: GOOD,
  Settled: GOOD,
  Closed: MUTED,
  Good: GOOD,
  Published: GOOD,
  Read: MUTED,
  Held: GOOD,

  "In Progress": INFO,
  "Under Review": INFO,
  Processing: INFO,
  "Under Mediation": INFO,
  "Under Conciliation": INFO,
  "Under Arbitration": INFO,
  Referred: INFO,
  Scheduled: INFO,
  Fair: INFO,
  Mediation: INFO,
  Conciliation: INFO,
  Arbitration: INFO,

  Pending: WARN,
  Open: WARN,
  Draft: WARN,
  Expired: WARN,
  Reorganizing: WARN,
  Inactive: WARN,
  "Returned for Revision": WARN,
  Returned: WARN,
  "Needs Attention": WARN,
  "Due Soon": WARN,
  "Not Submitted": WARN,
  "Moved Out": WARN,
  Missing: WARN,
  Transferred: MUTED,
  Rescheduled: WARN,
  Poor: WARN,
  High: WARN,

  Rejected: BAD,
  Voided: BAD,
  Cancelled: BAD,
  Overdue: BAD,
  Urgent: BAD,
  Dismissed: MUTED,
  "Certified to File Action": BAD,
  Deceased: MUTED,
  Unserviceable: BAD,
  "No Show": BAD,
  Failed: BAD,
  Confidential: BAD,

  Normal: MUTED,
  Archived: MUTED,
};

export default function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tones[status] ?? MUTED} ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
