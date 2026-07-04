// scenes.js — título, mapa-múndi e cutscenes
import { W, H, drawText, drawTextC, drawTextO, drawBox, textWidth, normText } from './gfx.js';
import * as S from './sprites.js';
import * as input from './input.js';
import * as audio from './audio.js';
import * as save from './save.js';
import { NODES, EDGES, LEVELS } from './levels.js';

// ==================== TÍTULO ====================
export class Title {
  constructor(G) { this.G = G; this.t = 0; this.started = false; }
  update() {
    this.t++;
    if (input.pressed('a') || input.pressed('pause')) {
      audio.unlock(); audio.sfx('enter');
      this.G.toMap();
    }
  }
  draw(ctx) {
    // céu de fim de manhã
    ctx.fillStyle = '#8ed0f0'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c9ecfa'; ctx.fillRect(0, 0, W, 30);
    // sol
    ctx.fillStyle = '#f8e858'; ctx.fillRect(262, 18, 22, 22);
    ctx.fillStyle = '#fff8b0'; ctx.fillRect(266, 22, 14, 14);
    // skyline
    ctx.fillStyle = '#a8bccc';
    ctx.fillRect(0, 96, 60, 60); ctx.fillRect(70, 82, 40, 74); ctx.fillRect(120, 100, 48, 56);
    ctx.fillRect(178, 70, 44, 86); ctx.fillRect(196, 56, 4, 16); // TELPA
    ctx.fillRect(232, 92, 60, 64);
    ctx.fillStyle = '#c8d8e4';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) ctx.fillRect(184 + i * 13, 76 + j * 14, 7, 8);
    // chão de ladrilho
    for (let i = 0; i < W / 16 + 1; i++) for (let j = 0; j < 2; j++)
      ctx.drawImage(S.TILES['L'], i * 16, 148 + j * 16);
    // título
    const bob = Math.sin(this.t * 0.05) * 2;
    drawTextO(ctx, 'MURRINHA', W / 2 - textWidth('MURRINHA', 5) / 2, 34 + bob, '#f2d24e', '#8a2018', 5);
    drawTextO(ctx, 'O GAZEADOR', W / 2 - textWidth('O GAZEADOR', 2) / 2, 66 + bob, '#f8f8f8', '#14284a', 2);
    // Murrinha andando na tela
    const wx = (this.t * 0.8) % (W + 60) - 30;
    const img = Math.floor(this.t / 8) % 2 ? S.murrWalk1 : S.murrWalk2;
    ctx.drawImage(img, Math.round(wx), 124);
    // pombo que acompanha
    const pi = Math.floor(this.t / 10) % 2 ? S.pomboFly1L : S.pomboFly2L;
    ctx.drawImage(pi, Math.round(wx - 34), 104 + Math.sin(this.t * 0.1) * 4);
    if (Math.floor(this.t / 32) % 2 === 0)
      drawTextC(ctx, input.isTouch() ? 'TOQUE PARA COMECAR' : 'APERTE Z PARA COMECAR', W / 2, 96, '#14284a');
    drawTextC(ctx, 'PRACA DA BANDEIRA - CAMPINA GRANDE - PB', W / 2, 170, '#f8f8f8');
  }
}

// ==================== MAPA-MÚNDI ====================
export class WorldMap {
  constructor(G, startNode = 'cad') {
    this.G = G;
    this.t = 0;
    this.cur = NODES.findIndex(n => n.id === startNode);
    if (this.cur < 0) this.cur = 0;
    this.avatar = { x: NODES[this.cur].x, y: NODES[this.cur].y };
    this.moving = false;
    this.toast = null; this.toastT = 0;
  }
  neighbors(i) {
    const id = NODES[i].id, out = [];
    for (const [a, b] of EDGES) {
      if (a === id) out.push(NODES.findIndex(n => n.id === b));
      if (b === id) out.push(NODES.findIndex(n => n.id === a));
    }
    return out;
  }
  update() {
    this.t++;
    if (this.toastT > 0) this.toastT--;
    const node = NODES[this.cur];
    // anda até o nó alvo
    if (this.moving) {
      const dx = node.x - this.avatar.x, dy = node.y - this.avatar.y;
      const d = Math.hypot(dx, dy);
      if (d < 1.5) { this.avatar.x = node.x; this.avatar.y = node.y; this.moving = false; }
      else { this.avatar.x += dx / d * 1.4; this.avatar.y += dy / d * 1.4; }
      return;
    }
    // escolhe vizinho pela direção
    let dir = null;
    if (input.pressed('right')) dir = [1, 0];
    if (input.pressed('left')) dir = [-1, 0];
    if (input.pressed('up')) dir = [0, -1];
    if (input.pressed('down')) dir = [0, 1];
    if (dir) {
      let best = -1, bestDot = 0.3;
      for (const ni of this.neighbors(this.cur)) {
        const n = NODES[ni];
        const vx = n.x - node.x, vy = n.y - node.y;
        const len = Math.hypot(vx, vy);
        const dot = (vx * dir[0] + vy * dir[1]) / len;
        if (dot > bestDot) { bestDot = dot; best = ni; }
      }
      if (best >= 0) { this.cur = best; this.moving = true; audio.sfx('select'); }
    }
    if (input.pressed('a')) {
      if (node.playable) { audio.sfx('enter'); this.G.startLevel(node.id); }
      else { this.toast = 'EM BREVE...'; this.toastT = 90; audio.sfx('select'); }
    }
  }
  draw(ctx) {
    // fundo: vista aérea estilizada do centro
    ctx.fillStyle = '#7ab648'; ctx.fillRect(0, 0, W, H); // verde geral
    // avenida Floriano (diagonal de cima a baixo à direita)
    ctx.fillStyle = '#68686f';
    ctx.fillRect(212, 0, 26, H);
    ctx.fillStyle = '#f2d24e';
    for (let y = (this.t * 0.4) % 16 - 16; y < H; y += 16) ctx.fillRect(224, y, 2, 8);
    // carrinhos passando
    const carY = (this.t * 0.9) % (H + 40) - 20;
    ctx.fillStyle = '#d81e18'; ctx.fillRect(215, carY, 7, 12);
    ctx.fillStyle = '#2a52c0'; ctx.fillRect(229, H - carY, 7, 12);
    // ruas
    ctx.fillStyle = '#8a8a90';
    ctx.fillRect(0, 74, 212, 12); ctx.fillRect(0, 118, 212, 10);
    ctx.fillRect(88, 0, 10, H); ctx.fillRect(160, 74, 10, 106);
    // a praça central (ladrilho)
    ctx.fillStyle = '#d87838'; ctx.fillRect(104, 86, 50, 32);
    ctx.fillStyle = '#e89858';
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++)
      if ((i + j) % 2 === 0) ctx.fillRect(104 + i * 8, 86 + j * 8, 8, 8);
    // arvorezinhas da praça
    ctx.fillStyle = '#3d8c3d';
    ctx.fillRect(108, 90, 7, 7); ctx.fillRect(140, 92, 7, 7); ctx.fillRect(122, 106, 7, 7);
    // pombos da praça (pontinhos que andam)
    ctx.fillStyle = '#9aa0ac';
    for (let i = 0; i < 5; i++) {
      const px = 110 + ((i * 37 + Math.floor(this.t / 20) * (i + 1)) % 40);
      ctx.fillRect(px, 94 + (i * 11) % 20, 2, 2);
    }
    // quarteirões
    ctx.fillStyle = '#c8b89c';
    ctx.fillRect(30, 30, 46, 36); ctx.fillRect(110, 24, 40, 42); ctx.fillRect(170, 26, 34, 40);
    ctx.fillRect(20, 96, 56, 34); ctx.fillRect(20, 138, 68, 34); ctx.fillRect(104, 132, 100, 40);
    ctx.fillStyle = '#b0a084';
    ctx.fillRect(30, 30, 46, 4); ctx.fillRect(110, 24, 40, 4); ctx.fillRect(170, 26, 34, 4);
    ctx.fillRect(20, 96, 56, 4); ctx.fillRect(20, 138, 68, 4); ctx.fillRect(104, 132, 100, 4);
    // fachada do CAD (bloco com colunas vermelhas)
    ctx.fillStyle = '#f0e8d8'; ctx.fillRect(40, 42, 36, 24);
    ctx.fillStyle = '#c03028';
    ctx.fillRect(43, 46, 3, 20); ctx.fillRect(51, 46, 3, 20); ctx.fillRect(59, 46, 3, 20); ctx.fillRect(67, 46, 3, 20);

    // caminhos entre nós
    ctx.fillStyle = '#fff8e0';
    for (const [a, b] of EDGES) {
      const na = NODES.find(n => n.id === a), nb = NODES.find(n => n.id === b);
      const d = Math.hypot(nb.x - na.x, nb.y - na.y), steps = Math.floor(d / 7);
      for (let s = 1; s < steps; s++) {
        ctx.fillRect(Math.round(na.x + (nb.x - na.x) * s / steps) - 1,
          Math.round(na.y + (nb.y - na.y) * s / steps) - 1, 2, 2);
      }
    }
    // nós
    const cleared = save.get().cleared;
    for (const n of NODES) {
      const isCur = NODES[this.cur] === n;
      if (n.playable) {
        ctx.fillStyle = '#14284a'; ctx.fillRect(n.x - 5, n.y - 5, 10, 10);
        ctx.fillStyle = cleared[n.id] ? '#57ab4a' : '#f2d24e';
        ctx.fillRect(n.x - 4, n.y - 4, 8, 8);
        if (cleared[n.id]) { ctx.fillStyle = '#fff'; ctx.fillRect(n.x - 2, n.y - 1, 2, 3); ctx.fillRect(n.x, n.y + 1, 3, 2); }
      } else {
        ctx.fillStyle = '#14284a'; ctx.fillRect(n.x - 4, n.y - 4, 8, 8);
        ctx.fillStyle = '#8a8a90'; ctx.fillRect(n.x - 3, n.y - 3, 6, 6);
        ctx.fillStyle = '#4a4a52'; ctx.fillRect(n.x - 2, n.y - 2, 4, 2); // cadeado
      }
      if (isCur && !this.moving) {
        // seta pulsante
        const b = Math.sin(this.t * 0.15) * 2;
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(n.x - 1, n.y - 16 + b, 3, 4);
        ctx.fillRect(n.x - 3, n.y - 13 + b, 7, 2);
      }
    }
    // avatar
    const av = S.mapMurr[Math.floor(this.t / 12) % 2];
    ctx.drawImage(av, Math.round(this.avatar.x - 5), Math.round(this.avatar.y - 14));

    // painel do nó atual
    const node = NODES[this.cur];
    drawBox(ctx, 0, H - 16, W, 16);
    const lbl = node.playable
      ? node.label + (cleared[node.id] ? ' (COMPLETA)' : '') + '  -  ' + (input.isTouch() ? 'TOQUE A' : 'Z') + ' PARA ENTRAR'
      : node.label + '  -  EM BREVE';
    drawTextC(ctx, lbl, W / 2, H - 11, node.playable ? '#f2d24e' : '#9aa0ac');
    // título
    drawTextO(ctx, 'CENTRO DE CAMPINA GRANDE', 6, 5, '#fff', '#14284a');
    // fichas totais
    ctx.drawImage(S.ficha[0], W - 46, 3);
    drawText(ctx, 'X' + save.get().fichasTotal, W - 37, 4, '#fff');
    if (this.toastT > 0) {
      drawBox(ctx, W / 2 - 46, 60, 92, 14);
      drawTextC(ctx, this.toast, W / 2, 64, '#f2d24e');
    }
  }
}

// ==================== CUTSCENE ====================
const PORTRAITS = { murr: () => S.portMurr, lig: () => S.portLig, pombo: () => S.portPombo };

export class Cutscene {
  constructor(G, levelDef) {
    this.G = G; this.def = levelDef;
    this.lines = levelDef.cutscene || [];
    this.i = 0; this.chars = 0; this.t = 0;
  }
  update() {
    this.t++; this.chars += 0.6;
    if (input.pressed('a') || input.pressed('b')) {
      const line = this.lines[this.i];
      if (line && this.chars < line.text.length) this.chars = 999; // completa a linha
      else {
        this.i++;
        this.chars = 0;
        audio.sfx('select');
        if (this.i >= this.lines.length) this.G.launchLevel(this.def.id);
      }
    }
    if (this.lines.length === 0) this.G.launchLevel(this.def.id);
  }
  draw(ctx) {
    ctx.fillStyle = '#101020'; ctx.fillRect(0, 0, W, H);
    // faixas de cinema
    ctx.fillStyle = '#181830';
    for (let j = 0; j < H; j += 8) ctx.fillRect(0, j, W, 4);
    drawTextC(ctx, this.def.name, W / 2, 16, '#f2d24e', 2);
    const line = this.lines[this.i];
    if (!line) return;
    // retrato
    const img = (PORTRAITS[line.who] || PORTRAITS.murr)();
    drawBox(ctx, 24, 58, 60, 60, '#243050');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 30, 64, 48, 48);
    // caixa de fala
    drawBox(ctx, 94, 58, 204, 74);
    drawText(ctx, line.name + ':', 101, 65, '#f2d24e');
    // texto com quebra de linha (máx ~46 chars/linha)
    const shown = normText(line.text).slice(0, Math.floor(this.chars));
    const words = shown.split(' ');
    let lx = 101, ly = 78, lineStr = '';
    const maxW = 190;
    for (const w2 of words) {
      const test = lineStr ? lineStr + ' ' + w2 : w2;
      if (textWidth(test) > maxW) {
        drawText(ctx, lineStr, 101, ly, '#fff'); ly += 9; lineStr = w2;
      } else lineStr = test;
    }
    drawText(ctx, lineStr, 101, ly, '#fff');
    if (this.chars >= line.text.length && Math.floor(this.t / 20) % 2 === 0)
      drawText(ctx, '>', 286, 122, '#f2d24e');
    drawTextC(ctx, (input.isTouch() ? 'TOQUE' : 'Z') + ' PARA AVANCAR', W / 2, 156, '#5a6a8a');
  }
}
