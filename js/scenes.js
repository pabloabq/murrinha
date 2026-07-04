// scenes.js — título, mapa-múndi e cutscenes
import { W, H, drawText, drawTextC, drawTextO, drawBox, textWidth, normText, bigText } from './gfx.js';
import * as S from './sprites.js';
import * as input from './input.js';
import * as audio from './audio.js';
import * as save from './save.js';
import { NODES, EDGES, LEVELS } from './levels.js';

// ==================== TÍTULO ====================
export class Title {
  constructor(G) {
    this.G = G; this.t = 0; this.started = false;
    this.logo = bigText('MURRINHA');
    this.logo2 = bigText('O GAZEADOR', '#f8f8f8', '#ffffff', '#b8c4d4', '#14284a');
  }
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
    ctx.fillStyle = '#f8e858'; ctx.fillRect(W - 58, 18, 22, 22);
    ctx.fillStyle = '#fff8b0'; ctx.fillRect(W - 54, 22, 14, 14);
    // skyline (padrão repetido para qualquer largura de tela)
    for (let x = 0; x < W + 300; x += 300) {
      ctx.fillStyle = '#a8bccc';
      ctx.fillRect(x, 96, 60, 60); ctx.fillRect(x + 70, 82, 40, 74); ctx.fillRect(x + 120, 100, 48, 56);
      ctx.fillRect(x + 178, 70, 44, 86); ctx.fillRect(x + 196, 56, 4, 16); // TELPA
      ctx.fillRect(x + 232, 92, 60, 64);
      ctx.fillStyle = '#c8d8e4';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) ctx.fillRect(x + 184 + i * 13, 76 + j * 14, 7, 8);
    }
    // chão de calçadão
    for (let i = 0; i < W / 16 + 1; i++) for (let j = 0; j < 2; j++)
      ctx.drawImage(S.TILES[j ? 'L3' : (i % 2 ? 'L2' : 'L')], i * 16, 148 + j * 16);

    // ---- placa do título (estilo Super Mario World) ----
    const bob = Math.round(Math.sin(this.t * 0.05) * 2);
    const pw = 216, ph = 74;
    const px = Math.round(W / 2 - pw / 2), py = 22 + bob;
    ctx.fillStyle = 'rgba(20,10,20,0.35)'; ctx.fillRect(px + 4, py + 4, pw, ph); // sombra
    ctx.fillStyle = '#4a1008'; ctx.fillRect(px - 2, py - 2, pw + 4, ph + 4);
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(px, py, pw, ph);        // moldura bege
    ctx.fillStyle = '#a01810'; ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8);
    ctx.fillStyle = '#c8281c'; ctx.fillRect(px + 4, py + 4, pw - 8, 10); // brilho
    // parafusos da placa
    ctx.fillStyle = '#f4f0e6';
    for (const [rx, ry] of [[px + 2, py + 2], [px + pw - 4, py + 2], [px + 2, py + ph - 4], [px + pw - 4, py + ph - 4]])
      ctx.fillRect(rx, ry, 2, 2);
    // logo em letras gordas
    const lw = this.logo.width * 2, lh = this.logo.height * 2;
    ctx.drawImage(this.logo, Math.round(W / 2 - lw / 2), py + 12, lw, lh);
    ctx.drawImage(this.logo2, Math.round(W / 2 - this.logo2.width / 2), py + 46);
    // listras vermelhas da farda na base da placa
    ctx.fillStyle = '#f8f8f8'; ctx.fillRect(px + 12, py + ph - 12, pw - 24, 6);
    ctx.fillStyle = '#c8281c'; ctx.fillRect(px + 12, py + ph - 11, pw - 24, 1); ctx.fillRect(px + 12, py + ph - 8, pw - 24, 1);

    // leões guardiões no calçadão, flanqueando a placa
    ctx.drawImage(S.leao, px - 30, 122);
    ctx.drawImage(S.leao, px + pw + 10, 122);

    // Murrinha andando na tela
    const wx = (this.t * 0.8) % (W + 60) - 30;
    const img = Math.floor(this.t / 8) % 2 ? S.murrWalk1 : S.murrWalk2;
    ctx.drawImage(img, Math.round(wx), 124);
    // pombo que acompanha
    const pi = Math.floor(this.t / 10) % 2 ? S.pomboFly1L : S.pomboFly2L;
    ctx.drawImage(pi, Math.round(wx - 34), 104 + Math.sin(this.t * 0.1) * 4);

    if (Math.floor(this.t / 32) % 2 === 0)
      drawTextO(ctx, input.isTouch() ? 'TOQUE PARA COMECAR' : 'APERTE Z PARA COMECAR',
        W / 2 - textWidth(input.isTouch() ? 'TOQUE PARA COMECAR' : 'APERTE Z PARA COMECAR') / 2, 112, '#f8f8f8', '#14284a');
    // faixa escura do rodapé para legibilidade
    ctx.fillStyle = 'rgba(16,16,28,0.7)'; ctx.fillRect(0, 166, W, 14);
    drawTextC(ctx, 'PRACA DA BANDEIRA - CAMPINA GRANDE - PB', W / 2, 170, '#f2d24e');
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
    const ox = (W - 320) >> 1; // centraliza o mapa em telas mais largas
    // fundo: vista aérea estilizada do centro
    ctx.fillStyle = '#6aa844'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#7ab648';
    for (let i = 0; i < W / 8 + 1; i++) for (let j = 0; j < H / 8 + 1; j++)
      if ((i + j) % 2 === 0) ctx.fillRect(i * 8, j * 8, 8, 8);
    ctx.save();
    ctx.translate(ox, 0);
    // avenida Floriano (vertical, à direita)
    ctx.fillStyle = '#55555e'; ctx.fillRect(210, 0, 30, H);
    ctx.fillStyle = '#68686f'; ctx.fillRect(212, 0, 26, H);
    ctx.fillStyle = '#f2d24e';
    for (let y = (this.t * 0.4) % 16 - 16; y < H; y += 16) ctx.fillRect(224, y, 2, 8);
    // tráfego no mapa: carros e um ônibus
    const carY = (this.t * 0.9) % (H + 40) - 20;
    ctx.fillStyle = '#d81e18'; ctx.fillRect(214, carY, 8, 13);
    ctx.fillStyle = '#bfe8f8'; ctx.fillRect(215, carY + 2, 6, 3);
    ctx.fillStyle = '#2a52c0'; ctx.fillRect(230, H - carY, 8, 13);
    const busY = (this.t * 0.5 + 90) % (H + 60) - 30;
    ctx.fillStyle = '#e8a020'; ctx.fillRect(213, busY, 9, 24);
    ctx.fillStyle = '#c03028'; ctx.fillRect(213, busY + 18, 9, 4);
    // ruas
    ctx.fillStyle = '#8a8a90';
    ctx.fillRect(0, 74, 212, 12); ctx.fillRect(0, 118, 212, 10);
    ctx.fillRect(88, 0, 10, H); ctx.fillRect(160, 74, 10, 106);
    ctx.fillStyle = '#9a9aa0';
    ctx.fillRect(0, 74, 212, 2); ctx.fillRect(0, 118, 212, 2);
    // a praça central (calçadão claro com ondas)
    ctx.fillStyle = '#e6e2d6'; ctx.fillRect(102, 86, 54, 32);
    ctx.fillStyle = '#8a867a';
    for (let i = 0; i < 6; i++) { ctx.fillRect(104 + i * 9, 90 + (i % 2) * 2, 6, 2); ctx.fillRect(106 + i * 9, 104 + ((i + 1) % 2) * 2, 6, 2); }
    // busto do fundador + banca do Orlando
    ctx.fillStyle = '#6a4a24'; ctx.fillRect(127, 96, 4, 6);
    ctx.fillStyle = '#c03028'; ctx.fillRect(142, 108, 9, 6);
    ctx.fillStyle = '#f8f8f8'; ctx.fillRect(142, 108, 9, 2);
    // árvores da praça e das calçadas
    for (const [tx, ty] of [[106, 88], [146, 90], [110, 108], [134, 96], [30, 68], [70, 68], [120, 112], [180, 70], [24, 132], [70, 132], [190, 130]]) {
      ctx.fillStyle = '#2a662e'; ctx.fillRect(tx + 1, ty + 1, 8, 8);
      ctx.fillStyle = '#3d8c3d'; ctx.fillRect(tx, ty, 8, 8);
      ctx.fillStyle = '#57ab4a'; ctx.fillRect(tx + 1, ty + 1, 4, 4);
    }
    // pombos da praça (pontinhos que andam)
    ctx.fillStyle = '#9aa0ac';
    for (let i = 0; i < 6; i++) {
      const px = 108 + ((i * 37 + Math.floor(this.t / 20) * (i + 1)) % 44);
      ctx.fillRect(px, 92 + (i * 11) % 22, 2, 2);
    }
    // quarteirões com telhados coloridos
    const blocos = [
      [30, 30, 46, 36, '#c8703c'], [110, 24, 40, 42, '#8a9aa8'], [170, 26, 34, 40, '#3d8c5c'],
      [20, 96, 56, 34, '#c8a040'], [20, 138, 68, 34, '#b05038'], [104, 132, 100, 40, '#7a8a98'],
    ];
    for (const [bx, by, bw, bh, cor] of blocos) {
      ctx.fillStyle = '#3a3a30'; ctx.fillRect(bx + 2, by + 2, bw, bh); // sombra
      ctx.fillStyle = cor; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let l = by + 8; l < by + bh; l += 6) ctx.fillRect(bx, l, bw, 1);
    }
    // fachada do CAD: colunas vermelhas e os dois leões
    ctx.fillStyle = '#f0e8d8'; ctx.fillRect(38, 40, 40, 26);
    ctx.fillStyle = '#c03028';
    for (let c = 0; c < 4; c++) ctx.fillRect(41 + c * 9, 44, 3, 22);
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(40, 64, 4, 4); ctx.fillRect(72, 64, 4, 4); // leões
    // letreiro das Brasileiras (verde-amarelo)
    ctx.fillStyle = '#f2d24e'; ctx.fillRect(174, 30, 26, 5);
    ctx.fillStyle = '#2e8a5c'; ctx.fillRect(174, 35, 26, 3);
    // TELPA no canto da avenida
    ctx.fillStyle = '#8ca4b8'; ctx.fillRect(244, 20, 30, 44);
    ctx.fillStyle = '#c8dce8';
    for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) ctx.fillRect(248 + i * 12, 24 + j * 10, 8, 6);
    ctx.fillStyle = '#55555e'; ctx.fillRect(256, 12, 3, 9);

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
    ctx.restore();

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
const PORTRAITS = { murr: () => S.portMurr, lig: () => S.portLig, pombo: () => S.portPombo, cego: () => S.portCego };

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
    const ox = (W - 320) >> 1;
    ctx.save(); ctx.translate(ox, 0);
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
    ctx.restore();
    drawTextC(ctx, (input.isTouch() ? 'TOQUE' : 'Z') + ' PARA AVANCAR', W / 2, 156, '#5a6a8a');
  }
}
