import type { Metadata } from "next";
import { Host_Grotesk, Instrument_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import { brand } from "@/lib/brand";
import { themeInitScript } from "@/lib/theme";
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script sets the "dark" class before React loads, so the server and client markup differ there.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
