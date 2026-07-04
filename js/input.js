// input.js — teclado + controles touch (D-pad e botões A/B via DOM)
import * as audio from './audio.js';

const state = { left: false, right: false, up: false, down: false, a: false, b: false, pause: false };
const prev = { ...state };
let touched = false;

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'a', KeyZ: 'a', KeyJ: 'a',
  ShiftLeft: 'b', ShiftRight: 'b', KeyX: 'b', KeyK: 'b',
  Enter: 'pause', Escape: 'pause',
};

export function held(k) { return state[k]; }
export function pressed(k) { return state[k] && !prev[k]; }
export function anyPressed() { return ['a', 'b', 'pause'].some(k => pressed(k)); }
export function endFrame() { Object.assign(prev, state); }
export function isTouch() { return touched; }

export function init() {
  addEventListener('keydown', e => {
    audio.unlock();
    const k = KEYMAP[e.code];
    if (k) { state[k] = true; e.preventDefault(); }
  });
  addEventListener('keyup', e => {
    const k = KEYMAP[e.code];
    if (k) { state[k] = false; e.preventDefault(); }
  });

  // --- touch ---
  const pad = document.getElementById('pad');
  const btnA = document.getElementById('btnA');
  const btnB = document.getElementById('btnB');
  const ctl = document.getElementById('controls');

  const showControls = () => {
    if (!touched) { touched = true; ctl.classList.add('on'); }
  };
  addEventListener('touchstart', showControls, { passive: true });

  // D-pad: um único elemento; posição do dedo decide esquerda/direita/cima/baixo
  const padTouches = new Map();
  const updatePad = () => {
    state.left = state.right = false;
    let down = false, up = false;
    const r = pad.getBoundingClientRect();
    for (const [, p] of padTouches) {
      const dx = p.x - (r.left + r.width / 2);
      const dy = p.y - (r.top + r.height / 2);
      if (Math.abs(dx) > Math.abs(dy) * 0.6) {
        if (dx < -6) state.left = true; else if (dx > 6) state.right = true;
      }
      if (dy < -r.height * 0.28) up = true;
      if (dy > r.height * 0.28 && Math.abs(dx) < r.width * 0.25) down = true;
    }
    state.down = down;
    // "up" no pad não pula (pulo é o botão A) — reservado p/ portas futuras
  };
  const padEv = e => {
    audio.unlock(); showControls();
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (e.type === 'touchend' || e.type === 'touchcancel') padTouches.delete(t.identifier);
      else padTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    updatePad();
  };
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(ev =>
    pad.addEventListener(ev, padEv, { passive: false }));

  const bindBtn = (el, key) => {
    el.addEventListener('touchstart', e => { audio.unlock(); showControls(); e.preventDefault(); state[key] = true; }, { passive: false });
    el.addEventListener('touchend', e => { e.preventDefault(); state[key] = false; }, { passive: false });
    el.addEventListener('touchcancel', () => { state[key] = false; });
  };
  bindBtn(btnA, 'a');
  bindBtn(btnB, 'b');

  // toque na tela (fora dos controles) = "a" (avançar diálogos/menus)
  const cv = document.getElementById('game');
  cv.addEventListener('touchstart', e => {
    audio.unlock(); showControls();
    e.preventDefault();
    state.a = true;
    setTimeout(() => { state.a = false; }, 80);
  }, { passive: false });
  cv.addEventListener('mousedown', () => { audio.unlock(); });
}
