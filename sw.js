// Offline cache: voice clips are cached the first time they play; the app shell is network-first so updates always arrive.
const V = 'tm-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('icon.svg') && u.search) return;
  if (u.pathname.includes('/audio/') && !u.pathname.endsWith('manifest.json')) {
    e.respondWith(caches.open(V).then(c => c.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }))));
  } else {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); if (res.ok) caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r)));
  }
});
