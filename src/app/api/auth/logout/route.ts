import { NextResponse } from "next/server";
import { destroySession, fullName, getAuthUser } from "@/server/auth";
import { db } from "@/server/db";

export async function POST() {
  const user = await getAuthUser();
  if (user) {
    const row = await db.user.findUnique({ where: { id: user.id } });
    if (row)
      await db.auditLog.create({
        data: {
          actorId: row.id,
          actorName: fullName(row),
          action: "LOGOUT",
          entityType: "User",
          entityId: row.id,
          summary: "Signed out",
          barangayCode: row.barangayCode,
          municipalityCode: row.municipalityCode ?? user.barangay?.municipalityCode ?? null,
        },
      });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
