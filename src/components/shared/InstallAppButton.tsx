"use client";
import { useSyncExternalStore } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { installState, installStateOnServer, openIosInstallHelp, promptInstall, subscribeInstall } from "@/lib/pwa";

type Props = {
  /** "menu": a row in the account menu. "wide": a full-width button for the landing page's phone menu. */
  variant?: "menu" | "wide";
  /** Called before the install dialog opens (for example, to close the menu it sits in). */
  onOpen?: () => void;
};

/**
 * "Install app": shows the browser's install dialog on Chrome, Edge, and Android, or the
 * Add to Home Screen steps on iPhone and iPad. Hidden when installed or when the browser can't install.
 */
export default function InstallAppButton({ variant = "menu", onOpen }: Props) {
  const state = useSyncExternalStore(subscribeInstall, installState, installStateOnServer);
  if (state === "unavailable" || state === "installed") return null;

  const onClick = () => {
    onOpen?.();
    if (state === "prompt") void promptInstall();
    else openIosInstallHelp();
  };

  return variant === "menu" ? (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] hover:bg-ground-muted"
    >
      <Icon name="download" className="h-4 w-4 text-ink-secondary" />
      Install app
    </button>
  ) : (
    <button type="button" onClick={onClick} className="btn btn-secondary mb-3 w-full">
      <Icon name="download" className="h-4 w-4" />
      Install app
    </button>
  );
}
