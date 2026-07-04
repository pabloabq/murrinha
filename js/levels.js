// levels.js — dados das fases: mapas ASCII, fundos, cutscenes
// Legenda do mapa:
//  # piso escola | M tijolo | L ladrilho praça | E canteiro | D carteira | X caixa
//  = laje (one-way) | b banco (one-way) | c coluna(deco) | i tronco | A copa
//  P início | C checkpoint | G objetivo | f ficha | h chocolate | p pipoca
//  1 Liginha | g trombadinha | o pombo | d aluno das DAMAS
import { W, H, drawTextC } from './gfx.js';
import * as S from './sprites.js';

// junta blocos horizontais de 20 colunas, com padding automático
function join(...chunks) {
  const h = 14, cw = 20;
  const rows = [];
  for (let j = 0; j < h; j++) {
    let r = '';
    for (const c of chunks) r += (c[j] || '').padEnd(cw, '.').slice(0, cw);
    rows.push(r);
  }
  return rows;
}

// ================= FASE 1 — FUGA DO CAD =================
const cad1 = [ // sala de aula
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........fff......',
  '..P................',
  '...........D...D...',
  '.....D.....D...D...',
  '####################',
  '####################',
];
const cad2 = [ // corredor: Liginha 1
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........aff......',
  '........=====......',
  '....................',
  '...................f',
  '.f.................f',
  '.DD.......1.......DD',
  '.DD...............DD',
  '####################',
  '####################',
];
const cad3 = [ // biblioteca: prateleiras e pilhas de livros
  '....................',
  '....................',
  '....h.t.............',
  '...====....fff......',
  '..........=====.....',
  '.ff................f',
  '.===..............==',
  '..........ff........',
  '.......====.........',
  '.fff................',
  '.===........K.......',
  '............K.......',
  '####################',
  '####################',
];
const cad4 = [ // depósito do zelador
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '....................',
  '....X...........f...',
  '....X..X....X...f...',
  '.f..X..X....X..XX...',
  '.f.XX..XX..XXX.XX...',
  '.f.XX..XX..XXX.XX...',
  '####################',
  '####################',
];
const cad5 = [ // pátio: muretas e o bueiro sem tampa
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........t.........',
  '....................',
  '......ff......ff....',
  '..C..........MMM...f',
  '.....MMMM....MMM...f',
  '.....MMMM....MMM...f',
  '.....MMMM....MMM...f',
  '#####MMMM....MMM####',
  '#####MMMM....MMM####',
];
const cad6 = [ // corredor final: Liginha 2 (mais brava)
  '....................',
  '....................',
  '....................',
  '....................',
  '..........fff.......',
  '.........=====......',
  '....................',
  '....................',
  '....................',
  'f..................f',
  'D.......1..........D',
  'D..................D',
  '####################',
  '####################',
];
const cad7 = [ // saguão com pé-direito alto
  '....................',
  '....................',
  '...tff..............',
  '...====.............',
  '..........ff........',
  '.........====.......',
  '................ff..',
  '...............====.',
  '....................',
  '....................',
  '.c......c......c....',
  '.c......c......c....',
  '####################',
  '####################',
];
const cad8 = [ // fachada: marquise + leões + saída
  '....................',
  '....................',
  '....................',
  '....................',
  '..===========.......',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.c....c.........G...',
  '.c....c.............',
  '####################',
  '####################',
];

export function bgCAD(ctx, camX, camY, t) {
  // parede da escola
  ctx.fillStyle = '#e6d9b8'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#cfc09a'; ctx.fillRect(0, 120 - camY * 0.5, W, H);
  ctx.fillStyle = '#8a6c3c'; ctx.fillRect(0, 118 - camY * 0.5, W, 3);
  // janelas com céu (parallax)
  const par = camX * 0.5;
  for (let x = -((par) % 112) - 112; x < W + 112; x += 112) {
    ctx.fillStyle = '#6a4c22'; ctx.fillRect(x, 28 - camY * 0.5, 44, 34);
    ctx.fillStyle = '#9ad4f0'; ctx.fillRect(x + 2, 30 - camY * 0.5, 40, 30);
    ctx.fillStyle = '#c9ecfa'; ctx.fillRect(x + 2, 30 - camY * 0.5, 40, 8);
    ctx.fillStyle = '#6a4c22'; ctx.fillRect(x + 20, 30 - camY * 0.5, 2, 30);
    // quadro de avisos entre janelas
    ctx.fillStyle = '#7c5a2a'; ctx.fillRect(x + 66, 40 - camY * 0.5, 26, 20);
    ctx.fillStyle = '#f2e8d0'; ctx.fillRect(x + 68, 42 - camY * 0.5, 10, 7);
    ctx.fillStyle = '#e8b0b0'; ctx.fillRect(x + 80, 44 - camY * 0.5, 9, 10);
  }
}

function decoCAD(ctx, lvl) {
  const gx = lvl.goalX;
  // porta larga
  ctx.fillStyle = '#5a3a16';
  ctx.fillRect(gx - 26, 128, 52, 64);
  ctx.fillStyle = '#7c5424';
  ctx.fillRect(gx - 22, 132, 20, 60); ctx.fillRect(gx + 2, 132, 20, 60);
  // letreiro CAD sobre a porta
  ctx.fillStyle = '#f8f4ec'; ctx.fillRect(gx - 30, 108, 60, 16);
  drawTextC(ctx, 'CAD', gx, 113, '#c81e14', 2);
  // leões guardiões
  ctx.drawImage(S.leao, gx - 56, 168);
  ctx.drawImage(S.leaoL, gx + 36, 168);
}

// ================= FASE 2 — PRAÇA DOS POMBOS =================
const pr1 = [ // chegada na praça
  '....................',
  '....................',
  '....................',
  '....o...............',
  '..AAAAA.............',
  '..AAAAA......fff....',
  '....i.......n.......',
  '....i......bbb......',
  '..P.i...............',
  '....i...............',
  '............g.......',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr2 = [ // canteiros e pombos
  '....................',
  '....................',
  '.........o.....o....',
  '.......AAAAAAAAA....',
  '.......AAAAAAAAA....',
  '....p.....ii........',
  '..........ii........',
  '...bb.....ii...ff...',
  '..........ii..bbb...',
  '.ff.......ii........',
  '.EEE....g.....g.....',
  '.EEE................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr3 = [ // banca do Orlando + árvore
  '...............AAAA.',
  '..............AAAAAA',
  '...............AAAA.',
  '....fff..........i..',
  '..........h.t....i..',
  '.................i..',
  '........=======..i..',
  '........XXXXXXX..i..',
  '..f.....XXXXXXX..i..',
  '..b.....XXXXXXX..i..',
  '....g...XXXXXXX..i..',
  '........XXXXXXX..i..',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr4 = [ // busto do fundador + checkpoint
  '....................',
  '....................',
  '...o................',
  '.AAAAA...o......o...',
  '.AAAAA..............',
  '...i................',
  '...i.....faf........',
  '...i....bbbbb.......',
  '...i................',
  '...C................',
  '.........g..g...d...',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr5 = [ // alameda dos pombos (chuva de cocô)
  '....................',
  '..o.....o.....o.....',
  '....................',
  '.AAA............AAA.',
  'AAAAA.....t....AAAAA',
  '..i..ff.......ff.i..',
  '..i.bbbb.....bbbb.i.',
  '..i...............i.',
  '..i...............i.',
  '..i...............i.',
  '..i...g.......g...i.',
  '..i...............i.',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr6 = [ // canteiro grande: sobe e desce
  '....................',
  '....................',
  '........t...........',
  '.......fff..........',
  '....................',
  '......EEEEE.........',
  '..f...EEEEE....f....',
  '..b...EEEEE....b....',
  '...............o....',
  '.....g..............',
  '....EEEEE......g....',
  '....EEEEE...........',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr7 = [ // reta final: parada de ônibus
  '....................',
  '....................',
  '....o.......o.......',
  '..AAAAA.............',
  '..AAAAA.............',
  '....i....fff........',
  '....i...............',
  '....i..bbb..........',
  '....i...........d...',
  '....................',
  '.....g.g.......G....',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];

export function bgPraca(ctx, camX, camY, t) {
  // céu
  ctx.fillStyle = '#8ed0f0'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#aadef6'; ctx.fillRect(0, 0, W, 46);
  ctx.fillStyle = '#c9ecfa'; ctx.fillRect(0, 0, W, 22);
  // nuvens
  const cl = camX * 0.25;
  ctx.fillStyle = '#ffffff';
  for (let x = -((cl) % 160) - 160; x < W + 160; x += 160) {
    ctx.fillRect(x + 20, 24, 30, 8); ctx.fillRect(x + 26, 20, 18, 6);
    ctx.fillRect(x + 90, 44, 24, 7); ctx.fillRect(x + 95, 41, 13, 5);
  }
  // skyline do centro (parallax 0.5) — inclui o prédio da TELPA
  const par = camX * 0.5;
  ctx.fillStyle = '#b0c4d4';
  for (let x = -((par) % 280) - 280; x < W + 280; x += 280) {
    ctx.fillRect(x, 80, 50, 60);           // prédio 1
    ctx.fillRect(x + 60, 92, 40, 48);      // prédio 2
    // TELPA: mais alto, com antena
    ctx.fillStyle = '#98aec2';
    ctx.fillRect(x + 130, 56, 44, 84);
    ctx.fillRect(x + 148, 40, 4, 18);
    ctx.fillStyle = '#c8d8e4';
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++)
      ctx.fillRect(x + 136 + i * 12, 62 + j * 14, 7, 8);
    ctx.fillStyle = '#b0c4d4';
    ctx.fillRect(x + 190, 86, 56, 54);     // prédio 3
  }
  // faixa de prédios baixos
  ctx.fillStyle = '#c8b89c'; ctx.fillRect(0, 130, W, 20);
  ctx.fillStyle = '#a89878'; ctx.fillRect(0, 130, W, 3);
  // linha de árvores da praça (frente aos prédios)
  const tp = camX * 0.7;
  ctx.fillStyle = '#2f7434';
  for (let x = -((tp) % 64) - 64; x < W + 64; x += 64) {
    ctx.fillRect(x + 8, 126, 22, 14); ctx.fillRect(x + 12, 120, 14, 8);
    ctx.fillRect(x + 44, 132, 14, 10);
  }
  ctx.fillStyle = '#245c28';
  for (let x = -((tp) % 64) - 64; x < W + 64; x += 64) ctx.fillRect(x + 8, 136, 22, 4);
}

function decoPraca(ctx, lvl) {
  for (const e of lvl.ents) {
    // busto do fundador perto do checkpoint
    if (e.t === 'check') ctx.drawImage(S.busto, e.x - 26, e.y - 4);
    // fio de telefone sob os pombos empoleirados
    if (e.t === 'pombo' && e.mode === 'perch') {
      ctx.fillStyle = '#3a3a44';
      ctx.fillRect(e.x - 26, e.y + 8, 62, 1);
      ctx.fillRect(e.x - 26, e.y + 9, 1, 2); ctx.fillRect(e.x + 35, e.y + 9, 1, 2);
    }
  }
  // placa de parada de ônibus no objetivo
  const gx = lvl.goalX;
  ctx.fillStyle = '#606068'; ctx.fillRect(gx + 6, 136, 3, 56);
  ctx.fillStyle = '#2a52c0'; ctx.fillRect(gx - 6, 124, 28, 16);
  ctx.fillStyle = '#f8f8f8'; ctx.fillRect(gx - 4, 126, 24, 12);
  ctx.fillStyle = '#2a52c0';
  ctx.fillRect(gx - 1, 129, 8, 6); ctx.fillRect(gx + 9, 129, 10, 2); ctx.fillRect(gx + 9, 133, 10, 2);
}

// ================= FASE 3 — TRAVESSIA DA FLORIANO =================
const fl1 = [ // calçada de partida: Cego da Ficha
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..P.......ff........',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fl2 = [ // pista 1 (mão: direita → esquerda)
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.....f....n....f....',
  '....................',
  '....................',
  '....................',
  'RRRRRRRRRRRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRR',
];
const fl3 = [ // pista 1 continua + canteiro central
  '....................',
  '....................',
  '....................',
  '....................',
  '..........AAAA......',
  '.........AAAAAA.....',
  '....f......ii..t....',
  '...........ii.......',
  '.....f.....ii.......',
  '..........Cii.......',
  '....................',
  '.........EEEEEE.....',
  'RRRRRRRRRREEEEEERRRR',
  'RRRRRRRRRREEEEEERRRR',
];
const fl4 = [ // pista 2 (mão: esquerda → direita, mais rápida)
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '...f....n.....f.....',
  '....................',
  '....................',
  '....................',
  'RRRRRRRRRRRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRR',
];
const fl5 = [ // canteiro 2 + pista 3 (motos!)
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '...a................',
  '....................',
  '..........f...f.....',
  '...t................',
  '....................',
  '..EEEE..............',
  'RREEEERRRRRRRRRRRRRR',
  'RREEEERRRRRRRRRRRRRR',
];
const fl6 = [ // reta final + faixa de pedestre
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....f.....f.........',
  '....................',
  '....................',
  '....................',
  'RRRRRRRRRRRRRRRRSSSS',
  'RRRRRRRRRRRRRRRRSSSS',
];
const fl7 = [ // calçada da TELPA: orelhões e o telefonema
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '......ff............',
  '..............G.....',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];

export function bgFloriano(ctx, camX, camY, t) {
  // céu de meio-dia
  ctx.fillStyle = '#9ad4f0'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9ecfa'; ctx.fillRect(0, 0, W, 28);
  // sol forte
  ctx.fillStyle = '#f8e858'; ctx.fillRect(W - 50, 12, 20, 20);
  const par = camX * 0.4;
  // o prédio da TELPA domina o fundo
  for (let x = -((par) % 420) - 420; x < W + 420; x += 420) {
    ctx.fillStyle = '#8ca4b8';
    ctx.fillRect(x + 200, 30, 70, 116);
    ctx.fillRect(x + 228, 12, 5, 20); // antena
    ctx.fillStyle = '#ff3020'; ctx.fillRect(x + 228, 10, 5, 3); // luz da antena
    ctx.fillStyle = '#c8dce8';
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++)
      ctx.fillRect(x + 206 + i * 16, 36 + j * 13, 10, 8);
    ctx.fillStyle = '#f8f8f8'; ctx.fillRect(x + 204, 32, 62, 3);
    // prédios vizinhos
    ctx.fillStyle = '#aab8c4';
    ctx.fillRect(x + 40, 70, 56, 76); ctx.fillRect(x + 120, 88, 48, 58);
    ctx.fillRect(x + 300, 78, 60, 68);
    ctx.fillStyle = '#8296a4';
    ctx.fillRect(x + 40, 70, 56, 4); ctx.fillRect(x + 120, 88, 48, 4); ctx.fillRect(x + 300, 78, 60, 4);
  }
  // fileira de lojas
  ctx.fillStyle = '#c8b89c'; ctx.fillRect(0, 146, W, 14);
  ctx.fillStyle = '#a89878'; ctx.fillRect(0, 146, W, 3);
}

function decoFloriano(ctx, lvl) {
  const gx = lvl.goalX;
  // dois orelhões na calçada da TELPA
  ctx.drawImage(S.orelhao, gx - 6, 174);
  ctx.drawImage(S.orelhao, gx + 22, 174);
  // Cego da Ficha na calçada de partida
  ctx.drawImage(S.cego, 88, 171);
  // faixa amarela central das pistas + faixa de pedestre
  ctx.fillStyle = '#e8c020';
  for (let i = 22; i < 136; i += 4) {
    const t0 = lvl.tileAt(i, 12), t1 = lvl.tileAt(i + 1, 12);
    if (t0 === 'R' && t1 === 'R') ctx.fillRect(i * 16, 198, 24, 2);
  }
  ctx.fillStyle = '#e8e4da';
  for (let k = 0; k < 5; k++) ctx.fillRect((110 + k) * 16 + 4, 193, 8, 10);
}

// ================= REGISTRO DAS FASES =================
export const LEVELS = {
  cad: {
    id: 'cad', name: 'FUGA DO CAD', music: 'cad',
    map: join(cad1, cad2, cad3, cad4, cad5, cad6, cad7, cad8),
    bg: bgCAD, deco: decoCAD,
    clearMsg: 'ESCAPOU DA LIGINHA!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Prova de matematica hoje? Hoje nao... HOJE NAO.' },
      { who: 'murr', name: 'MURRINHA', text: 'Vou gazear. So preciso sair da escola sem a Liginha me ver.' },
      { who: 'lig', name: 'LIGINHA', text: 'Eu SINTO cheiro de gazeador solto nesse colegio...' },
      { who: 'murr', name: 'MURRINHA', text: 'Vixe. La vem ela. Perna, pra que te quero!' },
    ],
  },
  praca: {
    id: 'praca', name: 'PRACA DOS POMBOS', music: 'praca',
    map: join(pr1, pr2, pr3, pr4, pr5, pr6, pr7),
    bg: bgPraca, deco: decoPraca,
    clearMsg: 'ATRAVESSOU SEQUINHO!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Livre! Agora e so atravessar a Praca dos Pombos...' },
      { who: 'pombo', name: 'POMBO', text: 'PRU. PRU-PRU. (mirando com precisao cirurgica)' },
      { who: 'murr', name: 'MURRINHA', text: '...sem levar uma cagada na cabeca. E olho nos trombadinhas!' },
    ],
  },
  flor: {
    id: 'flor', name: 'TRAVESSIA DA FLORIANO', music: 'floriano',
    map: join(fl1, fl2, fl3, fl4, fl5, fl6, fl7),
    bg: bgFloriano, deco: decoFloriano,
    clearMsg: 'ALO, MAE? TO NA ESCOLA!',
    traffic: [
      { c0: 20, c1: 48, row: 12, dir: -1, speed: 2.4, every: 100 },
      { c0: 59, c1: 81, row: 12, dir: 1, speed: 2.8, every: 90 },
      { c0: 86, c1: 115, row: 12, dir: -1, speed: 3.1, every: 72, types: ['moto', 'moto', 'carro', 'carro', 'onibus'] },
    ],
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Hora do alibi: ligar pra mainha do orelhao da TELPA. "To na escola!"' },
      { who: 'cego', name: 'CEGO DA FICHA', text: 'Fichas fresquinhas, menino. Eu nao VEJO os carros... mas OUCO cada um deles.' },
      { who: 'murr', name: 'MURRINHA', text: 'Atravessar a Floriano na hora do rush. O que pode dar errado?' },
    ],
  },
};

// ================= NÓS DO MAPA-MÚNDI =================
export const NODES = [
  { id: 'cad',    label: 'CAD',            x: 62,  y: 64,  playable: true },
  { id: 'praca',  label: 'PRACA DOS POMBOS', x: 128, y: 92,  playable: true },
  { id: 'bras',   label: 'AS BRASILEIRAS', x: 196, y: 64,  playable: false },
  { id: 'play',   label: 'PLAYTIME',       x: 52,  y: 118, playable: false },
  { id: 'calc',   label: 'CALCADAO',       x: 128, y: 136, playable: false },
  { id: 'flor',   label: 'AV. FLORIANO / TELPA', x: 226, y: 96, playable: true },
  { id: 'fisk',   label: 'FISK / GALEGO',  x: 180, y: 140, playable: false },
  { id: 'fila',   label: 'FILA DO ONIBUS', x: 262, y: 128, playable: false },
  { id: 'bus',    label: 'ONIBUS LOTADO',  x: 292, y: 96,  playable: false },
];
export const EDGES = [
  ['cad', 'praca'], ['praca', 'bras'], ['cad', 'play'], ['praca', 'calc'],
  ['bras', 'flor'], ['calc', 'fisk'], ['flor', 'fila'], ['fisk', 'fila'], ['fila', 'bus'],
];
