#!/usr/bin/env python
"""
build_walk.py — monta o strip de WALK CYCLE (6 quadros) a partir do sheet em
fundo verde (chroma key) que o Pablo gera. Ex: art/fichas/fundo_verde_<nome>.png

- tira o verde (chroma key + despill so na borda)
- detecta os quadros por ocupacao de coluna
- usa uma BASELINE VERTICAL COMUM (preserva o bob da cabeca e mantem os pes no
  mesmo chao entre quadros)
- reduz pra altura alvo preservando contorno, alinha pelo centro dos pes
- empacota art/char_<nome>_walk.png + salva um GIF de previa

Uso:  python tools/build_walk.py murrinha 92
"""
import sys, os
import numpy as np
from PIL import Image

OUTLINE = (28, 20, 16)


def dilate(mask, n=1):
    m = mask.copy()
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def key_green(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green = (g > r + 14) & (g > b + 14) & (g > 80)
    return ~green


def despill_edge(a):
    """reduz o esverdeado so nos pixels de BORDA (nao mexe no interior)."""
    al = a[..., 3] >= 128
    edge = al & dilate(~al, 1)
    rgb = a[..., :3].astype(np.int16)
    g = rgb[..., 1]; rb = np.maximum(rgb[..., 0], rgb[..., 2])
    fix = edge & (g > rb)
    a[fix, 1] = rb[fix].astype(np.uint8)
    return a


def frames_x(fg, merge_gap=60):
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
    # funde runs separados por gap pequeno (sliver de ruido ou vao interno de
    # braca/perna) — quadros de verdade ficam separados por gaps grandes.
    merged = [runs[0]]
    for x0, x1 in runs[1:]:
        if x0 - merged[-1][1] <= merge_gap:
            merged[-1][1] = x1
        else:
            merged.append([x0, x1])
    return [tuple(r) for r in merged]


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE
    a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def foot_center(img):
    a = np.asarray(img); al = a[..., 3] >= 128
    band = al[int(img.height * 0.88):, :]
    xs = np.nonzero(band.any(axis=0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


def build(name, H):
    src = f'art/fichas/fundo_verde_{name}.png'
    rgb = np.asarray(Image.open(src).convert('RGB')).astype(int)
    fg = key_green(rgb)
    runs = frames_x(fg)
    ys = np.nonzero(fg.any(1))[0]
    top, bot = int(ys.min()), int(ys.max())            # baseline comum
    scale = H / (bot - top + 1)
    rgba_full = np.dstack([rgb.astype(np.uint8),
                           np.where(fg, 255, 0).astype(np.uint8)])
    frames = []
    for (x0, x1) in runs:
        sub = rgba_full[top:bot + 1, x0:x1 + 1]
        im = Image.fromarray(sub, 'RGBA')
        im = im.resize((max(1, round(im.width * scale)), H), Image.LANCZOS)
        im = despill_edge(np.asarray(im).astype(np.uint8).copy())
        frames.append(crisp_outline(Image.fromarray(im, 'RGBA')))
    cw = max(f.width for f in frames) + 6
    strip = Image.new('RGBA', (cw * len(frames), H + 2), (0, 0, 0, 0))
    cells = []
    for i, f in enumerate(frames):
        fx = cw * i + round(cw / 2 - foot_center(f))
        strip.alpha_composite(f, (fx, 1))
        cell = Image.new('RGBA', (cw, H + 2), (0, 0, 0, 0))
        cell.alpha_composite(f, (round(cw / 2 - foot_center(f)), 1))
        cells.append(cell)
    strip.save(f'art/char_{name}_walk.png')
    # GIF de previa (zoom 2x, fundo cinza)
    gif = [Image.new('RGBA', (cw, H + 2), (90, 100, 110, 255)) for _ in cells]
    for gimg, cell in zip(gif, cells):
        gimg.alpha_composite(cell)
    gif = [g.convert('P', palette=Image.ADAPTIVE).resize((cw * 2, (H + 2) * 2), Image.NEAREST) for g in gif]
    gif[0].save(f'art/fichas/out/_walk_{name}.gif', save_all=True,
                append_images=gif[1:], duration=110, loop=0, disposal=2)
    print(f'{name}: walk {strip.size}, {len(frames)} quadros (celula {cw}x{H})')


if __name__ == '__main__':
    name = sys.argv[1]
    H = int(sys.argv[2]) if len(sys.argv) > 2 else 92
    build(name, H)
