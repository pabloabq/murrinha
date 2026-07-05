// sw.js — service worker: stale-while-revalidate (funciona offline, atualiza sozinho)
const VERSION = 'murrinha-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/main.js', './js/gfx.js', './js/sprites.js', './js/audio.js',
  './js/input.js', './js/save.js', './js/scenes.js', './js/level.js', './js/levels.js',
  './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(e.request);
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
