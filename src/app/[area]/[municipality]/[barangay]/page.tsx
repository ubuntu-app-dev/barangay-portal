import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LocationSignIn from "@/components/login/LocationSignin";
import LoginLoading from "@/components/login/LoginLoading";
import { brand } from "@/lib/brand";
import { resolveLocation } from "@/lib/geo/resolve";

export const metadata: Metadata = {
  title: `Sign in | ${brand.name}`,
  robots: { index: false },
};

type Props = {
  params: Promise<{ area: string; municipality: string; barangay: string }>;
};

async function Resolved({ params }: Props) {
  const { area, municipality, barangay } = await params;
  const location = await resolveLocation(area, municipality, barangay);
  if (!location?.barangay) notFound();
  return <LocationSignIn role="secretary" location={location} />;
}

/** /province/municipality/barangay: sign-in for a Barangay Secretary. */
export default function BarangaySignInPage({ params }: Props) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <Resolved params={params} />
    </Suspense>
  );
}
