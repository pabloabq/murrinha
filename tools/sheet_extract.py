#!/usr/bin/env python
"""
sheet_extract.py — pipeline deterministico de extracao das MODEL SHEETS.

As 9 fichas usam o MESMO template do ChatGPT (1448x1086), com 8 poses numa
grade fixa: linha de cima = turnaround (front/side/back/3-4), linha de baixo =
poses (standing/walking/clever/confident). Como a grade e' fixa, as janelas
SLOTS sao definidas UMA vez e valem pras 9 fichas.

Recorte por CONTORNO (nao por cor): o fundo creme e a camisa branca sao a MESMA
cor (dist ~8), entao chroma-key nao separa. Mas o personagem tem um contorno
preto fechado. Entao: dentro de cada janela, floodamos a partir da borda
passando so por pixels NAO-contorno -> o fundo e os "bolsos" que abrem pro chao
(entre as pernas) sao alcancados e removidos; a camisa, totalmente anelada pelo
contorno, fica. Robusto e independente de cor.

Uso:  python tools/sheet_extract.py art/fichas/ficha_murrinha.png [outdir]
"""
import sys, os, json
from collections import deque
import numpy as np
from PIL import Image, ImageDraw

# --- grade de poses (centros em coords do template 1448x1086) ---
SLOTS = {
    'front':     (205, 385), 'side':      (535, 385),
    'back':      (855, 385), 'q34':       (1195, 385),
    'standing':  (455, 855), 'walking':   (725, 855),
    'clever':    (1010, 855), 'confident': (1265, 855),
}
HALF_W, HALF_H = 165, 245     # meia-janela de busca em torno do centro
OUTLINE_V = 108               # pixel com value < isso = contorno (barreira)
DILATE = 1                    # fecha brechas de 1px no contorno antes do flood
CREAM_TOL = 34                # dist de cor pro fundo creme (remocao hibrida)
MIN_AREA = 2500               # ignora texto de rotulo e faiscas
FLAT_RATIO = 0.42             # descarta blob "achatado" (sombra do chao)


def dilate(mask, n=1):
    m = mask.copy()
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def reached_from_border(crop):
    """Conjunto alcancavel a partir da borda passando so por NAO-contorno.
    Isola 'exterior-conectado' de 'interior anelado pelo contorno'."""
    h, w = crop.shape[:2]
    val = crop.max(2)
    passable = ~dilate(val < OUTLINE_V, DILATE)
    seen = np.zeros((h, w), bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x]: dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x]: dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        if seen[y, x] or not passable[y, x]:
            continue
        seen[y, x] = True
        if y > 0:     dq.append((y - 1, x))
        if y < h - 1: dq.append((y + 1, x))
        if x > 0:     dq.append((y, x - 1))
        if x < w - 1: dq.append((y, x + 1))
    return seen


def foreground(crop, bgcol):
    """fg-mask HIBRIDA: remove so o que e' alcancavel pelo exterior E tem cor de
    fundo (creme) ou de sombra. Assim:
      - vao entre as pernas (creme, aberto pro chao) -> removido
      - cabelo claro/loiro (aberto, mas NAO creme)   -> mantido
      - camisa branca (creme, mas anelada/fechada)   -> mantida (nao alcancada)
      - sombra do chao (cinza, aberta)               -> removida
    """
    reached = reached_from_border(crop)
    diff = np.abs(crop - bgcol).max(2)
    cream = diff <= CREAM_TOL
    mx = crop.max(2); mn = crop.min(2)
    shadow = (mx - mn < 28) & (mx >= 150) & (mx <= 222)
    removed = reached & (cream | shadow)
    return ~removed


def components(mask):
    """Rotula componentes conexos (8-viz). Retorna [(minx,miny,maxx,maxy,area)]."""
    h, w = mask.shape
    seen = np.zeros((h, w), bool)
    out = []
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if seen[sy, sx]:
            continue
        dq = deque([(sy, sx)]); seen[sy, sx] = True
        minx = maxx = sx; miny = maxy = sy; area = 0
        while dq:
            y, x = dq.pop(); area += 1
            if x < minx: minx = x
            if x > maxx: maxx = x
            if y < miny: miny = y
            if y > maxy: maxy = y
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; dq.append((ny, nx))
        out.append((minx, miny, maxx, maxy, area))
    return out


def extract(path, outdir=None):
    im = Image.open(path).convert('RGB')
    arr = np.asarray(im).astype(np.int16)
    H, W = arr.shape[:2]
    name = os.path.splitext(os.path.basename(path))[0].replace('ficha_', '')
    outdir = outdir or os.path.join(os.path.dirname(path), 'out', name)
    os.makedirs(outdir, exist_ok=True)

    dbg = im.copy(); dd = ImageDraw.Draw(dbg)
    manifest = {'name': name, 'source': os.path.basename(path), 'poses': {}}
    # cor do fundo = mediana dos 4 cantos
    bgcol = np.median(np.concatenate([
        arr[:20, :20].reshape(-1, 3), arr[:20, -20:].reshape(-1, 3),
        arr[-20:, :20].reshape(-1, 3), arr[-20:, -20:].reshape(-1, 3)]), axis=0)

    for pose, (cx, cy) in SLOTS.items():
        x0, x1 = max(0, cx - HALF_W), min(W, cx + HALF_W)
        y0, y1 = max(0, cy - HALF_H), min(H, cy + HALF_H)
        dd.rectangle([x0, y0, x1, y1], outline=(60, 120, 220), width=1)
        crop = arr[y0:y1, x0:x1]
        fg = foreground(crop, bgcol)
        comps = [c for c in components(fg) if c[4] >= MIN_AREA]
        if not comps:
            manifest['poses'][pose] = None; continue
        # corpo = maior componente. rotulo (texto) fica ACIMA, sombra ABAIXO.
        core = max(comps, key=lambda c: c[4])
        cmnx, cmny, cmxx, cmxy, _ = core
        keep = [core]
        for c in comps:
            if c is core:
                continue
            mnx, mny, mxx, mxy, area = c
            bw, bh = mxx - mnx + 1, mxy - mny + 1
            if bh < FLAT_RATIO * bw:                 # sombra achatada
                continue
            ccy = (mny + mxy) / 2
            if ccy < cmny or ccy > cmxy:             # rotulo (acima) / sombra (abaixo)
                continue
            keep.append(c)                           # item lateral (ex: caderno)
        gmnx = min(k[0] for k in keep); gmny = min(k[1] for k in keep)
        gmxx = max(k[2] for k in keep); gmxy = max(k[3] for k in keep)
        # recorta a regiao e aplica alpha do fg
        sub = arr[y0 + gmny:y0 + gmxy + 1, x0 + gmnx:x0 + gmxx + 1].astype(np.uint8)
        suba = fg[gmny:gmxy + 1, gmnx:gmxx + 1]
        rgba = np.dstack([sub, np.where(suba, 255, 0).astype(np.uint8)])
        Image.fromarray(rgba, 'RGBA').save(os.path.join(outdir, f'{pose}.png'))
        dd.rectangle([x0 + gmnx, y0 + gmny, x0 + gmxx, y0 + gmxy],
                     outline=(220, 60, 60), width=2)
        manifest['poses'][pose] = {
            'w': int(gmxx - gmnx + 1), 'h': int(gmxy - gmny + 1),
            'srcBox': [int(x0 + gmnx), int(y0 + gmny), int(x0 + gmxx), int(y0 + gmxy)],
            'footY': int(y0 + gmxy),
        }
    dbg.save(os.path.join(outdir, '_debug.png'))
    with open(os.path.join(outdir, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f'{name}: ' + ', '.join(
        f'{p}={"ok" if v else "--"}' for p, v in manifest['poses'].items()))
    return manifest


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    extract(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
