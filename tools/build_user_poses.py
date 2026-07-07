#!/usr/bin/env python
"""Processa as poses que o Pablo desenhou (fundo verde) na MESMA escala do walk.
   pulando -> jump(apice)/fall(subida);  abaixa -> hide(bem baixo)/crouch(medio)."""
import numpy as np
from collections import deque
from PIL import Image

FICH = 'art/fichas'
OUTLINE = (28, 20, 16)
STAND = 68  # bate com a altura de pe do idle (62 no personagem)


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


def frames_x(fg, gap=60):
    occ = fg.sum(0) > 5
    runs = []; i = 0; W = len(occ)
    while i < W:
        if occ[i]:
            j = i
            while j < W and occ[j]:
                j += 1
            runs.append([i, j - 1]); i = j
        else:
            i += 1
    m = [runs[0]]
    for x0, x1 in runs[1:]:
        if x0 - m[-1][1] <= gap:
            m[-1][1] = x1
        else:
            m.append([x0, x1])
    return m


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE; a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def foot_center(img):
    a = np.asarray(img); al = a[..., 3] >= 128
    band = al[int(img.height * 0.88):, :]
    xs = np.nonzero(band.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


def load_frames(path):
    im = Image.open(path).convert('RGB'); fg = key(im)
    arr = np.asarray(im).astype('uint8')
    rgba = np.dstack([arr, np.where(fg, 255, 0).astype('uint8')])
    out = []
    for x0, x1 in frames_x(fg):
        sub = rgba[:, x0:x1 + 1]
        ys = np.nonzero(sub[..., 3].any(1))[0]
        out.append(Image.fromarray(sub[ys.min():ys.max() + 1], 'RGBA'))
    return out


# fator de escala vindo do WALK (pra tudo ficar do mesmo tamanho do personagem)
walk_fg = key(Image.open(FICH + '/fundo_verde_murrinha.png'))
ys = np.nonzero(walk_fg.any(1))[0]
FACTOR = STAND / (ys.max() - ys.min() + 1)


def save(frame, out):
    w = max(1, round(frame.width * FACTOR)); h = max(1, round(frame.height * FACTOR))
    im = crisp_outline(frame.resize((w, h), Image.LANCZOS))
    fc = foot_center(im); half = max(fc, im.width - fc)
    cw = int(2 * half) + 4
    canvas = Image.new('RGBA', (cw, im.height + 2), (0, 0, 0, 0))
    canvas.alpha_composite(im, (round(cw / 2 - fc), 1))
    canvas.save(out); print(out, canvas.size)


jump = load_frames(FICH + '/fundo verde murrinha pulando.png')
crouch = load_frames(FICH + '/fundo verde murrinha abaixa.png')
print('quadros: pulando=%d, abaixa=%d, FACTOR=%.4f' % (len(jump), len(crouch), FACTOR))
# pulando: 0=antecipacao 1=subida 2=apice 3=pouso
save(jump[2], 'art/char_murrinha_jump.png')   # apice (no ar subindo)
save(jump[1], 'art/char_murrinha_fall.png')   # pernas esticando (caindo)
# abaixa: 0=leve 1=medio 2=bem baixo 3=medio
save(crouch[1], 'art/char_murrinha_crouch.png')
save(crouch[2], 'art/char_murrinha_hide.png')  # bem baixo = esconde sob o cone
