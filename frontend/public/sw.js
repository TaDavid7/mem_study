// Service worker for ADR 0001 (offline-read-only app shell caching).
// Placeholder — see docs/ADR1_offline_model, "Follow-ups".
//
// TODO: pick a cache name/version and bump it on releases that change
// shell assets, so stale caches get evicted on activate.
const CACHE_NAME = "app-shell-v0";

// TODO: list the app-shell assets that must be available offline
// (e.g. "/", built JS/CSS chunks, fonts, icons).
const APP_SHELL_URLS = [];

self.addEventListener("install", (event) => {
  // TODO: pre-cache APP_SHELL_URLS into CACHE_NAME.
});

self.addEventListener("activate", (event) => {
  // TODO: delete caches that don't match CACHE_NAME.
});

self.addEventListener("fetch", (event) => {
  // TODO: serve app-shell requests from cache first, falling back to
  // network. Card data itself is NOT this service worker's concern —
  // that's the Dexie/IndexedDB read cache described in the ADR.
});
