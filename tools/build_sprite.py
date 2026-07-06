#!/usr/bin/env python
"""
build_sprite.py — monta o sprite de JOGO (strip) a partir das poses extraidas.

Pega as poses recortadas (art/fichas/out/<nome>/*.png), reduz pro tamanho do
jogo preservando o contorno, alinha os pes numa baseline comum e empacota um
strip de 3 quadros no layout que o engine espera:
    frame 0 = passada (bob p/ baixo)   <- walk
    frame 1 = parado (idle)            <- standing / neutro
    frame 2 = passada (bob p/ cima)    <- walk / no ar (pulo)
(drawPlayer/frameFor: parado usa fr1; andando faz ping-pong 0-1-2-1; no ar fr2.)

Fonte alta-res (SS=2): o strip sai com o DOBRO da altura logica.

Uso:  python tools/build_sprite.py murrinha 92
"""
import sys, os
import numpy as np
from PIL import Image

OUTLINE = (28, 20, 16)     # cor do contorno reforcado


def dilate(mask, n=1):
    m = mask.copy()
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def load(name, pose):
    return Image.open(f'art/fichas/out/{name}/{pose}.png').convert('RGBA')


def scale_h(img, H):
    """reduz pra altura H preservando aspecto (reducao em 2 etapas p/ nitidez)."""
    while img.height > H * 2:
        img = img.resize((max(1, img.width // 2), img.height // 2), Image.LANCZOS)
    w = max(1, round(img.width * H / img.height))
    return img.resize((w, H), Image.LANCZOS)


def crisp_and_outline(img):
    """binariza o alpha (borda limpa) e reforca 1px de contorno escuro em volta."""
    a = np.asarray(img).astype(np.uint8).copy()
    rgb, al = a[..., :3], a[..., 3]
    sil = al >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE
    a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def foot_center(img):
    """x central dos pes (10% de baixo) — pra alinhar horizontal sem balancar."""
    a = np.asarray(img)
    al = a[..., 3] >= 128
    h = img.height
    band = al[int(h * 0.9):, :]
    xs = np.nonzero(band.any(axis=0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


def build(name, H):
    idle = crisp_and_outline(scale_h(load(name, 'side'), H))
    walk = crisp_and_outline(scale_h(load(name, 'walking'), H))
    frames_src = [(walk, +1), (idle, 0), (walk, -1)]   # (img, bob)
    # largura da celula = maior largura; alinhamento por centro dos pes
    cw = max(im.width for im, _ in frames_src) + 6
    strip = Image.new('RGBA', (cw * 3, H + 2), (0, 0, 0, 0))
    for i, (im, bob) in enumerate(frames_src):
        fx = cw * i + round(cw / 2 - foot_center(im))
        strip.alpha_composite(im, (fx, 1 - bob))
    os.makedirs('art', exist_ok=True)
    strip.save(f'art/char_{name}_strip.png')
    # frame idle isolado (fallback _cut)
    cut = Image.new('RGBA', (cw, H + 2), (0, 0, 0, 0))
    cut.alpha_composite(idle, (round(cw / 2 - foot_center(idle)), 1))
    cut.save(f'art/char_{name}_cut.png')
    print(f'{name}: strip {strip.size} (celula {cw}x{H}), cut {cut.size}')


if __name__ == '__main__':
    name = sys.argv[1]
    H = int(sys.argv[2]) if len(sys.argv) > 2 else 92
    build(name, H)
