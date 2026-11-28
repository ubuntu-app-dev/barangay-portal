import { getAuthUser } from "@/server/auth";
import { pushToUsers } from "@/server/push";
import { hit, tooMany } from "@/server/rate-limit";

/** Sends a test notification to the signed-in user's devices (a few per hour). */
export async function POST() {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const key = `push-test:${user.id}`;
  if (tooMany(key, 5, 60 * 60_000)) return Response.json({ error: "Too many tests. Try again later." }, { status: 429 });
  hit(key);
  const { sent } = await pushToUsers([user.id], {
    title: "Notifications are on",
    body: "LGU Connect will remind you here when a report is due.",
    url: "/app",
    tag: "push-test",
  });
  if (sent === 0) return Response.json({ error: "No device received it. Turn notifications off and on again." }, { status: 409 });
  return Response.json({ ok: true, sent });
}
