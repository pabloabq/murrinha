// gfx.js — fábrica de sprites pixel-art e fonte bitmap 3x5
// Altura interna fixa (180); largura se adapta à proporção da tela do
// aparelho (16:9 até ~21:9) para preencher o celular sem tarjas.
export let W = 320;
export const H = 180;
export function setW(w) { W = w; }

// Cria um canvas a partir de um "mapa de pixels" (array de strings) + paleta.
export function sprite(rows, pal) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  for (let j = 0; j < h; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.' || ch === ' ') continue;
      x.fillStyle = pal[ch] || '#f0f';
      x.fillRect(i, j, 1, 1);
    }
  }
  return c;
}

// Canvas vazio para desenhar tiles proceduralmente
export function tile(fn, w = 16, h = 16) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  return c;
}

export function flipped(img) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const x = c.getContext('2d');
  x.translate(img.width, 0); x.scale(-1, 1);
  x.drawImage(img, 0, 0);
  return c;
}

// ---------------- Fonte bitmap 3x5 ----------------
const F = {
  'A':'010,101,111,101,101','B':'110,101,110,101,110','C':'011,100,100,100,011',
  'D':'110,101,101,101,110','E':'111,100,110,100,111','F':'111,100,110,100,100',
  'G':'011,100,101,101,011','H':'101,101,111,101,101','I':'111,010,010,010,111',
  'J':'001,001,001,101,010','K':'101,101,110,101,101','L':'100,100,100,100,111',
  'M':'101,111,111,101,101','N':'110,101,101,101,101','O':'010,101,101,101,010',
  'P':'110,101,110,100,100','Q':'010,101,101,110,011','R':'110,101,110,101,101',
  'S':'011,100,010,001,110','T':'111,010,010,010,010','U':'101,101,101,101,111',
  'V':'101,101,101,101,010','W':'101,101,111,111,101','X':'101,101,010,101,101',
  'Y':'101,101,010,010,010','Z':'111,001,010,100,111',
  '0':'111,101,101,101,111','1':'010,110,010,010,111','2':'111,001,111,100,111',
  '3':'111,001,011,001,111','4':'101,101,111,001,001','5':'111,100,111,001,111',
  '6':'111,100,111,101,111','7':'111,001,001,010,010','8':'111,101,111,101,111',
  '9':'111,101,111,001,111',
  '.':'000,000,000,000,010',',':'000,000,000,010,100','!':'010,010,010,000,010',
  '?':'111,001,011,000,010',':':'000,010,000,010,000','-':'000,000,111,000,000',
  "'":'010,010,000,000,000','"':'101,101,000,000,000','/':'001,001,010,100,100',
  '(':'010,100,100,100,010',')':'010,001,001,001,010','+':'000,010,111,010,000',
  '%':'101,001,010,100,101','*':'101,010,101,000,000','>':'100,010,001,010,100',
  '<':'001,010,100,010,001','=':'000,111,000,111,000','_':'000,000,000,000,111',
  '♥':'000,101,111,010,000', // ♥
  '→':'000,010,111,010,000', // → (aprox)
};
const glyphCache = {};
function glyph(ch, color) {
  const key = ch + color;
  if (glyphCache[key]) return glyphCache[key];
  const def = F[ch];
  if (!def) return null;
  const rows = def.split(',');
  const c = document.createElement('canvas');
  c.width = 3; c.height = 5;
  const x = c.getContext('2d');
  x.fillStyle = color;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++)
    if (rows[j][i] === '1') x.fillRect(i, j, 1, 1);
  glyphCache[key] = c;
  return c;
}

export function normText(s) {
  return s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function drawText(ctx, text, x, y, color = '#fff', scale = 1) {
  const s = normText(String(text));
  let cx = x;
  for (const ch of s) {
    if (ch === ' ') { cx += 4 * scale; continue; }
    const g = glyph(ch, color);
    if (g) ctx.drawImage(g, cx, y, 3 * scale, 5 * scale);
    cx += 4 * scale;
  }
  return cx;
}

export function textWidth(text, scale = 1) {
  return normText(String(text)).length * 4 * scale - scale;
}

export function drawTextC(ctx, text, cx, y, color = '#fff', scale = 1) {
  drawText(ctx, text, Math.round(cx - textWidth(text, scale) / 2), y, color, scale);
}

// Texto com contorno (para títulos)
export function drawTextO(ctx, text, x, y, color, outline, scale = 1) {
  for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]])
    drawText(ctx, text, x + dx * scale, y + dy * scale, outline, scale);
  drawText(ctx, text, x, y, color, scale);
}

// Caixa de diálogo estilo SNES
export function drawBox(ctx, x, y, w, h, bg = '#182848', border = '#f8f8f8') {
  ctx.fillStyle = border;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = border;
  // cantos arredondados (recorte de 1px)
  ctx.clearRect ? null : null;
}
