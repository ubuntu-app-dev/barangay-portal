import { z } from "zod";
import { db } from "@/server/db";
import { getAuthUser } from "@/server/auth";
import { pushConfigured } from "@/server/push";

/**
 * This device's push subscription for the signed-in user.
 * POST saves it (after the browser grants permission), DELETE removes it.
 * An endpoint belongs to one browser install, so saving it again moves it to whoever is signed in now.
 */
const Sub = z.object({
  endpoint: z.string().url().max(1000).startsWith("https://"),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  if (!pushConfigured()) return Response.json({ error: "Push notifications are not set up on this server." }, { status: 503 });
  const parsed = Sub.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That subscription could not be saved." }, { status: 400 });
  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent, userId: user.id },
    update: { p256dh: keys.p256dh, auth: keys.auth, userAgent, userId: user.id },
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const parsed = z.object({ endpoint: z.string().max(1000) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Missing endpoint." }, { status: 400 });
  await db.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint, userId: user.id } });
  return Response.json({ ok: true });
}
