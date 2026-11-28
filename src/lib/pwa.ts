"use client";
/**
 * Installable-app state shared by the install buttons.
 * Chrome and Edge fire `beforeinstallprompt` once, soon after load, so it is captured here at startup
 * (see PwaSetup) and replayed when someone presses an install button later.
 * iPhone and iPad have no install prompt: they get "Share → Add to Home Screen" instructions instead.
 */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState = "unavailable" | "prompt" | "ios" | "installed";

/** Opens the iPhone/iPad "Add to Home Screen" steps (IosInstallDialog listens for it). */
export const IOS_HELP_EVENT = "lgu-ios-install-help";
export const openIosInstallHelp = () => window.dispatchEvent(new Event(IOS_HELP_EVENT));

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac, so also check for touch.
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  // Other iOS browsers can also add to the home screen on iOS 16.4+, but the steps differ; Safari is the one we explain.
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

let started = false;
/** Call once on startup: registers the service worker and starts listening for the install prompt. */
export function startPwa() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // keep the browser's mini-infobar away; our button shows the prompt instead
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    notify();
  });
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  }
}

export function subscribeInstall(onChange: () => void) {
  listeners.add(onChange);
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onChange);
  };
}

export function installState(): InstallState {
  if (installed || isStandalone()) return "installed";
  if (deferred) return "prompt";
  if (isIosSafari()) return "ios";
  return "unavailable";
}

export const installStateOnServer = (): InstallState => "unavailable";

/** Shows the browser's install dialog. Returns true if the user accepted. */
export async function promptInstall() {
  const e = deferred;
  if (!e) return false;
  deferred = null; // a prompt event can be used only once
  await e.prompt();
  const { outcome } = await e.userChoice;
  notify();
  return outcome === "accepted";
}
