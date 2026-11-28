import "server-only";
import webpush, { WebPushError } from "web-push";
import { db } from "./db";

/**
 * Web push to installed apps and browsers that allowed notifications.
 * Needs VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT (generate keys with `npx web-push generate-vapid-keys`).
 * Payloads are encrypted for the device; keep them to titles and report names, never resident data.
 */
export type PushPayload = { title: string; body: string; url: string; tag?: string };

let ready: boolean | null = null;
export function pushConfigured() {
  if (ready !== null) return ready;
  const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  ready = !!(pub && priv && subject);
  if (ready) webpush.setVapidDetails(subject!, pub!, priv!);
  return ready;
}

export const vapidPublicKey = () => process.env.VAPID_PUBLIC_KEY ?? null;

/** Sends to every device of these users. Dead subscriptions (the user turned it off or uninstalled) are removed. */
export async function pushToUsers(userIds: string[], payload: PushPayload) {
  if (!pushConfigured() || userIds.length === 0) return { sent: 0, removed: 0 };
  const subs = await db.pushSubscription.findMany({ where: { userId: { in: userIds } } });
  const body = JSON.stringify(payload);
  let sent = 0;
  const dead: string[] = [];
  const used: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
          TTL: 24 * 3600, // a phone that is off for a day still gets it when it comes back
          urgency: "normal",
          topic: payload.tag?.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) || undefined,
        });
        sent++;
        used.push(s.id);
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) dead.push(s.id);
        else console.warn("[push] send failed", err instanceof WebPushError ? err.statusCode : err instanceof Error ? err.message : err);
      }
    }),
  );
  if (dead.length) await db.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  if (used.length) await db.pushSubscription.updateMany({ where: { id: { in: used } }, data: { lastUsedAt: new Date() } });
  return { sent, removed: dead.length };
}
