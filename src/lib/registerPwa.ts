import { registerSW } from "virtual:pwa-register";

const APP_SW_PATH = "/sw.js";

const isPreviewHost = (hostname: string) =>
  hostname.startsWith("id-preview--") ||
  hostname.startsWith("preview--") ||
  hostname === "lovableproject.com" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname === "lovableproject-dev.com" ||
  hostname.endsWith(".lovableproject-dev.com") ||
  hostname === "beta.lovable.dev" ||
  hostname.endsWith(".beta.lovable.dev");

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith(APP_SW_PATH))
      .map((registration) => registration.unregister()),
  );
}

export async function registerFocusPwa() {
  if (!("serviceWorker" in navigator)) return;

  const disabled = new URLSearchParams(window.location.search).get("sw") === "off";
  const embedded = window.self !== window.top;
  const allowed = import.meta.env.PROD && !embedded && !isPreviewHost(window.location.hostname) && !disabled;

  if (!allowed) {
    await unregisterAppWorkers();
    return;
  }

  registerSW({ immediate: true });
}