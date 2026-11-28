"use client";
/**
 * Browser side of push notifications: permission, subscribing this device, and removing it.
 * The service worker (public/sw.js) shows the notifications; server/push.ts sends them.
 */

export type PushStatus =
  | "unsupported" // this browser has no web push
  | "ios-install" // iPhone/iPad Safari: push works only from the installed Home Screen app
  | "no-worker" // the service worker isn't registered (development builds)
  | "denied" // the user blocked notifications for this site
  | "off"
  | "on";

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

async function registration() {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

export async function pushStatus(): Promise<PushStatus> {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!supported) return isIos() && !standalone() ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await registration();
  if (!reg) return "no-worker";
  const sub = await reg.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

function keyBytes(base64url: string) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Asks for permission and subscribes this device. Returns an error message, or null on success. */
export async function enablePush(publicKey: string): Promise<string | null> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "Notifications are blocked for this site. Allow them in your browser settings." : "Notifications were not allowed.";
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
  const res = await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
  if (!res.ok) {
    await sub.unsubscribe().catch(() => {});
    return ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Could not turn on notifications. Try again.";
  }
  return null;
}

/** Unsubscribes this device and tells the server. Safe to call when push was never on. */
export async function disablePush() {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

export async function sendTestPush(): Promise<string | null> {
  const res = await fetch("/api/push/test", { method: "POST" });
  if (res.ok) return null;
  return ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "The test could not be sent.";
}
