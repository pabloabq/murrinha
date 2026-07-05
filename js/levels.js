// levels.js — dados das fases: mapas ASCII, fundos, cutscenes
// Legenda do mapa:
//  # piso escola | M tijolo | L ladrilho praça | E canteiro | D carteira | X caixa
//  = laje (one-way) | b banco (one-way) | c coluna(deco) | i tronco | A copa
//  P início | C checkpoint | G objetivo | f ficha | h chocolate | p pipoca
//  1 Liginha | g trombadinha | o pombo | d aluno das DAMAS
import { W, H, drawTextC, drawText, drawTextO, textWidth } from './gfx.js';
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
  const cy = camY * 0.5;
  // parede da escola: painel bege claro em cima, rodapé (lambril) mais escuro
  ctx.fillStyle = '#ece0c4'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c8b488'; ctx.fillRect(0, 112 - cy, W, H);        // lambril
  ctx.fillStyle = '#a68a54'; ctx.fillRect(0, 110 - cy, W, 3);        // friso do lambril
  ctx.fillStyle = '#8a6c3c'; ctx.fillRect(0, 106 - cy, W, 2);
  // luminárias fluorescentes no teto
  for (let x = -((camX * 0.5) % 96); x < W; x += 96) {
    ctx.fillStyle = '#f8f4d8'; ctx.fillRect(x + 20, 6, 40, 4);
    ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 16, 4, 48, 12); ctx.globalAlpha = 1;
  }
  const par = camX * 0.5;
  for (let x = -((par) % 128) - 128; x < W + 128; x += 128) {
    // janelão com esquadria e céu
    ctx.fillStyle = '#7a5828'; ctx.fillRect(x + 2, 24 - cy, 50, 40);
    ctx.fillStyle = '#9ad4f0'; ctx.fillRect(x + 5, 27 - cy, 44, 34);
    ctx.fillStyle = '#c9ecfa'; ctx.fillRect(x + 5, 27 - cy, 44, 9);
    ctx.fillStyle = '#7a5828'; ctx.fillRect(x + 26, 27 - cy, 2, 34); ctx.fillRect(x + 5, 43 - cy, 44, 2);
    // coluna vermelha brutalista do CAD entre as janelas
    ctx.fillStyle = '#b02820'; ctx.fillRect(x + 60, 14 - cy, 10, 94);
    ctx.fillStyle = '#d84838'; ctx.fillRect(x + 60, 14 - cy, 3, 94);
    ctx.fillStyle = '#801812'; ctx.fillRect(x + 67, 14 - cy, 3, 94);
    // lousa verde com giz
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x + 82, 30 - cy, 40, 24);
    ctx.fillStyle = '#2e6a44'; ctx.fillRect(x + 84, 32 - cy, 36, 20);
    ctx.fillStyle = 'rgba(240,240,220,0.6)';
    ctx.fillRect(x + 88, 37 - cy, 20, 1); ctx.fillRect(x + 88, 41 - cy, 26, 1); ctx.fillRect(x + 88, 45 - cy, 14, 1);
    // quadro de avisos / mural
    ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x + 82, 62 - cy, 30, 20);
    ctx.fillStyle = '#f2e8d0'; ctx.fillRect(x + 85, 65 - cy, 10, 8);
    ctx.fillStyle = '#a8c8e8'; ctx.fillRect(x + 98, 66 - cy, 11, 12);
  }
  // fileira de armários (lockers) no lambril
  for (let x = -((camX * 0.5) % 26); x < W; x += 26) {
    ctx.fillStyle = '#b8402e'; ctx.fillRect(x + 2, 116 - cy, 22, 40);
    ctx.fillStyle = '#d05a44'; ctx.fillRect(x + 2, 116 - cy, 22, 3);
    ctx.fillStyle = '#7a2418'; ctx.fillRect(x + 23, 116 - cy, 2, 40);
    ctx.fillStyle = '#3a1a12'; ctx.fillRect(x + 20, 132 - cy, 2, 3);   // fechadura
    ctx.fillStyle = '#e8e0c8'; ctx.fillRect(x + 5, 120 - cy, 8, 4);    // ventilação
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
  // revoada de pombos no céu (é a PRAÇA DOS POMBOS!)
  ctx.fillStyle = '#6a6a76';
  for (let k = 0; k < 7; k++) {
    const bx = ((k * 53 - t * 0.6) % (W + 40) + W + 40) % (W + 40) - 20;
    const by = 30 + (k * 17) % 40 + Math.sin((t * 0.08) + k) * 3;
    const flap = Math.floor(t / 6 + k) % 2;
    ctx.fillRect(bx - 2, by + (flap ? 0 : 1), 2, 1); ctx.fillRect(bx + 1, by + (flap ? 0 : 1), 2, 1);
    ctx.fillRect(bx, by, 1, 1);
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
  // piso comercial claro + teto com luminárias
  ctx.fillStyle = '#f2ecdc'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e4dcc4'; ctx.fillRect(0, 122, W, H);
  ctx.fillStyle = '#d8cfb2'; ctx.fillRect(0, 120, W, 2);
  for (let x = -((camX * 0.4) % 80); x < W; x += 80) { ctx.fillStyle = '#fbf6e2'; ctx.fillRect(x + 18, 4, 44, 3); }
  // prateleiras/gôndolas de fundo (parallax) com produtos e etiquetas
  const par = camX * 0.5;
  for (let x = -((par) % 104) - 104; x < W + 104; x += 104) {
    ctx.fillStyle = '#b89a68'; ctx.fillRect(x + 6, 44, 92, 76);
    ctx.fillStyle = '#9a7c48';
    for (let j = 0; j < 4; j++) ctx.fillRect(x + 6, 52 + j * 18, 92, 3);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) {
      const c = ['#d05858','#5878d0','#58a868','#d0a848','#9058a8','#d07840'][(i * 2 + j) % 6];
      ctx.fillStyle = c; ctx.fillRect(x + 10 + i * 10, 55 + j * 18, 7, 11);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + 10 + i * 10, 55 + j * 18, 7, 2);
    }
    // etiquetas de promoção amarelas penduradas
    ctx.fillStyle = '#f2d24e'; ctx.fillRect(x + 30, 40, 12, 8); ctx.fillRect(x + 66, 40, 12, 8);
    ctx.fillStyle = '#c02020'; ctx.fillRect(x + 32, 43, 8, 2);
  }
  // letreiro "BRASILEIRAS" verde-amarelo no alto (marca da loja)
  ctx.fillStyle = '#1c6a44'; ctx.fillRect(0, 12, W, 18);
  ctx.fillStyle = '#2e8a5c'; ctx.fillRect(0, 12, W, 3);
  ctx.fillStyle = '#f2d24e'; ctx.fillRect(0, 28, W, 3);
  drawTextC(ctx, 'BRASILEIRAS', (W / 2 + ((camX * 0.15) % W)) % W, 16, '#f2d24e');
  drawTextC(ctx, 'BRASILEIRAS', ((W / 2 + ((camX * 0.15) % W)) % W) - W, 16, '#f2d24e');
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
const pl1 = [ // entrada do fliperama: bola de pinball rolando!
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
  '................B...',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl2 = [ // Cacimba lança beijos + moleque bagunçando
  '....................',
  '....................',
  '....................',
  '........t...........',
  '......=====.........',
  '....................',
  '..f..............f..',
  '.....===....===.....',
  '....................',
  '..........Q....g....',
  '....................',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl3 = [ // escadaria de fliperamas + checkpoint + pinball
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
  '.............B......',
  '....................',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl4 = [ // Cacimba + moleque correndo (Tavinho-style) entre fliperamas
  '....................',
  '....................',
  '....................',
  '....f.......f.......',
  '...===.....===......',
  '....................',
  '..f.......f........f',
  '.......======.......',
  '....................',
  '.....Q.........g...t',
  '....................',
  '..............B.....',
  'yyyyyyyyyyyyyyyyyyyy',
  'yyyyyyyyyyyyyyyyyyyy',
];
const pl5 = [ // salão dos fliperamas: Cacimba + pinball + moleque
  '....................',
  '....................',
  '....f...f...f.......',
  '...===.===.===......',
  '....................',
  '..f.................',
  '.........===........',
  '.....B.........g....',
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
  // salão escuro do fliperama
  ctx.fillStyle = '#120a20'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1a0e2e'; ctx.fillRect(0, 120, W, H);
  // tubos de neon no teto (piscando)
  for (let x = -((camX * 0.6) % 90); x < W; x += 90) {
    const on = (Math.floor(t / 8) + x) % 3;
    ctx.fillStyle = on === 0 ? '#f02090' : on === 1 ? '#20d0f0' : '#f2d24e';
    ctx.fillRect(x + 10, 6, 70, 3);
    ctx.globalAlpha = 0.15; ctx.fillRect(x + 6, 3, 78, 12); ctx.globalAlpha = 1;
  }
  // fileira de fliperamas ao fundo (parallax), com telas CRT brilhando
  const par = camX * 0.5;
  for (let x = -((par) % 46) - 46; x < W + 46; x += 46) {
    ctx.fillStyle = '#241436'; ctx.fillRect(x + 4, 40, 38, 82);        // gabinete
    ctx.fillStyle = '#0a0a16'; ctx.fillRect(x + 8, 48, 30, 24);        // moldura da tela
    const scr = (Math.floor(t / 10) + x) % 4;
    ctx.fillStyle = ['#20d0f0', '#f02090', '#40e060', '#f2d24e'][scr];
    ctx.fillRect(x + 10, 50, 26, 20);                                  // CRT aceso
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 10, 50, 26, 4);
    ctx.fillStyle = '#f2d24e'; ctx.fillRect(x + 12, 78, 22, 3);        // marquise
    ctx.fillStyle = '#3a2a4a'; ctx.fillRect(x + 10, 86, 8, 6); ctx.fillRect(x + 26, 86, 8, 6); // botões
    ctx.fillStyle = '#120a20'; ctx.fillRect(x + 42, 40, 4, 82);        // vão entre gabinetes
  }
  // letreiro PLAYTIME em neon (fixo no fundo)
  const bob = 40;
  ctx.globalAlpha = 0.9;
  drawTextO(ctx, 'PLAYTIME', W / 2 - textWidth('PLAYTIME', 2) / 2, 20, (Math.floor(t / 16) % 2 ? '#f02090' : '#f050a0'), '#40103a', 2);
  ctx.globalAlpha = 1;
  // grade de piso neon (perspectiva)
  ctx.strokeStyle = 'rgba(240,32,144,0.30)'; ctx.lineWidth = 1;
  for (let x = -(camX % 22); x < W + 40; x += 22) { ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x - 50, H); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(32,208,240,0.22)';
  for (let yy = 132; yy < H; yy += 10) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
}
function decoPlay(ctx, lvl) {
  // fliperamas jogáveis embaixo das lajes '=' (plataformas)
  for (let i = 0; i < lvl.w; i++) for (let j = 0; j < lvl.h; j++) {
    if (lvl.rows[j][i] === '=' && lvl.rows[j - 1] && lvl.rows[j - 1][i] !== '=' && (i === 0 || lvl.rows[j][i - 1] !== '=')) {
      ctx.drawImage(S.fliperama, i * 16 + 1, j * 16 + 2);
      if (Math.floor(lvl.time / 24) % 2 === 0) drawText(ctx, 'JOGA!', i * 16 + 1, j * 16 - 8, '#f2d24e');
    }
  }
  const gx = lvl.goalX;
  // porta de SAÍDA verde neon
  ctx.fillStyle = '#0a2a1a'; ctx.fillRect(gx - 10, 150, 30, 42);
  ctx.fillStyle = '#20f060'; ctx.fillRect(gx - 10, 150, 30, 4);
  ctx.fillStyle = '#0e3a24'; ctx.fillRect(gx - 6, 156, 22, 34);
  drawTextC(ctx, 'SAIDA', gx + 5, 160, '#20f060');
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
  // fim de tarde ameno no calçadão (paleta quente, diferente da praça)
  ctx.fillStyle = '#f2c078'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f6d49a'; ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = '#fce6be'; ctx.fillRect(0, 0, W, 16);
  // fileira de sobrados coloridos do centro histórico (parallax 0.5)
  const par = camX * 0.5;
  const cores = ['#c8704a', '#7a9a6a', '#b8905a', '#9a6a8a', '#6a8a9a'];
  for (let x = -((par) % 360) - 360, k = 0; x < W + 360; x += 60, k++) {
    ctx.fillStyle = cores[((k % 5) + 5) % 5];
    ctx.fillRect(x, 66, 58, 74);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, 66, 58, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    for (let wj = 0; wj < 3; wj++) for (let wi = 0; wi < 2; wi++) ctx.fillRect(x + 10 + wi * 26, 78 + wj * 20, 14, 12);
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x, 64, 58, 3); // beiral
  }
  // varal de bandeirinhas de feira balançando entre os postes
  const bl = camX * 0.85;
  for (let x = -((bl) % 24) - 24; x < W + 24; x += 24) {
    const col = ['#e23838', '#f2c020', '#38a0e2', '#38c060'][(Math.floor(x / 24) % 4 + 4) % 4];
    ctx.fillStyle = col;
    const yy = 128 + Math.sin((x + t) * 0.05) * 2;
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 10, yy); ctx.lineTo(x + 5, yy + 8); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 128); ctx.lineTo(W, 128); ctx.stroke();
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
  // manhã de céu claro
  ctx.fillStyle = '#8fd0ee'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#bfe6f6'; ctx.fillRect(0, 0, W, 30);
  const cl = camX * 0.2;
  ctx.fillStyle = '#ffffff';
  for (let x = -((cl) % 150) - 150; x < W + 150; x += 150) { ctx.fillRect(x + 30, 22, 26, 7); ctx.fillRect(x + 100, 14, 20, 6); }
  // quarteirão: prédio branco da FISK + convento das DAMAS, alternando
  const par = camX * 0.5;
  for (let x = -((par) % 220) - 220; x < W + 220; x += 220) {
    // --- FISK: prédio branco, letreiro vermelho ---
    ctx.fillStyle = '#f6f6ee'; ctx.fillRect(x + 14, 40, 96, 100);
    ctx.fillStyle = '#d0ccc0'; ctx.fillRect(x + 14, 40, 96, 3);
    ctx.fillStyle = '#d81e18'; ctx.fillRect(x + 24, 48, 76, 14);        // faixa do letreiro
    drawTextC(ctx, 'FISK', x + 62, 51, '#f8f8f8');
    ctx.fillStyle = '#7aa8c8';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) {           // janelas azuis
      ctx.fillStyle = '#8ec4e4'; ctx.fillRect(x + 24 + i * 20, 72 + j * 20, 14, 13);
      ctx.fillStyle = '#c8e6f6'; ctx.fillRect(x + 24 + i * 20, 72 + j * 20, 14, 4);
    }
    ctx.fillStyle = '#c8442e'; ctx.fillRect(x + 46, 120, 30, 20);       // portão vermelho
    // --- convento das DAMAS: bege, telhado, campanário e cruz ---
    ctx.fillStyle = '#ece0c4'; ctx.fillRect(x + 122, 56, 74, 84);
    ctx.fillStyle = '#b8905a'; ctx.fillRect(x + 118, 52, 82, 6);        // beiral
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + 150, 30, 18, 26);       // campanário
    ctx.fillStyle = '#a07040'; ctx.fillRect(x + 150, 24, 18, 6);        // telhado do campanário
    ctx.fillStyle = '#7a5a30'; ctx.fillRect(x + 158, 14, 2, 10); ctx.fillRect(x + 155, 17, 8, 2); // cruz
    ctx.fillStyle = '#8aa0b8';                                          // vitrais em arco
    ctx.fillRect(x + 130, 70, 12, 22); ctx.fillRect(x + 150, 70, 12, 22); ctx.fillRect(x + 170, 70, 12, 22);
    ctx.fillStyle = '#e0d0e8'; ctx.fillRect(x + 132, 72, 8, 6); ctx.fillRect(x + 152, 72, 8, 6); ctx.fillRect(x + 172, 72, 8, 6);
    ctx.fillStyle = '#d8ccb0'; ctx.fillRect(x + 148, 120, 22, 20);      // escadaria/porta
  }
  // arborização e meio-fio
  ctx.fillStyle = '#c8c4b8'; ctx.fillRect(0, 140, W, 12);
  ctx.fillStyle = '#a8a498'; ctx.fillRect(0, 140, W, 2);
}
function decoFisk(ctx, lvl) { /* Galego e Bené desenhados como entidades */ }

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
  // pôr do sol: céu em gradiente laranja/rosa
  const bands = ['#3a3a6a', '#6a4a7a', '#a85a6a', '#e08858', '#f4b45c', '#f8d878'];
  for (let i = 0; i < bands.length; i++) { ctx.fillStyle = bands[i]; ctx.fillRect(0, i * 8, W, 9); }
  ctx.fillStyle = '#f8e090'; ctx.fillRect(0, 48, W, H);
  // sol grande baixo no horizonte
  ctx.fillStyle = '#f8e060'; ctx.fillRect(W - 84, 34, 34, 34);
  ctx.fillStyle = '#fff0a0'; ctx.fillRect(W - 80, 38, 26, 26);
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff0a0'; ctx.fillRect(W - 92, 26, 50, 50); ctx.globalAlpha = 1;
  // skyline do centro em silhueta contra o sol (parallax)
  const par = camX * 0.4;
  ctx.fillStyle = '#5a3a4a';
  for (let x = -((par) % 260) - 260; x < W + 260; x += 260) {
    ctx.fillRect(x, 80, 40, 62); ctx.fillRect(x + 46, 66, 30, 76);       // TELPA alta
    ctx.fillRect(x + 60, 54, 6, 12);
    ctx.fillRect(x + 88, 92, 46, 50); ctx.fillRect(x + 150, 76, 34, 66);
    ctx.fillRect(x + 200, 96, 50, 46);
    // janelinhas acesas
    ctx.fillStyle = '#f8d060';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + 50 + (k % 3) * 8, 74 + Math.floor(k / 3) * 12, 3, 4);
    ctx.fillStyle = '#5a3a4a';
  }
  // orelhões e postes iluminados na calçada de trás
  ctx.fillStyle = '#7a5060'; ctx.fillRect(0, 128, W, 16);
  for (let x = -((camX * 0.7) % 120); x < W; x += 120) {
    ctx.fillStyle = '#3a2a34'; ctx.fillRect(x + 30, 96, 3, 34);         // poste
    ctx.fillStyle = '#f8e090'; ctx.fillRect(x + 26, 92, 11, 5);         // luz acesa
    ctx.globalAlpha = 0.3; ctx.fillRect(x + 22, 90, 19, 12); ctx.globalAlpha = 1;
  }
}
function decoFila(ctx, lvl) {
  const gx = lvl.goalX;
  // o ônibus (frente virada pro ponto) com faróis acesos
  ctx.drawImage(S.onibus, gx - 24, 148);
  ctx.fillStyle = '#141420'; ctx.fillRect(gx - 6, 168, 16, 24);         // porta traseira aberta
  ctx.fillStyle = '#f8e060'; ctx.fillRect(gx + 30, 164, 4, 4);          // farol
  // placa do ponto de ônibus
  ctx.fillStyle = '#3a3a44'; ctx.fillRect(8, 96, 3, 48);
  ctx.fillStyle = '#2a52c0'; ctx.fillRect(2, 92, 16, 12);
  ctx.fillStyle = '#f8f8f8'; ctx.fillRect(4, 94, 12, 8);
  ctx.fillStyle = '#2a52c0'; ctx.fillRect(6, 96, 3, 4);
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
  const sway = Math.sin(t * 0.05) * 1.5;         // balanço do ônibus
  const S2 = y => y - camY + sway;               // mundo -> tela
  // parede interna creme
  ctx.fillStyle = '#e2dcc6'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d0c8ac'; ctx.fillRect(0, S2(120), W, H);
  // teto metálico com nervuras
  ctx.fillStyle = '#9aa0a8'; ctx.fillRect(0, S2(28), W, 20);
  ctx.fillStyle = '#8a9098'; for (let x = -(camX % 20); x < W; x += 20) ctx.fillRect(x, S2(30), 2, 16);
  ctx.fillStyle = '#6a7078'; ctx.fillRect(0, S2(46), W, 2);
  // faixa de janelas com a cidade passando
  const wy = S2(52);
  ctx.fillStyle = '#3a3a42'; ctx.fillRect(0, wy - 2, W, 52);
  for (let x = -((camX * 1.1) % 76); x < W; x += 76) {
    ctx.fillStyle = '#bfe6f2'; ctx.fillRect(x + 5, wy + 2, 64, 42);   // vidro (céu)
    ctx.fillStyle = '#d8f0f8'; ctx.fillRect(x + 5, wy + 2, 64, 10);
    // cidade correndo lá fora (parallax rápido)
    const o = (camX * 2.6) % 68;
    ctx.fillStyle = '#a9b6c2';
    ctx.fillRect(x + 5 + ((8 - o + 68) % 68), wy + 20, 16, 24);
    ctx.fillRect(x + 5 + ((40 - o + 68) % 68), wy + 26, 13, 18);
    ctx.fillStyle = '#8aa0b0'; ctx.fillRect(x + 5 + ((24 - o + 68) % 68), wy + 14, 10, 30);
    ctx.fillStyle = '#3a3a42'; ctx.fillRect(x, wy - 2, 6, 48);        // montante entre janelas
  }
  ctx.fillStyle = '#2a2a32'; ctx.fillRect(0, wy + 44, W, 3);
  // barra de apoio horizontal do teto + alças penduradas
  ctx.fillStyle = '#b8bcc4'; ctx.fillRect(0, S2(112), W, 3);
  for (let x = -((camX) % 40) + 12; x < W; x += 40) {
    ctx.strokeStyle = '#7a5a30'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, S2(115)); ctx.lineTo(x, S2(126)); ctx.stroke();
    ctx.fillStyle = '#3a2a18'; ctx.fillRect(x - 3, S2(126), 7, 5);   // alça
  }
  // fileira de bancos ao fundo (atrás dos passageiros), acima do piso
  const seatY = S2(150);
  for (let x = -((camX) % 48); x < W; x += 48) {
    ctx.fillStyle = '#2a52a0'; ctx.fillRect(x + 2, seatY, 42, 22);      // assento
    ctx.fillStyle = '#3a68c0'; ctx.fillRect(x + 2, seatY, 42, 6);
    ctx.fillStyle = '#1a3a78'; ctx.fillRect(x + 2, seatY + 22, 42, 4);  // sombra
    ctx.fillStyle = '#8a8a92'; ctx.fillRect(x + 22, seatY + 22, 3, 14); // pé do banco
  }
}
function decoBus(ctx, lvl) {
  // barras de apoio verticais fixas (nos montantes)
  for (let i = 6; i < lvl.w; i += 6) {
    ctx.fillStyle = '#c0c4cc'; ctx.fillRect(i * 16, 44, 3, 148);
    ctx.fillStyle = '#e8ecf0'; ctx.fillRect(i * 16, 44, 1, 148);
  }
  const gx = lvl.goalX;
  // porta dianteira sanfonada (saída)
  ctx.fillStyle = '#20242c'; ctx.fillRect(gx - 4, 150, 24, 42);
  ctx.fillStyle = '#3a6a9a'; ctx.fillRect(gx - 4, 150, 5, 42); ctx.fillRect(gx + 14, 150, 5, 42);
  ctx.fillStyle = '#8ec8e8'; ctx.fillRect(gx + 1, 156, 12, 20);
  if (Math.floor(lvl.time / 18) % 2 === 0) drawTextC(ctx, 'DESCER AQUI', gx + 8, 142, '#f2d24e');
}

// ================= REGISTRO DAS FASES =================
export const LEVELS = {
  cad: {
    id: 'cad', name: 'FUGA DO CAD', music: 'cad',
    map: join(cad1, cad2, cad3, cad4, cad5, cad6, cad7, cad8),
    bg: bgCAD, bgImg: 'art/cad.png', deco: decoCAD,
    clearMsg: 'ESCAPOU DA VANITA!',
    objetivo: 'Fuja da escola e chegue na porta da entrada (entre os leoes) sem ser pego.',
    desafios: [
      { spr: 'vanita', nm: 'VANITA', tip: 'A diretora! Encostou, pegou. Corra e passe longe.' },
      { spr: 'ficha', nm: 'FICHAS', tip: 'Colete 100 = 1 vida extra.' },
    ],
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
    objetivo: 'Atravesse a Praca dos Pombos ate a parada de onibus do outro lado.',
    desafios: [
      { spr: 'pombo', nm: 'POMBOS', tip: 'Voam e soltam cagada. Nao pare embaixo deles!' },
      { spr: 'tromba', nm: 'TROMBADINHAS', tip: 'Pule na cabeca pra derrotar.' },
    ],
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
    objetivo: 'SUBA atravessando as 4 faixas da avenida ate a calcada da TELPA la em cima.',
    desafios: [
      { spr: 'carro', nm: 'CARROS E MOTOS', tip: 'Atropelam! So passe quando a faixa estiver limpa.' },
      { spr: 'escada', nm: 'CANTEIROS', tip: 'Descanse neles com seguranca entre as faixas.' },
    ],
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
    objetivo: 'Suba a loja pela escada rolante e pegue o CHOCOLATE la no fim.',
    desafios: [
      { spr: 'fiscal', nm: 'FISCAL', tip: 'Nao deixe ele te encostar. Pule por cima.' },
      { spr: 'escada', nm: 'ESCADA ROLANTE', tip: 'Suba nela pro segundo andar.' },
      { spr: 'choc', nm: 'CHOCOLATE', tip: 'O premio! Da +1 vida.' },
    ],
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
    objetivo: 'Atravesse o salao de fliperamas ate a SAIDA verde.',
    desafios: [
      { spr: 'cacimba', nm: 'CACIMBA', tip: 'Lanca beijos que te apaixonam e deixam lerdo. Toque dele = encanto!' },
      { spr: 'bola', nm: 'BOLA DE PINBALL', tip: 'Rola pelo chao e te empurra. Pule por cima.' },
      { spr: 'tromba', nm: 'MOLEQUES', tip: 'Pise neles.' },
    ],
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
    objetivo: 'Percorra o calcadao ate a saida, desviando dos personagens.',
    desafios: [
      { spr: 'carrapeta', nm: 'CARRAPETA', tip: 'O palhaco solta ondas de assovio que paralisam. Pule por cima!' },
      { spr: 'gordo', nm: 'GORDO', tip: 'Solta PEIDO que deixa lerdo. Nao encoste nele.' },
      { spr: 'tavinho', nm: 'TAVINHO', tip: 'Cruza correndo e prende voce na conversa (perde tempo).' },
    ],
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
    objetivo: 'Pegue a pipoca do Galego e corra do Ratinho ate o ponto de onibus.',
    desafios: [
      { spr: 'galego', nm: 'GALEGO', tip: 'Pegue os graos que pulam da panela: cada um vale uma ficha!' },
      { spr: 'ratinho', nm: 'RATINHO', tip: 'Quer roubar seu tenis. Nao deixe ele te alcancar!' },
      { spr: 'tromba', nm: 'ALUNOS DAS DAMAS', tip: 'Multidao na saida. Pise neles.' },
    ],
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
    objetivo: 'Chegue na porta de tras do onibus protegendo sua carteira.',
    desafios: [
      { spr: 'tromba', nm: 'TROMBADINHAS', tip: 'Enxame querendo bater sua carteira. Pule na cabeca deles!' },
    ],
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
    objetivo: 'Fure o onibus lotado da porta de tras ate a frente e desca no ponto certo.',
    desafios: [
      { spr: 'tromba', nm: 'PASSAGEIROS', tip: 'Empurram voce. Fure a multidao pra frente.' },
      { spr: 'catraca', nm: 'CATRACA', tip: 'Pule por cima dela.' },
      { spr: 'ratinho', nm: 'RATINHO', tip: 'Ele tambem pegou esse onibus! Cuidado.' },
    ],
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
