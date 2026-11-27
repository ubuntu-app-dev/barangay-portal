import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ageOf, nameLastFirst } from "@/lib/dashboard/format";
import { ANIMAL_STATUS, BLOTTER_KIND, BLOTTER_STATUS, CIVIL_STATUS, CONDITION, RELATIONSHIP, REPORT_KIND, RESOURCE_CATEGORY, SEX, SPECIES, TENURE, TOILET, WATER_SHORT, label } from "@/lib/labels";
import { audit } from "@/server/audit";
import { db } from "@/server/db";
import { oneOf, str, type SearchParams } from "@/server/params";
import { listBlotter } from "@/server/queries/blotter";
import { listIssued } from "@/server/queries/documents";
import { listHouseholds, listResidents } from "@/server/queries/residents";
import { buildReport, csvCell, reportCsv, resolvePeriod } from "@/server/reports";
import type { ReportKindKey } from "@/types/reports";

const MAX = 20_000;
const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
const yn = (b: boolean) => (b ? "Yes" : "No");
/** BOM first so Excel opens UTF-8 (ñ, ₱) correctly. */
const csv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");

/**
 * CSV downloads for the signed-in barangay only. Lists reuse the page filters from the query string,
 * without paging (up to 20,000 rows). Every export is written to the audit log.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Sign in again.", { status: 401 });
  const { kind } = await ctx.params;
  const sp: SearchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const code = session.barangay.code;
  let body: string;
  let name = kind;

  switch (kind) {
    case "residents": {
      const { rows } = await listResidents(session, sp, MAX);
      body = csv([
        ["Resident no.", "Last name", "First name", "Middle name", "Suffix", "Sex", "Birth date", "Age", "Civil status", "Purok", "Address", "Household", "Relationship", "Contact", "Voter", "Precinct", "PWD", "Solo parent", "4Ps", "Senior ID"],
        ...rows.map((r) => [r.residentNo, r.lastName, r.firstName, r.middleName, r.suffix, label(SEX, r.sex), day(r.birthDate), ageOf(r.birthDate), label(CIVIL_STATUS, r.civilStatus), r.purok?.name, r.address, r.household?.householdNo, label(RELATIONSHIP, r.relationship), r.contactNumber, yn(r.isRegisteredVoter), r.voterPrecinct, yn(r.isPwd), yn(r.isSoloParent), yn(r.is4Ps), r.seniorIdNo]),
      ]);
      break;
    }
    case "households": {
      const { rows } = await listHouseholds(session, sp, MAX);
      body = csv([
        ["Household no.", "Purok", "Address", "Head", "Members", "Tenure", "Water", "Toilet", "Electricity", "Monthly income"],
        ...rows.map((h) => {
          const head = h.members.find((m) => m.relationship === "HEAD");
          return [h.householdNo, h.purok?.name, h.address, head ? `${head.lastName}, ${head.firstName}` : "", h.members.length, label(TENURE, h.tenure), label(WATER_SHORT, h.waterSource), label(TOILET, h.toilet), yn(h.hasElectricity), h.monthlyIncome?.toString()];
        }),
      ]);
      break;
    }
    case "issued": {
      const { rows } = await listIssued(session, sp, {}, MAX);
      body = csv([["Control no.", "Document", "Resident", "Purpose", "Issued", "Valid until", "O.R. no.", "Fee", "Status", "Void reason"], ...rows.map((d) => [d.controlNo, d.documentType.name, nameLastFirst(d.resident), d.purpose, day(d.issuedAt), day(d.validUntil), d.orNumber, d.fee.toString(), d.display, d.voidReason])]);
      name = "issued-documents";
      break;
    }
    case "blotter": {
      // VAWC entries are never exported here (the list excludes them).
      const { rows } = await listBlotter(session, sp, { kind: oneOf(str(sp.kind), BLOTTER_KIND) }, MAX);
      body = csv([
        ["Blotter no.", "KP case no.", "Type", "Category", "Title", "Date and time", "Location", "Complainant", "Respondent", "Status"],
        ...rows.map((e) => [e.blotterNo, e.kpCaseNo, label(BLOTTER_KIND, e.kind), e.category, e.title, e.incidentAt.toISOString(), e.location, e.parties.find((p) => p.role === "COMPLAINANT")?.name, e.parties.find((p) => p.role === "RESPONDENT")?.name, label(BLOTTER_STATUS, e.status)]),
      ]);
      break;
    }
    case "animals": {
      const rows = await db.animal.findMany({ where: { barangayCode: code, deletedAt: null }, orderBy: { tagNo: "asc" }, take: MAX });
      body = csv([["Tag no.", "Species", "Name", "Breed", "Sex", "Color", "Birth year", "Owner", "Last vaccinated", "Vaccine", "Status"], ...rows.map((a) => [a.tagNo, label(SPECIES, a.species), a.name, a.breed, label(SEX, a.sex), a.color, a.birthYear, a.ownerName, day(a.lastVaccinatedAt), a.vaccine, label(ANIMAL_STATUS, a.status)])]);
      break;
    }
    case "resources": {
      const rows = await db.communityResource.findMany({ where: { barangayCode: code, deletedAt: null }, orderBy: [{ category: "asc" }, { name: "asc" }], take: MAX });
      body = csv([["Name", "Category", "Quantity", "Unit", "Condition", "Location", "Custodian", "Acquired", "Value"], ...rows.map((r) => [r.name, label(RESOURCE_CATEGORY, r.category), r.quantity, r.unit, label(CONDITION, r.condition), r.location, r.custodian, day(r.acquiredAt), r.value?.toString()])]);
      break;
    }
    case "report": {
      const k = oneOf(str(sp.kind), REPORT_KIND) as ReportKindKey | undefined;
      if (!k) return new Response("Choose a report.", { status: 400 });
      const custom = str(sp.period) === "custom";
      const report = await buildReport(k, code, resolvePeriod(str(sp.period), custom ? str(sp.from) : undefined, custom ? str(sp.to) : undefined));
      body = "﻿" + reportCsv(report);
      name = `${k.toLowerCase().replace(/_/g, "-")}-report`;
      break;
    }
    default:
      return new Response("Unknown export.", { status: 404 });
  }

  await audit(session, { action: "EXPORT", entityType: "Export", summary: `Exported ${name.replace(/-/g, " ")} as CSV` });
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
