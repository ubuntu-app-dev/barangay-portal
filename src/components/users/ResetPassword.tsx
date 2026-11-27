"use client";
import { useRef, useState, useTransition } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { resetUserPassword } from "@/server/actions/users";

/** Generates a temporary password and shows it once, so the administrator can hand it over. */
export default function ResetPassword({ id, username }: { id: string; username: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: true; password: string } | { ok: false; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const close = () => {
    ref.current?.close();
    setResult(null);
    setCopied(false);
  };
  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => ref.current?.showModal()}>
        <Icon name="key" className="h-4 w-4" /> Reset password
      </button>
      <dialog ref={ref} className="modal" aria-label="Reset password" onClose={() => setResult(null)}>
        <div className="space-y-4 p-6">
          <h2 className="font-display text-[18px] font-bold">Reset the password of {username}?</h2>
          {result?.ok ? (
            <>
              <p className="text-[14px] text-ink-secondary">Give this temporary password to the person directly (not by group chat). It will not be shown again. They must change it when they sign in.</p>
              <div className="flex items-center gap-2">
                <code className="field flex-1 select-all font-mono text-[17px] font-bold tracking-wider">{result.password}</code>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(result.password);
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={close} className="btn btn-primary">
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[14px] text-ink-secondary">A new temporary password is generated and the person is signed out on every device.</p>
              {result && !result.ok && <p role="alert" className="rounded-xl bg-dash-danger-soft px-4 py-3 text-[14px] text-dash-danger">{result.message}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="button" disabled={pending} onClick={() => start(async () => setResult(await resetUserPassword(id)))} className="btn btn-danger">
                  {pending ? "Resetting…" : "Reset password"}
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
