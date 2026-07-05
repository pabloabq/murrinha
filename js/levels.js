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
  '..............o.....',
  '.......AAAAAAAAA....',
  '.......AAAAAAAAA....',
  '....p.....ii........',
  '..........ii........',
  '...bb.....ii...ff...',
  '..........ii..bbb...',
  '.ff.......ii........',
  '.EEE.....g..........',
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

// ================= FASE 4 — AS BRASILEIRAS =================
const br1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '..P................f',
  '........rrrr........',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br2 = [
  '....................',
  '....................',
  '....................',
  '........f.f.........',
  '.......rrrrr........',
  '....................',
  '..f..............f..',
  '....................',
  '....................',
  '.......F...........t',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br3 = [ // escada rolante (degraus de laje subindo)
  '....................',
  '....................',
  '...............fff..',
  '..............rrrr..',
  '............==......',
  '..........==........',
  '........==..........',
  '......==............',
  '....==..............',
  '..C.................',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br4 = [
  '....................',
  '....................',
  '....h...............',
  '...rrr..............',
  '....................',
  '....................',
  '..........f.f.......',
  '....................',
  '............F.......',
  '....................',
  '.f.................f',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br5 = [ // escada rolante descendo
  '....................',
  '....................',
  '..fff...............',
  '..rrrr..............',
  '......==............',
  '........==..........',
  '..........==........',
  '............==......',
  '..............==....',
  '................f...',
  '....................',
  '....................',
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const br6 = [ // o chocolate premiado (objetivo)
  '....................',
  '....................',
  '....................',
  '....................',
  '........fff.........',
  '.......rrrrr........',
  '....................',
  '....................',
  '............f.......',
  '..........G.........',
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
  const gx = lvl.goalX;
  // chocolate gigante no objetivo
  ctx.save(); ctx.translate(gx - 6, 150); ctx.scale(2, 2);
  ctx.drawImage(S.chocolate, 0, 0); ctx.restore();
  drawTextC(ctx, 'BRASILEIRAS', W / 2 + lvl.camX * 0 + 0, 8, '#fff'); // (título fixo desativado)
}

// ================= FASE 5 — PLAYTIME =================
const pl1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '..P.................',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl2 = [
  '....................',
  '....................',
  '....................',
  '.......fff..........',
  '......=====.........',
  '....................',
  '..f..............f..',
  '....................',
  '..........Q.........',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl3 = [ // fliperamas (plataformas)
  '....................',
  '....................',
  '....f.......f.......',
  '...===.....===......',
  '....................',
  '.......ff...........',
  '......====..........',
  '....................',
  '..C.................',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl4 = [
  '....................',
  '....................',
  '....................',
  '..........fff.......',
  '.........=====......',
  '....................',
  '..f.................',
  '....................',
  '.....Q.............t',
  '....................',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl5 = [
  '....................',
  '....................',
  '....f...f...f.......',
  '...===.===.===......',
  '....................',
  '....................',
  '.............f......',
  '..........G.........',
  '....................',
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
const ca1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '..P.................',
  '.......bbb..........',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca2 = [ // Carrapeta e suas ondas
  '....................',
  '....................',
  '....................',
  '........f...........',
  '.......bbb..........',
  '....................',
  '..f..............f..',
  '....................',
  '....................',
  '.............W......',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca3 = [ // barracas (plataformas) + Gordo
  '....................',
  '....................',
  '.......fff..........',
  '......XXXXX.........',
  '....................',
  '..f.............f...',
  '....................',
  '..C.....O..........t',
  '....................',
  '....................',
  '....................',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca4 = [ // Tavinho cruzando
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '........bbbbb.......',
  '....................',
  '..f.................',
  '..........V.........',
  '....................',
  '....................',
  '..f................f',
  '....................',
  'LLLLLLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLLLLLL',
];
const ca5 = [ // barracas finais
  '....................',
  '....................',
  '.....f......f.......',
  '....XXX....XXX......',
  '....................',
  '....................',
  '.........f..........',
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
const fk1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '..P.................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk2 = [ // Bené patrulha as DAMAS
  '....................',
  '....................',
  '....................',
  '........f.f.........',
  '.......=====........',
  '....................',
  '..f..............f..',
  '....................',
  '........g.....g.....',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk3 = [ // Galego da Pipoca: chuva de pipoca!
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..f..............f..',
  '....................',
  '..C.........q.......',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk4 = [
  '....................',
  '....................',
  '.......fff..........',
  '......=====.........',
  '....................',
  '..f.................',
  '....................',
  '........g....g.....t',
  '....................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fk5 = [ // Ratinho aparece! (perseguidor rápido)
  '....................',
  '....................',
  '....................',
  '.........f..........',
  '........f.f.........',
  '....................',
  '..f..............f..',
  '....................',
  '.....Y.............G',
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
const fi1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........f.f........',
  '..P.................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi2 = [ // enxame de trombadinhas
  '....................',
  '....................',
  '....................',
  '........f.f.........',
  '....................',
  '....................',
  '..f..............f..',
  '....................',
  '....g...g...g...g...',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi3 = [
  '....................',
  '....................',
  '.......fff..........',
  '......bbbbb.........',
  '....................',
  '..f..............f..',
  '....................',
  '..C.................',
  '...g....g....g...g..',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi4 = [
  '....................',
  '....................',
  '....................',
  '.........fff........',
  '....................',
  '..f.................',
  '....................',
  '....g...g...g...g..t',
  '....................',
  '....................',
  '....................',
  '....................',
  'SSSSSSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSSSSSS',
];
const fi5 = [ // a porta traseira do ônibus (objetivo)
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
const bu1 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..P.....z...z...z...',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu2 = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..z...z...z...z...z.',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu3 = [ // catraca (pule por cima) + cobrador ao lado
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.........ff.........',
  '....................',
  '...z............z...',
  '.............Z......',
  '........DD..........',
  '........DD..........',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu4 = [ // Ratinho também está no ônibus!
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..z...Y...z...z...z.',
  '....................',
  '....................',
  '....................',
  'uuuuuuuuuuuuuuuuuuuu',
  'uuuuuuuuuuuuuuuuuuuu',
];
const bu5 = [ // a porta da frente: descer no ponto certo (objetivo)
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..........f.........',
  '....................',
  '..z...z...z......G..',
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
  bras: {
    id: 'bras', name: 'AS BRASILEIRAS', music: 'praca',
    map: join(br1, br2, br3, br4, br5, br6),
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
    map: join(pl1, pl2, pl3, pl4, pl5),
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
    map: join(ca1, ca2, ca3, ca4, ca5),
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
    map: join(fk1, fk2, fk3, fk4, fk5),
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
    map: join(fi1, fi2, fi3, fi4, fi5),
    bg: bgFila, deco: decoFila,
    clearMsg: 'ENTROU NO ONIBUS!',
    cutscene: [
      { who: 'murr', name: 'MURRINHA', text: 'Fim de tarde. Hora de pegar o onibus como se tivesse saido da aula.' },
      { who: 'murr', name: 'MURRINHA', text: 'A fila ta cheia de trombadinha querendo bater minha carteira. Pula neles!' },
    ],
  },
  bus: {
    id: 'bus', name: 'O ONIBUS LOTADO', music: 'floriano',
    map: join(bu1, bu2, bu3, bu4, bu5),
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
