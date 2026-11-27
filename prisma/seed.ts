/**
 * Development seed. Run: npm run db:seed  (or npm run db:reset to rebuild from scratch)
 *
 * Geography is real (PSGC Q2_2024 codes, Pila, Laguna) so the location sign-in pages work.
 * People, records, and numbers are FICTIONAL sample data for development only.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import type {
  CivilStatus,
  Education,
  Relationship,
  RequestStatus,
  Sex,
  Species,
  WaterSource,
} from "../src/generated/prisma/enums";
import { DEFAULT_BODIES, DEFAULT_DOCUMENT_TYPES, DEFAULT_OFFICE_HOURS } from "../src/lib/defaults";
import { hashPassword } from "../src/server/password";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Deterministic random numbers so every seed gives the same data.
let state = 20261127;
const rand = () => ((state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;
const NOW = new Date();
const daysAgo = (d: number, hour = 9) => {
  const t = new Date(NOW);
  t.setDate(t.getDate() - d);
  t.setHours(hour, int(0, 59), 0, 0);
  return t;
};
const pad = (n: number, w = 4) => String(n).padStart(w, "0");
const YEAR = NOW.getFullYear();

const REGION = { code: "0400000000", name: "Region IV-A (CALABARZON)" };
const PROVINCE = { code: "0403400000", name: "Laguna" };
const MUNICIPALITY = { code: "0403422000", name: "Pila" };
const BARANGAYS: [string, string, "URBAN" | "RURAL"][] = [
  ["0403422001", "Aplaya", "RURAL"],
  ["0403422002", "Bagong Pook", "URBAN"],
  ["0403422003", "Bukal", "RURAL"],
  ["0403422004", "Bulilan Norte", "RURAL"],
  ["0403422005", "Bulilan Sur", "URBAN"],
  ["0403422006", "Concepcion", "RURAL"],
  ["0403422007", "Labuin", "URBAN"],
  ["0403422008", "Linga", "RURAL"],
  ["0403422009", "Masico", "RURAL"],
  ["0403422010", "Mojon", "RURAL"],
  ["0403422011", "Pansol", "RURAL"],
  ["0403422012", "Pinagbayanan", "URBAN"],
  ["0403422014", "San Antonio", "RURAL"],
  ["0403422015", "San Miguel", "RURAL"],
  ["0403422016", "Santa Clara Norte", "RURAL"],
  ["0403422017", "Santa Clara Sur", "URBAN"],
  ["0403422018", "Tubuan", "RURAL"],
];
const MAIN = "0403422002"; // Bagong Pook: the fully populated demo barangay
const SECOND = "0403422007"; // Labuin: a second secretary, lightly populated

const OFFICES = [
  { name: "Office of the Municipal Mayor", acronym: "OMM" },
  { name: "Municipal Planning and Development Office", acronym: "MPDO" },
  { name: "Municipal Health Office", acronym: "MHO" },
  { name: "Municipal Social Welfare and Development Office", acronym: "MSWDO" },
  { name: "Municipal Peace and Order Council", acronym: "MPOC" },
  { name: "Municipal Disaster Risk Reduction and Management Office", acronym: "MDRRMO" },
  { name: "Municipal Agriculture Office", acronym: "MAO" },
  { name: "Department of the Interior and Local Government (Municipal)", acronym: "DILG" },
  { name: "Municipal Information Technology Office", acronym: "MITO" },
];

const MALE = ["Juan", "Jose", "Mark Anthony", "Rafael", "Carlo", "Noel", "Samuel", "Dionisio", "Benjamin", "Rodolfo", "Joshua", "Fernando", "Miguel", "Gabriel", "Paolo", "Christian", "Ramon", "Eduardo", "Antonio", "Renato", "Jerome", "Kevin", "Bryan", "Angelo", "Patrick", "Emmanuel", "Ricardo", "Arnel", "Romeo", "Danilo"];
const FEMALE = ["Maria", "Angelica", "Josefina", "Liza", "Imelda", "Katrina", "Joanna", "Teresita", "Lourdes", "Marites", "Gloria", "Cristina", "Rosario", "Andrea", "Patricia", "Jasmine", "Kimberly", "Michelle", "Precious", "Nicole", "Erlinda", "Corazon", "Remedios", "Ana", "Bea", "Camille", "Diana", "Elena", "Faith", "Grace"];
const LAST = ["Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Torres", "Villanueva", "Ramos", "Bautista", "Aquino", "Navarro", "Lim", "Cabrera", "Ocampo", "Gonzales", "Pascual", "Soriano", "Estrada", "Mercado", "Padilla", "Flores", "Aguilar", "Castillo", "Rivera", "Domingo", "Salazar", "Manalo", "Perez", "Valdez", "De Leon", "Fernandez", "Marquez", "Robles", "Tolentino", "Pineda"];
const MIDDLE = ["Reyes", "Cruz", "Santos", "Lopez", "Rosales", "Javier", "Morales", "Castro", "Dizon", "Lacson", "Ilagan", "Mendoza"];
const STREETS = ["Rizal St.", "Mabini St.", "Bonifacio St.", "Luna St.", "Del Pilar St.", "Burgos St.", "Quezon Ave.", "Sampaguita St.", "Ilang-Ilang St.", "Narra St."];
const OCCUPATIONS = ["Farmer", "Fisherfolk", "Teacher", "Vendor", "Tricycle driver", "Construction worker", "Office staff", "Nurse", "Sari-sari store owner", "Factory worker", "Housekeeper", "Self-employed", "Government employee", "Call center agent", "Mechanic"];
const EDUCATION: Education[] = ["ELEMENTARY_GRADUATE", "HIGH_SCHOOL_GRADUATE", "SENIOR_HIGH", "VOCATIONAL", "COLLEGE_LEVEL", "COLLEGE_GRADUATE"];
const PURPOSES = ["Employment", "Scholarship application", "Medical assistance", "Travel", "Bank requirement", "School enrollment", "Senior citizen application", "Burial assistance", "Business renewal", "Loan application"];

async function reset() {
  // Children first. TRUNCATE ... CASCADE keeps this short and resets everything.
  const tables = await db.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length)
    await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"public"."${t.tablename}"`).join(", ")} CASCADE`);
}

async function main() {
  console.log("Resetting tables…");
  await reset();

  console.log("Geography…");
  await db.region.create({ data: REGION });
  await db.province.create({ data: { ...PROVINCE, regionCode: REGION.code } });
  await db.municipality.create({
    data: {
      ...MUNICIPALITY,
      regionCode: REGION.code,
      provinceCode: PROVINCE.code,
      isActive: true,
      address: "Municipal Hall, Pila, Laguna",
      email: "lgu@example.com",
      phone: "(049) 000-0000",
    },
  });
  for (const [code, name, classification] of BARANGAYS)
    await db.barangay.create({
      data: {
        code,
        name,
        classification,
        municipalityCode: MUNICIPALITY.code,
        isActive: code === MAIN || code === SECOND,
        officeHours: DEFAULT_OFFICE_HOURS,
      },
    });

  const offices = await Promise.all(
    OFFICES.map((o) => db.municipalOffice.create({ data: { ...o, municipalityCode: MUNICIPALITY.code } })),
  );
  const office = (acronym: string) => offices.find((o) => o.acronym === acronym)!;

  console.log("Accounts…");
  const pw = await hashPassword("Password123");
  const superadmin = await db.user.create({
    data: { username: "superadmin", email: "superadmin@example.com", passwordHash: pw, role: "SUPERADMIN", firstName: "System", lastName: "Administrator", position: "Superadmin" },
  });
  const mAdmin = await db.user.create({
    data: { username: "pila.admin", email: "it@pila.example.com", passwordHash: pw, role: "MUNICIPAL_ADMIN", firstName: "Paolo", lastName: "Robles", position: "IT Officer", municipalityCode: MUNICIPALITY.code, officeId: office("MITO").id, createdById: superadmin.id },
  });
  const mStaff = await db.user.create({
    data: { username: "pila.mpdo", email: "mpdo@pila.example.com", passwordHash: pw, role: "MUNICIPAL_PERSONNEL", firstName: "Cristina", lastName: "Manalo", position: "Planning Officer II", municipalityCode: MUNICIPALITY.code, officeId: office("MPDO").id, createdById: mAdmin.id },
  });
  await db.user.create({
    data: { username: "pila.mho", passwordHash: pw, role: "MUNICIPAL_PERSONNEL", firstName: "Ramon", lastName: "Castillo", position: "Municipal Health Officer", municipalityCode: MUNICIPALITY.code, officeId: office("MHO").id, createdById: mAdmin.id },
  });
  const secretary = await db.user.create({
    data: {
      username: "bagongpook.sec",
      email: "secretary.bagongpook@example.com",
      passwordHash: pw,
      role: "BARANGAY_SECRETARY",
      firstName: "Maria Elena",
      lastName: "Santos",
      position: "Barangay Secretary",
      phone: "0917 000 0010",
      barangayCode: MAIN,
      permissions: ["vawc:view"],
      createdById: mAdmin.id,
      preferences: { email: true, requests: true, submissions: true, announcements: true },
    },
  });
  await db.user.create({
    data: { username: "labuin.sec", passwordHash: pw, role: "BARANGAY_SECRETARY", firstName: "Jerome", lastName: "Tolentino", position: "Barangay Secretary", barangayCode: SECOND, createdById: mAdmin.id },
  });

  for (const code of [MAIN, SECOND]) await seedBarangay(code, code === MAIN, secretary.id, offices, mStaff.id);

  console.log("Announcements…");
  const ann = [
    { officeId: office("MHO").id, title: "Dengue prevention advisory", body: "Clean-up drives and the reporting of suspected dengue cases are required in all barangays this week. Coordinate with your Barangay Health Workers and submit a list of clean-up sites.", priority: "URGENT", isAdvisory: true, isPinned: true, d: 2 },
    { officeId: office("MPDO").id, title: "Q4 Barangay Profile Update", body: "Submit the updated barangay profile, including officials and population figures, through the Municipal Submissions module on or before the due date.", priority: "HIGH", isAdvisory: false, isPinned: false, d: 7 },
    { officeId: office("MDRRMO").id, title: "Typhoon preparedness: pre-emptive evacuation protocol", body: "Review your evacuation center list and update the community resources inventory. Report the number of families in high-risk areas.", priority: "URGENT", isAdvisory: true, isPinned: false, d: 4 },
    { officeId: office("OMM").id, title: "Revised barangay assembly schedule", body: "The year-end barangay assembly moves to the first week of December. Post the schedule in your barangay hall.", priority: "NORMAL", isAdvisory: false, isPinned: false, d: 10 },
    { officeId: office("DILG").id, title: "Updated certificate templates", body: "Barangays may now use the updated certificate templates. Check your document wording in Document Management before December 1.", priority: "NORMAL", isAdvisory: false, isPinned: false, d: 15 },
    { officeId: office("MSWDO").id, title: "Social pension validation", body: "Submit the list of indigent senior citizens for the social pension validation. Use the Resident Classification page to export the list.", priority: "HIGH", isAdvisory: true, isPinned: false, d: 20 },
  ] as const;
  for (const a of ann)
    await db.announcement.create({
      data: {
        scope: "MUNICIPAL",
        municipalityCode: MUNICIPALITY.code,
        officeId: a.officeId,
        title: a.title,
        body: a.body,
        priority: a.priority,
        isAdvisory: a.isAdvisory,
        isPinned: a.isPinned,
        publishedAt: daysAgo(a.d),
        authorId: mStaff.id,
      },
    });
  await db.announcement.create({
    data: { scope: "SYSTEM", title: "Welcome to LGU Connect", body: "Your barangay records now live in one secure system. Visit Help and Support for guides on each module.", priority: "NORMAL", publishedAt: daysAgo(30), authorId: superadmin.id },
  });

  await db.systemSetting.createMany({
    data: [
      { key: "session.hours", value: 12 },
      { key: "password.minLength", value: 8 },
      { key: "maintenance.banner", value: "" },
    ],
  });

  console.log("\nDone. Sign in with password: Password123");
  console.log("  Barangay Secretary  bagongpook.sec   at /laguna/pila/bagong-pook");
  console.log("  Barangay Secretary  labuin.sec       at /laguna/pila/labuin");
  console.log("  Municipal Personnel pila.mpdo        at /laguna/pila");
  console.log("  Municipal IT Admin  pila.admin       at /laguna/pila");
  console.log("  Superadmin          superadmin       at /login");
}

type Office = { id: string; acronym: string | null };

async function seedBarangay(code: string, full: boolean, secretaryId: string, offices: Office[], reviewerId: string) {
  const name = BARANGAYS.find((b) => b[0] === code)![1];
  console.log(`Barangay ${name}…`);
  const office = (a: string) => offices.find((o) => o.acronym === a)!.id;

  await db.barangay.update({
    where: { code },
    data: {
      landAreaHectares: new Prisma.Decimal(full ? 142.6 : 210.3),
      dateEstablished: new Date("1958-06-12"),
      zipCode: "4010",
      legislativeDistrict: "4th District of Laguna",
      history: `Barangay ${name} began as a farming settlement along the shores of Laguna de Bay. It became a separate barangay of Pila and grew around its chapel, its school, and the provincial road. (Sample text: replace with the barangay's own history.)`,
      vision: "A peaceful, healthy, and progressive barangay where every family is safe, informed, and included.",
      mission: "To deliver prompt and transparent public service, protect the welfare of residents, and work with the municipality on community development.",
      boundaryNorth: "Laguna de Bay",
      boundaryEast: "Barangay Labuin",
      boundarySouth: "Barangay Pinagbayanan",
      boundaryWest: "Barangay Bulilan Sur",
      address: `Barangay Hall, Rizal St., Barangay ${name}, Pila, Laguna`,
      landline: "(049) 000-0101",
      mobile: "0917 000 0100",
      email: `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      facebook: `facebook.com/brgy${name.toLowerCase().replace(/\s+/g, "")}`,
      hotlines: [
        { name: "National Emergency Hotline", number: "911", note: "Police, fire, and medical emergencies" },
        { name: "Barangay Emergency", number: "0917 000 0100", note: "Sample number" },
        { name: "Bureau of Fire Protection, Pila", number: "(049) 000-0102", note: "Sample number" },
        { name: "PNP Pila", number: "(049) 000-0103", note: "Sample number" },
        { name: "Rural Health Unit", number: "(049) 000-0104", note: "Sample number" },
        { name: "MDRRMO Pila", number: "(049) 000-0105", note: "Sample number" },
      ],
    },
  });

  const puroks = [];
  for (let i = 1; i <= 6; i++) puroks.push(await db.purok.create({ data: { barangayCode: code, name: `Purok ${i}`, sortOrder: i } }));

  const term = { termStart: new Date("2023-11-30"), termEnd: new Date("2026-11-30") };
  const officials = [
    ["Hon. Ricardo D. Villanueva", "Punong Barangay", "Overall governance"],
    ["Hon. Teresita M. Cruz", "Barangay Kagawad", "Peace and Order"],
    ["Hon. Anselmo R. Dela Peña", "Barangay Kagawad", "Health and Sanitation"],
    ["Hon. Lourdes P. Ramos", "Barangay Kagawad", "Education and Culture"],
    ["Hon. Benjamin A. Torres", "Barangay Kagawad", "Infrastructure"],
    ["Hon. Marites S. Aquino", "Barangay Kagawad", "Finance and Appropriations"],
    ["Hon. Rodolfo C. Mendoza", "Barangay Kagawad", "Environment and Agriculture"],
    ["Hon. Gloria F. Bautista", "Barangay Kagawad", "Women, Family, and Senior Citizens"],
    ["Hon. Joshua L. Reyes", "SK Chairperson", "Youth and Sports"],
    [full ? "Maria Elena Santos" : "Jerome Tolentino", "Barangay Secretary", null],
    ["Fernando G. Lim", "Barangay Treasurer", null],
  ] as const;
  for (const [i, [n, position, committee]] of officials.entries())
    await db.barangayOfficial.create({
      data: { barangayCode: code, name: n, position, committee, ...term, contact: `0917 000 ${pad(i + 1)}`, sortOrder: i, isSignatory: i === 0 },
    });

  await db.barangayBody.createMany({
    data: DEFAULT_BODIES.map((b) => ({ ...b, barangayCode: code, isActive: b.acronym !== "BADAC" })),
  });

  const types = [];
  for (const [i, t] of DEFAULT_DOCUMENT_TYPES.entries())
    types.push(
      await db.documentType.create({
        data: { ...t, requirements: [...t.requirements], fee: new Prisma.Decimal(t.fee), barangayCode: code, sortOrder: i },
      }),
    );

  // Residents and households.
  const householdCount = full ? 48 : 12;
  const counters: Record<string, number> = { household: 0, resident: 0 };
  const residents: { id: string; name: string; age: number; sex: Sex; civilStatus: CivilStatus; purok: string; address: string; since: number }[] = [];
  const waterSources: WaterSource[] = ["LEVEL_III", "LEVEL_III", "LEVEL_III", "LEVEL_II", "LEVEL_I", "DELIVERED"];

  for (let h = 0; h < householdCount; h++) {
    const purok = pick(puroks);
    const last = pick(LAST);
    const address = `${int(1, 250)} ${pick(STREETS)}`;
    const created = daysAgo(int(5, 900));
    const household = await db.household.create({
      data: {
        barangayCode: code,
        householdNo: `HH-${pad(++counters.household)}`,
        purokId: purok.id,
        address,
        tenure: pick(["OWNED", "OWNED", "OWNED", "RENTED", "SHARED", "INFORMAL"] as const),
        waterSource: pick(waterSources),
        toilet: pick(["WATER_SEALED", "WATER_SEALED", "WATER_SEALED", "POUR_FLUSH", "SHARED", "PIT_LATRINE"] as const),
        hasElectricity: chance(0.95),
        monthlyIncome: new Prisma.Decimal(int(6, 60) * 1000),
        createdAt: created,
      },
    });
    const family = await db.family.create({ data: { barangayCode: code, householdId: household.id, name: `${last} family` } });

    const size = int(1, 7);
    const headSex: Sex = chance(0.7) ? "MALE" : "FEMALE";
    const headAge = int(24, 78);
    const since = Math.max(1960, YEAR - int(1, Math.min(headAge, 45)));
    const members: { rel: Relationship; sex: Sex; age: number; civil: CivilStatus }[] = [
      { rel: "HEAD", sex: headSex, age: headAge, civil: headAge > 65 && chance(0.3) ? "WIDOWED" : "MARRIED" },
    ];
    if (size > 1 && members[0].civil === "MARRIED")
      members.push({ rel: "SPOUSE", sex: headSex === "MALE" ? "FEMALE" : "MALE", age: Math.max(20, headAge + int(-6, 4)), civil: "MARRIED" });
    while (members.length < size) {
      const sex: Sex = chance(0.5) ? "MALE" : "FEMALE";
      const age = Math.max(0, headAge - int(18, 36));
      members.push({ rel: sex === "MALE" ? "SON" : "DAUGHTER", sex, age, civil: age > 24 && chance(0.4) ? "MARRIED" : "SINGLE" });
    }
    if (chance(0.15)) members.push({ rel: pick(["FATHER", "MOTHER"] as const) as Relationship, sex: chance(0.5) ? "MALE" : "FEMALE", age: Math.min(95, headAge + int(20, 30)), civil: "WIDOWED" });

    for (const m of members) {
      const first = m.sex === "MALE" ? pick(MALE) : pick(FEMALE);
      const middle = pick(MIDDLE);
      const birth = new Date(Date.UTC(YEAR - m.age, int(0, 11), int(1, 28)));
      const adult = m.age >= 18;
      const r = await db.resident.create({
        data: {
          barangayCode: code,
          residentNo: `R-${pad(++counters.resident, 5)}`,
          firstName: first,
          middleName: middle,
          lastName: m.rel === "SPOUSE" && m.sex === "FEMALE" ? last : last,
          sex: m.sex,
          birthDate: birth,
          birthPlace: chance(0.8) ? "Pila, Laguna" : pick(["Santa Cruz, Laguna", "Calamba, Laguna", "Manila", "Lucena, Quezon"]),
          civilStatus: m.civil,
          religion: pick(["Roman Catholic", "Roman Catholic", "Roman Catholic", "Iglesia ni Cristo", "Born Again Christian", "Aglipayan"]),
          occupation: adult && m.age < 65 ? pick(OCCUPATIONS) : m.age >= 65 ? "Retired" : m.age >= 5 ? "Student" : null,
          education: adult ? pick(EDUCATION) : m.age >= 6 ? "ELEMENTARY_LEVEL" : null,
          contactNumber: adult && chance(0.7) ? `09${int(10, 99)} ${int(100, 999)} ${int(1000, 9999)}` : null,
          purokId: purok.id,
          address,
          residentSince: Math.max(since, YEAR - m.age),
          householdId: household.id,
          familyId: family.id,
          relationship: m.rel,
          isRegisteredVoter: adult && chance(0.85),
          voterPrecinct: adult ? `${pad(int(1, 80), 4)}${pick(["A", "B", "C"])}` : null,
          isPwd: chance(0.03),
          disability: null,
          isSoloParent: adult && m.rel === "HEAD" && members.length > 1 && !members.some((x) => x.rel === "SPOUSE") && chance(0.5),
          is4Ps: chance(0.08),
          isIndigenous: chance(0.01),
          isOfw: adult && m.age < 55 && chance(0.05),
          isOutOfSchoolYouth: m.age >= 15 && m.age <= 24 && chance(0.1),
          seniorIdNo: m.age >= 60 && chance(0.8) ? `OSCA-${int(10000, 99999)}` : null,
          status: chance(0.97) ? "ACTIVE" : "MOVED_OUT",
          createdById: secretaryId,
          createdAt: created,
        },
      });
      residents.push({ id: r.id, name: `${first} ${middle[0]}. ${last}`, age: m.age, sex: m.sex, civilStatus: m.civil, purok: purok.name, address, since });
    }
  }
  await db.counter.createMany({
    data: [
      { barangayCode: code, key: "household", value: counters.household },
      { barangayCode: code, key: "resident", value: counters.resident },
    ],
  });
  if (!full) return;

  const adults = residents.filter((r) => r.age >= 18);
  const signatory = { signatoryName: "Hon. Ricardo D. Villanueva", signatoryPosition: "Punong Barangay" };

  // Issued documents across the past year, and the requests behind them.
  console.log("  documents…");
  const docCounters: Record<string, number> = {};
  let requestNo = 0;
  const statuses: RequestStatus[] = ["PENDING", "PENDING", "PENDING", "PENDING", "PENDING", "PROCESSING", "PROCESSING", "PROCESSING", "READY_FOR_RELEASE", "READY_FOR_RELEASE", "REJECTED"];
  for (let i = 0; i < 160; i++) {
    const t = types[Math.min(types.length - 1, Math.floor(Math.pow(rand(), 1.6) * types.length))];
    const r = pick(adults);
    const age = i < 40 ? int(0, 30) : int(30, 360);
    const issuedAt = daysAgo(age, int(8, 16));
    const year = issuedAt.getFullYear();
    const key = `doc:${t.prefix}:${year}`;
    docCounters[key] = (docCounters[key] ?? 0) + 1;
    const purpose = t.key === "jobseeker" ? "First-time employment" : t.key === "permit" ? "Community event" : pick(PURPOSES);
    const req = await db.documentRequest.create({
      data: {
        barangayCode: code,
        requestNo: `REQ-${year}-${pad(++requestNo)}`,
        residentId: r.id,
        documentTypeId: t.id,
        purpose,
        channel: chance(0.3) ? "ONLINE" : "WALK_IN",
        status: "RELEASED",
        requestedAt: issuedAt,
        processedById: secretaryId,
        releasedAt: issuedAt,
      },
    });
    const validUntil = t.validityMonths ? new Date(issuedAt.getTime() + t.validityMonths * 30.44 * 86400_000) : null;
    const voided = chance(0.03);
    await db.issuedDocument.create({
      data: {
        barangayCode: code,
        controlNo: `${t.prefix}-${year}-${pad(docCounters[key])}`,
        documentTypeId: t.id,
        residentId: r.id,
        requestId: req.id,
        purpose,
        fee: t.fee,
        orNumber: Number(t.fee) > 0 ? `${int(1000000, 9999999)}` : null,
        issuedAt,
        validUntil,
        snapshot: { name: r.name, age: r.age, civilStatus: r.civilStatus, address: `${r.address}, ${r.purok}`, residentSince: r.since, sex: r.sex },
        ...signatory,
        issuedById: secretaryId,
        status: voided ? "VOIDED" : "VALID",
        voidReason: voided ? "Wrong name entered" : null,
        voidedAt: voided ? issuedAt : null,
        voidedById: voided ? secretaryId : null,
        printCount: 1,
      },
    });
  }
  // Open requests in the queue.
  for (let i = 0; i < 14; i++) {
    const t = pick(types.slice(0, 6));
    const r = pick(adults);
    const status = statuses[i % statuses.length];
    await db.documentRequest.create({
      data: {
        barangayCode: code,
        requestNo: `REQ-${YEAR}-${pad(++requestNo)}`,
        residentId: r.id,
        documentTypeId: t.id,
        purpose: pick(PURPOSES),
        channel: chance(0.4) ? "ONLINE" : "WALK_IN",
        status,
        rejectionReason: status === "REJECTED" ? "Incomplete requirements: no proof of residency." : null,
        requestedAt: daysAgo(int(0, 6), int(8, 16)),
      },
    });
  }
  await db.counter.createMany({
    data: [
      { barangayCode: code, key: `request:${YEAR}`, value: requestNo },
      ...Object.entries(docCounters).map(([key, value]) => ({ barangayCode: code, key, value })),
    ],
  });

  // Blotter.
  console.log("  blotter…");
  const incidents = [
    { kind: "INCIDENT", category: "Theft", title: "Stolen motorcycle helmet", narrative: "The complainant reported that a motorcycle helmet was taken from a parked motorcycle in front of the chapel at around 7 PM.", status: "OPEN" },
    { kind: "INCIDENT", category: "Noise disturbance", title: "Late-night videoke", narrative: "Neighbors reported loud videoke past 10 PM in violation of the barangay ordinance. The tanod advised the household to stop.", status: "CLOSED" },
    { kind: "COMPLAINT", category: "Unpaid debt", title: "Unpaid loan of ₱15,000", narrative: "The complainant lent ₱15,000 to the respondent in March and was promised payment by June. No payment has been made despite repeated demands.", status: "UNDER_MEDIATION", kp: "MEDIATION" },
    { kind: "COMPLAINT", category: "Boundary dispute", title: "Fence built over property line", narrative: "The complainant alleges that the respondent's new fence extends about half a meter into the complainant's lot.", status: "UNDER_CONCILIATION", kp: "CONCILIATION" },
    { kind: "INCIDENT", category: "Traffic incident", title: "Tricycle and bicycle collision", narrative: "A tricycle and a bicycle collided along Rizal St. The cyclist had minor abrasions and was brought to the health center.", status: "SETTLED" },
    { kind: "COMPLAINT", category: "Property damage", title: "Damaged gate", narrative: "The complainant's gate was damaged by the respondent's delivery truck while backing up.", status: "SETTLED", kp: "MEDIATION" },
    { kind: "INCIDENT", category: "Animal-related", title: "Dog bite incident", narrative: "A child was bitten by a loose dog near the elementary school. The owner was identified and the child was referred to the animal bite center.", status: "REFERRED" },
    { kind: "COMPLAINT", category: "Threats", title: "Verbal threats between neighbors", narrative: "The complainant reported repeated verbal threats from the respondent after an argument over parking.", status: "OPEN" },
    { kind: "INCIDENT", category: "Domestic violence", title: "VAWC report (confidential)", narrative: "Confidential. Details are restricted to authorized personnel under RA 9262.", status: "REFERRED", vawc: true },
    { kind: "COMPLAINT", category: "Trespassing", title: "Unauthorized entry to farm lot", narrative: "The complainant reported that the respondent repeatedly enters the farm lot to graze carabaos without permission.", status: "CERTIFIED_TO_FILE_ACTION", kp: "CONCILIATION" },
    { kind: "INCIDENT", category: "Physical injury", title: "Fistfight at basketball court", narrative: "Two young men fought after a pickup game. Tanod separated them; both sustained minor injuries.", status: "UNDER_MEDIATION", kp: "MEDIATION" },
    { kind: "INCIDENT", category: "Other", title: "Fallen tree blocking road", narrative: "A mango tree fell across the road after heavy rain. BDRRMC cleared it within two hours.", status: "CLOSED" },
  ] as const;
  for (const [i, e] of incidents.entries()) {
    const at = daysAgo(int(1, 120), int(7, 21));
    const kp = "kp" in e ? e.kp : null;
    const entry = await db.blotterEntry.create({
      data: {
        barangayCode: code,
        blotterNo: `BL-${YEAR}-${pad(i + 1)}`,
        kind: e.kind,
        category: e.category,
        title: e.title,
        narrative: e.narrative,
        incidentAt: at,
        location: `${pick(STREETS)}, ${pick(puroks).name}`,
        purokId: pick(puroks).id,
        status: e.status,
        actionTaken: e.status === "OPEN" ? null : "Parties were invited to the barangay hall.",
        resolution: ["SETTLED", "CLOSED"].includes(e.status) ? "Settled amicably. Both parties signed the agreement." : null,
        resolvedAt: ["SETTLED", "CLOSED"].includes(e.status) ? daysAgo(int(0, 1)) : null,
        kpStage: kp,
        kpCaseNo: kp ? `KP-${YEAR}-${pad(i + 1, 3)}` : null,
        kpFiledAt: kp ? at : null,
        kpDeadline: kp ? new Date(at.getTime() + (kp === "MEDIATION" ? 15 : 30) * 86400_000) : null,
        isVawc: "vawc" in e,
        recordedById: secretaryId,
        createdAt: at,
      },
    });
    const c = pick(adults);
    const r = pick(adults);
    await db.blotterParty.createMany({
      data: [
        { entryId: entry.id, role: "COMPLAINANT", residentId: c.id, name: c.name, address: `${c.address}, ${c.purok}`, age: c.age, sex: c.sex },
        ...(e.kind === "COMPLAINT" || e.category === "Physical injury"
          ? [{ entryId: entry.id, role: "RESPONDENT" as const, residentId: r.id, name: r.name, address: `${r.address}, ${r.purok}`, age: r.age, sex: r.sex }]
          : []),
      ],
    });
    if (kp)
      await db.caseHearing.create({
        data: { entryId: entry.id, stage: kp, scheduledAt: new Date(at.getTime() + 5 * 86400_000), outcome: e.status === "SETTLED" ? "SETTLED" : "HELD", notes: "Both parties attended." },
      });
  }
  await db.counter.createMany({
    data: [
      { barangayCode: code, key: `blotter:${YEAR}`, value: incidents.length },
      { barangayCode: code, key: `kp:${YEAR}`, value: incidents.length },
    ],
  });

  // Animals and community resources.
  console.log("  community resources…");
  const species: Species[] = ["DOG", "DOG", "DOG", "CAT", "CAT", "CARABAO", "GOAT", "PIG", "POULTRY"];
  for (let i = 0; i < 36; i++) {
    const s = pick(species);
    const owner = pick(adults);
    await db.animal.create({
      data: {
        barangayCode: code,
        tagNo: `AN-${pad(i + 1)}`,
        species: s,
        name: ["DOG", "CAT"].includes(s) ? pick(["Bantay", "Brownie", "Whitey", "Muning", "Choco", "Lucky", "Tiger", "Ming"]) : null,
        breed: s === "DOG" ? pick(["Aspin", "Shih Tzu", "Labrador", "Mixed"]) : s === "CAT" ? pick(["Puspin", "Persian"]) : null,
        sex: chance(0.5) ? "MALE" : "FEMALE",
        color: pick(["Brown", "Black", "White", "Spotted", "Gray"]),
        birthYear: YEAR - int(0, 8),
        ownerResidentId: owner.id,
        ownerName: owner.name,
        lastVaccinatedAt: ["DOG", "CAT"].includes(s) && chance(0.7) ? daysAgo(int(10, 400)) : null,
        vaccine: ["DOG", "CAT"].includes(s) ? "Anti-rabies" : null,
        status: chance(0.92) ? "ACTIVE" : pick(["DECEASED", "MISSING", "TRANSFERRED"] as const),
      },
    });
  }
  await db.counter.create({ data: { barangayCode: code, key: "animal", value: 36 } });
  const resources = [
    ["Barangay Hall", "FACILITY", 1, "building", "GOOD", "Rizal St."],
    ["Covered basketball court", "FACILITY", 1, "court", "GOOD", "Purok 3"],
    ["Day care center", "FACILITY", 1, "building", "FAIR", "Purok 1"],
    ["Barangay Health Station", "HEALTH", 1, "building", "GOOD", "Purok 2"],
    ["Evacuation center (elementary school)", "EVACUATION_CENTER", 1, "site", "GOOD", "Purok 4"],
    ["Barangay patrol vehicle", "VEHICLE", 1, "vehicle", "FAIR", "Barangay Hall"],
    ["Rescue boat", "VEHICLE", 2, "boat", "GOOD", "Lakeshore, Purok 6"],
    ["Generator set (5 kVA)", "EQUIPMENT", 2, "unit", "GOOD", "Barangay Hall"],
    ["Two-way radios", "EQUIPMENT", 12, "unit", "FAIR", "Barangay Hall"],
    ["Monoblock chairs", "EQUIPMENT", 150, "piece", "GOOD", "Storage room"],
    ["Communal deep well", "WATER_SYSTEM", 2, "well", "FAIR", "Purok 5"],
    ["Public faucet stands", "WATER_SYSTEM", 6, "stand", "POOR", "Puroks 5 and 6"],
    ["Community garden lot", "LAND", 1, "lot", "GOOD", "Purok 3"],
    ["First aid kits", "HEALTH", 8, "kit", "GOOD", "Health Station"],
  ] as const;
  for (const [n, category, quantity, unit, condition, location] of resources)
    await db.communityResource.create({
      data: { barangayCode: code, name: n, category, quantity, unit, condition, location, custodian: pick(["Barangay Secretary", "Barangay Treasurer", "BDRRMC Chair", "BHW Coordinator"]), acquiredAt: daysAgo(int(200, 3000)) },
    });

  // Report requirements from the municipality and this barangay's submissions.
  console.log("  submissions…");
  // Date-only columns: build them at UTC midnight so they are stored as the intended day.
  const monthStart = (offset: number) => new Date(Date.UTC(NOW.getFullYear(), NOW.getMonth() + offset, 1));
  const monthEnd = (offset: number) => new Date(Date.UTC(NOW.getFullYear(), NOW.getMonth() + offset + 1, 0));
  const label = (d: Date) => d.toLocaleString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" });
  const reqs = [
    { office: "DILG", title: `Monthly Certificate Issuance Report (${label(monthStart(-1))})`, kind: "CERTIFICATES", f: "MONTHLY", ps: monthStart(-1), pe: monthEnd(-1), due: daysAgo(-3), sub: "UNDER_REVIEW" },
    { office: "MPOC", title: `Monthly Blotter Report (${label(monthStart(-1))})`, kind: "BLOTTER", f: "MONTHLY", ps: monthStart(-1), pe: monthEnd(-1), due: daysAgo(-3), sub: "RETURNED" },
    { office: "MPDO", title: "Q4 Barangay Profile Update", kind: "BARANGAY_PROFILE", f: "QUARTERLY", ps: new Date(Date.UTC(YEAR, 9, 1)), pe: new Date(Date.UTC(YEAR, 11, 31)), due: daysAgo(-6), sub: null },
    { office: "MAO", title: `Community Resource Inventory (${label(monthStart(-1))})`, kind: "COMMUNITY_RESOURCES", f: "MONTHLY", ps: monthStart(-1), pe: monthEnd(-1), due: daysAgo(4), sub: null },
    { office: "MPDO", title: "Resident Demographics Update (Q3)", kind: "DEMOGRAPHICS", f: "QUARTERLY", ps: new Date(Date.UTC(YEAR, 6, 1)), pe: new Date(Date.UTC(YEAR, 8, 30)), due: daysAgo(40), sub: "APPROVED" },
    { office: "MPDO", title: "Household Statistics (Q3)", kind: "HOUSEHOLDS", f: "QUARTERLY", ps: new Date(Date.UTC(YEAR, 6, 1)), pe: new Date(Date.UTC(YEAR, 8, 30)), due: daysAgo(40), sub: "APPROVED" },
    { office: "MSWDO", title: "Household Statistics (Q4)", kind: "HOUSEHOLDS", f: "QUARTERLY", ps: new Date(Date.UTC(YEAR, 9, 1)), pe: new Date(Date.UTC(YEAR, 11, 31)), due: daysAgo(-20), sub: null },
  ] as const;
  for (const r of reqs) {
    const requirement = await db.reportRequirement.create({
      data: { municipalityCode: MUNICIPALITY.code, officeId: office(r.office), title: r.title, kind: r.kind, frequency: r.f, periodStart: r.ps, periodEnd: r.pe, dueAt: r.due, description: "Use the figures generated by LGU Connect. Add notes for anything unusual.", createdById: reviewerId },
    });
    if (r.sub)
      await db.submission.create({
        data: {
          barangayCode: code,
          requirementId: requirement.id,
          officeId: requirement.officeId,
          kind: r.kind,
          title: r.title,
          periodStart: r.ps,
          periodEnd: r.pe,
          data: { note: "Sample figures generated by the seed." },
          status: r.sub,
          submittedAt: daysAgo(r.sub === "APPROVED" ? 45 : 8),
          submittedById: secretaryId,
          reviewedAt: r.sub === "UNDER_REVIEW" ? null : daysAgo(r.sub === "APPROVED" ? 42 : 5),
          reviewedById: r.sub === "UNDER_REVIEW" ? null : reviewerId,
          remarks: r.sub === "RETURNED" ? "Add the case status for the complaints filed in the second half of the month." : r.sub === "APPROVED" ? "Accepted. Thank you." : null,
        },
      });
  }

  await db.announcement.create({
    data: { scope: "BARANGAY", barangayCode: code, title: "Free anti-rabies vaccination", body: "Bring your dogs and cats to the covered court on Saturday, 8 AM to 12 NN. Free of charge.", priority: "NORMAL", publishedAt: daysAgo(3), authorId: secretaryId },
  });
  await db.announcement.create({
    data: { scope: "BARANGAY", barangayCode: code, title: "Clean-up drive this Sunday", body: "All puroks will hold a clean-up drive this Sunday at 6 AM as part of dengue prevention.", priority: "HIGH", publishedAt: daysAgo(1), authorId: secretaryId },
  });

  await db.notification.createMany({
    data: [
      { userId: secretaryId, title: "Report returned", body: "The Monthly Blotter Report needs revision.", href: "/dashboard/municipal-submissions/submission-status", createdAt: daysAgo(5) },
      { userId: secretaryId, title: "Urgent advisory", body: "Dengue prevention advisory from the Municipal Health Office.", href: "/dashboard/announcements-and-communications/important-advisories", createdAt: daysAgo(2) },
      { userId: secretaryId, title: "New certificate request", body: "An online Barangay Clearance request is waiting.", href: "/dashboard/document-management/certificate-requests", createdAt: daysAgo(0), readAt: null },
      { userId: secretaryId, title: "Q3 Demographics approved", body: "The MPDO approved your Resident Demographics Update (Q3).", href: "/dashboard/municipal-submissions/submission-history", createdAt: daysAgo(42), readAt: daysAgo(41) },
    ],
  });

  // A little history for Activity pages.
  await db.auditLog.createMany({
    data: [
      { actorId: secretaryId, actorName: "Maria Elena Santos", action: "CREATE", entityType: "Resident", summary: "Registered a new resident", barangayCode: code, municipalityCode: MUNICIPALITY.code, createdAt: daysAgo(3) },
      { actorId: secretaryId, actorName: "Maria Elena Santos", action: "UPDATE", entityType: "Household", summary: "Updated household water source", changes: { waterSource: ["LEVEL_II", "LEVEL_III"] }, barangayCode: code, municipalityCode: MUNICIPALITY.code, createdAt: daysAgo(2) },
      { actorId: secretaryId, actorName: "Maria Elena Santos", action: "SUBMIT", entityType: "Submission", summary: "Submitted the Monthly Certificate Issuance Report", barangayCode: code, municipalityCode: MUNICIPALITY.code, createdAt: daysAgo(8) },
    ],
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
