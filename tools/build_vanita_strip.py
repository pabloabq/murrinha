#!/usr/bin/env python
"""Monta a tira de andar da Vanita a partir do ciclo pronto (vanita_walk_strip8.png,
   8 quadros RGBA, corpo inteiro se mexendo). NAO cria movimento — so limpa, ALINHA
   pelo QUADRIL (cinto, ponto estavel -> zero tremor) com pe no chao, e escala pro
   tamanho do jogo (mesma altura da idle)."""
import numpy as np
from PIL import Image

STRIP = 'art/fichas/vanita_walk_strip8.png'
N = 8
STAND = 92                       # altura cabeca->pe no jogo (igual a idle)
OUTLINE = (28, 20, 16)


def dilate(m, n=1):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 110
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, a[..., 3]).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE; a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


im = Image.open(STRIP).convert('RGBA')
A = np.asarray(im)
H, W = A.shape[:2]
fw = W // N

# recorta os 8 quadros e mede quadril + base
frames, hips, bases, tops = [], [], [], []
for i in range(N):
    sub = im.crop((i * fw, 0, (i + 1) * fw, H))
    m = np.asarray(sub)[..., 3] >= 40
    ys = np.nonzero(m.any(1))[0]; top, bot = ys.min(), ys.max()
    hh = bot - top
    # quadril = centro-x na faixa do cinto (~50-58% da altura)
    band = m[top + int(hh * 0.50):top + int(hh * 0.58)]
    bx = np.nonzero(band.any(0))[0]
    hip_cx = (bx.min() + bx.max()) / 2.0
    frames.append(sub); hips.append(hip_cx); bases.append(bot); tops.append(top)

# celula simetrica em torno do quadril, pe (base) no fundo
half = 0
xext = 0
for i, sub in enumerate(frames):
    m = np.asarray(sub)[..., 3] >= 40
    xs = np.nonzero(m.any(0))[0]
    half = max(half, hips[i] - xs.min(), xs.max() - hips[i])
half = int(np.ceil(half)) + 2
cellW = 2 * half
topmin = min(tops)
cellH = max(bases) - topmin + 2       # do topo mais alto ate a base comum

factor = STAND / (max(b - t for b, t in zip(bases, tops)))  # maior altura -> STAND

cells = []
for i, sub in enumerate(frames):
    cell = Image.new('RGBA', (cellW, cellH), (0, 0, 0, 0))
    # quadril -> centro; base -> fundo (todos base=687, entao alinha embaixo)
    ox = round(half - hips[i])
    oy = round((cellH - 2) - bases[i])
    cell.alpha_composite(sub, (ox, oy))
    nw = max(1, round(cellW * factor)); nh = max(1, round(cellH * factor))
    cells.append(crisp_outline(cell.resize((nw, nh), Image.LANCZOS)))

CW = max(c.width for c in cells); CH = max(c.height for c in cells)
strip = Image.new('RGBA', (CW * N, CH), (0, 0, 0, 0))
for i, c in enumerate(cells):
    strip.alpha_composite(c, (CW * i + (CW - c.width) // 2, CH - c.height))
strip.save('art/char_vanita_walk.png')
print('walk:', strip.size, N, 'quadros, cw=', CW, 'factor=%.3f' % factor)

# preview grande (fundo claro) p/ conferir
prev = Image.new('RGBA', (CW * N, CH), (150, 165, 175, 255))
for i, c in enumerate(cells):
    prev.alpha_composite(c, (CW * i, CH - c.height))
prev.save('tools/_vstrip_prev.png')
