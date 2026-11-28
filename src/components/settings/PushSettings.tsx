"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { disablePush, enablePush, pushStatus, sendTestPush, type PushStatus } from "@/lib/push-client";
import { openIosInstallHelp } from "@/lib/pwa";

const NOTE: Partial<Record<PushStatus, string>> = {
  unsupported: "This browser can't show push notifications. Try Chrome, Edge, Firefox, or Safari, or install the app.",
  "no-worker": "Push notifications work on the live site, not in this development build.",
  denied: "Notifications are blocked for this site. Allow them in your browser's site settings, then reload this page.",
};

/**
 * "Push on this device": deadline reminders and other notices as system notifications, even when
 * LGU Connect is closed. Each phone or computer is turned on separately.
 */
export default function PushSettings({ publicKey }: { publicKey: string | null }) {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    let live = true;
    pushStatus().then((s) => live && setStatus(s));
    return () => {
      live = false;
    };
  }, []);

  async function run(task: () => Promise<string | null>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const err = await task();
      setMessage(err ? { tone: "error", text: err } : { tone: "ok", text: okText });
    } catch {
      setMessage({ tone: "error", text: "Something went wrong. Try again." });
    } finally {
      setStatus(await pushStatus());
      setBusy(false);
    }
  }

  const on = status === "on";
  return (
    <section className="surface p-5 sm:p-7" aria-labelledby="push-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary">
            <Icon name="bell" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="push-title" className="font-display text-[17px] font-bold">
              Push notifications on this device
            </h2>
            <p className="mt-1 max-w-[60ch] text-[14px] text-ink-secondary">
              Get report deadline reminders on this phone or computer, even when LGU Connect is closed. Turn it on separately on each device you use.
              Notifications show report names and dates only, never resident information.
            </p>
          </div>
        </div>
        {status && publicKey && (status === "on" || status === "off") && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="push-title"
            disabled={busy}
            onClick={() => (on ? run(async () => (await disablePush(), null), "Push notifications are off on this device.") : run(() => enablePush(publicKey), "Push notifications are on. Try sending a test."))}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${on ? "bg-brand-fill" : "bg-ink-secondary/40"}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 text-[14px]">
        {status === null && <p className="text-ink-secondary">Checking this device…</p>}
        {status && !publicKey && <p className="text-ink-secondary">Push notifications are not set up on this server yet. Ask your system administrator.</p>}
        {status && publicKey && NOTE[status] && <p className="text-ink-secondary">{NOTE[status]}</p>}
        {status === "ios-install" && (
          <p className="text-ink-secondary">
            On iPhone and iPad, notifications work from the installed app.{" "}
            <button type="button" className="font-semibold text-brand underline" onClick={openIosInstallHelp}>
              Add LGU Connect to your Home Screen
            </button>
            , open it from there, then come back to this page.
          </p>
        )}
        {on && (
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => run(sendTestPush, "Test sent. It should appear in a few seconds.")}>
            Send a test notification
          </button>
        )}
        {message && (
          <p role="status" className={message.tone === "ok" ? "text-dash-success" : "text-dash-danger"}>
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
