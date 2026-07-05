// scenes.js — título, mapa-múndi e cutscenes
import { W, H, drawText, drawTextC, drawTextO, drawBox, textWidth, normText, bigText } from './gfx.js';
import * as S from './sprites.js';
import * as input from './input.js';
import * as audio from './audio.js';
import * as save from './save.js';
import * as assets from './assets.js';
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
    audio.unlock();
    if (input.pressed('b')) { this.help = !this.help; audio.sfx('select'); return; }
    if (input.pressed('a') || input.pressed('pause')) {
      if (this.help) { this.help = false; audio.sfx('select'); return; }
      audio.sfx('enter');
      this.G.toMap();
    }
  }
  draw(ctx) {
    if (this.help) { this.drawHelp(ctx); return; }
    const art = assets.get('art/title.png');
    if (art) {
      // capa gerada por IA preenchendo a tela (cover)
      const sc = Math.max(W / art.width, H / art.height);
      const dw = art.width * sc, dh = art.height * sc;
      ctx.drawImage(art, Math.round((W - dw) / 2), Math.round((H - dh) / 2), Math.round(dw), Math.round(dh));
    } else {
      ctx.fillStyle = '#e07838'; ctx.fillRect(0, 0, W, H);
      drawTextO(ctx, 'CAMPINA 86', W / 2 - textWidth('CAMPINA 86', 3) / 2, 40, '#f2d24e', '#14284a', 3);
    }
    // Murrinha andando na base
    const wx = (this.t * 0.8) % (W + 60) - 30;
    const img = Math.floor(this.t / 8) % 2 ? S.murrWalk1 : S.murrWalk2;
    ctx.drawImage(img, Math.round(wx), 138);

    if (Math.floor(this.t / 32) % 2 === 0)
      drawTextO(ctx, input.isTouch() ? 'TOQUE PARA COMECAR' : 'APERTE Z PARA COMECAR',
        W / 2 - textWidth(input.isTouch() ? 'TOQUE PARA COMECAR' : 'APERTE Z PARA COMECAR') / 2, 118, '#f8f8f8', '#14284a');
    // dica de controles + guia
    const ctrl = input.isTouch() ? 'D-PAD ANDAR - A PULAR - B CORRER (PULO LONGO)' : 'SETAS ANDAR - Z PULAR - X CORRER (PULO LONGO)';
    ctx.fillStyle = 'rgba(16,16,28,0.62)'; ctx.fillRect(0, 150, W, 30);
    drawTextC(ctx, ctrl, W / 2, 153, '#dce6f2');
    drawTextC(ctx, input.isTouch() ? 'BOTAO B = COMO JOGAR' : 'APERTE X = COMO JOGAR', W / 2, 162, '#f2d24e');
    drawTextC(ctx, 'MURRINHA, O GAZEADOR - CAMPINA GRANDE, PB', W / 2, 172, '#bcd0e4');
  }

  drawHelp(ctx) {
    ctx.fillStyle = '#0e1428'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#141c34';
    for (let j = 0; j < H; j += 6) ctx.fillRect(0, j, W, 3);
    const ox = (W - 320) >> 1; ctx.save(); ctx.translate(ox, 0);
    drawTextC(ctx, 'COMO JOGAR', 160, 8, '#f2d24e', 2);
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(20, 22, 280, 1);
    drawText(ctx, 'QUEM E VOCE', 16, 28, '#8ec8f0');
    wrap(ctx, 'Voce e o MURRINHA, aluno do CAD. Hoje vai GAZEAR AULA (matar aula) pelo centro de Campina Grande.', 16, 38, 288, '#ffffff');
    drawText(ctx, 'OBJETIVO', 16, 64, '#8ec8f0');
    wrap(ctx, 'Vencer cada lugar sem ser pego, ate pegar o onibus de volta pra casa. Ninguem pode saber que voce gazeou!', 16, 74, 288, '#ffffff');
    drawText(ctx, 'CONTROLES', 16, 100, '#8ec8f0');
    const c = input.isTouch()
      ? 'D-PAD = andar   BOTAO A = pular (segure=alto)   BOTAO B = correr (pulo longo)'
      : 'SETAS/A D = andar   Z/ESPACO = pular (segure=alto)   X/SHIFT = correr (pulo longo)';
    wrap(ctx, c, 16, 110, 288, '#c8d4e4');
    drawText(ctx, 'COLETE', 16, 130, '#8ec8f0');
    ctx.drawImage(S.ficha[0], 16, 138); drawText(ctx, '100=VIDA', 24, 140, '#fff');
    ctx.drawImage(S.chocolate, 74, 139); drawText(ctx, '+VIDA', 86, 140, '#fff');
    ctx.drawImage(S.pipocaBag, 128, 137); drawText(ctx, 'TURBO', 140, 140, '#fff');
    ctx.drawImage(S.maca, 180, 138); drawText(ctx, 'ESCUDO', 190, 140, '#fff');
    ctx.drawImage(S.ticket, 240, 139); drawText(ctx, '3/FASE', 252, 140, '#fff');
    ctx.restore();
    ctx.fillStyle = 'rgba(16,20,40,0.85)'; ctx.fillRect(0, 166, W, 14);
    if (Math.floor(this.t / 24) % 2 === 0)
      drawTextC(ctx, input.isTouch() ? 'TOQUE PARA VOLTAR' : 'APERTE Z PARA VOLTAR', W / 2, 170, '#8ef08e');
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

// ==================== FINAL + CRÉDITOS ====================
const ENDING_LINES = [
  { who: 'murr', name: 'MURRINHA', text: 'Desci no ponto de sempre. Cheguei em casa na hora certa. Perfeito.' },
  { who: 'mae', name: 'MAE', text: 'E a escola hoje, meu filho? Como foi a aula?' },
  { who: 'murr', name: 'MURRINHA', text: 'Foi otima, mae. Aprendi um monte de coisa. (piscadela)' },
  { who: 'lig', name: 'VANITA', text: 'Na diretoria... "Murrinha, faltou de novo. Da proxima, eu PEGO."' },
  { who: 'murr', name: 'MURRINHA', text: 'Mas isso e uma historia pra outro dia de gazeacao. FIM!' },
];
export class Ending {
  constructor(G) { this.G = G; this.phase = 'talk'; this.i = 0; this.chars = 0; this.t = 0; }
  update() {
    this.t++; this.chars += 0.6;
    if (this.phase === 'talk') {
      if (input.pressed('a') || input.pressed('b')) {
        const line = ENDING_LINES[this.i];
        if (line && this.chars < line.text.length) this.chars = 999;
        else { this.i++; this.chars = 0; audio.sfx('select'); if (this.i >= ENDING_LINES.length) { this.phase = 'credits'; this.t = 0; audio.playSong('clear'); } }
      }
    } else {
      if (this.t > 60 && input.pressed('a')) { audio.stopSong(); this.G.toTitle(); }
    }
  }
  draw(ctx) {
    if (this.phase === 'talk') {
      ctx.fillStyle = '#101020'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#181830';
      for (let j = 0; j < H; j += 8) ctx.fillRect(0, j, W, 4);
      const line = ENDING_LINES[this.i];
      if (!line) return;
      const ox = (W - 320) >> 1;
      ctx.save(); ctx.translate(ox, 0);
      const port = { murr: S.portMurr, lig: S.portLig, mae: S.portMae }[line.who] || S.portMurr;
      drawBox(ctx, 24, 48, 60, 60, '#243050');
      ctx.drawImage(port, 30, 54, 48, 48);
      drawBox(ctx, 94, 48, 204, 84);
      drawText(ctx, line.name + ':', 101, 55, '#f2d24e');
      const shown = normText(line.text).slice(0, Math.floor(this.chars));
      let ly = 70, lineStr = '';
      for (const w2 of shown.split(' ')) {
        const test = lineStr ? lineStr + ' ' + w2 : w2;
        if (textWidth(test) > 188) { drawText(ctx, lineStr, 101, ly, '#fff'); ly += 9; lineStr = w2; }
        else lineStr = test;
      }
      drawText(ctx, lineStr, 101, ly, '#fff');
      ctx.restore();
      drawTextC(ctx, (input.isTouch() ? 'TOQUE' : 'Z') + ' PARA CONTINUAR', W / 2, 150, '#5a6a8a');
      return;
    }
    // --- créditos ---
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) { ctx.fillStyle = '#20204a'; ctx.fillRect((i * 53) % W, (i * 37 + this.t * 0.3) % H, 1, 1); }
    const sv = save.get();
    const done = Object.keys(sv.cleared).length, tick = Object.values(sv.tickets || {}).reduce((a, b) => a + b, 0);
    drawTextC(ctx, 'FIM DE UM DIA', W / 2, 22, '#f2d24e', 2);
    drawTextC(ctx, 'DE GAZEACAO', W / 2, 40, '#f2d24e', 2);
    const cx = W / 2;
    drawTextC(ctx, 'MURRINHA - O GAZEADOR', cx, 66, '#fff');
    drawTextC(ctx, 'CAMPINA GRANDE - PARAIBA', cx, 78, '#9aa0ac');
    drawTextC(ctx, 'FASES VENCIDAS: ' + done + '/9', cx, 98, '#8f8');
    drawTextC(ctx, 'FICHAS NA COLECAO: ' + sv.fichasTotal, cx, 110, '#f2d24e');
    drawTextC(ctx, 'TICKETS ESTUDANTIS: ' + tick + '/27', cx, 122, '#8ec8e8');
    drawTextC(ctx, 'OBRIGADO POR JOGAR, GAZEADOR!', cx, 146, '#fff');
    if (this.t > 60 && Math.floor(this.t / 30) % 2 === 0)
      drawTextC(ctx, (input.isTouch() ? 'TOQUE' : 'Z') + ' PARA VOLTAR AO TITULO', cx, 166, '#5a6a8a');
  }
}

// ==================== CUTSCENE ====================
const PORTRAITS = {
  murr: () => S.portMurr, lig: () => S.portLig, pombo: () => S.portPombo, cego: () => S.portCego,
  fiscal: () => S.portFiscal, cacimba: () => S.portCacimba, carrapeta: () => S.portCarrapeta, galego: () => S.portGalego,
};

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
        if (this.i >= this.lines.length) this.G.toBriefing(this.def.id);
      }
    }
    if (this.lines.length === 0) this.G.toBriefing(this.def.id);
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

// ==================== BRIEFING (objetivo + desafios + controles) ====================
// ícones dos desafios: mini-sprites já existentes no jogo
const BRIEF_ICONS = {
  vanita: () => S.ligWalk1, fiscal: () => S.fiscal[0], cacimba: () => S.cacimba[0],
  ratinho: () => S.ratinho[0], gordo: () => S.gordo[0], tavinho: () => S.tavinho[0],
  carrapeta: () => S.carrapeta[0], galego: () => S.galego, tromba: () => S.troWalk1,
  pombo: () => S.pomboSit, bola: () => S.bola, carro: () => S.carros[0],
  choc: () => S.chocolate, pipoca: () => S.pipocaBag, ficha: () => S.ficha[0],
  ticket: () => S.ticket, maca: () => S.maca, nota: () => S.nota, orelhao: () => S.orelhao,
  escada: () => S.checkSignOn, catraca: () => S.cobrador, damas: () => S.damas,
};

export class Briefing {
  constructor(G, def) { this.G = G; this.def = def; this.t = 0; }
  update() {
    this.t++;
    if (this.t > 6 && (input.pressed('a') || input.pressed('b') || input.pressed('pause'))) {
      audio.sfx('enter'); this.G.launchLevel(this.def.id);
    }
  }
  draw(ctx) {
    const touch = input.isTouch();
    // fundo
    ctx.fillStyle = '#0e1428'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#141c34';
    for (let j = 0; j < H; j += 6) ctx.fillRect(0, j, W, 3);
    const ox = (W - 320) >> 1;
    ctx.save(); ctx.translate(ox, 0);

    // título da fase
    drawTextC(ctx, this.def.name, 160, 8, '#f2d24e', 2);
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(20, 22, 280, 1);

    // ---- OBJETIVO ----
    drawText(ctx, 'OBJETIVO', 16, 28, '#8ec8f0');
    wrap(ctx, this.def.objetivo || 'Chegue ao fim da fase inteiro!', 16, 38, 150, '#ffffff');

    // ---- CONTROLES ----
    drawText(ctx, 'CONTROLES', 16, 74, '#8ec8f0');
    const ctrls = touch ? [
      ['D-PAD', 'andar'], ['BOTAO A', 'pular (segure=alto)'],
      ['BOTAO B', 'correr = pulo longo'], ['CANTO', 'pausar'],
    ] : [
      ['SETAS / A D', 'andar'], ['Z ou ESPACO', 'pular (segure=alto)'],
      ['X ou SHIFT', 'correr = pulo longo'], ['ENTER', 'pausar'],
    ];
    let cy = 84;
    for (const [k, v] of ctrls) {
      drawText(ctx, k, 16, cy, '#f2d24e');
      drawText(ctx, v, 90, cy, '#c8d4e4');
      cy += 9;
    }

    // ---- CUIDADO COM / DESAFIOS ---- (coluna direita)
    drawText(ctx, 'CUIDADO COM', 176, 28, '#f28a8a');
    let dy = 38;
    for (const d of (this.def.desafios || [])) {
      const icon = BRIEF_ICONS[d.spr] && BRIEF_ICONS[d.spr]();
      if (icon) {
        // desenha o ícone em caixa 18x18, alinhado embaixo
        ctx.fillStyle = '#1c2848'; ctx.fillRect(176, dy, 18, 18);
        const s = Math.min(16, icon.width, icon.height) / Math.max(icon.width, icon.height) * 16;
        ctx.drawImage(icon, 0, 0, icon.width, icon.height, 177, dy + 17 - Math.min(17, icon.height), Math.min(17, icon.width), Math.min(17, icon.height));
      }
      drawText(ctx, d.nm, 198, dy, '#f4e29a');
      wrap(ctx, d.tip, 198, dy + 8, 120, '#c8d4e4');
      dy += 22;
    }
    ctx.restore();

    // rodapé: começar
    ctx.fillStyle = 'rgba(16,20,40,0.85)'; ctx.fillRect(0, 166, W, 14);
    if (Math.floor(this.t / 24) % 2 === 0)
      drawTextC(ctx, touch ? 'TOQUE PARA GAZEAR!' : 'APERTE Z PARA GAZEAR!', W / 2, 170, '#8ef08e');
  }
}

// quebra de texto simples (retorna próximo y)
function wrap(ctx, text, x, y, maxW, color) {
  let ly = y, line = '';
  for (const w2 of normText(text).split(' ')) {
    const test = line ? line + ' ' + w2 : w2;
    if (textWidth(test) > maxW) { drawText(ctx, line, x, ly, color); ly += 8; line = w2; }
    else line = test;
  }
  drawText(ctx, line, x, ly, color);
  return ly + 8;
}
