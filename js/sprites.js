// sprites.js — toda a pixel art do jogo, desenhada em código
import { sprite, tile, flipped } from './gfx.js';

// ------- paletas -------
const PAL = {
  k: '#141420',        // contorno
  s: '#f2c184', S: '#d19a5e', // pele
  h: '#4a2f14', H: '#33200c', // cabelo Murrinha
  w: '#f8f8f8', W: '#d8d8dc', // camisa branca
  r: '#d81e18', R: '#a01410', // vermelho CAD
  b: '#2a52c0', B: '#1c3a8c', // bermuda azul
  t: '#eeeeee', g: '#8a8a96', // tênis
  o: '#e88820',              // laranja (bico/pés pombo)
  p: '#9aa0ac', P: '#6a7080', // pombo cinza
  q: '#4a505c',              // pombo cabeça escura
  v: '#2e8a5c', V: '#1d5c3c', // verde (vestido Liginha? não: teal)
  d: '#3a7a8c', D: '#285662', // vestido Liginha teal
  G: '#c8c8d0', // cabelo grisalho Liginha
  y: '#f2d24e', Y: '#c8a428', // dourado ficha
  c: '#6a4020', C: '#4a2c14', // chocolate
  e: '#f25e8a', // rosa
  n: '#c05010', N: '#903a0a', // marrom-tijolo
  u: '#e8dcc0', U: '#c4b490', // bege leão/pedra
  m: '#88b8e0', // azul claro (aluno DAMAS)
  z: '#f2e8d0', // papel
  x: '#606068',
};

const sp = rows => sprite(rows, PAL);

// ==================== MURRINHA (16x24) ====================
const MURR_HEAD = [
  '....kkkkkkkk....',
  '...khhhhhhhhk...',
  '..khhhhhhhhhhk..',
  '..khhhhhhhhhhk..',
  '..khhsssssshhk..',
  '..kssksssskssk..',
  '..kssksssskssk..',
  '..kssssssssssk..',
  '..kssskkkksssk..',
  '...kssssssssk...',
  '....kkkkkkkk....',
];
const MURR_BODY = [
  '...kwwwrrwwwwk..',
  '..kswwwrrwwwwsk.',
  '..kswrrrrrrrwsk.',
  '..kswwwwwwwwwsk.',
  '..kswrrrrrrrwsk.',
  '...kwwwrwrwwwk..',
  '...kwwwwwwwwk...',
  '...kbbbbbbbbk...',
];
export const murrIdle = sp([...MURR_HEAD, ...MURR_BODY,
  '...kbbk..kbbk...',
  '...kssk..kssk...',
  '..kttttkkttttk..',
  '..kggggkkggggk..',
]);
export const murrWalk1 = sp([...MURR_HEAD, ...MURR_BODY,
  '..kbbk....kbbk..',
  '..kssk....kssk..',
  '.kttttk..kttttk.',
  '.kggggk..kggggk.',
]);
export const murrWalk2 = sp([...MURR_HEAD, ...MURR_BODY,
  '....kbbkkbbk....',
  '....kssk.kssk...',
  '...kttttkttttk..',
  '...kggggkggggk..',
]);
export const murrJump = sp([...MURR_HEAD, ...MURR_BODY,
  '..kbbk....kbbk..',
  '.kssk......kssk.',
  'kttttk....kttttk',
  'kggggk....kggggk',
]);
export const murrIdleL = flipped(murrIdle), murrWalk1L = flipped(murrWalk1),
  murrWalk2L = flipped(murrWalk2), murrJumpL = flipped(murrJump);

// rostinho para HUD (8x8)
export const murrFace = sp([
  '.kkkkkk.',
  'khhhhhhk',
  'khhhhhhk',
  'kssssssk',
  'kskssksk',
  'kssssssk',
  'kskkkksk',
  '.kkkkkk.',
]);

// ==================== LIGINHA (16x28) ====================
const LIG_HEAD = [
  '.....kkkkk......',
  '....kGGGGGk.....',
  '...kGGkkkGGk....',
  '..kGGkGGGkGGk...',
  '..kGGGGGGGGGk...',
  '..kGsssssssGk...',
  '..kskkskksksk...',  // óculos + olhos bravos
  '..kskkskksksk...',
  '..kssssssssssk..',
  '..ksskkkkkssk...',  // boca séria
  '...kssssssss k..',
  '....kkkkkkkk....',
];
const LIG_BODY = [
  '...kddddddddk...',
  '..ksddddddddsk..',
  '..ksdkddddkdsk..',
  '..ksddddddddsk..',
  '...kdddddddd k..',
  '...kddddddddk...',
  '...kddddddddk...',
  '..kddddddddddk..',
  '..kddddddddddk..',
  '.kddddddddddddk.',
  '.kddddddddddddk.',
  '.kkkkkkkkkkkkkk.',
];
export const ligWalk1 = sp([...LIG_HEAD, ...LIG_BODY,
  '...kssk..kssk...',
  '..kxxxk..kxxxk..',
  '..kxxxk..kxxxk..',
  '................',
]);
export const ligWalk2 = sp([...LIG_HEAD, ...LIG_BODY,
  '....ksskkssk....',
  '...kxxxkkxxxk...',
  '...kxxxkkxxxk...',
  '................',
]);
export const ligWalk1L = flipped(ligWalk1), ligWalk2L = flipped(ligWalk2);

// ==================== POMBO ====================
export const pomboSit = sp([
  '...kkk....',
  '..kqqqk...',
  '.kqkqqko..',
  'kpppqqk...',
  'kpppppk...',
  'kPpppPk...',
  '.kpppk....',
  '..koko....',
]);
export const pomboFly1 = sp([
  'kpp........kpp',
  '.kppp....kppp.',
  '..kpppkkpppk..',
  '...kppppppk...',
  '..kqqppppk....',
  '.kqkqppppk....',
  '.kqqok........',
  '..kk..........',
]);
export const pomboFly2 = sp([
  '..............',
  '...kppkkppk...',
  '..kpppppppppk.',
  '.kpppppppppk..',
  '..kqqppppk....',
  '.kqkqppppppk..',
  '.kqqok..kppk..',
  '..kk......k...',
]);
export const pomboFly1L = flipped(pomboFly1), pomboFly2L = flipped(pomboFly2);

// cagada de pombo (4x4)
export const poop = sp(['.ww.', 'wWww', '.ww.', '..w.']);
export const splat = sp(['w.w.w', '.wWw.', 'wWWWw', '.wWw.', 'w.w.w']);

// ==================== TROMBADINHA (12x16) ====================
const TRO_TOP = [
  '..kkkkkk....',
  '.knnnnnnk...',
  '.knnnnnnkk..',
  '.kssssssk...',
  '.kskssksk...',
  '.kssssssk...',
  '..kskksk....',
  '..kwwwwk....',
  '.kswwwwsk...',
  '.kswwwwsk...',
  '..kxxxxk....',
];
export const troWalk1 = sp([...TRO_TOP,
  '..kxk.kxk...',
  '..ksk.ksk...',
  '.kssk.kssk..',
  '............',
  '............',
]);
export const troWalk2 = sp([...TRO_TOP,
  '...kxkxk....',
  '...ksksk....',
  '..kssksssk..',
  '............',
  '............',
]);
export const troSquash = sp([
  '............',
  '............',
  '............',
  '............',
  '............',
  '............',
  '............',
  '............',
  '............',
  '............',
  '..kkkkkk....',
  '.knnnnnnk...',
  '.kssssssk...',
  '.kwwwwwwk...',
  'kkkkkkkkkk..',
  '............',
]);
export const troWalk1L = flipped(troWalk1), troWalk2L = flipped(troWalk2);

// ==================== ITENS ====================
export const ficha = [
  sp(['.kkkk.', 'kyyyyk', 'kyYYyk', 'kyYYyk', 'kyyyyk', '.kkkk.']),
  sp(['..kk..', '.kyyk.', '.kyYk.', '.kyYk.', '.kyyk.', '..kk..']),
  sp(['..kk..', '..kyk.', '..kyk.', '..kyk.', '..kyk.', '..kk..']),
  sp(['..kk..', '.kyyk.', '.kYyk.', '.kYyk.', '.kyyk.', '..kk..']),
];
export const chocolate = sp([
  'kkkkkkkkkk',
  'krrkccccck',
  'krrkcCcCck',
  'krrkccccck',
  'krrkcCcCck',
  'kkkkkkkkkk',
]);
export const pipocaBag = sp([
  '.kwkwkwkw.',
  'kwwwwwwwwk',
  'kwzwzwzwzk',
  'krwrwrwrwk',
  'krwrwrwrwk',
  'krwrwrwrwk',
  'krwrwrwrwk',
  '.kkkkkkkk.',
]);
export const ticket = sp([
  'kkkkkkkkkk',
  'kvzvvvvzvk',
  'kvzvkkvzvk',
  'kvzvvvvzvk',
  'kkkkkkkkkk',
]);

// placa de checkpoint (PARADA)
export const checkSign = sp([
  '.kkkkkkkkkkkk.',
  'kwwwwwwwwwwwwk',
  'kwrrwrrwrrwwwk',
  'kwrwwrwrwrwwwk',
  'kwrrwrrwrrwwwk',
  'kwrwwrwrwrwwwk',
  'kwrwwrwrwrwwwk',
  'kwwwwwwwwwwwwk',
  '.kkkkkkkkkkkk.',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
]);
export const checkSignOn = sprite([
  '.kkkkkkkkkkkk.',
  'kvvvvvvvvvvvvk',
  'kvwwvwwvwwvvvk',
  'kvwvvwvwvwvvvk',
  'kvwwvwwvwwvvvk',
  'kvwvvwvwvwvvvk',
  'kvwvvwvwvwvvvk',
  'kvvvvvvvvvvvvk',
  '.kkkkkkkkkkkk.',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
  '......kk......',
], PAL);

// ==================== LEÃO DO CAD (20x24) ====================
export const leao = sp([
  '....kkkk............',
  '...kuuuuk...........',
  '..kuUuuUuk..........',
  '..kuuuuuuk..........',
  '..kukuukuk..........',
  '..kuuuuuuk..........',
  '..kuukkuuk..........',
  '...kuuuuk...........',
  '..kUuuuuUk......kk..',
  '.kuuuuuuuuk....kUuk.',
  'kuuuuuuuuuuk...kuuk.',
  'kuuuuuuuuuuk...kuuk.',
  'kuuuuuuuuuuuk..kuuk.',
  'kuuuuuuuuuuuuk.kuuk.',
  'kuuuuuuuuuuuuukkuuk.',
  'kuuuuuuuuuuuuuuuuuk.',
  'kuukuuuuuuuuuuuuuk..',
  'kuukuuuuuuuuuuuuk...',
  'kuukuuukuukuuuuk....',
  'kuukuuukuukuuuk.....',
  'kUUkUUUkUUkUUUk.....',
  'kkkkkkkkkkkkkkk.....',
  'kUUUUUUUUUUUUUUk....',
  'kkkkkkkkkkkkkkkk....',
]);
export const leaoL = flipped(leao);

// busto do fundador (14x20, bronze sobre pedestal)
export const busto = sp([
  '....kkkkk.....',
  '...kCcccCk....',
  '...kccccck....',
  '...kckcckk....',
  '...kccccck....',
  '...kcckcck....',
  '....kccck.....',
  '...kccccck....',
  '..kccccccck...',
  '.kcccccccck...',
  '.kkkkkkkkkk...',
  '..kUUUUUUk....',
  '..kuuuuuuk....',
  '..kuuuuuuk....',
  '..kuuuuuuk....',
  '..kuuuuuuk....',
  '..kuuuuuuk....',
  '.kuuuuuuuuk...',
  'kUUUUUUUUUUk..',
  'kkkkkkkkkkkk..',
]);

// aluno das DAMAS (NPC decorativo, 16x24)
export const damas = sp([
  '....kkkkkkkk....',
  '...kHHHHHHHHk...',
  '..kHHHHHHHHHHk..',
  '..kHHsssssHHHk..',
  '..kssksssskssk..',
  '..kssssssssssk..',
  '..kssskkkksssk..',
  '...kssssssssk...',
  '....kkkkkkkk....',
  '...kmmmwwmmmk...',
  '..ksmmmwwmmmsk..',
  '..ksmBBBBBBmsk..',
  '..ksmmmmmmmmsk..',
  '..ksmBBBBBBmsk..',
  '...kmmmwmwmmk...',
  '...kmmmmmmmmk...',
  '...kBBBBBBBBk...',
  '...kBBBBBBBBk...',
  '...kssk..kssk...',
  '...kssk..kssk...',
  '..kttttkkttttk..',
  '..kggggkkggggk..',
]);

// ==================== RETRATOS (cutscene, 24x24) ====================
export const portMurr = sp([
  '...kkkkkkkkkkkkkkkk.....',
  '..khhhhhhhhhhhhhhhhk....',
  '.khhhhhhhhhhhhhhhhhhk...',
  '.khhhhhhhhhhhhhhhhhhk...',
  '.khhhhhhhhhhhhhhhhhhk...',
  '.khhhssssssssssshhhhk...',
  '.khhsssssssssssssshhk...',
  '.khsssssssssssssssshk...',
  '.kssssssssssssssssssk...',
  '.ksssskkkssssskkksssk...',
  '.ksssskkkssssskkksssk...',
  '.kssssssssssssssssssk...',
  '.kssssssssssssssssssk...',
  '.ksssssssskkssssssssk...',
  '.kssssssssssssssssssk...',
  '.ksssskssssssssksssk....',
  '..ksssskkkkkkkkssssk....',
  '..kssssssssssssssss k...',
  '...kssssssssssssssk.....',
  '....kssssssssssssk......',
  '.....kkkkkkkkkkkk.......',
  '....kwwwwwrrwwwwwk......',
  '...kwwwwwrrrrwwwwwk.....',
  '..kwwwwrrrrrrrrwwwwk....',
]);
export const portLig = sp([
  '.....kkkkkkkkkkkk.......',
  '....kGGGGGGGGGGGGk......',
  '...kGGGkkkkkkkGGGGk.....',
  '..kGGGkGGGGGGGkGGGGk....',
  '..kGGGGGGGGGGGGGGGGk....',
  '..kGGGGGGGGGGGGGGGGk....',
  '..kGGsssssssssssGGGk....',
  '..kGsssssssssssssGGk....',
  '..ksskkkkssssskkkkssk...',
  '..ksskkkkksssskkkkssk...',
  '..ksskkskksssskkskssk...',
  '..ksskkkkksssskkkkssk...',
  '..kssssssssssssssssk....',
  '..kssssssssssssssssk....',
  '..ksssssssskksssssk.....',
  '..kssssssssssssssssk....',
  '..ksskkkkkkkkkkkkssk....',
  '..ksskkkkkkkkkkkkssk....',
  '...kssssssssssssssk.....',
  '....kssssssssssssk......',
  '.....kkkkkkkkkkkk.......',
  '....kddddddddddddk......',
  '...kddddddddddddddk.....',
  '..kddddddddddddddddk....',
]);
export const portPombo = sp([
  '........kkkkkk..........',
  '......kkqqqqqqkk........',
  '.....kqqqqqqqqqqk.......',
  '....kqqqkkqqkkqqqk......',
  '....kqqqkkqqkkqqqk......',
  '....kqqqqqqqqqqqqk......',
  '....kqqqqqookqqqqk......',
  '....kqqqqoookqqqqk......',
  '.....kqqqqqqqqqqk.......',
  '....kppppppppppppk......',
  '...kppppppppppppppk.....',
  '..kppppppppppppppppk....',
  '..kppPpppppppppPpppk....',
  '..kppppppppppppppppk....',
  '..kpPpppppppppppPppk....',
  '..kppppppppppppppppk....',
  '..kppppppppppppppppk....',
  '...kppppppppppppppk.....',
  '....kppppppppppppk......',
  '.....kpppppppppk........',
  '......kkkkkkkkk.........',
  '.......koko.............',
  '........................',
  '........................',
]);

// avatar do mapa (10x12)
export const mapMurr = [sp([
  '..kkkkkk..',
  '.khhhhhhk.',
  '.khhhhhhk.',
  '.kssssssk.',
  '.kskssksk.',
  '.kssssssk.',
  '..kkkkkk..',
  '.kwwrrwwk.',
  '.kwrrrrwk.',
  '.kwwwwwwk.',
  '..kbk.kbk.',
  '..ksk.ksk.',
]), sp([
  '..kkkkkk..',
  '.khhhhhhk.',
  '.khhhhhhk.',
  '.kssssssk.',
  '.kskssksk.',
  '.kssssssk.',
  '..kkkkkk..',
  '.kwwrrwwk.',
  '.kwrrrrwk.',
  '.kwwwwwwk.',
  '..kbkkbk..',
  '..kskksk..',
])];

// ==================== TILES ====================
function bricks(x, base, dark, mortar, w, h) {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  x.fillStyle = mortar;
  for (let j = 0; j < h; j += 4) x.fillRect(0, j + 3, w, 1);
  for (let j = 0; j < h; j += 8) { x.fillRect(7, j, 1, 4); x.fillRect(0, j + 4, 1, 4); x.fillRect(15, j + 4, 1, 4); }
  x.fillStyle = dark;
  for (let j = 0; j < h; j += 8) { x.fillRect(1, j + 1, 2, 1); x.fillRect(9, j + 5, 2, 1); }
}

export const TILES = {
  // chão/parede da escola (piso bege com friso)
  '#': tile(x => {
    x.fillStyle = '#c8a058'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#e0bc74'; x.fillRect(0, 0, 16, 3);
    x.fillStyle = '#8a6428'; x.fillRect(0, 3, 16, 1);
    x.fillStyle = '#a87c38';
    x.fillRect(3, 7, 2, 2); x.fillRect(11, 11, 2, 2); x.fillRect(7, 13, 2, 1);
  }),
  // tijolo vermelho (muro)
  'M': tile(x => bricks(x, '#b04028', '#8c2e1a', '#d8c0a8', 16, 16)),
  // ladrilho da praça (laranja/terracota)
  'L': tile(x => {
    x.fillStyle = '#d87838'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#e89858'; x.fillRect(0, 0, 8, 8); x.fillRect(8, 8, 8, 8);
    x.fillStyle = '#b85c24'; x.fillRect(0, 0, 16, 1);
    x.fillStyle = '#c06830'; x.fillRect(7, 0, 1, 16); x.fillRect(0, 7, 16, 1);
    x.fillStyle = '#f2b078'; x.fillRect(0, 1, 16, 1);
  }),
  // terra/canteiro (topo com grama)
  'E': tile(x => {
    x.fillStyle = '#8a5a2c'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#5ca03c'; x.fillRect(0, 0, 16, 4);
    x.fillStyle = '#77c04b'; x.fillRect(0, 0, 16, 2);
    x.fillStyle = '#6a4420'; x.fillRect(4, 8, 2, 2); x.fillRect(12, 12, 2, 2);
  }),
  // terra sem grama (miolo de canteiro empilhado)
  'E2': tile(x => {
    x.fillStyle = '#8a5a2c'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#6a4420'; x.fillRect(4, 4, 2, 2); x.fillRect(12, 10, 2, 2); x.fillRect(8, 14, 2, 2);
  }),
  // piso da escola sem friso claro (miolo)
  '#2': tile(x => {
    x.fillStyle = '#c8a058'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#a87c38';
    x.fillRect(3, 3, 2, 2); x.fillRect(11, 7, 2, 2); x.fillRect(6, 12, 2, 2);
  }),
  // plataforma banco de alvenaria (one-way)
  'b': tile(x => {
    x.fillStyle = '#d8d0c0'; x.fillRect(0, 0, 16, 5);
    x.fillStyle = '#f0e8d8'; x.fillRect(0, 0, 16, 2);
    x.fillStyle = '#a8a090'; x.fillRect(0, 5, 16, 1);
    x.fillStyle = '#b8b0a0'; x.fillRect(2, 6, 3, 10); x.fillRect(11, 6, 3, 10);
  }),
  // laje/marquise (one-way)
  '=': tile(x => {
    x.fillStyle = '#d8d4c8'; x.fillRect(0, 0, 16, 6);
    x.fillStyle = '#f0ece0'; x.fillRect(0, 0, 16, 2);
    x.fillStyle = '#98948a'; x.fillRect(0, 6, 16, 1);
  }),
  // carteira escolar (sólida)
  'D': tile(x => {
    x.fillStyle = '#8a5c28'; x.fillRect(0, 2, 16, 3);
    x.fillStyle = '#b07c3c'; x.fillRect(0, 2, 16, 1);
    x.fillStyle = '#503818'; x.fillRect(2, 5, 2, 11); x.fillRect(12, 5, 2, 11);
    x.fillStyle = '#606068'; x.fillRect(2, 10, 12, 2);
  }),
  // caixa/banca de madeira
  'X': tile(x => {
    x.fillStyle = '#a87840'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c89858'; x.fillRect(1, 1, 14, 2); x.fillRect(1, 5, 14, 2); x.fillRect(1, 9, 14, 2); x.fillRect(1, 13, 14, 2);
    x.fillStyle = '#684818'; x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
  }),
  // coluna vermelha do CAD (decoração, não sólida)
  'c': tile(x => {
    x.fillStyle = '#c03028'; x.fillRect(4, 0, 8, 16);
    x.fillStyle = '#e05048'; x.fillRect(4, 0, 2, 16);
    x.fillStyle = '#801a14'; x.fillRect(10, 0, 2, 16);
  }),
  // tronco de árvore (decoração)
  'i': tile(x => {
    x.fillStyle = '#6a4420'; x.fillRect(5, 0, 6, 16);
    x.fillStyle = '#8a5c30'; x.fillRect(5, 0, 2, 16);
  }),
  // copa de árvore (decoração)
  'A': tile(x => {
    x.fillStyle = '#3d8c3d';
    x.fillRect(1, 4, 14, 12); x.fillRect(3, 1, 10, 4);
    x.fillStyle = '#57ab4a'; x.fillRect(3, 3, 6, 5); x.fillRect(2, 9, 4, 3);
    x.fillStyle = '#2a662e'; x.fillRect(10, 8, 4, 6); x.fillRect(5, 12, 4, 3);
  }),
};
