/* Optionaler Service Worker für Offline-Nutzung.
   Neben noten.html ablegen und beide Dateien über http(s) bereitstellen –
   die App registriert ihn dann automatisch. Bei file:// ist das nicht möglich. */
const CACHE = 'noten-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(new Request(self.registration.scope, { cache: 'reload' })).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
/* Netz zuerst (damit Updates ankommen), sonst aus dem Cache. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match(self.registration.scope)))
  );
});
