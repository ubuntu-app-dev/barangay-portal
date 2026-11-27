import Icon from "./Icon";

const TEXT: Record<string, string> = {
  created: "Saved. The record was created.",
  updated: "Saved. Your changes were recorded.",
  archived: "The record was archived. It stays in the history.",
  deleted: "The record was removed.",
  issued: "Issued. The document now has a control number.",
  submitted: "Submitted to the municipality.",
};

/** One-line confirmation after a redirect, driven by ?saved=… in the URL. */
export default function SavedNotice({ value }: { value?: string }) {
  if (!value || !TEXT[value]) return null;
  return (
    <div role="status" className="flex items-center gap-2.5 rounded-xl border border-dash-success/20 bg-dash-success-soft px-4 py-3 text-[14px] font-medium text-dash-success">
      <Icon name="checkCircle" className="h-4 w-4" />
      {TEXT[value]}
    </div>
  );
}
