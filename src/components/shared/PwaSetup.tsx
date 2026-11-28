"use client";
import { useEffect } from "react";
import { startPwa } from "@/lib/pwa";
import IosInstallDialog from "./IosInstallDialog";

/** Mounted once in the root layout: registers the service worker, catches the install prompt early,
 *  and hosts the iPhone/iPad install steps. */
export default function PwaSetup() {
  useEffect(() => startPwa(), []);
  return <IosInstallDialog />;
}
