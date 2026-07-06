// main.js — boot, loop principal e gerenciamento de cenas
import { W, H, drawTextC } from './gfx.js';
import * as input from './input.js';
import * as audio from './audio.js';
import * as save from './save.js';
import { Title, WorldMap, Cutscene, Briefing, Ending } from './scenes.js';
import { Level } from './level.js';
import { LEVELS } from './levels.js';

import { setW } from './gfx.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ---------- escala adaptativa (preenche telas 16:9 a ~21:9) ----------
function resize() {
  const vw = innerWidth || 320, vh = innerHeight || 180;
  const aspect = Math.max(16 / 9, Math.min(vw / vh, 21 / 9));
  const w = Math.round(H * aspect / 2) * 2; // par, entre 320 e 420
  if (w !== canvas.width || canvas.height !== H) {
    setW(w);
    canvas.width = w; canvas.height = H;
    ctx.imageSmoothingEnabled = false;
  }
  let scale = Math.min(vw / canvas.width, vh / H);
  if (scale > 1.5) scale = Math.floor(scale * 2) / 2; // meio-inteiro para nitidez
  canvas.style.width = canvas.width * scale + 'px';
  canvas.style.height = H * scale + 'px';
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 250));
resize();

// ---------- estado global ----------
const G = {
  lives: 3,
  fichas: 0,     // fichas da sessão (conta p/ vida a cada 100)
  scene: null,
  lastNode: 'cad',

  toTitle() { input.reset(); G.scene = new Title(G); audio.stopSong(); },
  toMap() {
    input.reset();
    G.scene = new WorldMap(G, G.lastNode);
    audio.playSong('map');
  },
  startLevel(id) {
    input.reset();
    G.lastNode = id;
    audio.stopSong();
    G.scene = new Cutscene(G, LEVELS[id]);
  },
  toBriefing(id) {
    input.reset();
    G.scene = new Briefing(G, LEVELS[id]);
  },
  launchLevel(id) {
    input.reset();               // evita tecla presa fazendo o Murrinha andar sozinho
    if (G.lives <= 0) G.lives = 3;
    G.scene = new Level(LEVELS[id], G);
    audio.playSong(LEVELS[id].music);
  },
  onLevelClear(id, fichasFase, tickets) {
    save.markCleared(id, fichasFase, tickets);
    audio.stopSong();
    if (LEVELS[id].ending) { G.scene = new Ending(G); }
    else G.toMap();
  },
};

// pré-carrega os cenários gerados por IA
import * as assets from './assets.js';
assets.load(['art/title.png', 'art/cad.png', 'art/praca.png', 'art/bras.png', 'art/play.png',
  'art/calc.png', 'art/fisk.png', 'art/fila.png', 'art/bus.png',
  'art/char_cacimba_cut.png', 'art/char_murrinha_cut.png',
  'art/char_trombadinha_cut.png', 'art/char_vanita_cut.png',
  'art/char_fiscal_cut.png', 'art/char_gordo_cut.png',
  'art/char_ratinho_cut.png', 'art/char_tavinho_cut.png',
  'art/char_carrapeta_cut.png', 'art/char_galego_cut.png',
  'art/char_damas_cut.png', 'art/char_passageiro_cut.png',
  'art/char_cobrador_cut.png',
  'art/char_cacimba_strip.png']);

input.init();
G.toTitle();
window.MURR = { G, ctx, canvas, input, LEVELS }; // gancho de debug/testes

// pausa: botão pause volta pro mapa (dentro de fase) — segurar para sair
let pauseOverlay = false;
function handlePause() {
  if (!input.pressed('pause')) return;
  if (G.scene instanceof Level) {
    pauseOverlay = !pauseOverlay;
    if (pauseOverlay) audio.stopSong(); else audio.playSong(G.scene.def.music);
  } else if (G.scene instanceof WorldMap) {
    G.toTitle();
  }
}

// botão de pausa touch (canto superior direito do canvas)
canvas.addEventListener('touchstart', e => {
  const r = canvas.getBoundingClientRect();
  const t = e.changedTouches[0];
  const x = (t.clientX - r.left) / r.width, y = (t.clientY - r.top) / r.height;
  if (x > 0.9 && y < 0.15 && G.scene instanceof Level) {
    pauseOverlay = !pauseOverlay;
    if (pauseOverlay) audio.stopSong(); else audio.playSong(G.scene.def.music);
  }
}, { passive: true });

// ---------- loop fixo 60fps ----------
let last = performance.now(), acc = 0;
const STEP = 1000 / 60;
function frame(now) {
  requestAnimationFrame(frame);
  acc += Math.min(now - last, 100);
  last = now;
  let ran = false;
  while (acc >= STEP) {
    handlePause();
    if (!pauseOverlay) G.scene.update();
    else {
      if (input.pressed('a')) { pauseOverlay = false; audio.playSong(G.scene.def.music); }
      if (input.pressed('b')) { pauseOverlay = false; G.toMap(); } // B = sair pro mapa
    }
    input.endFrame();
    acc -= STEP;
    ran = true;
  }
  if (ran) {
    G.scene.draw(ctx);
    if (pauseOverlay) drawPause();
  }
}
function drawPause() {
  ctx.fillStyle = 'rgba(10,10,25,0.75)';
  ctx.fillRect(0, 0, W, H);
  drawTextC(ctx, 'PAUSA', W / 2, 70, '#f2d24e', 3);
  drawTextC(ctx, (input.isTouch() ? 'BOTAO A' : 'Z') + ' PARA VOLTAR', W / 2, 100, '#fff');
  drawTextC(ctx, (input.isTouch() ? 'BOTAO B' : 'X') + ' PARA SAIR PRO MAPA', W / 2, 112, '#9aa0ac');
}
requestAnimationFrame(frame);

// ---------- PWA ----------
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
  // quando uma versão nova assumir, recarrega sozinho (uma vez)
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  });
}
