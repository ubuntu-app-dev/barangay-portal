import type { Metadata } from "next";
import LoginExperience from "@/components/login/LoginExperience";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign in | ${brand.name}`,
  description:
    "Choose your location, then sign in to the Barangay Information System or the Municipal System.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginExperience />;
}
