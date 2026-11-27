import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/server/db";
import { words } from "@/server/params";
import { ageOn } from "@/server/time";

/**
 * Typeahead for pickers: residents and households of the signed-in barangay only.
 * GET /api/dashboard/lookup?type=resident|household&q=...
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sign in again." }, { status: 401 });
  const code = session.barangay.code;
  const type = request.nextUrl.searchParams.get("type");
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 80) ?? "";
  const w = words(q);
  const id = request.nextUrl.searchParams.get("id");

  // One resident's details for the certificate preview.
  if (type === "resident" && id) {
    const r = await db.resident.findFirst({ where: { id, barangayCode: code, deletedAt: null }, include: { purok: true } });
    if (!r) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: r.id,
      name: [r.firstName, r.middleName ? `${r.middleName[0]}.` : null, r.lastName, r.suffix].filter(Boolean).join(" "),
      age: ageOn(r.birthDate, new Date()),
      sex: r.sex,
      civilStatus: r.civilStatus.toLowerCase().replace("_", "-"),
      address: r.address,
      purok: r.purok?.name ?? "",
      residentSince: r.residentSince,
    });
  }

  if (type === "household") {
    const rows = await db.household.findMany({
      where: {
        barangayCode: code,
        deletedAt: null,
        AND: w.map((t) => ({
          OR: [
            { householdNo: { contains: t, mode: "insensitive" as const } },
            { address: { contains: t, mode: "insensitive" as const } },
            { members: { some: { relationship: "HEAD" as const, lastName: { contains: t, mode: "insensitive" as const } } } },
          ],
        })),
      },
      include: { purok: true, members: { where: { relationship: "HEAD", deletedAt: null }, take: 1 } },
      orderBy: { householdNo: "asc" },
      take: 20,
    });
    return NextResponse.json(
      rows.map((h) => ({
        value: h.id,
        label: `${h.householdNo}${h.members[0] ? ` · ${h.members[0].lastName} household` : ""}`,
        sub: [h.address, h.purok?.name].filter(Boolean).join(", "),
      })),
    );
  }

  const rows = await db.resident.findMany({
    where: {
      barangayCode: code,
      deletedAt: null,
      status: "ACTIVE",
      AND: w.map((t) => ({
        OR: [
          { firstName: { contains: t, mode: "insensitive" as const } },
          { lastName: { contains: t, mode: "insensitive" as const } },
          { middleName: { contains: t, mode: "insensitive" as const } },
          { residentNo: { contains: t, mode: "insensitive" as const } },
        ],
      })),
    },
    include: { purok: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 20,
  });
  const now = new Date();
  return NextResponse.json(
    rows.map((r) => ({
      value: r.id,
      label: `${r.lastName}, ${r.firstName}${r.middleName ? ` ${r.middleName[0]}.` : ""}${r.suffix ? ` ${r.suffix}` : ""}`,
      sub: `${r.residentNo} · ${ageOn(r.birthDate, now)} yrs · ${r.purok?.name ?? r.address}`,
    })),
  );
}
