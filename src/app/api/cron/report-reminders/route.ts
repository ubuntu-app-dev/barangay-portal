import { runReportReminders } from "@/server/reminders";

/**
 * Daily report deadline reminders (see server/reminders.ts). Scheduled in vercel.json.
 * Vercel Cron calls it with "Authorization: Bearer $CRON_SECRET"; anything else is refused.
 */
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const summary = await runReportReminders();
  console.log("[cron] report reminders", summary);
  return Response.json(summary);
}
