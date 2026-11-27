import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_BODIES, DEFAULT_DOCUMENT_TYPES, DEFAULT_OFFICE_HOURS } from "@/lib/defaults";

type Tx = Prisma.TransactionClient;

/** Puroks, document types, councils, and office hours a barangay needs before its secretary can work. */
export async function prepareBarangay(tx: Tx, code: string, purokCount: number) {
  const [puroks, types, bodies] = await Promise.all([tx.purok.count({ where: { barangayCode: code } }), tx.documentType.count({ where: { barangayCode: code } }), tx.barangayBody.count({ where: { barangayCode: code } })]);
  if (!puroks) await tx.purok.createMany({ data: Array.from({ length: purokCount }, (_, i) => ({ barangayCode: code, name: `Purok ${i + 1}`, sortOrder: i + 1 })) });
  if (!types)
    await tx.documentType.createMany({
      data: DEFAULT_DOCUMENT_TYPES.map((t, i) => ({ ...t, requirements: [...t.requirements], fee: new Prisma.Decimal(t.fee), barangayCode: code, sortOrder: i })),
    });
  if (!bodies) await tx.barangayBody.createMany({ data: DEFAULT_BODIES.map((b) => ({ ...b, barangayCode: code })) });
  const b = await tx.barangay.findUniqueOrThrow({ where: { code } });
  await tx.barangay.update({ where: { code }, data: { isActive: true, ...(b.officeHours ? {} : { officeHours: DEFAULT_OFFICE_HOURS }) } });
  return { puroks: !puroks, types: !types, bodies: !bodies };
}

