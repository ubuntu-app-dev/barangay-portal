"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, type LoginLocation } from "@/lib/auth/login";
import type { LoginRole } from "@/types/login";

type Props = {
  role: LoginRole;
  location: LoginLocation;
  summary: string[];
  focusOnMount: boolean;
  changeHref?: string;
};

export default function CredentialsForm({
  role,
  location,
  summary,
  focusOnMount,
  changeHref,
}: Props) {
  const router = useRouter();
  const userRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (focusOnMount) userRef.current?.focus();
  }, [focusOnMount]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!username || !password)
      return setError("Enter your username and password.");
    setPending(true);
    setError(null);
    const result = await login({ role, username, password, location });
    if (result.ok) return router.push(result.redirectTo);
    setError(result.message);
    setPending(false);
  };

  const field =
    "h-12 w-full rounded-xl border border-rule bg-panel px-4 text-[15px]";

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-busy={pending}>
      {summary.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {summary.map((s) => (
            <span
              key={s}
              className="rounded-full bg-brand/10 px-3 py-1 text-[13px] font-semibold text-brand"
            >
              {s}
            </span>
          ))}
          {changeHref && (
            <Link
              href={changeHref}
              className="text-[13px] font-semibold text-ink-secondary underline"
            >
              Change location
            </Link>
          )}
        </div>
      )}
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-[14px] font-semibold"
        >
          Username or email
        </label>
        <input
          ref={userRef}
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={field}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[14px] font-semibold"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${field} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-[13px] font-semibold text-brand"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-[14px] font-medium text-flag-red">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-[13px] text-ink-secondary">
        Forgot your password? Ask your system administrator to reset it.
      </p>
    </form>
  );
}
