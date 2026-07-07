// level.js — motor de plataforma: física, colisões, entidades, câmera, HUD
import { W, H, SS, drawText, drawTextC, drawTextO, drawBox, textWidth } from './gfx.js';
import * as S from './sprites.js';
import * as assets from './assets.js';
import * as input from './input.js';
import * as audio from './audio.js';

const TS = 16;
const SOLID = new Set(['#', 'M', 'L', 'E', 'D', 'X', 'K', 'R', 'S', 'T', 'y', 'u']);
const ONEWAY = new Set(['=', 'b', 'r', 'm']);
// tiles puramente decorativos (árvore, coluna) — escondidos quando há cenário de IA
const DECO_TILES = new Set(['A', 'i', 'c']);
// tiles de PISO/CHÃO — escondidos quando há cenário de IA (a imagem já traz o chão)
const FLOOR_FILL = new Set(['#', '#2', 'y', 'u', 'S', 'R', 'L', 'L2', 'L3', 'T']);
const GRAV = 0.30, GRAV_HOLD = 0.13, TERM = 5.2;
const WALK = 1.35, RUN = 2.1, ACC = 0.09, FRIC = 0.12;
// px lógicos por quadro do walk-cycle: a animação avança pela DISTÂNCIA andada
// (não por relógio), então o passo cola no chão e não patina em nenhuma velocidade.
const WALK_STRIDE = 11.0;

// desenha um sprite de personagem com a BASE alinhada aos pés do hitbox (no chão)
function foot(ctx, e, img, dx = 0) {
  ctx.drawImage(img, Math.round(e.x + dx), Math.round(e.y + e.h - img.height));
}

// escolhe o quadro do walk-cycle: parado usa o quadro neutro; andando faz
// ping-pong pelos passos (pernas/braços se mexem de verdade).
function frameFor(e, frames) {
  if (frames <= 1) return 0;
  const moving = Math.abs(e.vx || 0) >= 0.25;
  if (frames === 3) {                                  // strips legado (ping-pong)
    if (!moving) return 1;                             // quadro neutro no meio
    return [0, 1, 2, 1][Math.floor(e.anim / 7) % 4];
  }
  // ciclo completo (>=4 quadros): anima pela distância percorrida (sem patinar)
  if (!moving) return 0;
  return ((Math.floor(e.x / WALK_STRIDE)) % frames + frames) % frames;
}
// desenha personagem de IA: pé no chão, centralizado, animando o quadro certo.
// info = { img, frames }. A fonte é alta-res (SS×), então desenha em tamanho
// lógico = px/SS -> mesmo tamanho de antes, porém com o dobro do detalhe.
function drawAI(ctx, e, info, flip) {
  const img = info.img, frames = info.frames;
  const fw = Math.floor(img.width / frames);
  const lw = fw / SS, lh = img.height / SS;          // tamanho lógico
  const bob = frames > 1 ? 0 : Math.round(Math.abs(Math.sin(e.anim * 0.14)));
  const dx = Math.round(e.x + e.w / 2 - lw / 2);
  const dy = Math.round(e.y + e.h - lh - bob);
  const sx = frameFor(e, frames) * fw;
  if (flip) {
    ctx.save(); ctx.translate(dx + lw, dy); ctx.scale(-1, 1);
    ctx.drawImage(img, sx, 0, fw, img.height, 0, 0, lw, lh); ctx.restore();
  } else ctx.drawImage(img, sx, 0, fw, img.height, dx, dy, lw, lh);
}
// mapa entidade -> sprite de IA (quando existir, substitui o sprite de código)
// sprites de 1 quadro (fallback enquanto não há strip animado)
const AI_CHAR = {
  'chaser:cacimba': 'art/char_cacimba_cut.png',
  'chaser:fiscal': 'art/char_fiscal_cut.png',
  'chaser:ratinho': 'art/char_ratinho_cut.png',
  tromba: 'art/char_trombadinha_cut.png',
  liginha: 'art/char_vanita_cut.png',
  bigwalk: 'art/char_gordo_cut.png',
  crosser: 'art/char_tavinho_cut.png',
  whistler: 'art/char_carrapeta_cut.png',
  galego: 'art/char_galego_cut.png',
  damas: 'art/char_damas_cut.png',
  passenger: 'art/char_passageiro_cut.png',
  cobrador: 'art/char_cobrador_cut.png',
};
// strips animados (walk-cycle) — têm prioridade sobre o sprite de 1 quadro
const AI_STRIP = {
  'chaser:cacimba': { path: 'art/char_cacimba_strip.png', frames: 3 },
  'chaser:fiscal': { path: 'art/char_fiscal_strip.png', frames: 3 },
  'chaser:ratinho': { path: 'art/char_ratinho_strip.png', frames: 3 },
  tromba: { path: 'art/char_trombadinha_strip.png', frames: 3 },
  liginha: { path: 'art/char_vanita_walk.png', frames: 6 },
  bigwalk: { path: 'art/char_gordo_strip.png', frames: 3 },
  crosser: { path: 'art/char_tavinho_strip.png', frames: 3 },
  whistler: { path: 'art/char_carrapeta_strip.png', frames: 3 },
};
function aiKey(e) { return (typeof e.skin === 'string') ? e.t + ':' + e.skin : e.t; }
// 10 passageiros distintos (homens/mulheres, adultos/idosos, roupas variadas)
const N_PASS = 10;
// info do sprite de IA da entidade: { img, frames } ou null
function aiInfo(e) {
  if (e.t === 'passenger') { const im = assets.get('art/char_passageiro' + (e.skin % N_PASS) + '_cut.png'); return im ? { img: im, frames: 1 } : null; }
  const k = aiKey(e);
  const st = AI_STRIP[k]; if (st) { const im = assets.get(st.path); if (im) return { img: im, frames: st.frames }; }
  const sp = AI_CHAR[k]; if (sp) { const im = assets.get(sp); if (im) return { img: im, frames: 1 }; }
  return null;
}
function aiImg(e) { const i = aiInfo(e); return i ? i.img : null; } // p/ posicionar a nameTag

// nome do personagem (discreto) acima da cabeça, pra saber de quem é
const ENT_NAMES = {
  liginha: 'VANITA', bigwalk: 'GORDO', crosser: 'TAVINHO', whistler: 'CARRAPETA',
  galego: 'GALEGO', cobrador: 'COBRADOR', damas: 'DAMAS', tromba: 'TROMBADINHA',
  passenger: 'PASSAGEIRO', roller: 'PINBALL',
  'chaser:fiscal': 'FISCAL', 'chaser:cacimba': 'CACIMBA', 'chaser:ratinho': 'RATINHO',
};
function nameTag(ctx, e) {
  const nm = ENT_NAMES[e.skin ? e.t + ':' + e.skin : e.t];
  if (!nm) return;
  // topo do sprite (IA transborda pra cima da hitbox) pra a tag ficar acima da cabeça
  const ai = aiImg(e);
  const top = ai ? (e.y + e.h - ai.height / SS) : e.y;
  const w = textWidth(nm), tx = Math.round(e.x + e.w / 2 - w / 2), ty = Math.round(top - 9);
  ctx.fillStyle = 'rgba(10,10,22,0.55)'; ctx.fillRect(tx - 2, ty - 1, w + 4, 7);
  drawText(ctx, nm, tx, ty, '#f4e29a');
}

export class Level {
  constructor(def, G) {
    this.def = def;
    this.G = G; // estado global: lives, fichas, callbacks
    this.rows = def.map;
    this.h = this.rows.length;
    this.w = Math.max(...this.rows.map(r => r.length));
    this.pw = this.w * TS; this.ph = this.h * TS;
    this.collected = new Set();
    this.checkpoint = null;
    this.spawn = { x: 32, y: 0 };
    this.goalX = this.pw - 48;
    // varre o mapa por marcadores
    for (let j = 0; j < this.h; j++) for (let i = 0; i < this.rows[j].length; i++) {
      const ch = this.rows[j][i];
      if (ch === 'P') this.spawn = { x: i * TS, y: j * TS - 8 };
      if (ch === 'G') this.goalX = i * TS;
    }
    this.reset(true);
    this.state = 'play'; // play | dying | win | gameover
    this.stateT = 0;
    this.fichasFase = 0;
    this.tickets = 0;
    this.time = 0;
    this.toast = null; this.toastT = 0;
    // zonas de tráfego horizontais legadas: {c0, c1, row, dir, speed, every, types}
    this.traffic = (def.traffic || []).map(z => ({ ...z, t: z.every - 40 }));
    // FAIXAS da avenida (Frogger vertical): carros atravessam a largura toda
    // e nascem/somem FORA da tela, nas bordas do mapa. {topRow, dir, speed, every, types, phase}
    this.lanes = (def.laneTraffic || []).map((z, i) => ({ ...z, t: z.phase != null ? z.phase : (z.every - 30 - i * 24) }));
  }

  tileAt(i, j) {
    if (i < 0 || i >= this.w) return '#'; // paredes nas bordas
    if (j < 0) return '.';
    if (j >= this.h) return '.';
    return this.rows[j][i] || '.';
  }

  reset(hard) {
    // (re)cria player e entidades a partir do mapa
    const sp = (!hard && this.checkpoint) ? this.checkpoint : this.spawn;
    this.p = {
      x: sp.x, y: sp.y, w: 10, h: 22, vx: 0, vy: 0,
      dir: 1, ground: false, anim: 0, inv: hard ? 0 : 90,
      boost: 0, jumpHeld: false, stun: 0, shield: false,
      charm: 0, stink: 0,     // apaixonado (Cacimba) / fedido (Gordo) => mais lento
    };
    this.ents = [];
    this.parts = [];
    this.poops = [];
    this.cars = [];
    this.waves = [];
    this.grains = [];
    this.kisses = [];   // beijos do Cacimba
    this.clouds = [];   // nuvens de peido do Gordo
    this.knives = [];   // canivetes dos trombadinhas (FISK)
    this.shake = 0;
    this.combo = 0;
    // y tal que um NPC de altura h fique com os PÉS no primeiro chão abaixo da linha j
    const feetY = (i, j, h) => {
      let gj = j;
      while (gj < this.h && !SOLID.has(this.tileAt(i, gj)) && !ONEWAY.has(this.tileAt(i, gj))) gj++;
      return gj * TS - h;
    };
    for (let j = 0; j < this.h; j++) for (let i = 0; i < this.rows[j].length; i++) {
      const ch = this.rows[j][i], x = i * TS, y = j * TS, key = i + ',' + j;
      if (this.collected.has(key)) continue;
      switch (ch) {
        case 'f': this.ents.push({ t: 'ficha', x: x + 5, y: y + 5, w: 6, h: 6, key, anim: (i * 7) % 24 }); break;
        case 'h': this.ents.push({ t: 'choc', x: x + 3, y: y + 6, w: 10, h: 6, key }); break;
        case 'p': this.ents.push({ t: 'pipoca', x: x + 3, y: y + 4, w: 10, h: 8, key }); break;
        case 'n': this.ents.push({ t: 'nota', x: x + 2, y: y + 4, w: 12, h: 9, key, anim: 0 }); break;
        case 'a': this.ents.push({ t: 'maca', x: x + 4, y: y + 4, w: 8, h: 9, key }); break;
        case 't': this.ents.push({ t: 'ticket', x: x + 3, y: y + 5, w: 10, h: 5, key, anim: 0 }); break;
        case '1': this.ents.push({ t: 'liginha', x, y: feetY(i, j, 26), w: 12, h: 26, vx: -0.5, dir: -1, mode: 'patrol', anim: 0, saw: 0, susp: 0, look: 0, homeX: x, range: 60 }); break;
        case 'g': this.ents.push({ t: 'tromba', x: x + 2, y: feetY(i, j, 16), w: 10, h: 16, vx: -0.45, dir: -1, anim: 0, dead: 0 }); break;
        case 'o': this.ents.push({ t: 'pombo', x: x + 3, y: y + 8, w: 10, h: 8, mode: 'perch', vx: 0, anim: 0, drop: 0, homeY: y + 8 }); break;
        case 'C': { // ancora a placa no chão abaixo dela
          let gj = j;
          while (gj < this.h && !SOLID.has(this.tileAt(i, gj)) && !ONEWAY.has(this.tileAt(i, gj))) gj++;
          const gy = gj * TS - 16;
          this.ents.push({ t: 'check', x: x + 1, y: gy, w: 14, h: 16, on: this.checkpoint && this.checkpoint.x === x + 1 });
          break;
        }
        case 'd': this.ents.push({ t: 'damas', x, y: feetY(i, j, 24), w: 16, h: 24, anim: (i * 13) % 60 }); break;
        // --- perseguidores (pule por cima!) ---
        case 'F': this.ents.push({ t: 'chaser', skin: 'fiscal', x, y: feetY(i, j, 24), w: 12, h: 24, vx: -0.6, dir: -1, mode: 'patrol', anim: 0, saw: 0, spd: 1.0, range: 96 }); break;
        case 'Q': this.ents.push({ t: 'chaser', skin: 'cacimba', x, y: feetY(i, j, 24), w: 12, h: 24, vx: 0.8, dir: 1, mode: 'patrol', anim: 0, saw: 0, spd: 1.3, range: 220, aggressive: true }); break;
        case 'Y': this.ents.push({ t: 'chaser', skin: 'ratinho', x, y: feetY(i, j, 24), w: 12, h: 24, vx: -0.8, dir: -1, mode: 'patrol', anim: 0, saw: 0, spd: 1.2, range: 110 }); break;
        // --- obstáculos que andam (jump-over, não pisáveis) ---
        case 'O': this.ents.push({ t: 'bigwalk', skin: 'gordo', x, y: feetY(i, j, 20), w: 20, h: 20, vx: -0.3, dir: -1, anim: 0 }); break;
        case 'V': this.ents.push({ t: 'crosser', skin: 'tavinho', x, y: feetY(i, j, 24), w: 13, h: 24, vx: 2.2, dir: 1, anim: 0, x0: x - 70, x1: x + 70 }); break;
        // --- Carrapeta: emite ondas de assovio ---
        case 'W': this.ents.push({ t: 'whistler', x, y: feetY(i, j, 24), w: 13, h: 24, dir: -1, anim: 0, fire: 60 }); break;
        // --- Galego: chuva de pipoca (bônus) ---
        case 'q': this.ents.push({ t: 'galego', x, y: feetY(i, j, 24), w: 14, h: 24, anim: 0, pop: 40 }); break;
        // --- passageiro do ônibus (obstáculo que balança) ---
        case 'z': this.ents.push({ t: 'passenger', x: x - 1, y: feetY(i, j, 28), w: 14, h: 28, skin: (this.ents.length * 7 + i) % 10, anim: 0, homeX: x - 1 }); break;
        case 'Z': this.ents.push({ t: 'cobrador', x, y: feetY(i, j, 24), w: 14, h: 24, anim: 0 }); break;
        // --- bola de fliperama: rola pelo chão, empurra o Murrinha (pule!) ---
        case 'B': this.ents.push({ t: 'roller', x, y: feetY(i, j, 10), w: 10, h: 10, vx: -1.4, dir: -1, anim: 0 }); break;
      }
    }
  }

  // ---------- física ----------
  moveX(e, dx) {
    e.x += dx;
    const top = Math.floor(e.y / TS), bot = Math.floor((e.y + e.h - 1) / TS);
    if (dx > 0) {
      const i = Math.floor((e.x + e.w) / TS);
      for (let j = top; j <= bot; j++) if (SOLID.has(this.tileAt(i, j))) { e.x = i * TS - e.w - 0.01; e.vx = 0; return true; }
    } else if (dx < 0) {
      const i = Math.floor(e.x / TS);
      for (let j = top; j <= bot; j++) if (SOLID.has(this.tileAt(i, j))) { e.x = (i + 1) * TS + 0.01; e.vx = 0; return true; }
    }
    return false;
  }
  moveY(e, dy) {
    const prevBot = e.y + e.h;
    e.y += dy;
    const left = Math.floor(e.x / TS), right = Math.floor((e.x + e.w - 1) / TS);
    if (dy > 0) {
      const j = Math.floor((e.y + e.h) / TS);
      for (let i = left; i <= right; i++) {
        const t = this.tileAt(i, j);
        if (SOLID.has(t) || (ONEWAY.has(t) && prevBot <= j * TS + 1)) {
          e.y = j * TS - e.h - 0.01; e.vy = 0; return true;
        }
      }
    } else if (dy < 0) {
      const j = Math.floor(e.y / TS);
      for (let i = left; i <= right; i++) if (SOLID.has(this.tileAt(i, j))) { e.y = (j + 1) * TS + 0.01; e.vy = 0; return true; }
    }
    return false;
  }
  onGround(e) {
    const j = Math.floor((e.y + e.h + 1) / TS);
    const left = Math.floor(e.x / TS), right = Math.floor((e.x + e.w - 1) / TS);
    for (let i = left; i <= right; i++) {
      const t = this.tileAt(i, j);
      if (SOLID.has(t)) return true;
      if (ONEWAY.has(t) && e.y + e.h <= j * TS + 2) return true;
    }
    return false;
  }
  edgeAhead(e) { // para inimigos não caírem de plataformas
    const i = Math.floor((e.x + (e.vx > 0 ? e.w + 2 : -2)) / TS);
    const j = Math.floor((e.y + e.h + 2) / TS);
    const t = this.tileAt(i, j);
    return !(SOLID.has(t) || ONEWAY.has(t));
  }

  overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---------- update ----------
  update() {
    this.time++;
    if (this.toastT > 0) this.toastT--;
    const p = this.p, G = this.G;

    if (this.state === 'dying') {
      this.stateT++;
      p.vy += GRAV; p.y += p.vy;
      if (this.stateT > 110) {
        if (G.lives <= 0) { this.state = 'gameover'; this.stateT = 0; audio.playSong('gameover'); }
        else { this.reset(false); this.state = 'play'; audio.playSong(this.def.music); }
      }
      this.updateParts();
      return;
    }
    if (this.state === 'gameover') {
      this.stateT++;
      if (this.stateT > 60 && input.pressed('a')) {
        G.lives = 3;
        this.collected.clear(); this.checkpoint = null;
        this.fichasFase = 0;
        this.reset(true); this.state = 'play';
        audio.playSong(this.def.music);
      }
      return;
    }
    if (this.state === 'win') {
      this.stateT++;
      // Murrinha sai andando
      if (p.x < this.goalX + 40) { p.x += 1.2; p.anim++; }
      if (this.stateT > 100 && input.pressed('a')) G.onLevelClear(this.def.id, this.fichasFase, this.tickets);
      this.updateParts();
      return;
    }

    // ----- player -----
    if (p.stun > 0) p.stun--;
    const stunned = p.stun > 0;
    const dir = stunned ? 0 : (input.held('right') ? 1 : 0) - (input.held('left') ? 1 : 0);
    const slow = p.charm > 0 ? 0.72 : (p.stink > 0 ? 0.6 : 1);   // apaixonado/fedido => lerdo (mas dá pra correr)
    const max = (input.held('b') ? RUN : WALK) * (p.boost > 0 ? 1.55 : 1) * slow;
    if (dir !== 0) {
      p.dir = dir;
      p.vx += ACC * dir * (Math.sign(p.vx) !== dir ? 2.2 : 1); // skid mais rápido
      p.vx = Math.max(-max, Math.min(max, p.vx));
      p.anim++;
    } else {
      if (Math.abs(p.vx) < FRIC) p.vx = 0; else p.vx -= FRIC * Math.sign(p.vx);
    }
    p.ground = this.onGround(p);
    // agachar (↓ no chão) = esconder: some do campo de visão da Vanita quando parado
    p.crouch = !stunned && input.held('down') && p.ground;
    p.hiding = p.crouch && Math.abs(p.vx) < 0.5;
    if (!stunned && input.pressed('a') && p.ground) {
      p.vy = -(4.7 + Math.abs(p.vx) * 0.30);
      p.jumpHeld = true;
      audio.sfx('jump');
    }
    if (!input.held('a')) p.jumpHeld = false;
    p.vy += (p.vy < 0 && p.jumpHeld) ? GRAV_HOLD : GRAV;
    p.vy = Math.min(p.vy, TERM);
    this.moveX(p, p.vx);
    this.moveY(p, p.vy);
    p.x = Math.max(0, Math.min(p.x, this.pw - p.w));
    if (p.inv > 0) p.inv--;
    if (p.boost > 0) p.boost--;
    if (p.charm > 0) p.charm--;
    if (p.stink > 0) p.stink--;

    // caiu no buraco
    if (p.y > this.ph + 8) this.hurt(true, 'ESCORREGOU E CAIU!');

    // chegou ao objetivo (por X, ou por Y no caso das travessias verticais)
    const reachedX = !this.def.goalY && p.x + p.w / 2 >= this.goalX;
    const reachedY = this.def.goalY && p.y <= this.def.goalY && p.ground;
    if ((reachedX || reachedY) && this.state === 'play') {
      this.state = 'win'; this.stateT = 0;
      audio.stopSong(); audio.playSong('clear');
    }

    // ----- entidades -----
    for (const e of this.ents) {
      switch (e.t) {
        case 'ficha': e.anim++; if (this.overlap(p, e)) { this.collect(e); this.fichasFase++; G.fichas++; audio.sfx('coin'); if (G.fichas >= 100) { G.fichas -= 100; G.lives++; audio.sfx('life'); this.say('+1 VIDA!'); } } break;
        case 'choc': if (this.overlap(p, e)) { this.collect(e); G.lives++; audio.sfx('life'); this.say('CHOCOLATE DAS BRASILEIRAS! +1 VIDA'); } break;
        case 'pipoca': if (this.overlap(p, e)) { this.collect(e); p.boost = 480; audio.sfx('powerup'); this.say('PIPOCA DO GALEGO! TURBO!'); } break;
        case 'nota': e.anim++; if (this.overlap(p, e)) { this.collect(e); this.fichasFase += 10; G.fichas += 10; audio.sfx('powerup'); this.say('UMA NOTA! VALE 10 FICHAS!'); if (G.fichas >= 100) { G.fichas -= 100; G.lives++; audio.sfx('life'); } } break;
        case 'maca': if (this.overlap(p, e)) { this.collect(e); p.shield = true; audio.sfx('powerup'); this.say('MACA DO LANCHE! AGUENTA 1 SUSTO'); } break;
        case 'ticket': e.anim++; if (this.overlap(p, e)) { this.collect(e); this.tickets++; audio.sfx('life'); this.say('TICKET ESTUDANTIL! (' + this.tickets + '/3)'); } break;
        case 'check': if (!e.on && this.overlap(p, e)) { e.on = true; this.checkpoint = { x: e.x, y: e.y - 8 }; audio.sfx('checkpoint'); this.say('CHECKPOINT!'); } break;
        case 'tromba': this.upTromba(e, p); break;
        case 'liginha': this.upLiginha(e, p); break;
        case 'chaser': this.upChaser(e, p); break;
        case 'bigwalk': this.upBigwalk(e, p); break;
        case 'crosser': this.upCrosser(e, p); break;
        case 'whistler': this.upWhistler(e, p); break;
        case 'galego': this.upGalego(e, p); break;
        case 'passenger': this.upPassenger(e, p); break;
        case 'cobrador': e.anim++; break; // decorativo (fica atrás da catraca)
        case 'roller': this.upRoller(e, p); break;
        case 'pombo': this.upPombo(e, p); break;
        case 'damas': e.anim++; break;
      }
    }
    this.ents = this.ents.filter(e => !e.gone);

    // ondas de assovio (Carrapeta) — anel baixo que corre pelo chão; PULE por cima
    for (const wv of (this.waves || [])) {
      wv.x += wv.vx; wv.r = 5 + Math.sin(wv.life * 0.3); wv.life--;
      if (wv.life <= 0 || wv.x < -20 || wv.x > this.pw + 20) { wv.gone = true; continue; }
      // NÃO mata: paralisa e empurra (como no filme). Pule por cima pra não parar.
      if (p.stun <= 0 && p.inv <= 0 && this.state === 'play' && Math.abs((p.x + p.w / 2) - wv.x) < 8 && p.y + p.h > wv.y + 4) {
        p.stun = 26; p.inv = 44; p.vx = -Math.sign(wv.vx) * 1.6; p.vy = -1.5;
        audio.sfx('hurt'); this.say('FIU-FIU! PAROU PRA OUVIR O CARRAPETA');
      }
    }
    if (this.waves) this.waves = this.waves.filter(w => !w.gone);

    // grãos de pipoca (Galego) — colete para fichas
    for (const gr of (this.grains || [])) {
      gr.vy += 0.12; gr.x += gr.vx; gr.y += gr.vy;
      const gj = Math.floor((gr.y + 4) / TS), gi = Math.floor(gr.x / TS);
      if (SOLID.has(this.tileAt(gi, gj)) || ONEWAY.has(this.tileAt(gi, gj)) || gr.y > this.ph) { gr.gone = true; continue; }
      if (this.overlap(p, { x: gr.x - 2, y: gr.y - 2, w: 6, h: 6 })) {
        gr.gone = true; this.fichasFase++; G.fichas++; audio.sfx('coin');
        if (G.fichas >= 100) { G.fichas -= 100; G.lives++; audio.sfx('life'); }
      }
    }
    if (this.grains) this.grains = this.grains.filter(g => !g.gone);

    // beijos do Cacimba — apaixonam e deixam o Murrinha lerdo (não matam)
    for (const k of this.kisses) {
      k.x += k.vx; k.y += k.vy; k.vy += 0.006; k.life--;
      if (k.life <= 0 || k.x < -8 || k.x > this.pw + 8 || k.y > this.ph) { k.gone = true; continue; }
      if (p.inv <= 0 && this.state === 'play' && this.overlap(p, { x: k.x - 3, y: k.y - 3, w: 7, h: 7 })) {
        k.gone = true;
        if (p.charm <= 0) this.say('APAIXONOU! MURRINHA FICOU LERDO...');
        p.charm = 210; audio.sfx('hurt'); this.burst(k.x, k.y, '#f25e8a', 5);
      }
    }
    this.kisses = this.kisses.filter(k => !k.gone);

    // nuvens de peido do Gordo — deixam fedido e lerdo (não matam)
    for (const c of this.clouds) {
      c.life--; c.r = Math.min(10, c.r + 0.14);
      if (c.life <= 0) { c.gone = true; continue; }
      if (p.inv <= 0 && this.state === 'play' && this.overlap(p, { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 })) {
        if (p.stink <= 0) this.say('ECA! O PEIDO DO GORDO! QUE FEDOR...');
        p.stink = 100;
      }
    }
    this.clouds = this.clouds.filter(c => !c.gone);

    // canivetes dos trombadinhas (FISK) — voam reto; PULE ou não deixe te acertar
    for (const kn of this.knives) {
      kn.x += kn.vx; kn.spin = (kn.spin || 0) + 0.5;
      if (kn.x < this.camX - 30 || kn.x > this.camX + W + 30) { kn.gone = true; continue; }
      if (p.inv <= 0 && this.state === 'play' && this.overlap(p, { x: kn.x - 4, y: kn.y - 2, w: 8, h: 5 })) {
        kn.gone = true; this.hurt(false, 'CANIVETE DO TROMBADINHA!');
      }
    }
    this.knives = this.knives.filter(k => !k.gone);

    // cagadas de pombo
    for (const q of this.poops) {
      q.vy += 0.16; q.y += q.vy;
      const j = Math.floor((q.y + 3) / TS), i = Math.floor(q.x / TS);
      if (SOLID.has(this.tileAt(i, j)) || ONEWAY.has(this.tileAt(i, j)) || q.y > this.ph) {
        q.gone = true; audio.sfx('splat');
        this.burst(q.x, j * TS - 2, '#f8f8f8', 5);
      } else if (p.inv <= 0 && this.overlap(p, { x: q.x - 2, y: q.y - 2, w: 4, h: 4 })) {
        q.gone = true; audio.sfx('splat'); this.hurt(false, 'CAGADA DE POMBO EM CHEIO!');
      }
    }
    this.poops = this.poops.filter(q => !q.gone);

    // ----- tráfego da avenida -----
    for (const z of this.traffic) {
      z.t++;
      if (z.t >= z.every) {
        z.t = 0;
        const types = z.types || ['carro', 'carro', 'carro', 'moto', 'onibus'];
        const type = types[Math.floor(Math.random() * types.length)];
        const dims = { carro: [32, 16], moto: [20, 13], onibus: [56, 26] }[type];
        const spd = z.speed * (type === 'moto' ? 1.5 : type === 'onibus' ? 0.8 : 1) * (0.85 + Math.random() * 0.4);
        // o veículo vive SEMPRE dentro da zona: nasce numa ponta, some na outra
        // (assim nunca invade canteiro central nem calçada)
        this.cars.push({
          type, w: dims[0], h: dims[1],
          x: z.dir > 0 ? z.c0 * TS + 1 : z.c1 * TS - dims[0] - 1,
          y: z.row * TS - dims[1],
          vx: z.dir * spd,
          skin: Math.floor(Math.random() * 4),
          z0: z.c0 * TS, z1: z.c1 * TS,
        });
      }
    }
    // FAIXAS da avenida: carros atravessam a largura toda, nascem/somem FORA da tela
    for (const lane of this.lanes) {
      lane.t++;
      if (lane.t >= lane.every) {
        lane.t = 0;
        const types = lane.types || ['carro', 'carro', 'carro', 'moto', 'onibus'];
        const type = types[Math.floor(Math.random() * types.length)];
        const dims = { carro: [32, 16], moto: [20, 13], onibus: [56, 26] }[type];
        const spd = lane.speed * (type === 'moto' ? 1.4 : type === 'onibus' ? 0.85 : 1) * (0.9 + Math.random() * 0.25);
        this.cars.push({
          type, w: dims[0], h: dims[1],
          x: lane.dir > 0 ? -dims[0] - 6 : this.pw + 6,
          y: (lane.topRow + 2) * TS - dims[1],   // "rodas" no piso da faixa
          vx: lane.dir * spd,
          skin: Math.floor(Math.random() * 4),
          lane: true,
        });
      }
    }
    for (const c of this.cars) {
      c.x += c.vx;
      // legado (zonas) despawna nas bordas da zona; faixas despawnam fora do mapa
      if (c.lane) { if (c.x < -c.w - 10 || c.x > this.pw + 10) { c.gone = true; continue; } }
      else if (c.x <= c.z0 || c.x + c.w >= c.z1) { c.gone = true; continue; }
      if (p.inv <= 0 && this.state === 'play' &&
        this.overlap(p, { x: c.x + 2, y: c.y + 2, w: c.w - 4, h: c.h - 2 })) {
        this.hurt(false, 'ATROPELADO NA FLORIANO!');
      }
    }
    this.cars = this.cars.filter(c => !c.gone);
    this.updateParts();
  }

  upTromba(e, p) {
    if (e.dead) { e.dead++; if (e.dead > 40) e.gone = true; return; }
    e.anim++;
    if (this.onGround(e)) {
      if (this.edgeAhead(e)) { e.vx *= -1; e.dir *= -1; }
    } else e.vy = (e.vy || 0);
    e.vy = (e.vy || 0) + GRAV; e.vy = Math.min(e.vy, TERM);
    if (this.moveX(e, e.vx)) { e.vx *= -1; e.dir *= -1; }
    this.moveY(e, e.vy);
    // na FISK, o trombadinha arremessa CANIVETE na direção do Murrinha
    if (this.def.throwKnives) {
      const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
      e.knifeT = (e.knifeT || 60 + (e.x % 90)) - 1;
      if (e.knifeT <= 0 && Math.abs(dx) < 130 && Math.abs(p.y - e.y) < 30 && this.state === 'play') {
        e.knifeT = 150;
        const dir = Math.sign(dx) || 1; e.dir = dir;
        this.knives.push({ x: e.x + 5, y: e.y + 6, vx: dir * 3.2, spin: 0 });
        audio.sfx('kick');
      }
    }
    if (p.inv <= 0 && this.state === 'play' && this.overlap(p, e)) {
      // pisão generoso: se o pé do Murrinha está acima do meio do trombadinha (e não subindo forte), pisa
      if (p.vy > -1.5 && p.y + p.h < e.y + e.h * 0.6) {
        e.dead = 1; p.vy = -3.6; audio.sfx('stomp');
        this.burst(e.x + 5, e.y + 4, '#c05010', 4);
        this.shake = 4; this.combo = (this.combo || 0) + 1;
      } else this.hurt(false, 'UM TROMBADINHA TE DERRUBOU!');
    }
  }

  // VANITA — stealth: campo de visão (cone) + barra de suspeita.
  // Ela varre o corredor; de vez em quando abaixa o olhar pra anotar na prancheta
  // (cone off = sua brecha). Ela te vê se você estiver NO CONE e NÃO escondido
  // (agachado). Ser visto enche a suspeita; cheia = APITO + perseguição.
  upLiginha(e, p) {
    e.anim++;
    if (e.susp === undefined) { e.susp = 0; e.look = 0; }
    const dx = (p.x + p.w / 2) - (e.x + e.w / 2), dy = Math.abs((p.y + p.h / 2) - (e.y + e.h / 2));
    // ciclo da prancheta: ~4.7s olhando, ~1.4s anotando (cega)
    e.look = (e.look + 1) % 366;
    e.looking = e.look >= 84;
    // cone: à frente, alcance 96, altura 30
    const inCone = Math.sign(dx) === e.dir && Math.abs(dx) < 96 && dy < 30;
    const spots = e.looking && inCone && !p.hiding && this.state === 'play';
    e.spots = spots;

    if (e.mode === 'patrol') {
      if (spots) {
        const near = 1 - Math.abs(dx) / 96 * 0.5;               // mais perto = enche mais rápido
        e.susp += (Math.abs(p.vx) > WALK + 0.05 ? 4.5 : 2.6) * near;  // correndo denuncia mais
      } else {
        e.susp -= 3;
      }
      e.susp = Math.max(0, Math.min(100, e.susp));
      if (e.susp >= 100) { e.mode = 'chase'; e.saw = 40; audio.sfx('apito'); this.say('PAROU, GAZEADOR!'); }
      // patrulha um trecho (pausa ao anotar); vira nos limites (home±range) e nas bordas/paredes
      if (e.homeX === undefined) e.homeX = e.x;
      const range = e.range || 64;
      if ((e.x - e.homeX) > range && e.dir > 0) e.dir = -1;
      else if ((e.x - e.homeX) < -range && e.dir < 0) e.dir = 1;
      const step = e.looking ? (e.dir * 0.5) : 0;
      if (step) {
        if (this.onGround(e) && this.edgeAhead(e)) e.dir = -e.dir;
        else if (this.moveX(e, step)) e.dir = -e.dir;
      }
      e.vx = step;
    } else { // perseguição
      if (e.saw > 0) e.saw--;
      e.dir = Math.sign(dx) || e.dir;
      e.vx = e.dir * 1.15;
      if (this.onGround(e) && this.edgeAhead(e)) e.vx = 0; else this.moveX(e, e.vx);
      // perde de vista (longe, escondido ou fora do cone por um tempo) -> volta a patrulhar
      const lost = Math.abs(dx) > 170 || dy > 60 || (p.hiding && Math.abs(dx) > 40);
      e.susp = lost ? e.susp - 1.5 : 100;
      if (e.susp <= 0) { e.mode = 'patrol'; e.susp = 0; e.vx = e.dir * 0.5; }
    }
    e.vy = (e.vy || 0) + GRAV; e.vy = Math.min(e.vy, TERM);
    this.moveY(e, e.vy);
    // pega no toque (mas ainda dá pra pular por cima)
    if (p.inv <= 0 && this.state === 'play' && this.overlap(p, e) && p.y + p.h > e.y + 10)
      this.hurt(false, 'PEGO PELA VANITA!');
  }

  // perseguidor (fiscal, cacimba, ratinho). Os "agressivos" (Cacimba) caçam
  // de qualquer direção, mais rápido e com pouca desistência.
  upChaser(e, p) {
    e.anim++;
    const dx = (p.x + p.w / 2) - (e.x + e.w / 2), dy = Math.abs(p.y - e.y);
    const agg = e.aggressive;
    if (e.mode === 'patrol') {
      // agressivo: vê o jogador de qualquer lado; comum: só na direção que encara
      const sees = dy < (agg ? 70 : 44) && Math.abs(dx) < (e.range || 100) && (agg || Math.sign(dx) === e.dir);
      if (sees) { e.mode = 'chase'; e.saw = 40; audio.sfx('apito'); if (agg) this.say('CACIMBA VEM DANCAR COLADINHO! CORRE!'); }
      if (this.onGround(e) && this.edgeAhead(e)) { e.vx *= -1; e.dir *= -1; }
      if (this.moveX(e, e.vx)) { e.vx *= -1; e.dir *= -1; }
    } else {
      if (e.saw > 0) e.saw--;
      e.dir = Math.sign(dx) || e.dir;
      // rebola ao andar (dança) e persegue sem parar
      const wobble = agg ? Math.sin(e.anim * 0.3) * 0.25 : 0;
      e.vx = e.dir * ((e.spd || 1.15) + wobble);
      // no chão plano do fliperama não há beiras; se houver buraco, não cai
      if (this.onGround(e) && this.edgeAhead(e) && !agg) e.vx = 0; else this.moveX(e, e.vx);
      const leashX = agg ? 360 : 190, leashY = agg ? 100 : 60;
      if (Math.abs(dx) > leashX || dy > leashY) { e.mode = 'patrol'; e.vx = e.dir * 0.5; }
    }
    e.vy = (e.vy || 0) + GRAV; e.vy = Math.min(e.vy, TERM);
    this.moveY(e, e.vy);
    // CACIMBA lança beijos teleguiados: apaixona e deixa lerdo (não mata)
    if (e.skin === 'cacimba') {
      e.kiss = (e.kiss || 90) - 1;
      if (e.kiss <= 0 && Math.abs(dx) < 190 && dy < 70 && this.state === 'play') {
        e.kiss = e.mode === 'chase' ? 100 : 150;
        const d = Math.hypot(dx, (p.y + 8) - (e.y + 6)) || 1;
        this.kisses.push({ x: e.x + 6, y: e.y + 6, vx: dx / d * 1.7, vy: ((p.y + 8) - (e.y + 6)) / d * 1.7, life: 160 });
        audio.sfx('coin');
      }
    }
    if (p.inv <= 0 && this.state === 'play' && this.overlap(p, e) && p.y + p.h > e.y + 15) {
      const msg = { fiscal: 'O FISCAL TE PEGOU!', cacimba: 'CACIMBA TE ENCANTOU!', ratinho: 'RATINHO ROUBOU SEU TENIS!' }[e.skin] || 'PEGO!';
      this.hurt(false, msg);
    }
  }

  // bola de fliperama que rola: quica nas paredes/beiras e empurra o Murrinha (não mata)
  upRoller(e, p) {
    e.anim += Math.abs(e.vx);
    if (this.onGround(e) && this.edgeAhead(e)) { e.vx *= -1; e.dir *= -1; }
    if (this.moveX(e, e.vx)) { e.vx *= -1; e.dir *= -1; }
    e.vy = (e.vy || 0) + GRAV; e.vy = Math.min(e.vy, TERM);
    this.moveY(e, e.vy);
    if (p.stun <= 0 && p.inv <= 0 && this.state === 'play' && this.overlap(p, e)) {
      p.stun = 20; p.inv = 40; p.vx = e.dir * 2.4; p.vy = -2.2;
      this.shake = 5; audio.sfx('kick'); this.say('A BOLA DE FLIPERAMA TE ATROPELOU!');
    }
  }

  // obstáculo largo que anda (Gordo) — jump-over; solta PEIDO que deixa lerdo
  upBigwalk(e, p) {
    e.anim++;
    if (this.onGround(e) && this.edgeAhead(e)) { e.vx *= -1; e.dir *= -1; }
    if (this.moveX(e, e.vx)) { e.vx *= -1; e.dir *= -1; }
    e.vy = (e.vy || 0) + GRAV; e.vy = Math.min(e.vy, TERM);
    this.moveY(e, e.vy);
    e.fart = (e.fart || 100) - 1;
    if (e.fart <= 0 && this.state === 'play') {
      e.fart = 130;
      this.clouds.push({ x: e.x + (e.dir < 0 ? e.w : -6), y: e.y + e.h - 8, life: 110, r: 3 });
      audio.sfx('splat');
    }
    if (p.inv <= 0 && this.state === 'play' && this.overlap(p, e) && p.y + p.h > e.y + 8)
      this.hurt(false, 'TROMBOU NO GORDO!');
  }

  // Tavinho: cruza a tela em alta velocidade. NÃO mata: prende na conversa (para o tempo)
  upCrosser(e, p) {
    e.anim++;
    e.x += e.vx;
    if (e.x < e.x0) { e.x = e.x0; e.vx *= -1; e.dir = 1; }
    if (e.x > e.x1) { e.x = e.x1; e.vx *= -1; e.dir = -1; }
    if (p.stun <= 0 && p.inv <= 0 && this.state === 'play' && this.overlap(p, e) && p.y + p.h > e.y + 10) {
      p.stun = 40; p.inv = 60; p.vx = -Math.sign(e.vx) * 1.2;
      audio.sfx('hurt'); this.say('TAVINHO TE PRENDEU NA CONVERSA! BLA BLA BLA...');
    }
  }

  // Carrapeta: solta ondas de assovio que correm pelo chão (pule por cima)
  upWhistler(e, p) {
    e.anim++;
    e.dir = Math.sign((p.x) - e.x) || -1;
    // só assovia quando o Murrinha está por perto (não spamma de longe) e com folga
    if (--e.fire <= 0) {
      if (Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 150) {
        e.fire = 175;
        if (!this.waves) this.waves = [];
        this.waves.push({ x: e.x + e.w / 2, y: e.y + e.h - 6, r: 3, vx: e.dir * 1.05, life: 240 });
        audio.sfx('apito');
      } else e.fire = 20;
    }
  }

  // Galego: fica na barraca soltando pipoca que arca e cai (colete!)
  upGalego(e, p) {
    e.anim++;
    if (--e.pop <= 0) {
      e.pop = 45 + Math.floor(Math.random() * 30);
      if (!this.grains) this.grains = [];
      this.grains.push({ x: e.x + 6, y: e.y + 2, vx: (Math.random() - 0.3) * 1.8, vy: -2.6 - Math.random() });
    }
  }

  // passageiro do ônibus: balança com as freadas; empurra o Murrinha (não mata)
  upPassenger(e, p) {
    e.anim++;
    e.x = e.homeX + Math.sin((e.anim + e.skin * 20) * 0.06) * 3;
    if (this.state === 'play' && this.overlap(p, e)) {
      // empurra pra trás em vez de matar (o ônibus é lotado, não letal)
      p.x -= Math.sign((p.x + p.w / 2) - (e.x + e.w / 2)) * 1.2 || -1.2;
    }
  }

  upPombo(e, p) {
    e.anim++;
    if (e.mode === 'perch') {
      const dx = (p.x) - e.x;
      if (Math.abs(dx) < 78 && p.y > e.y - 20) {
        e.mode = 'fly'; e.vx = Math.sign(dx) || 1; e.drop = 20;
        audio.sfx('flap');
      }
    } else {
      e.x += e.vx * 1.05;
      e.y = e.homeY + Math.sin(e.anim * 0.15) * 3;
      e.drop--;
      // solta a cagada um pouco À FRENTE do Murrinha (dá pra parar e deixar cair)
      const rel = (p.x + p.w / 2) - (e.x + 5);
      if (e.drop <= 0 && rel > -6 && rel < 40) {
        this.poops.push({ x: e.x + 5, y: e.y + 8, vy: 0.3 });
        e.drop = 80;
      }
      if (e.x < -40 || e.x > this.pw + 40) e.gone = true;
    }
  }

  collect(e) { e.gone = true; this.collected.add(e.key); this.burst(e.x + 3, e.y + 3, '#f2d24e', 4); }

  hurt(pit = false, msg = null) {
    const G = this.G;
    if (this.state !== 'play') return;
    this.combo = 0;
    // a maçã do lanche segura um susto (menos queda em buraco)
    if (this.p.shield && !pit) {
      this.p.shield = false;
      this.p.inv = 110;
      this.shake = 6;
      audio.sfx('hurt');
      this.say('UFA! A MACA DO LANCHE SEGUROU!');
      return;
    }
    G.lives--;
    this.state = 'dying'; this.stateT = 0;
    this.deathMsg = msg || 'MURRINHA FOI PEGO!';
    this.shake = 9;
    const p = this.p;
    p.vy = -4.4; p.vx = 0;
    if (pit) p.y = this.ph - 40;
    audio.stopSong(); audio.playSong('death'); audio.sfx('hurt');
  }

  say(msg) { this.toast = msg; this.toastT = 120; }
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) this.parts.push({
      x, y, vx: (Math.random() - 0.5) * 2.4, vy: -Math.random() * 2.2, life: 24 + Math.random() * 12, color
    });
  }
  updateParts() {
    for (const q of this.parts) { q.x += q.vx; q.y += q.vy; q.vy += 0.12; q.life--; }
    this.parts = this.parts.filter(q => q.life > 0);
  }

  // ---------- draw ----------
  draw(ctx) {
    const p = this.p;
    let camX = Math.max(0, Math.min(p.x - W * 0.42, this.pw - W));
    let camY = Math.max(0, Math.min(p.y - H * 0.55, this.ph - H));
    // screen shake (juice)
    if (this.shake > 0) {
      const s = this.shake;
      camX += (((this.time * 13) % 5) - 2) * s * 0.4;
      camY += (((this.time * 7) % 5) - 2) * s * 0.4;
      this.shake = Math.max(0, this.shake - 0.5);
    }
    this.camX = camX; this.camY = camY;

    // fundo: sequência de cenários (gerados por IA) OU desenho em código
    const paths = this.def.bgImgs || (this.def.bgImg ? [this.def.bgImg] : []);
    const imgs = paths.map(p => assets.get(p));
    const useImg = paths.length && imgs.every(Boolean);
    if (useImg) { ctx.fillStyle = this.def.bgFill || '#12101c'; ctx.fillRect(0, 0, W, H); }
    else this.def.bg(ctx, camX, camY, this.time);

    ctx.save();
    ctx.translate(-Math.round(camX), -Math.round(camY));

    // cenário de IA em ESPAÇO DE MUNDO (sobe/desce junto com o chão -> pulo correto)
    if (useImg) this.drawBgImagesWorld(ctx, imgs);

    // tiles (somente os visíveis)
    const i0 = Math.floor(camX / TS), i1 = Math.min(this.w - 1, Math.ceil((camX + W) / TS));
    const j0 = Math.floor(camY / TS), j1 = Math.min(this.h - 1, Math.ceil((camY + H) / TS));
    const hasImg = !!(this.def.bgImg || this.def.bgImgs); // cenário de IA cobre a cenografia
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      let t = this.tileAt(i, j);
      // com cenário de IA escondemos só a DECO; o PISO em código continua
      // desenhado (na linha da colisão) pra o personagem sempre pisar firme
      if (hasImg && DECO_TILES.has(t)) continue;
      // miolo de blocos empilhados não repete o topo (grama/friso/onda)
      if ((t === 'E' || t === '#') && this.tileAt(i, j - 1) === t) t += '2';
      else if (t === 'L') t = this.tileAt(i, j - 1) === 'L' ? 'L3' : (i % 2 ? 'L2' : 'L');
      const img = S.TILES[t];
      if (img) ctx.drawImage(img, i * TS, j * TS);
    }

    // decoração da fase (leões, letreiros...)
    if (this.def.deco) this.def.deco(ctx, this);

    // entidades
    for (const e of this.ents) this.drawEnt(ctx, e);

    // cagadas
    for (const q of this.poops) ctx.drawImage(S.poop, Math.round(q.x - 2), Math.round(q.y - 2));

    // ondas de assovio
    for (const wv of (this.waves || [])) {
      ctx.strokeStyle = '#a8e0f8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(Math.round(wv.x), Math.round(wv.y), Math.round(wv.r), 0, Math.PI * 2); ctx.stroke();
    }
    // grãos de pipoca
    for (const gr of (this.grains || [])) ctx.drawImage(S.pipocaGrao, Math.round(gr.x - 2), Math.round(gr.y - 2));

    // beijos do Cacimba (corações)
    for (const k of this.kisses) ctx.drawImage(S.beijo, Math.round(k.x - 2), Math.round(k.y - 2 + Math.sin(k.life * 0.3)));

    // canivetes
    for (const kn of this.knives) ctx.drawImage(kn.vx < 0 ? S.caniveteL : S.canivete, Math.round(kn.x - 4), Math.round(kn.y - 2));

    // nuvens de peido do Gordo (verde fedido)
    for (const c of this.clouds) {
      const a = Math.min(0.6, c.life / 110 * 0.6);
      ctx.globalAlpha = a; ctx.fillStyle = '#8ab048';
      const r = Math.round(c.r);
      ctx.fillRect(Math.round(c.x - r), Math.round(c.y - r), r * 2, r * 2);
      ctx.fillStyle = '#a8c860'; ctx.fillRect(Math.round(c.x - r + 2), Math.round(c.y - r + 2), r, r);
      ctx.globalAlpha = 1;
    }

    // tráfego
    for (const c of this.cars) {
      const img = c.type === 'moto' ? (c.vx < 0 ? S.moto : S.motoR)
        : c.type === 'onibus' ? (c.vx < 0 ? S.onibus : S.onibusR)
        : (c.vx < 0 ? S.carros : S.carrosR)[c.skin];
      ctx.drawImage(img, Math.round(c.x), Math.round(c.y));
    }

    // partículas
    for (const q of this.parts) {
      ctx.fillStyle = q.color;
      ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
    }

    // player
    if (this.state !== 'dying' || (this.stateT % 8 < 6)) this.drawPlayer(ctx);

    ctx.restore();

    this.drawHUD(ctx);

    if (this.state === 'gameover') this.drawGameOver(ctx);
    if (this.state === 'win' && this.stateT > 40) this.drawWin(ctx);
    if (this.state === 'dying' && this.deathMsg && this.stateT > 14) {
      const bw = Math.max(120, textWidth(this.deathMsg) + 16);
      drawBox(ctx, W / 2 - bw / 2, 58, bw, 18, '#7a1010', '#f2d24e');
      drawTextC(ctx, this.deathMsg, W / 2, 64, '#fff');
    }
  }

  // desenha a SEQUÊNCIA de cenários em ESPAÇO DE MUNDO: preenche a altura
  // do nível (chão da imagem no chão do mundo) e sobe/desce com a câmera,
  // então pular NÃO faz o piso "descer". Não repete de tela em tela.
  drawBgImagesWorld(ctx, imgs) {
    const hh = this.ph;
    const tws = imgs.map(im => Math.max(1, Math.round(im.width * hh / im.height)));
    const seqW = tws.reduce((a, b) => a + b, 0);
    let x = Math.floor(this.camX / seqW) * seqW - seqW;
    let idx = 0;
    const right = this.camX + W + 2;
    while (x < right) {
      const k = idx % imgs.length;
      ctx.drawImage(imgs[k], Math.round(x), 0, tws[k], hh);
      x += tws[k]; idx++;
    }
  }

  drawPlayer(ctx) {
    const p = this.p;
    if (p.inv > 0 && (p.inv % 6 < 3) && this.state === 'play') return;
    let img;
    const right = p.dir >= 0;
    const walk = assets.get('art/char_murrinha_walk.png');   // ciclo de 4 quadros
    const idle = assets.get('art/char_murrinha_idle.png');
    if (walk && idle) {
      const WF = 4, wfw = Math.floor(walk.width / WF);
      const A = n => assets.get('art/char_murrinha_' + n + '.png') || idle;
      let src, fw, fr = 0, bob = 0;
      if (!p.ground) {                       // no ar: subindo = pulo, descendo = queda
        src = p.vy < 0 ? A('jump') : A('fall'); fw = src.width;
      } else if (p.hiding) {                 // escondido (agachado e parado)
        src = A('hide'); fw = src.width;
      } else if (p.crouch) {                 // agachado
        src = A('crouch'); fw = src.width;
      } else if (Math.abs(p.vx) > 0.3) {     // andando: ciclo completo de 4 quadros (bob já está na arte)
        src = walk; fw = wfw;
        fr = (Math.floor(p.x / WALK_STRIDE) % WF + WF) % WF;
      } else {                               // parado
        src = idle; fw = idle.width;
      }
      const lw = fw / SS, lh = src.height / SS;
      const dx = Math.round(p.x + p.w / 2 - lw / 2);
      const dy = Math.round(p.y + p.h - lh - bob);
      const sxp = fr * fw;
      if (right) ctx.drawImage(src, sxp, 0, fw, src.height, dx, dy, lw, lh);
      else { ctx.save(); ctx.translate(dx + lw, dy); ctx.scale(-1, 1); ctx.drawImage(src, sxp, 0, fw, src.height, 0, 0, lw, lh); ctx.restore(); }
    } else {
      if (this.state === 'dying') img = right ? S.murrJump : S.murrJumpL;
      else if (!p.ground) img = right ? S.murrJump : S.murrJumpL;
      else if (Math.abs(p.vx) > 0.2) img = (Math.floor(p.anim / 6) % 2 === 0) ? (right ? S.murrWalk1 : S.murrWalk1L) : (right ? S.murrWalk2 : S.murrWalk2L);
      else img = right ? S.murrIdle : S.murrIdleL;
      ctx.drawImage(img, Math.round(p.x - 3), Math.round(p.y - 2));
    }
    if (p.boost > 0 && p.boost % 4 < 2) {
      ctx.fillStyle = '#f2d24e';
      ctx.fillRect(Math.round(p.x - p.dir * 8), Math.round(p.y + 14), 3, 3);
    }
    // apaixonado: corações subindo
    if (p.charm > 0) {
      for (let k = 0; k < 2; k++) {
        const hy = p.y - 4 - ((this.time * 0.6 + k * 20) % 22);
        ctx.drawImage(S.beijo, Math.round(p.x + 2 + Math.sin((this.time + k * 30) * 0.15) * 5), Math.round(hy));
      }
    }
    // fedido: linhas de fedor onduladas
    if (p.stink > 0) {
      ctx.fillStyle = '#8ab048';
      for (let k = 0; k < 3; k++) {
        const sx = Math.round(p.x + k * 4 - 1 + Math.sin((this.time + k * 8) * 0.3) * 2);
        ctx.fillRect(sx, Math.round(p.y - 6 - (this.time + k * 7) % 10), 1, 3);
      }
    }
  }

  drawEnt(ctx, e) {
    const f = Math.floor(e.anim / 8) % 2;
    if (e.t !== 'pombo') nameTag(ctx, e);
    switch (e.t) {
      case 'ficha': {
        const fr = Math.floor(e.anim / 5) % 4;
        ctx.drawImage(S.ficha[fr], Math.round(e.x), Math.round(e.y + Math.sin(e.anim * 0.08) * 1.5));
        break;
      }
      case 'choc': ctx.drawImage(S.chocolate, Math.round(e.x), Math.round(e.y)); break;
      case 'pipoca': ctx.drawImage(S.pipocaBag, Math.round(e.x), Math.round(e.y)); break;
      case 'nota': ctx.drawImage(S.nota, Math.round(e.x), Math.round(e.y + Math.sin(e.anim * 0.07) * 1.5)); break;
      case 'maca': ctx.drawImage(S.maca, Math.round(e.x), Math.round(e.y)); break;
      case 'ticket': ctx.drawImage(S.ticket, Math.round(e.x), Math.round(e.y + Math.sin(e.anim * 0.1) * 2)); break;
      case 'check': ctx.drawImage(e.on ? S.checkSignOn : S.checkSign, Math.round(e.x), Math.round(e.y)); break;
      case 'tromba': {
        if (e.dead) { foot(ctx, e, S.troSquash, -1); break; }
        const ai = aiInfo(e);
        if (ai) drawAI(ctx, e, ai, e.dir < 0);
        else foot(ctx, e, e.dir < 0 ? (f ? S.troWalk1 : S.troWalk2) : (f ? S.troWalk1L : S.troWalk2L), -1);
        break;
      }
      case 'liginha': {
        // campo de visão (cone) — desenhado ATRÁS dela
        if (e.looking || e.mode === 'chase') {
          const eyeX = e.dir >= 0 ? e.x + e.w - 1 : e.x + 1;
          const eyeY = e.y + 6, len = 96 * (e.dir >= 0 ? 1 : -1);
          const t = (e.susp || 0) / 100;
          const alpha = e.mode === 'chase' ? 0.42 : 0.24 + t * 0.18;
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY);
          ctx.lineTo(eyeX + len, eyeY - 18);
          ctx.lineTo(eyeX + len, eyeY + 18);
          ctx.closePath();
          // amarelo brilhante -> vermelho conforme a suspeita (sem perder brilho)
          ctx.fillStyle = `rgba(255,${Math.round(230 - 150 * t)},${Math.round(120 - 95 * t)},${alpha})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(255,${Math.round(240 - 130 * t)},${Math.round(150 - 110 * t)},0.75)`;
          ctx.lineWidth = 1; ctx.stroke();
        }
        const vwalk = assets.get('art/char_vanita_walk.png');
        const vidle = assets.get('art/char_vanita_idle.png');
        if (vwalk && vidle) {
          const WF = 2, cw = Math.floor(vwalk.width / WF);
          let src, fw, fr = 0, bob = 0;
          if (e.mode === 'chase' && e.saw > 15) { src = assets.get('art/char_vanita_whistle.png') || vwalk; fw = src.width; }  // flagrou: aponta e grita
          else if (Math.abs(e.vx) > 0.2) { src = vwalk; fw = cw; fr = ((Math.floor(e.x / WALK_STRIDE)) % WF + WF) % WF; bob = fr; }
          else { src = vidle; fw = vidle.width; }
          const lw = fw / SS, lh = src.height / SS;
          const dx = Math.round(e.x + e.w / 2 - lw / 2), dy = Math.round(e.y + e.h - lh - bob);
          if (e.dir >= 0) ctx.drawImage(src, fr * fw, 0, fw, src.height, dx, dy, lw, lh);
          else { ctx.save(); ctx.translate(dx + lw, dy); ctx.scale(-1, 1); ctx.drawImage(src, fr * fw, 0, fw, src.height, 0, 0, lw, lh); ctx.restore(); }
        } else {
          const ai = aiInfo(e);
          if (ai) drawAI(ctx, e, ai, e.dir < 0);
          else foot(ctx, e, e.dir < 0 ? (f ? S.ligWalk1 : S.ligWalk2) : (f ? S.ligWalk1L : S.ligWalk2L), -2);
        }
        // indicador de suspeita: ? enchendo (pisca mais rápido) -> ! na perseguição
        if (e.mode === 'chase') {
          if (e.saw > 0 && e.saw % 10 < 6) drawText(ctx, '!', Math.round(e.x + 5), Math.round(e.y - 10), '#f22', 2);
        } else if ((e.susp || 0) > 6) {
          const blink = Math.max(4, 20 - Math.floor(e.susp / 6));
          if (Math.floor(e.anim / blink) % 2 === 0)
            drawText(ctx, '?', Math.round(e.x + 5), Math.round(e.y - 10), e.susp > 60 ? '#f80' : '#fd0', 2);
        }
        break;
      }
      case 'pombo':
        if (e.mode === 'perch') ctx.drawImage(S.pomboSit, Math.round(e.x), Math.round(e.y));
        else {
          const img = e.vx >= 0 ? (f ? S.pomboFly1L : S.pomboFly2L) : (f ? S.pomboFly1 : S.pomboFly2);
          ctx.drawImage(img, Math.round(e.x - 2), Math.round(e.y - 2));
        }
        break;
      case 'chaser': {
        const ai = aiInfo(e);
        if (ai) drawAI(ctx, e, ai, e.dir < 0);
        else { const set = { fiscal: S.fiscal, cacimba: S.cacimba, ratinho: S.ratinho }[e.skin]; foot(ctx, e, set[(e.dir < 0 ? 0 : 2) + f], -2); }
        if (e.mode === 'chase' && e.saw > 0 && e.saw % 10 < 6) drawText(ctx, '!', Math.round(e.x + 5), Math.round(e.y - 10), '#f22', 2);
        break;
      }
      case 'bigwalk': { const ai = aiInfo(e); if (ai) drawAI(ctx, e, ai, e.dir < 0); else foot(ctx, e, S.gordo[e.dir < 0 ? 0 : 1], -2); break; }
      case 'crosser': {
        const ai = aiInfo(e);
        if (ai) drawAI(ctx, e, ai, e.dir < 0); else foot(ctx, e, S.tavinho[(e.dir < 0 ? 0 : 2) + f], -2);
        if (Math.floor(e.anim / 12) % 2 === 0) drawText(ctx, 'BLA BLA', Math.round(e.x - 8), Math.round(e.y - 8), '#fff');
        break;
      }
      case 'whistler': { const ai = aiInfo(e); if (ai) drawAI(ctx, e, ai, e.dir < 0); else foot(ctx, e, S.carrapeta[(e.dir < 0 ? 0 : 2) + f], -2); break; }
      case 'galego': {
        const ai = aiInfo(e);
        if (ai) drawAI(ctx, e, ai, false); else foot(ctx, e, S.galego, 0);
        ctx.drawImage(S.panela, Math.round(e.x + 12), Math.round(e.y + e.h - S.panela.height));
        break;
      }
      case 'damas': { const ai = aiInfo(e); if (ai) drawAI(ctx, e, ai, false); else foot(ctx, e, S.damas, 0); break; }
      case 'passenger': { const ai = aiInfo(e); if (ai) drawAI(ctx, e, ai, e.skin % 2 ? true : false); else foot(ctx, e, S.passageiros[e.skin], -2); break; }
      case 'cobrador': { const ai = aiInfo(e); if (ai) drawAI(ctx, e, ai, false); else foot(ctx, e, S.cobrador, -1); break; }
      case 'roller': {
        const a = (e.anim * 0.12) % (Math.PI / 2); // rotação simulada
        ctx.save(); ctx.translate(Math.round(e.x + 5), Math.round(e.y + 5)); ctx.rotate(e.dir * a);
        ctx.drawImage(S.bola, -5, -5); ctx.restore();
        break;
      }
    }
  }

  drawHUD(ctx) {
    ctx.fillStyle = 'rgba(10,10,20,0.55)';
    ctx.fillRect(0, 0, W, 13);
    // vidas: rostinho + corações (até 5; acima disso vira xN)
    ctx.drawImage(S.murrFace, 4, 2);
    const lives = this.G.lives;
    if (lives <= 5) {
      for (let k = 0; k < lives; k++) ctx.drawImage(S.coracao, 15 + k * 8, 3);
    } else {
      ctx.drawImage(S.coracao, 15, 3);
      drawText(ctx, 'X' + lives, 24, 4, '#fff');
    }
    // maçã do lanche ativa (escudo)
    if (this.p.shield) ctx.drawImage(S.maca, 58, 2);
    // nome da fase
    drawTextC(ctx, this.def.name, W / 2, 4, '#f2d24e');
    // tickets da fase
    ctx.drawImage(S.ticket, W - 78, 4);
    drawText(ctx, this.tickets + '/3', W - 66, 4, this.tickets >= 3 ? '#8f8' : '#fff');
    // fichas
    ctx.drawImage(S.ficha[0], W - 42, 3);
    drawText(ctx, 'X' + String(this.G.fichas).padStart(2, '0'), W - 33, 4, '#fff');
    // toast
    if (this.toastT > 0 && this.toast) {
      const a = Math.min(1, this.toastT / 20);
      ctx.globalAlpha = a;
      drawBox(ctx, W / 2 - 80, 18, 160, 13);
      drawTextC(ctx, this.toast, W / 2, 22, '#f2d24e');
      ctx.globalAlpha = 1;
    }
  }

  drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(10,8,18,0.9)';
    ctx.fillRect(0, 0, W, H);
    drawTextO(ctx, 'SUSPENSO!', W / 2 - 54, 44, '#f22018', '#000', 3);
    if (this.deathMsg) drawTextC(ctx, this.deathMsg, W / 2, 78, '#f2d24e');
    drawTextC(ctx, 'SEUS PAIS FORAM CHAMADOS NA DIRETORIA...', W / 2, 96, '#fff');
    if (this.stateT > 60 && Math.floor(this.stateT / 30) % 2 === 0)
      drawTextC(ctx, input.isTouch() ? 'TOQUE PARA TENTAR DE NOVO' : 'APERTE Z PARA TENTAR DE NOVO', W / 2, 128, '#8ec8e8');
  }

  drawWin(ctx) {
    drawBox(ctx, W / 2 - 90, 48, 180, 74);
    drawTextC(ctx, 'FASE COMPLETA!', W / 2, 58, '#f2d24e', 1);
    drawTextC(ctx, this.def.clearMsg || 'MURRINHA ESCAPOU!', W / 2, 74, '#fff');
    ctx.drawImage(S.ficha[0], W / 2 - 44, 86);
    drawText(ctx, 'X ' + this.fichasFase, W / 2 - 34, 87, '#fff');
    ctx.drawImage(S.ticket, W / 2 + 8, 87);
    drawText(ctx, this.tickets + '/3', W / 2 + 22, 87, this.tickets >= 3 ? '#8f8' : '#fff');
    if (this.stateT > 100 && Math.floor(this.stateT / 30) % 2 === 0)
      drawTextC(ctx, input.isTouch() ? 'TOQUE PARA CONTINUAR' : 'APERTE Z', W / 2, 108, '#8f8');
  }
}
