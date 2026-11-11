import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LocationSignIn from "@/components/login/LocationSignIn";
import LoginLoading from "@/components/login/LoginLoading";
import { brand } from "@/lib/brand";
import { resolveLocation } from "@/lib/geo/resolve";

export const metadata: Metadata = { title: `Sign in | ${brand.name}`, robots: { index: false } };

type Props = { params: Promise<{ area: string; municipality: string }> };

async function Resolved({ params }: Props) {
  const { area, municipality } = await params;
  const location = await resolveLocation(area, municipality);
  if (!location) notFound();
  return <LocationSignIn role="municipal" location={location} />;
}

/** /province/municipality: sign-in for Municipal Personnel. */
export default function MunicipalSignInPage({ params }: Props) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <Resolved params={params} />
    </Suspense>
  );
}
