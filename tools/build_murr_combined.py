#!/usr/bin/env python
"""Reconstroi Murrinha PARADO + ANDANDO do arquivo unico do Pablo (mesma origem
   -> mesmo tom/tamanho). Alinha CADA quadro pelo proprio pe (pe sempre no chao,
   sem flutuar). Escala comum: parado = 62px."""
import numpy as np
from PIL import Image

SRC = 'art/fichas/andar e parado.png'
OUTLINE = (28, 20, 16)
STAND = 62


def dilate(m, n=1):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def key(im):
    rgb = np.asarray(im.convert('RGB')).astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return ~((g > r + 14) & (g > b + 14) & (g > 80))


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE; a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def foot_center(img):
    a = np.asarray(img); al = a[..., 3] >= 128
    band = al[int(img.height * 0.9):, :]
    xs = np.nonzero(band.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


im = Image.open(SRC).convert('RGB')
fg = key(im)
arr = np.asarray(im).astype('uint8')
rgba = np.dstack([arr, np.where(fg, 255, 0).astype('uint8')])
occ = fg.sum(0) > 5
runs = []; i = 0
while i < len(occ):
    if occ[i]:
        j = i
        while j < len(occ) and occ[j]:
            j += 1
        if j - i > 30:
            runs.append((i, j - 1))
        i = j
    else:
        i += 1
# cada quadro cortado no PROPRIO bbox (pe no fundo)
frames = []
for x0, x1 in runs:
    ys = np.nonzero(fg[:, x0:x1 + 1].any(1))[0]
    frames.append(Image.fromarray(rgba[ys.min():ys.max() + 1, x0:x1 + 1], 'RGBA'))
print('quadros:', len(frames), 'alturas:', [f.height for f in frames])

PARADO = 4                       # imagem 5 = em pe (Pablo confirmou)
WALK = [0, 1, 2, 3]             # imagens 1-4 = ciclo de caminhada, na ordem
factor = STAND / frames[PARADO].height


def scaled(f):
    return crisp_outline(f.resize((max(1, round(f.width * factor)),
                                   max(1, round(f.height * factor))), Image.LANCZOS))


def save_single(idx, out):
    im2 = scaled(frames[idx]); fc = foot_center(im2)
    half = max(fc, im2.width - fc); cw = int(2 * half) + 4
    c = Image.new('RGBA', (cw, im2.height + 2), (0, 0, 0, 0))
    c.alpha_composite(im2, (round(cw / 2 - fc), 1)); c.save(out); print(out, c.size)


def save_walk(idxs, out):
    ims = [scaled(frames[k]) for k in idxs]
    H = max(f.height for f in ims); cw = max(f.width for f in ims) + 6
    strip = Image.new('RGBA', (cw * len(ims), H + 2), (0, 0, 0, 0))
    for i, f in enumerate(ims):                     # pe de cada quadro no FUNDO da celula
        strip.alpha_composite(f, (cw * i + round(cw / 2 - foot_center(f)), 1 + (H - f.height)))
    strip.save(out); print(out, strip.size, len(ims), 'quadros')


save_single(PARADO, 'art/char_murrinha_idle.png')
save_walk(WALK, 'art/char_murrinha_walk.png')
