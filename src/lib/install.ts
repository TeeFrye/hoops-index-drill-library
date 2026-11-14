import { useSyncExternalStore } from "react";

/**
 * Install support across platforms:
 * - Chrome / Edge / Samsung Internet (Android + desktop) fire `beforeinstallprompt`,
 *   which we keep so our own button can open the native install dialog.
 * - iPhone / iPad have no install API, so we show step-by-step instructions instead.
 * - Once installed (or launched from the home screen), every install UI hides.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallMode = "installed" | "prompt" | "ios" | "manual";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

let deferred: BeforeInstallPromptEvent | null = null;
let installed = isStandalone();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // keep Chrome's mini-infobar from appearing; we show our own button
  deferred = e as BeforeInstallPromptEvent;
  emit();
});
window.addEventListener("appinstalled", () => {
  installed = true;
  deferred = null;
  emit();
});

function getMode(): InstallMode {
  if (installed) return "installed";
  if (deferred) return "prompt";
  if (isIOS()) return "ios";
  return "manual";
}

export function useInstallMode(): InstallMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getMode,
    getMode,
  );
}

/** Opens the browser's native install dialog. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null; // the event can only be used once
  emit();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === "accepted";
}
