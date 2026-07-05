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
const cad2 = [ // corredor: Liginha 1 (pule por cima pegando as fichas!)
  '....................',
  '....................',
  '....................',
  '.........f..........',
  '........f.f.........',
  '.......f...f........',
  '....................',
  '....a...............',
  '.f.................f',
  '.f.......1.........f',
  '.DD...............DD',
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
const cad4 = [ // depósito do zelador: caixas para pular (chão contínuo)
  '....................',
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '....................',
  '....................',
  '.......f......f.....',
  '..............f.....',
  '....XX....XX....XX..',
  '....XX....XX....XX..',
  '.f..XX....XX....XX..',
  '####################',
  '####################',
];
const cad5 = [ // pátio: escadinha de muretas (sobe e desce, sem buraco)
  '....................',
  '....................',
  '....................',
  '....................',
  '.............ff.....',
  '..........t.........',
  '.......ff...........',
  '....................',
  '..C.............MMMM',
  '............MMMMMMMM',
  '........MMMMMMMMMMMM',
  '....MMMMMMMMMMMMMMMM',
  '####MMMMMMMMMMMMMMMM',
  '####################',
];
const cad6 = [ // corredor final: Liginha 2 (pule por cima!)
  '....................',
  '....................',
  '....................',
  '..........f.........',
  '.........f.f........',
  '........f...f.......',
  '.......f.....f......',
  '....................',
  '....................',
  'f..................f',
  'D........1.........D',
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
  '....o...............',
  '..AAAAA.............',
  '..AAAAA......fff....',
  '....i.......n.......',
  '....i......bbb......',
  '..P.i...............',
  '....i...............',
  '....i.......g.......',
  '....i...............',
  '....i...............',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr2 = [ // canteiros e pombos
  '....................',
  '..............o.....',
  '.......AAAAAAAAA....',
  '.......AAAAAAAAA....',
  '....p.....ii........',
  '..........ii........',
  '...bb.....ii...ff...',
  '..........ii..bbb...',
  '.ff.......ii........',
  '.EEE.....g.ii.......',
  '.EEE.......ii.......',
  '...........ii.......',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const pr3 = [ // banca do Orlando (baixa, teto com prêmio) + árvore
  '..............AAAAA.',
  '.............AAAAAAA',
  '..............AAAAA.',
  '....fff........i....',
  '...............i....',
  '...............i....',
  '...............i....',
  '.........ht....i....',
  '........=====..i....',
  '..f.....XXXXX..i....',
  '..b.....XXXXX..i....',
  '....g...XXXXX..i....',
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
  '...iC...............',
  '...i.....g..g...d...',
  '...i................',
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
  '....i...............',
  '....i.g.g......G....',
  '....i...............',
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

// ============ FASE — TRAVESSIA DA FLORIANO (Frogger vertical) ============
// Você SOBE atravessando 4 faixas de trânsito. Descanse nos canteiros (m).
// Carros nascem/somem FORA da tela pelas laterais e cruzam a largura toda.
// 32 colunas de largura (as bordas ficam fora da câmera) x 20 linhas de altura.
const FLOR_MAP = [
  '................................', // 0  céu
  '................................', // 1
  '................................', // 2
  '................................', // 3
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', // 4  calçada da TELPA (CHEGADA - one-way)
  '........f...............f.......', // 5  faixa A (→)
  '......................t.........', // 6      (ticket)
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', // 7  canteiro 1
  '............f...a...f...........', // 8  faixa B (←)  + maçã
  '..........t.....................', // 9      (ticket)
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', // 10 canteiro 2
  '........f...............f.......', // 11 faixa C (→)
  '..................t.............', // 12     (ticket)
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', // 13 canteiro 3
  '..............f.....f...........', // 14 faixa D (←)
  '............P...................', // 15 (início logo acima da calçada)
  'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 16 calçada de partida
  'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 17
  'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 18
  'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 19
];

export function bgFloriano(ctx, camX, camY, t) {
  ctx.fillStyle = '#9ad4f0'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9ecfa'; ctx.fillRect(0, 0, W, Math.max(0, 40 - camY));
  // prédio da TELPA acima da calçada de cima (aparece quando você sobe)
  const telY = 4 * 16 - camY; // topo da calçada de chegada em tela
  ctx.fillStyle = '#8ca4b8'; ctx.fillRect(60, telY - 74, 70, 74);
  ctx.fillStyle = '#55555e'; ctx.fillRect(90, telY - 88, 5, 14);
  ctx.fillStyle = '#ff3020'; ctx.fillRect(90, telY - 90, 5, 3);
  ctx.fillStyle = '#c8dce8';
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) ctx.fillRect(66 + i * 15, telY - 68 + j * 15, 9, 9);
  ctx.fillStyle = '#aab8c4';
  ctx.fillRect(150, telY - 56, 46, 56); ctx.fillRect(6, telY - 44, 44, 44);
  ctx.fillStyle = '#8296a4'; ctx.fillRect(150, telY - 56, 46, 3); ctx.fillRect(6, telY - 44, 44, 3);
  // asfalto da avenida (linhas 5..15) atrás das faixas vazias
  const aTop = 5 * 16 - camY, aBot = 16 * 16 - camY;
  ctx.fillStyle = '#484850'; ctx.fillRect(0, aTop, W, aBot - aTop);
  ctx.fillStyle = '#3c3c44';
  for (let yy = aTop; yy < aBot; yy += 6) ctx.fillRect(0, yy, W, 1);
}

function decoFloriano(ctx, lvl) {
  // orelhões na calçada de chegada (linha 4)
  const topY = 4 * 16;
  ctx.drawImage(S.orelhao, 12 * 16, topY - 18);
  ctx.drawImage(S.orelhao, 18 * 16, topY - 18);
  drawTextC(ctx, 'TELPA', 15 * 16 + 4, topY - 26, '#f2d24e');
  // Cego da Ficha na calçada de partida (linha 16)
  ctx.drawImage(S.cego, 8 * 16, 16 * 16 - 21);
  // seta CHEGADA piscando no topo
  if (Math.floor(lvl.time / 20) % 2 === 0) drawTextC(ctx, 'SOBE!', 24 * 16, 15 * 16, '#f8f8f8');
}

// ================= FASE 4 — AS BRASILEIRAS =================
const br1 = [ // entrada: balcões e a primeira arara
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f.f......',
  '........=====.......',
  '....................',
  '....................',
  '..P.......rr........',
  '.......rr...........',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br2 = [ // fiscal patrulha entre as araras (esconda-se pulando)
  '....................',
  '....................',
  '........t...........',
  '......=====.........',
  '....................',
  '....f..........f....',
  '...rr...........rr..',
  '....................',
  '....................',
  '.........F..........',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br3 = [ // a ESCADA ROLANTE sobe pro mezanino (única da cidade!)
  '................ffff',
  '...............rrrrr',
  '..............======',   // mezanino (piso do 2o andar)
  '............==.......',
  '..........==.........',
  '........==...........',
  '......==.............',
  '....==...............',
  '..==.................',
  '..C.................f',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br4 = [ // mezanino: prateleiras, fiscal 2 e o chocolate no alto
  'rrrr................',   // continua o mezanino
  '======..............',
  '.....h..............',   // chocolate no 2o andar
  '....===.............',
  '..........fff.......',
  '.........=====......',
  '...............F....',
  '....................',
  '....................',
  '..f..............f..',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br5 = [ // escada rolante DESCE de volta ao térreo
  'fff.................',
  'rrr.................',
  '===.................',
  '...==...............',
  '.....==.............',
  '.......==...........',
  '.........==.....t...',
  '...........==..rrrr.',   // ticket 2 numa arara alta
  '.............==.....',
  '...............f....',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br6 = [ // corredor de caixas registradoras + fiscal 3
  '....................',
  '....................',
  '........fff.........',
  '.......=====........',
  '....................',
  '..f.................',
  '...rr.......rr......',
  '....................',
  '..........F.........',
  '....................',
  '.f................f.',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br7 = [ // vitrine dos chocolates: o prêmio (objetivo)
  '....................',
  '....................',
  '.......ftf..........',
  '......=====.........',   // ticket 3 no topo
  '....................',
  '....................',
  '............f.......',
  '....................',
  '..........G.........',
  '....................',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];

export function bgBras(ctx, camX, camY, t) {
  ctx.fillStyle = '#f0ead8'; ctx.fillRect(0, 0, W, H);        // interior claro
  ctx.fillStyle = '#e0d8c0'; ctx.fillRect(0, 120, W, H);
  // prateleiras de fundo (parallax)
  const par = camX * 0.5;
  for (let x = -((par) % 96) - 96; x < W + 96; x += 96) {
    ctx.fillStyle = '#c8b088'; ctx.fillRect(x + 6, 40, 84, 78);
    ctx.fillStyle = '#a88a58';
    for (let j = 0; j < 4; j++) ctx.fillRect(x + 6, 48 + j * 18, 84, 3);
    // produtos coloridos
    for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) {
      ctx.fillStyle = ['#c85050','#5070c8','#50a060','#c8a040','#8050a0'][(i + j) % 5];
      ctx.fillRect(x + 10 + i * 10, 52 + j * 18, 6, 10);
    }
  }
  // faixa verde-amarela das Brasileiras no topo
  ctx.fillStyle = '#2e8a5c'; ctx.fillRect(0, 14, W, 8);
  ctx.fillStyle = '#f2d24e'; ctx.fillRect(0, 22, W, 6);
}
function decoBras(ctx, lvl) {
  // escada rolante: degraus metálicos animados sob os '=' em diagonal
  const t = lvl.time;
  for (let j = 0; j < lvl.h; j++) for (let i = 0; i < lvl.w; i++) {
    if (lvl.rows[j][i] !== '=') continue;
    const diagUp = lvl.rows[j - 1] && lvl.rows[j - 1][i + 1] === '=';
    const diagDn = lvl.rows[j + 1] && lvl.rows[j + 1][i + 1] === '=';
    if (!diagUp && !diagDn) continue; // só nos trechos inclinados (escada)
    const x = i * 16, y = j * 16;
    ctx.fillStyle = '#9aa0ac'; ctx.fillRect(x, y + 6, 16, 4);       // lateral metálica
    ctx.fillStyle = '#c8ccd4';
    const off = Math.floor(t / 6) % 4;
    for (let s = -4; s < 16; s += 4) ctx.fillRect(x + ((s + off) % 16 + 16) % 16, y + 2, 2, 4); // degraus subindo
  }
  const gx = lvl.goalX;
  // vitrine e chocolate gigante no objetivo
  ctx.fillStyle = '#8a5a2c'; ctx.fillRect(gx - 14, 150, 40, 42);
  ctx.fillStyle = '#bfe8f8'; ctx.fillRect(gx - 12, 152, 36, 30);
  ctx.save(); ctx.translate(gx - 4, 156); ctx.scale(1.6, 1.6);
  ctx.drawImage(S.chocolate, 0, 0); ctx.restore();
}

// ================= FASE 5 — PLAYTIME =================
const pl1 = [ // entrada do fliperama
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '........=====.......',
  '....................',
  '..P.................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl2 = [ // Cacimba dança atrás de você (pule por cima)
  '....................',
  '....................',
  '....................',
  '........t...........',
  '......=====.........',
  '....................',
  '..f..............f..',
  '.....===....===.....',
  '....................',
  '..........Q.........',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl3 = [ // escadaria de fliperamas + checkpoint
  '....................',
  '....................',
  '..............fff...',
  '.............=====..',
  '..........===.......',
  '.......===..........',
  '....===.............',
  '....................',
  '..C.................',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl4 = [ // Cacimba 2 + saltos entre fliperamas
  '....................',
  '....................',
  '....................',
  '....f.......f.......',
  '...===.....===......',
  '....................',
  '..f.......f........f',
  '.......======.......',
  '....................',
  '...................t',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl5 = [ // salão dos fliperamas + Cacimba 2
  '....................',
  '....................',
  '....f...f...f.......',
  '...===.===.===......',
  '....................',
  '..f.................',
  '.........===........',
  '....................',
  '............Q.......',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl6 = [ // a porta de SAÍDA (objetivo)
  '....................',
  '....................',
  '.......ftf..........',
  '......=====.........',
  '....................',
  '....................',
  '............f.......',
  '....................',
  '..........G.........',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];

export function bgPlay(ctx, camX, camY, t) {
  ctx.fillStyle = '#0e0e22'; ctx.fillRect(0, 0, W, H);
  // neon parallax
  const par = camX * 0.4;
  for (let x = -((par) % 80) - 80; x < W + 80; x += 80) {
    ctx.fillStyle = '#1a1a3a'; ctx.fillRect(x + 8, 30, 60, 92);
    ctx.fillStyle = (Math.floor(t / 20) + x) % 2 ? '#f02080' : '#20d0f0';
    ctx.fillRect(x + 8, 30, 60, 2);
    ctx.fillStyle = '#20d0f0';
    for (let j = 0; j < 5; j++) ctx.fillRect(x + 12, 40 + j * 14, 52, 1);
  }
  // grade de piso brilhante ao fundo
  ctx.strokeStyle = 'rgba(32,208,240,0.25)'; ctx.lineWidth = 1;
  for (let x = -(camX % 24); x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 118); ctx.lineTo(x - 30, H); ctx.stroke(); }
}
function decoPlay(ctx, lvl) {
  // fliperamas embaixo das lajes '=' (procura tiles de laje na base)
  for (let i = 0; i < lvl.w; i++) for (let j = 0; j < lvl.h; j++) {
    if (lvl.rows[j][i] === '=' && lvl.rows[j - 1] && lvl.rows[j - 1][i] !== '=' && (i === 0 || lvl.rows[j][i - 1] !== '=')) {
      ctx.drawImage(S.fliperama, i * 16 + 1, j * 16 + 2);
    }
  }
  const gx = lvl.goalX;
  // porta de SAÍDA verde neon
  ctx.fillStyle = '#0a2a1a'; ctx.fillRect(gx - 10, 156, 28, 36);
  ctx.fillStyle = '#20f060'; ctx.fillRect(gx - 10, 156, 28, 4);
  drawTextC(ctx, 'SAIDA', gx + 4, 160, '#20f060');
}

// ================= FASE 6 — CALÇADÃO =================
const ca1 = [ // entrada do calçadão: bancos de alvenaria
  '....................',
  '....................',
  '....................',
  '....................',
  '.........t..........',
  '....................',
  '.........f.f........',
  '.......bbb...bbb.....',
  '..P.................',
  '....................',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca2 = [ // Carrapeta 1: pule as ondas de assovio
  '....................',
  '....................',
  '....................',
  '........fff.........',
  '.......bbbbb........',
  '....................',
  '..f..............f..',
  '....................',
  '....................',
  '..............W.....',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca3 = [ // barracas de ambulante + Gordo + checkpoint
  '....................',
  '....................',
  '.......t............',
  '.....XXXXX..........',
  '....................',
  '..f...........f.....',
  '.........bbb........',
  '..C.......O.........',
  '....................',
  '....................',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca4 = [ // Tavinho cruza correndo (te prende na conversa)
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '........bbbbb.......',
  '....................',
  '..f.............f...',
  '.........V..........',
  '....................',
  '....................',
  '..f................f',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca5 = [ // barracas altas + Gordo 2 (plataforma-obstáculo)
  '....................',
  '....................',
  '....f......f........',
  '...XXX....XXX.......',
  '....................',
  '..f.................',
  '.........bbb........',
  '.....O..............',
  '....................',
  '..f...............f.',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca6 = [ // Carrapeta 2 e a saída do calçadão (objetivo)
  '....................',
  '....................',
  '.......ftf..........',
  '......bbbbb.........',
  '....................',
  '..f.................',
  '....................',
  '..W...............G.',
  '....................',
  '....................',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];

export function bgCalc(ctx, camX, camY, t) {
  bgPraca(ctx, camX, camY, t); // mesma praça/centro, com barracas na frente
  const par = camX * 0.7;
  for (let x = -((par) % 72) - 72; x < W + 72; x += 72) {
    // toldos de barraca coloridos ao fundo
    ctx.fillStyle = '#c03028'; ctx.fillRect(x + 10, 116, 40, 6);
    ctx.fillStyle = '#f8f8f8'; ctx.fillRect(x + 10, 116, 40, 2);
    ctx.fillStyle = '#8a5a2c'; ctx.fillRect(x + 12, 122, 3, 18); ctx.fillRect(x + 45, 122, 3, 18);
  }
}
function decoCalc(ctx, lvl) {
  for (const e of lvl.ents) if (e.t === 'check') ctx.drawImage(S.busto, e.x - 26, e.y - 4);
}

// ================= FASE 7 — FISK / GALEGO =================
const fk1 = [ // ponto da FISK: chegada
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '........=====.......',
  '....................',
  '..P.................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk2 = [ // saída das DAMAS: multidão de alunos (trombadinhas)
  '....................',
  '....................',
  '....................',
  '........t...........',
  '......=====.........',
  '....................',
  '..f..............f..',
  '....................',
  '.....g....g....g....',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk3 = [ // GALEGO DA PIPOCA: pegue os grãos que pulam da panela!
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....f..........f....',
  '....................',
  '....................',
  '..C...........q.....',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk4 = [ // mais pipoca + plataformas do ponto
  '....................',
  '....................',
  '.......fff..........',
  '......=====.........',
  '....................',
  '..f.......q........f',
  '....................',
  '....................',
  '.........g.........t',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk5 = [ // O RATINHO APARECE! Corre que ele quer teu tênis
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '....................',
  '..f..............f..',
  '....................',
  '....................',
  '.....Y..............',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk6 = [ // disparada até o ponto de ônibus (objetivo)
  '....................',
  '....................',
  '.......ftf..........',
  '......=====.........',
  '....................',
  '..f.................',
  '....................',
  '..............f....G',
  '....................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];

export function bgFisk(ctx, camX, camY, t) {
  ctx.fillStyle = '#9ad4f0'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9ecfa'; ctx.fillRect(0, 0, W, 26);
  const par = camX * 0.5;
  for (let x = -((par) % 200) - 200; x < W + 200; x += 200) {
    // prédio branco da FISK com letreiro vermelho
    ctx.fillStyle = '#f4f4ec'; ctx.fillRect(x + 20, 46, 90, 96);
    ctx.fillStyle = '#d81e18'; ctx.fillRect(x + 30, 54, 70, 12);
    ctx.fillStyle = '#f4f4ec';
    // "FISK"
    // janelas
    ctx.fillStyle = '#9ad4f0';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) ctx.fillRect(x + 32 + i * 24, 74 + j * 20, 16, 12);
    ctx.fillStyle = '#c8c4b8'; ctx.fillRect(x + 20, 46, 90, 3);
    // convento das DAMAS ao lado
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + 120, 60, 64, 82);
    ctx.fillStyle = '#b89860'; ctx.fillRect(x + 148, 44, 8, 18);
  }
  ctx.fillStyle = '#b0aca0'; ctx.fillRect(0, 140, W, 12);
}
function decoFisk(ctx, lvl) {
  for (const e of lvl.ents) if (e.t === 'check') { /* Galego já desenhado como entidade */ }
  // letreiro FISK
}

// ================= FASE 8 — FILA DO ÔNIBUS =================
const fi1 = [ // fim de tarde: chegando na parada
  '....................',
  '....................',
  '....................',
  '....................',
  '........t...........',
  '....................',
  '.........f.f........',
  '.......bbb..........',
  '..P.................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi2 = [ // primeiro enxame de trombadinhas (pise neles!)
  '....................',
  '....................',
  '....................',
  '.........t..........',
  '....................',
  '....................',
  '..f..............f..',
  '....................',
  '.....g......g.......',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi3 = [ // banco pra respirar + checkpoint
  '....................',
  '....................',
  '.......fff..........',
  '......bbbbb.........',
  '....................',
  '..f..............f..',
  '....................',
  '..C.................',
  '...g.....g.....g....',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi4 = [ // segundo enxame, mais denso
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '............t.......',
  '..f.................',
  '.......bb....bb.....',
  '....................',
  '....g......g......g.',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi5 = [ // reta final de trombadinhas
  '....................',
  '....................',
  '....f...f...f.......',
  '....................',
  '....................',
  '..f.................',
  '....................',
  '....g....g....g.....',
  '....................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi6 = [ // a porta traseira do ônibus (objetivo)
  '....................',
  '....................',
  '....................',
  '........f.f.........',
  '....................',
  '..f.................',
  '....g...g...........',
  '....................',
  '...............G....',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];

export function bgFila(ctx, camX, camY, t) {
  // fim de tarde: céu laranja
  ctx.fillStyle = '#f0a850'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f8c878'; ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = '#f8e0a0'; ctx.fillRect(0, 0, W, 18);
  ctx.fillStyle = '#f8e858'; ctx.fillRect(W - 70, 20, 26, 26); // sol baixo
  const par = camX * 0.5;
  ctx.fillStyle = '#a06840';
  for (let x = -((par) % 240) - 240; x < W + 240; x += 240) {
    ctx.fillRect(x, 84, 50, 58); ctx.fillRect(x + 60, 96, 40, 46);
    ctx.fillRect(x + 130, 60, 44, 82); ctx.fillRect(x + 190, 88, 56, 54);
  }
  // o ônibus estacionado ao fundo direito
  ctx.fillStyle = '#c8b89c'; ctx.fillRect(0, 130, W, 20);
}
function decoFila(ctx, lvl) {
  const gx = lvl.goalX;
  // traseira do ônibus no objetivo
  ctx.drawImage(S.onibus, gx - 20, 150);
  ctx.fillStyle = '#141420'; ctx.fillRect(gx - 4, 168, 14, 24); // porta traseira aberta
}

// ================= FASE 9 — O ÔNIBUS LOTADO =================
const bu1 = [ // entrou pela porta de trás: primeiros passageiros
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........f.........',
  '....................',
  '..P.....z...z...z...',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu2 = [ // o corredor aperta: fura a multidão
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '........t...........',
  '....................',
  '..z..z...z..z...z.z.',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu3 = [ // catraca (pule por cima) + cobrador + checkpoint
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........ff.........',
  '....................',
  '..C..z..........z...',
  '.............Z......',
  '........DD..........',
  '........DD..........',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu4 = [ // O RATINHO também pegou esse ônibus!
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '........t...........',
  '....................',
  '..z...Y....z...z...z.',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu5 = [ // últimas fileiras antes da frente
  '....................',
  '....................',
  '....................',
  '....................',
  '..........t.........',
  '....................',
  '..........f.........',
  '....................',
  '..z.z..z..z.z..z.z..',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu6 = [ // a porta da frente: descer no ponto certo (objetivo)
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........f.........',
  '....................',
  '..z...z..........G..',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];

export function bgBus(ctx, camX, camY, t) {
  const sway = Math.sin(t * 0.06) * 2;
  ctx.fillStyle = '#c8c0a8'; ctx.fillRect(0, 0, W, H);         // teto/parede do ônibus
  ctx.fillStyle = '#b0a888'; ctx.fillRect(0, 96, W, H);
  // janelas do ônibus com a cidade passando
  ctx.fillStyle = '#3a3a44'; ctx.fillRect(0, 20 + sway, W, 6); // barra superior
  for (let x = -((camX * 1.2) % 72); x < W; x += 72) {
    ctx.fillStyle = '#2a2a34'; ctx.fillRect(x + 4, 28 + sway, 60, 48);
    ctx.fillStyle = '#8ec8e8'; ctx.fillRect(x + 6, 30 + sway, 56, 44);
    // cidade correndo do lado de fora
    ctx.fillStyle = '#c8b89c';
    const o = (camX * 2.4) % 40;
    ctx.fillRect(x + 6 + ((10 - o) % 56 + 56) % 56, 44 + sway, 14, 30);
    ctx.fillRect(x + 6 + ((36 - o) % 56 + 56) % 56, 50 + sway, 12, 24);
    ctx.fillStyle = '#2a2a34'; ctx.fillRect(x + 4, 28 + sway, 60, 2);
  }
  // barra de apoio (onde os passageiros seguram)
  ctx.fillStyle = '#8a8a96'; ctx.fillRect(0, 84 + sway, W, 3);
}
function decoBus(ctx, lvl) {
  const gx = lvl.goalX;
  // porta da frente aberta no objetivo
  ctx.fillStyle = '#1a1a22'; ctx.fillRect(gx - 2, 150, 20, 42);
  ctx.fillStyle = '#3a6a9a'; ctx.fillRect(gx - 2, 150, 4, 42);
  drawTextC(ctx, 'DESCER', gx + 8, 144, '#f2d24e');
}

// ================= REGISTRO DAS FASES =================
export const LEVELS = {
  cad: {
    id: 'cad', name: 'FUGA DO CAD', music: 'cad',
    map: join(cad1, cad2, cad3, cad4, cad5, cad6, cad7, cad8),
    bg: bgCAD, deco: decoCAD,
    clearMsg: 'ESCAPOU DA VANITA!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Prova de matematica hoje? Hoje nao... HOJE NAO.' },
      { who: 'murr', name: 'MURRINHA', text: 'Vou gazear. So preciso sair da escola sem a Vanita me ver.' },
      { who: 'lig', name: 'VANITA', text: 'Eu SINTO cheiro de gazeador solto nesse colegio...' },
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
    map: FLOR_MAP,
    bg: bgFloriano, deco: decoFloriano,
    goalY: 55,                     // vence ao pisar na calçada da TELPA (lá em cima)
    clearMsg: 'ALO, MAE? TO NA ESCOLA!',
    laneTraffic: [
      { topRow: 5,  dir: 1,  speed: 1.6, every: 135, types: ['carro', 'carro', 'moto'] },
      { topRow: 8,  dir: -1, speed: 1.9, every: 120, types: ['carro', 'moto', 'carro'] },
      { topRow: 11, dir: 1,  speed: 2.0, every: 118, types: ['moto', 'carro', 'moto'] },
      { topRow: 14, dir: -1, speed: 1.6, every: 145, types: ['carro', 'carro', 'moto'] },
    ],
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'A Floriano na hora do rush. Pra ligar da TELPA, tenho que atravessar ela toda.' },
      { who: 'cego', name: 'CEGO DA FICHA', text: 'Sobe com juizo, menino. Descansa nos canteiros e passa quando a faixa tiver limpa.' },
      { who: 'murr', name: 'MURRINHA', text: 'Subir faixa por faixa sem virar panqueca. Bora!' },
    ],
  },
  bras: {
    id: 'bras', name: 'AS BRASILEIRAS', music: 'praca',
    map: join(br1, br2, br3, br4, br5, br6, br7),
    bg: bgBras, deco: decoBras,
    clearMsg: 'CHOCOLATE NO BOLSO!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'A loja das Brasileiras. A unica escada rolante da cidade!' },
      { who: 'murr', name: 'MURRINHA', text: 'Missao: pegar um chocolate sem o fiscal ver. Pela escola!' },
      { who: 'fiscal', name: 'FISCAL', text: 'Ó os menino do CAD de novo... to de olho, viu?' },
    ],
  },
  play: {
    id: 'play', name: 'PLAYTIME', music: 'floriano',
    map: join(pl1, pl2, pl3, pl4, pl5, pl6),
    bg: bgPlay, deco: decoPlay,
    clearMsg: 'ZEROU E VAZOU!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'O Playtime! Fliperama ate a boca. Bora zerar uns joguinho.' },
      { who: 'cacimba', name: 'CACIMBA', text: 'Ei menino... deixa eu dancar so um pouquinho colado em voce...' },
      { who: 'murr', name: 'MURRINHA', text: 'NAO. Longe, Cacimba! Vou jogar e sair sem ser encantado!' },
    ],
  },
  calc: {
    id: 'calc', name: 'CALCADAO', music: 'praca',
    map: join(ca1, ca2, ca3, ca4, ca5, ca6),
    bg: bgCalc, deco: decoCalc,
    clearMsg: 'PASSOU RETO!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'O Calcadao: barraqueiro, o Gordo andando devagar, e o palhaco Carrapeta.' },
      { who: 'carrapeta', name: 'CARRAPETA', text: 'FIU-FIU! (a onda de assovio vem vindo)' },
      { who: 'murr', name: 'MURRINHA', text: 'Pula as ondas do Carrapeta e nao encosta no Gordo. Simples... sera?' },
    ],
  },
  fisk: {
    id: 'fisk', name: 'FISK E O GALEGO', music: 'praca',
    map: join(fk1, fk2, fk3, fk4, fk5, fk6),
    bg: bgFisk, deco: decoFisk,
    clearMsg: 'CORREU DO RATINHO!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Regiao da FISK. Pega a pipoca do Galego pulando da panela!' },
      { who: 'galego', name: 'GALEGO', text: 'Pipoca quentinha, menino! Cada grao vale uma ficha!' },
      { who: 'murr', name: 'MURRINHA', text: 'E cuidado: o Ratinho ta rondando querendo meu tenis...' },
    ],
  },
  fila: {
    id: 'fila', name: 'FILA DO ONIBUS', music: 'cad',
    map: join(fi1, fi2, fi3, fi4, fi5, fi6),
    bg: bgFila, deco: decoFila,
    clearMsg: 'ENTROU NO ONIBUS!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Fim de tarde. Hora de pegar o onibus como se tivesse saido da aula.' },
      { who: 'murr', name: 'MURRINHA', text: 'A fila ta cheia de trombadinha querendo bater minha carteira. Pula neles!' },
    ],
  },
  bus: {
    id: 'bus', name: 'O ONIBUS LOTADO', music: 'floriano',
    map: join(bu1, bu2, bu3, bu4, bu5, bu6),
    bg: bgBus, deco: decoBus,
    clearMsg: 'DESCEU NO PONTO CERTO!',
    ending: true,
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Entrei pela porta de tras. Agora atravessar o onibus LOTADO ate a frente.' },
      { who: 'murr', name: 'MURRINHA', text: 'Fura a multidao, passa da catraca e desce no ponto certo. Ninguem vai saber!' },
    ],
  },
};

// ================= NÓS DO MAPA-MÚNDI =================
export const NODES = [
  { id: 'cad',    label: 'CAD',            x: 62,  y: 64,  playable: true },
  { id: 'praca',  label: 'PRACA DOS POMBOS', x: 128, y: 92,  playable: true },
  { id: 'bras',   label: 'AS BRASILEIRAS', x: 196, y: 64,  playable: true },
  { id: 'play',   label: 'PLAYTIME',       x: 52,  y: 118, playable: true },
  { id: 'calc',   label: 'CALCADAO',       x: 128, y: 136, playable: true },
  { id: 'flor',   label: 'AV. FLORIANO / TELPA', x: 226, y: 96, playable: true },
  { id: 'fisk',   label: 'FISK / GALEGO',  x: 180, y: 140, playable: true },
  { id: 'fila',   label: 'FILA DO ONIBUS', x: 262, y: 128, playable: true },
  { id: 'bus',    label: 'ONIBUS LOTADO',  x: 292, y: 96,  playable: true },
];
export const EDGES = [
  ['cad', 'praca'], ['praca', 'bras'], ['cad', 'play'], ['praca', 'calc'],
  ['bras', 'flor'], ['calc', 'fisk'], ['flor', 'fila'], ['fisk', 'fila'], ['fila', 'bus'],
];
