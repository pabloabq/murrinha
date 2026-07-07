// sw.js — service worker: stale-while-revalidate (funciona offline, atualiza sozinho)
const VERSION = 'murrinha-v33';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/main.js', './js/gfx.js', './js/sprites.js', './js/audio.js',
  './js/input.js', './js/save.js', './js/scenes.js', './js/level.js', './js/levels.js',
  './js/assets.js',
  './art/title.png', './art/cad.png', './art/praca.png', './art/bras.png', './art/play.png',
  './art/calc.png', './art/fisk.png', './art/fila.png', './art/bus.png',
  './art/char_cacimba_cut.png', './art/char_murrinha_cut.png',
  './art/char_trombadinha_cut.png', './art/char_vanita_cut.png',
  './art/char_fiscal_cut.png', './art/char_gordo_cut.png',
  './art/char_ratinho_cut.png', './art/char_tavinho_cut.png',
  './art/char_carrapeta_cut.png', './art/char_galego_cut.png',
  './art/char_damas_cut.png', './art/char_cobrador_cut.png',
  './art/char_passageiro0_cut.png', './art/char_passageiro1_cut.png',
  './art/char_passageiro2_cut.png', './art/char_passageiro3_cut.png',
  './art/char_passageiro4_cut.png', './art/char_passageiro5_cut.png',
  './art/char_passageiro6_cut.png', './art/char_passageiro7_cut.png',
  './art/char_passageiro8_cut.png', './art/char_passageiro9_cut.png',
  './art/char_cacimba_strip.png', './art/char_murrinha_strip.png',
  './art/char_fiscal_strip.png', './art/char_ratinho_strip.png',
  './art/char_trombadinha_strip.png', './art/char_vanita_strip.png',
  './art/char_gordo_strip.png', './art/char_tavinho_strip.png',
  './art/char_carrapeta_strip.png',
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
