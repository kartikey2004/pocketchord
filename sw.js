/* PocketChord service worker — offline app shell + runtime caching of Tone.js & piano samples */
const CACHE = 'pocketchord-v5';
const SHELL = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const url = new URL(req.url);
      // Runtime-cache same-origin files plus Tone.js / piano samples so it works offline after first use.
      if (res.ok && (url.origin === location.origin || /tonejs\.github\.io|cdnjs\.cloudflare\.com/.test(url.host))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    } catch (err) {
      // Offline fallback for navigations -> the app shell.
      if (req.mode === 'navigate') return caches.match('./index.html');
      throw err;
    }
  })());
});
