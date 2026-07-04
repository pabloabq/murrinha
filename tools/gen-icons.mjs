// gen-icons.mjs — gera icons/icon-192.png e icon-512.png (rosto do Murrinha em pixel art)
// PNG codificado na mão (zlib do Node) — zero dependências.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const PAL = {
  '.': [200, 30, 20],   // fundo vermelho CAD
  '_': [168, 22, 14],   // borda do fundo
  k: [20, 20, 32], h: [74, 47, 20], s: [242, 193, 132],
  w: [248, 248, 248], r: [216, 30, 24], y: [242, 210, 78],
};
// 16x16: rosto do Murrinha com a farda
const ART = [
  '________________',
  '_.............._',
  '_...kkkkkkkk..._',
  '_..khhhhhhhhk.._',
  '_.khhhhhhhhhhk._',
  '_.khhsssssshhk._',
  '_.kssksssskssk._',
  '_.kssksssskssk._',
  '_.kssssssssssk._',
  '_.kssskkkksssk._',
  '_..kssssssssk.._',
  '_...kkkkkkkk..._',
  '_..kwwwrrwwww.._',
  '_..kwrrrrrrww.._',
  '_..kwwwwwwwww.._',
  '________________',
];

function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size) {
  const scale = size / 16;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filtro none
    const row = ART[Math.floor(y / scale)];
    for (let x = 0; x < size; x++) {
      const [r, g, b] = PAL[row[Math.floor(x / scale)]] || PAL['.'];
      raw[o++] = r; raw[o++] = g; raw[o++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(new URL(`../icons/icon-${size}.png`, import.meta.url), png(size));
  console.log(`icons/icon-${size}.png ok`);
}
