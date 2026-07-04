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
  '..........fff......',
  '........=====......',
  '....................',
  '...................f',
  '.f.................f',
  '.DD.......1.......DD',
  '.DD...............DD',
  '####################',
  '####################',
];
const cad3 = [ // biblioteca: prateleiras
  '....................',
  '....................',
  '....h...............',
  '...====....fff......',
  '..........=====.....',
  '.ff................f',
  '.===..............==',
  '..........ff........',
  '.......====.........',
  '.fff................',
  '.===........X.......',
  '............X.......',
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
  '....................',
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
  '....ff..............',
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
  '....i...............',
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
const pr3 = [ // banca do Orlando
  '....................',
  '....................',
  '....................',
  '....fff.............',
  '..........h........',
  '........=======.....',
  '........XXXXXXX.....',
  '..f.....XXXXXXX.....',
  '..b.....XXXXXXX..g..',
  '........XXXXXXX.....',
  '....g...XXXXXXX...f.',
  '........XXXXXXX...f.',
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
  '...i.....fff........',
  '...i....bbbbb.......',
  '...i................',
  '...C................',
  '.........g..g...d...',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr5 = [ // lago de pombos (chuva de cocô)
  '....................',
  '..o.....o.....o.....',
  '....................',
  '....................',
  '....................',
  '.....ff.......ff....',
  '....bbbb.....bbbb...',
  '....................',
  '....................',
  '....................',
  '......g.........g...',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr6 = [ // canteiro grande: sobe e desce
  '....................',
  '....................',
  '....................',
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
};

// ================= NÓS DO MAPA-MÚNDI =================
export const NODES = [
  { id: 'cad',    label: 'CAD',            x: 62,  y: 64,  playable: true },
  { id: 'praca',  label: 'PRACA DOS POMBOS', x: 128, y: 92,  playable: true },
  { id: 'bras',   label: 'AS BRASILEIRAS', x: 196, y: 64,  playable: false },
  { id: 'play',   label: 'PLAYTIME',       x: 52,  y: 118, playable: false },
  { id: 'calc',   label: 'CALCADAO',       x: 128, y: 136, playable: false },
  { id: 'flor',   label: 'AV. FLORIANO',   x: 226, y: 96,  playable: false },
  { id: 'fisk',   label: 'FISK / GALEGO',  x: 180, y: 140, playable: false },
  { id: 'fila',   label: 'FILA DO ONIBUS', x: 262, y: 128, playable: false },
  { id: 'bus',    label: 'ONIBUS LOTADO',  x: 292, y: 96,  playable: false },
];
export const EDGES = [
  ['cad', 'praca'], ['praca', 'bras'], ['cad', 'play'], ['praca', 'calc'],
  ['bras', 'flor'], ['calc', 'fisk'], ['flor', 'fila'], ['fisk', 'fila'], ['fila', 'bus'],
];
