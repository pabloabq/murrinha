#!/usr/bin/env python
"""Reconstroi a VANITA (arte do Pablo, fundo verde): walk 4 quadros + parado
   (de vanita_anda: q0-q3 andar, q4 parado) e apito (de vanita_apita q3).
   Cada quadro alinhado pelo PROPRIO pe (sem flutuar). Altura de pe = 92 (adulta).
   Como sao 2 arquivos, cada um escala pela sua propria altura de pe -> mesmo
   tamanho de personagem em ambos."""
import numpy as np
from PIL import Image

OUTLINE = (28, 20, 16)
STAND = 92


def dilate(m, n=1):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def frames_of(path):
    im = Image.open(path).convert('RGB')
    rgb = np.asarray(im).astype(int)
    fg = ~((rgb[..., 1] > rgb[..., 0] + 14) & (rgb[..., 1] > rgb[..., 2] + 14) & (rgb[..., 1] > 80))
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
    out = []
    for x0, x1 in runs:
        ys = np.nonzero(fg[:, x0:x1 + 1].any(1))[0]
        out.append(Image.fromarray(rgba[ys.min():ys.max() + 1, x0:x1 + 1], 'RGBA'))
    return out


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


def scaled(f, factor):
    return crisp_outline(f.resize((max(1, round(f.width * factor)),
                                   max(1, round(f.height * factor))), Image.LANCZOS))


def save_single(f, out, factor):
    im2 = scaled(f, factor); fc = foot_center(im2)
    half = max(fc, im2.width - fc); cw = int(2 * half) + 4
    c = Image.new('RGBA', (cw, im2.height + 2), (0, 0, 0, 0))
    c.alpha_composite(im2, (round(cw / 2 - fc), 1)); c.save(out); print(out, c.size)


def save_walk(fs, out, factor):
    ims = [scaled(f, factor) for f in fs]
    H = max(f.height for f in ims); cw = max(f.width for f in ims) + 6
    strip = Image.new('RGBA', (cw * len(ims), H + 2), (0, 0, 0, 0))
    for i, f in enumerate(ims):
        strip.alpha_composite(f, (cw * i + round(cw / 2 - foot_center(f)), 1 + (H - f.height)))
    strip.save(out); print(out, strip.size, len(ims), 'quadros')


novo = frames_of('art/fichas/vanita_novo.png')   # 8 quadros: q0=parado, q1-q7=andar (CALCA)
apita = frames_of('art/fichas/vanita_apita.png')
f_novo = STAND / novo[0].height        # q0 = parado (ref de altura)
f_apita = STAND / apita[0].height      # q0 = em pe (ref nesse arquivo)

save_single(novo[0], 'art/char_vanita_idle.png', f_novo)
save_walk([novo[1], novo[2], novo[3], novo[4], novo[5], novo[6], novo[7]], 'art/char_vanita_walk.png', f_novo)
save_single(apita[3], 'art/char_vanita_whistle.png', f_apita)   # q3 = soprando (ainda de saia)
