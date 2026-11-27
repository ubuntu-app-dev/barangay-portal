"use client";
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { initialState, type ActionState } from "@/lib/action-state";
import Icon from "./Icon";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const FormCtx = createContext<{ errors: Record<string, string>; pending: boolean }>({
  errors: {},
  pending: false,
});

type FormProps = {
  action: Action;
  children: ReactNode;
  className?: string;
  /** Clear the inputs after a successful save (for "add another" forms). */
  resetOnSuccess?: boolean;
  /** Called after a successful save, e.g. to close a dialog. */
  onSuccess?: () => void;
  /** Hidden inputs sent with every submit. */
  hidden?: Record<string, string>;
};

/**
 * A form wired to a server action. Values stay in place when validation fails, field errors show under
 * their inputs, and the top message reads out to screen readers. The server re-validates everything.
 */
export function ActionForm({ action, children, className = "", resetOnSuccess, onSuccess, hidden }: FormProps) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const ref = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (!state.at) return;
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccessRef.current?.();
    } else if (state.errors) {
      const first = Object.keys(state.errors)[0];
      const el = first ? ref.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`) : null;
      el?.focus();
    }
  }, [state, resetOnSuccess]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  return (
    <FormCtx value={{ errors: state.errors ?? {}, pending }}>
      <form ref={ref} onSubmit={submit} noValidate aria-busy={pending} className={className}>
        {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <FormMessage state={state} />
        {children}
      </form>
    </FormCtx>
  );
}

function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  const good = !!state.ok;
  return (
    <div
      role={good ? "status" : "alert"}
      className={`mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-[14px] font-medium ${good ? "bg-dash-success-soft text-dash-success" : "bg-dash-danger-soft text-dash-danger"}`}
    >
      <Icon name={good ? "checkCircle" : "alert"} className="mt-0.5 h-4 w-4" />
      <span>{state.message}</span>
    </div>
  );
}

export function useFieldError(name: string): string | undefined {
  return useContext(FormCtx).errors[name];
}

export function useFormPending() {
  return useContext(FormCtx).pending;
}

type FieldShellProps = {
  id: string;
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function FieldShell({ id, label, name, hint, required, className = "", children }: FieldShellProps) {
  const error = useContext(FormCtx).errors[name];
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-dash-danger">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-dash-danger">
          <Icon name="alert" className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-ink-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function useFieldProps(name: string, hint?: string) {
  const id = useId();
  const error = useContext(FormCtx).errors[name];
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}

type Common = { name: string; label: string; hint?: string; className?: string };

export function Input({ name, label, hint, className, required, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const a = useFieldProps(name, hint);
  return (
    <FieldShell id={a.id} label={label} name={name} hint={hint} required={required} className={className}>
      <input {...rest} {...a} name={name} required={required} className="field" />
    </FieldShell>
  );
}

export function Textarea({ name, label, hint, className, required, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const a = useFieldProps(name, hint);
  return (
    <FieldShell id={a.id} label={label} name={name} hint={hint} required={required} className={className}>
      <textarea {...rest} {...a} name={name} required={required} className="field" />
    </FieldShell>
  );
}

type Option = { value: string; label: string };

export function Select({
  name,
  label,
  hint,
  className,
  required,
  options,
  placeholder,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string }) {
  const a = useFieldProps(name, hint);
  return (
    <FieldShell id={a.id} label={label} name={name} hint={hint} required={required} className={className}>
      <select {...rest} {...a} name={name} required={required} className="field">
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** A labelled checkbox. Sends "on" when checked, nothing when not. */
export function Checkbox({ name, label, hint, defaultChecked, className = "", onChange }: Common & { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-rule bg-panel px-3.5 py-3 transition-colors hover:border-[#c3c8d2] has-[:checked]:border-dash-primary has-[:checked]:bg-dash-primary-soft/60 ${className}`}
    >
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} onChange={(e) => onChange?.(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--dash-primary)]" />
      <span className="leading-tight">
        <span className="block text-[14px] font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[12.5px] text-ink-secondary">{hint}</span>}
      </span>
    </label>
  );
}

export function SubmitButton({ children, pendingText = "Saving…", variant = "primary", className = "" }: { children: ReactNode; pendingText?: string; variant?: "primary" | "danger" | "secondary"; className?: string }) {
  const pending = useFormPending();
  return (
    <button type="submit" disabled={pending} className={`btn btn-${variant} ${className}`}>
      {pending && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {pending ? pendingText : children}
    </button>
  );
}

/** A titled group of fields inside a long form. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="grid gap-6 border-b border-rule pb-7 pt-1 [&+&]:pt-7 lg:grid-cols-[240px_1fr]">
      <div>
        <p id={id} className="font-display text-[15px] font-bold">
          {title}
        </p>
        {description && <p className="mt-1 text-[13px] text-ink-secondary">{description}</p>}
      </div>
      <div className="grid content-start gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center justify-end gap-3">{children}</div>;
}
