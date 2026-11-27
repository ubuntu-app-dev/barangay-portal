"use client";
import { useId, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, SubmitButton, Textarea } from "./form";
import Icon from "./Icon";
import type { IconName } from "./icon-paths";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  /** The button that opens the dialog. */
  trigger: ReactNode;
  triggerClassName?: string;
  title: string;
  description?: ReactNode;
  action: Action;
  hidden?: Record<string, string>;
  confirmLabel: string;
  tone?: "primary" | "danger";
  icon?: IconName;
  /** Ask for a reason (sent as "reason"). */
  reason?: { label: string; placeholder?: string; required?: boolean };
  /** Extra fields inside the dialog form. */
  children?: ReactNode;
};

/** A native <dialog> with a server-action form inside: confirmations, reasons, and quick edits. */
export default function ActionDialog({
  trigger,
  triggerClassName = "btn btn-secondary btn-sm",
  title,
  description,
  action,
  hidden,
  confirmLabel,
  tone = "primary",
  icon,
  reason,
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => ref.current?.close();
  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => ref.current?.showModal()}>
        {trigger}
      </button>
      <dialog ref={ref} className="modal" aria-labelledby={titleId}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {icon && (
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone === "danger" ? "bg-dash-danger-soft text-dash-danger" : "bg-dash-primary-soft text-dash-primary"}`}
              >
                <Icon name={icon} className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-display text-[18px] font-bold tracking-[-0.01em]">
                {title}
              </h2>
              {description && <div className="mt-1 text-[14px] text-ink-secondary">{description}</div>}
            </div>
            <button type="button" onClick={close} aria-label="Close" className="btn btn-ghost btn-sm -mr-2 -mt-1 px-2">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <ActionForm action={action} hidden={hidden} onSuccess={close} resetOnSuccess className="mt-5">
            <div className="space-y-4">
              {children}
              {reason && <Textarea name="reason" label={reason.label} placeholder={reason.placeholder} required={reason.required} rows={3} />}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={close} className="btn btn-secondary">
                Cancel
              </button>
              <SubmitButton variant={tone === "danger" ? "danger" : "primary"} pendingText="Working…">
                {confirmLabel}
              </SubmitButton>
            </div>
          </ActionForm>
        </div>
      </dialog>
    </>
  );
}
