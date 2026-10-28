/* Service worker: deixa o app funcionar offline.
   Ao mudar qualquer arquivo do projeto, aumente o número da versão abaixo. */
const V = "pdf-reader-v2";
const SHELL = ["./", "index.html", "style.css", "app.js", "i18n.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "vendor/pdf-lib.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const own = u.origin === location.origin, fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !fonts) return;
  // serve do cache na hora e atualiza em segundo plano (o OCR e os idiomas entram no cache no primeiro uso)
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
