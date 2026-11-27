import type { Official } from "@/types/profile";

function Node({ title, name, featured = false }: { title: string; name: string; featured?: boolean }) {
  return (
    <div className={`min-w-[170px] rounded-2xl border px-4 py-3 text-center shadow-sm ${featured ? "border-brand bg-brand text-white" : "border-rule bg-panel"}`}>
      <p className={`text-[12px] ${featured ? "text-white/85" : "text-ink-secondary"}`}>{title}</p>
      <p className="font-display text-[14px] font-bold">{name}</p>
    </div>
  );
}

/** Punong Barangay at the top, the other officers below. Connector lines show from tablet width up. */
export default function OrgChart({ officials }: { officials: Official[] }) {
  const find = (p: string) => officials.find((o) => o.isActive && o.position === p);
  const kagawads = officials.filter((o) => o.isActive && o.position === "Barangay Kagawad").length;
  const children = [
    { title: "Sangguniang Barangay", name: `${kagawads} Barangay Kagawad` },
    { title: "SK Chairperson", name: find("SK Chairperson")?.name ?? "Vacant" },
    { title: "Barangay Secretary", name: find("Barangay Secretary")?.name ?? "Vacant" },
    { title: "Barangay Treasurer", name: find("Barangay Treasurer")?.name ?? "Vacant" },
  ];
  return (
    <div className="flex flex-col items-center">
      <Node title="Punong Barangay" name={find("Punong Barangay")?.name ?? "Vacant"} featured />
      <span aria-hidden="true" className="hidden h-6 w-px bg-rule md:block" />
      <ul className="relative mt-4 flex flex-wrap justify-center gap-4 md:mt-0 md:pt-6 md:before:absolute md:before:left-[12%] md:before:right-[12%] md:before:top-0 md:before:h-px md:before:bg-rule">
        {children.map((c) => (
          <li key={c.title} className="relative">
            <span aria-hidden="true" className="absolute -top-6 left-1/2 hidden h-6 w-px bg-rule md:block" />
            <Node title={c.title} name={c.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
