"use client";
import { useState } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { recordPrint } from "@/server/actions/documents";

/** Counts the print on the server, then opens the browser's print dialog. */
export default function PrintButton({ id, label = "Print" }: { id: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await recordPrint(id);
        } finally {
          setBusy(false);
          window.print();
        }
      }}
      className="btn btn-primary"
    >
      <Icon name="printer" className="h-4 w-4" /> {label}
    </button>
  );
}
