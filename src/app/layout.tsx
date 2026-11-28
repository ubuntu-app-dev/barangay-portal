import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Instrument_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import { brand } from "@/lib/brand";
import ThemeScript from "@/components/shared/ThemeScript";
import PwaSetup from "@/components/shared/PwaSetup";
import "./globals.css";

const display = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.name} | Barangay and Municipal LGU System`,
  description: `${brand.tagline} A centralized platform for barangay secretaries, municipal personnel, and Superadmins.`,
  applicationName: brand.name,
  // Installed on iPhone/iPad from Safari's "Add to Home Screen" (the manifest covers other platforms).
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script sets the "dark" class before React loads, so the server and client markup differ there.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <PwaSetup />
      </body>
    </html>
  );
}
