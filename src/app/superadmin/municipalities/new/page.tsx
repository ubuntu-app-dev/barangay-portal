import type { Metadata } from "next";
import { Suspense } from "react";
import AutoSubmitSelect from "@/components/admin/AutoSubmitSelect";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { ActionForm, SubmitButton } from "@/components/dashboard/ui/form";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireRole } from "@/lib/auth/staff";
import { getGeoProvider } from "@/lib/geo";
import { importMunicipality } from "@/server/actions/superadmin";
import { str, type SearchParams } from "@/server/params";
import type { GeoOption } from "@/types/geo";

export const metadata: Metadata = { title: "Onboard a Municipality" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  await requireRole("SUPERADMIN");
  const sp = await searchParams;
  const geo = getGeoProvider();
  const region = str(sp.region);
  const province = str(sp.province);
  let regions: GeoOption[] = [];
  let provinces: GeoOption[] = [];
  let muns: GeoOption[] = [];
  let error = false;
  try {
    regions = await geo.regions();
    if (region) provinces = await geo.provinces(region);
    // Regions without provinces (NCR) list their cities directly.
    if (region && (provinces.length === 0 || province)) muns = await geo.municipalities({ region, province: provinces.length ? province : undefined });
  } catch {
    error = true;
  }
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: "/superadmin/municipalities", label: "Municipalities" }} icon="globe" title="Onboard a municipality" description="Pick it from the official PSGC list. Its barangays and the default municipal offices are created for you." />
      {error ? (
        <Card title="PSGC list unavailable">
          <EmptyState icon="alert" title="The PSGC service could not be reached" text="Check the internet connection and the PSA token in .env.local, then reload." />
        </Card>
      ) : (
        <Card title="Location" icon="mapPin">
          <form method="get" className="grid gap-4 md:grid-cols-2">
            <AutoSubmitSelect name="region" label="Region" defaultValue={region}>
              <option value="" disabled>
                Choose a region
              </option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </AutoSubmitSelect>
            {region && provinces.length > 0 && (
              <AutoSubmitSelect name="province" label="Province (or independent city)" defaultValue={province}>
                <option value="" disabled>
                  Choose
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </AutoSubmitSelect>
            )}
            <noscript>
              <button type="submit" className="btn btn-secondary">
                Next
              </button>
            </noscript>
          </form>
          {muns.length > 0 && (
            <ActionForm action={importMunicipality} hidden={{ region: region!, ...(province ? { province } : {}) }} className="mt-5 border-t border-rule pt-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold">City or municipality</span>
                  <select name="municipality" required defaultValue="" className="field">
                    <option value="" disabled>
                      Choose
                    </option>
                    {muns.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <SubmitButton pendingText="Loading barangays…">Load and activate</SubmitButton>
              </div>
            </ActionForm>
          )}
        </Card>
      )}
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
