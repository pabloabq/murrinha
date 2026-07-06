#!/usr/bin/env python
"""
build_cast.py — processa as poses HD geradas por IA (fundo verde) em sprites de
jogo, na proporcao certa. Chroma-key + recorte + escala por fator UNICO por
personagem (mantem proporcao crianca x adulto) + contorno. Monta os walks de 4
fases e as poses avulsas (idle/jump/fall/crouch/hide/slide, idle/whistle).

Fonte: scratchpad (mw_1..4, murr_*, van_*). Saida: art/char_murrinha_*, char_vanita_*.
"""
import numpy as np, os
from PIL import Image

SP = r"C:\Users\Pablo\AppData\Local\Temp\claude\C--Users-Pablo-Documents-Campina-82v2\29ce7a32-26c8-42bf-bf24-545cc8f05632\scratchpad"
OUTLINE = (28, 20, 16)
STAND_MURR = 62   # altura de pe do Murrinha (highres, SS=2) -> ~31 logico
STAND_VAN = 92    # altura de pe da Vanita (adulta)


def dilate(m, n=1):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def key_trim(path):
    im = Image.open(path).convert('RGB'); rgb = np.asarray(im).astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    fg = ~((g > r + 14) & (g > b + 14) & (g > 80))
    ys = np.nonzero(fg.any(1))[0]; xs = np.nonzero(fg.any(0))[0]
    rgba = np.dstack([np.asarray(im).astype('uint8'), np.where(fg, 255, 0).astype('uint8')])
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE
    a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def scaled(path, factor):
    c = key_trim(path)
    c = c.resize((max(1, round(c.width * factor)), max(1, round(c.height * factor))), Image.LANCZOS)
    return crisp_outline(c)


def foot_center(img):
    a = np.asarray(img); al = a[..., 3] >= 128
    band = al[int(img.height * 0.88):, :]
    xs = np.nonzero(band.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


def save_pose(path, out, factor):
    """1 quadro: pes na base, personagem centralizado pelo PE (estados casam)."""
    im = scaled(path, factor)
    fc = foot_center(im)
    half = max(fc, im.width - fc)
    cw = int(2 * half) + 4
    canvas = Image.new('RGBA', (cw, im.height + 2), (0, 0, 0, 0))
    canvas.alpha_composite(im, (round(cw / 2 - fc), 1))
    canvas.save(out)
    return im.height


def save_walk(paths, out, stand):
    """strip de N quadros. Normaliza CADA quadro pra MESMA altura de personagem
    (as gerações de IA saem em tamanhos diferentes; escalar por fator único faria
    a personagem crescer/encolher ao andar)."""
    frames = []
    for p in paths:
        c = key_trim(p)
        c = c.resize((max(1, round(c.width * stand / c.height)), stand), Image.LANCZOS)
        frames.append(crisp_outline(c))
    H = max(f.height for f in frames)
    cw = max(f.width for f in frames) + 6
    strip = Image.new('RGBA', (cw * len(frames), H + 2), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        strip.alpha_composite(f, (cw * i + round(cw / 2 - foot_center(f)), 1 + (H - f.height)))
    strip.save(out)
    return len(frames), cw, H


# ---- MURRINHA ----
refM = key_trim(os.path.join(SP, 'murr_idle.png')).height
fM = STAND_MURR / refM
for pose, src in [('idle', 'murr_idle'), ('jump', 'murr_jump'), ('fall', 'murr_fall'),
                  ('crouch', 'murr_crouch'), ('hide', 'murr_hide'), ('slide', 'murr_slide')]:
    save_pose(os.path.join(SP, src + '.png'), 'art/char_murrinha_%s.png' % pose, fM)
nfw = save_walk([os.path.join(SP, 'mw_%d.png' % i) for i in (1, 3)], 'art/char_murrinha_walk.png', STAND_MURR)
print('MURRINHA fator %.4f (refH %d), walk %s' % (fM, refM, nfw))

# ---- VANITA ----
refV = key_trim(os.path.join(SP, 'van_idle.png')).height
fV = STAND_VAN / refV
for pose, src in [('idle', 'van_idle'), ('whistle', 'van_whistle')]:
    save_pose(os.path.join(SP, src + '.png'), 'art/char_vanita_%s.png' % pose, fV)
nvw = save_walk([os.path.join(SP, 'van_w%d.png' % i) for i in (1, 3)], 'art/char_vanita_walk.png', STAND_VAN)
print('VANITA fator %.4f (refH %d), walk %s' % (fV, refV, nvw))
