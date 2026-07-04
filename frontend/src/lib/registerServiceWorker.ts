// Registers public/sw.js for app-shell caching per ADR 0001.
// Placeholder — see docs/ADR1_offline_model.
//
// TODO: decide update strategy (e.g. prompt user to reload when a new
// service worker takes over) instead of registering and forgetting.
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // TODO: only register once the app shell + manifest are actually
  // ready to be cached; this is a no-op-shaped stub until then.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // TODO: surface registration failures somewhere useful.
    });
  });
}
