// Checks your PSA token and the data. Prints counts and samples, never the token.
// Run:  node --env-file=.env.local scripts/check-psa.mjs      (Node 20.6 or newer)
const token = process.env.PSA_PSGC_TOKEN?.trim();
const version = process.env.PSA_PSGC_VERSION?.trim() || "Q2_2024";
const BASE = "https://classification.psa.gov.ph/psgc";
if (!token) {
  console.error(
    "PSA_PSGC_TOKEN is not set (or empty). Add it to .env.local first.",
  );
  process.exit(1);
}
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "barangay-portal/1.0",
};
const isRow = (v) =>
  v &&
  typeof v === "object" &&
  "area_name" in v &&
  ("code" in v || "psgc_code" in v);

function findRows(node) {
  if (Array.isArray(node)) {
    if (isRow(node[0])) return node;
    for (const item of node) {
      const found = findRows(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === "object")
    for (const value of Object.values(node)) {
      const found = findRows(value);
      if (found) return found;
    }
  return null;
}

// Loads every page of one level (follows the API's `next` links).
async function load(level, filters = {}) {
  let url = `${BASE}/${version}/${level}?${new URLSearchParams({ token, page_size: "1000", ...filters })}`;
  const rows = [];
  let count = 0;
  for (let page = 0; url && page < 120; page++) {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      console.error(
        `${level}: HTTP ${res.status}. Check the token and PSA_PSGC_VERSION.`,
      );
      process.exit(1);
    }
    const json = await res.json();
    count = json.count ?? count;
    rows.push(...(findRows(json) ?? []));
    url =
      typeof json.next === "string" &&
      new URL(json.next).hostname === "classification.psa.gov.ph"
        ? json.next
        : null;
  }
  return { rows, count };
}
const codeOf = (r) => String(r.code ?? r.psgc_code).padStart(10, "0");
const show = (rows) =>
  rows
    .slice(0, 3)
    .map((r) => `${codeOf(r)} ${r.area_name} [${r.geographic_level}]`)
    .join(" | ");

console.log(`Token length: ${token.length} characters. Version: ${version}\n`);
const regions = await load("regions");
console.log(
  `regions: ${regions.rows.length} loaded (API count ${regions.count})\n  ${show(regions.rows)}`,
);
if (!regions.rows.length) {
  console.log("No rows. Try another PSA_PSGC_VERSION.");
  process.exit(1);
}
const provinces = await load("provinces");
console.log(
  `provinces: ${provinces.rows.length} loaded (API count ${provinces.count}; levels: ${[...new Set(provinces.rows.map((r) => r.geographic_level))].join(", ")})\n  ${show(provinces.rows)}`,
);
const places = await load("municipalities");
console.log(
  `municipalities: ${places.rows.length} loaded (API count ${places.count}; levels: ${[...new Set(places.rows.map((r) => r.geographic_level))].join(", ")})\n  ${show(places.rows)}`,
);

// Where do independent and NCR cities live? (src/lib/geo/psa.ts reads both lists.)
const tally = (rows) =>
  Object.entries(
    rows.reduce(
      (m, r) => ({
        ...m,
        [r.geographic_level]: (m[r.geographic_level] ?? 0) + 1,
      }),
      {},
    ),
  )
    .map(([k, v]) => `${k}:${v}`)
    .join(" ");
console.log(`\nprovinces endpoint by level: ${tally(provinces.rows)}`);
console.log(`municipalities endpoint by level: ${tally(places.rows)}`);
for (const name of [
  "Pasig",
  "Caloocan",
  "Las Pi",
  "Pateros",
  "Davao City",
  "Baguio",
  "Cebu City",
]) {
  const hits = [
    ["provinces", provinces.rows],
    ["municipalities", places.rows],
  ].flatMap(([where, rows]) =>
    rows
      .filter((r) => r.area_name?.includes(name))
      .map(
        (r) => `${where}: ${codeOf(r)} ${r.area_name} [${r.geographic_level}]`,
      ),
  );
  console.log(
    `${name}: ${hits.length ? hits.join(" ; ") : "NOT FOUND in either list"}`,
  );
}

// Same rule as src/lib/geo/psa.ts. Expect roughly: City of Manila ~897, Caloocan ~188, Laoag ~80.
for (const name of ["City of Manila", "Caloocan", "Laoag"]) {
  const place = places.rows.find((r) => r.area_name?.includes(name));
  if (!place) {
    console.log(`${name}: not found in the municipalities list`);
    continue;
  }
  const code = codeOf(place);
  const prefix =
    code.slice(5, 7) === "00" ? code.slice(0, 5) : code.slice(0, 7);
  const { rows } = await load("barangays", {
    prv: String(Number(code.slice(2, 5))),
  });
  const own = rows.filter((r) => codeOf(r).startsWith(prefix));
  console.log(
    `${place.area_name} (${code}): ${own.length} barangays (${rows.length} rows downloaded)`,
  );
}
