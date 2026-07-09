#!/usr/bin/env python
"""PUPPET da Vanita (calca) — anda por CODIGO, arte 100% dela.
   De UMA pose parada de perfil (vanita_unica_nova.png):
     - corta o corpo (cabeca..quadril) e a perna (coxa + canela+pe)
     - anima 2 ossos (coxa/canela) por IK seguindo uma trajetoria de pe
       (pe vai pra frente no ar, volta pro chao atras) => joelho dobra de verdade
   Saida: char_vanita_walk.png (tira N quadros) + char_vanita_idle.png.
   Tambem gera _preview_puppet.png (quadros grandes) pra conferir no olho."""
import math
import numpy as np
from PIL import Image

SRC = 'art/fichas/vanita_unica_nova.png'
OUTLINE = (28, 20, 16)
STAND = 92          # altura do personagem no jogo (px)
NFR = 8             # quadros do ciclo

# landmarks medidos na pose (coords da imagem original)
HIP_Y = 215
KNEE_Y = 300
FOOT_Y = 378        # centro do tornozelo/base efetiva do osso
LEG_CX = 98         # x central da perna no quadril

# parametros do andar (px, na escala da fonte)
STRIDE = 46         # afastamento frente/tras do pe (total ~2x)
LIFT = 34           # altura que o pe levanta no balanco
BODY_BOB = 6        # sobe/desce do quadril (cosmetico)


def key(im):
    rgb = np.asarray(im.convert('RGB')).astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return ~((g > r + 14) & (g > b + 14) & (g > 80))


def dilate(m, n=1):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]
        d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def crisp_outline(img):
    a = np.asarray(img).astype(np.uint8).copy()
    sil = a[..., 3] >= 128
    ring = dilate(sil, 1) & ~sil
    a[..., 3] = np.where(sil, 255, 0).astype(np.uint8)
    a[ring, 0], a[ring, 1], a[ring, 2] = OUTLINE; a[ring, 3] = 255
    return Image.fromarray(a, 'RGBA')


def erode(m, n=1):
    for _ in range(n):
        e = m.copy()
        e[1:, :] &= m[:-1, :]; e[:-1, :] &= m[1:, :]
        e[:, 1:] &= m[:, :-1]; e[:, :-1] &= m[:, 1:]
        m = e
    return m


im = Image.open(SRC).convert('RGB')
fg = erode(key(im), 1)               # tira o halo verde da borda
arr = np.asarray(im).astype('uint8')
rgba = np.dstack([arr, np.where(fg, 255, 0).astype('uint8')])

# ---- recorta as 3 pecas (com folga vertical p/ nao cortar contorno) ----
def piece(y0, y1):
    """recorta linhas [y0,y1) mantendo so onde ha alpha; devolve (img, off_x, off_y)."""
    sub = rgba[y0:y1].copy()
    m = sub[..., 3] >= 128
    xs = np.nonzero(m.any(0))[0]
    if len(xs) == 0:
        return None
    x0, x1 = xs.min(), xs.max() + 1
    return Image.fromarray(sub[:, x0:x1], 'RGBA'), x0, y0

PAD = 3
body_img, body_ox, body_oy = piece(0, HIP_Y + PAD)
thigh_img, thigh_ox, thigh_oy = piece(HIP_Y - PAD, KNEE_Y + PAD)
shin_img, shin_ox, shin_oy = piece(KNEE_Y - PAD, FOOT_Y + 40)   # inclui o pe

# pivots dentro de cada peca (relativo ao canto sup-esq da peca)
hip_in_body = (LEG_CX - body_ox, HIP_Y - body_oy)
hip_in_thigh = (LEG_CX - thigh_ox, HIP_Y - thigh_oy)
knee_in_thigh = (LEG_CX - thigh_ox, KNEE_Y - thigh_oy)
knee_in_shin = (LEG_CX - shin_ox, KNEE_Y - shin_oy)

L_thigh = KNEE_Y - HIP_Y
L_shin = FOOT_Y - KNEE_Y


def darken(img, f=0.62):
    a = np.asarray(img).astype(np.float32).copy()
    a[..., :3] *= f
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def _map(pt, w, h, W, H, deg):
    """onde o ponto pt (na img wxh) vai parar apos rotate(-deg,expand) -> img WxH."""
    a = math.radians(deg)
    vx = pt[0] - w / 2.0
    vy = pt[1] - h / 2.0
    nx = vx * math.cos(a) - vy * math.sin(a)     # horario, y p/ baixo
    ny = vx * math.sin(a) + vy * math.cos(a)
    return (nx + W / 2.0, ny + H / 2.0)


def rotexp(img, deg):
    return img.rotate(-deg, resample=Image.BICUBIC, expand=True)   # PIL: + = anti-horario


def ik_angles(fx, fy):
    """hip na origem (0,0), pe em (fx,fy) (y p/ baixo). devolve (ang_coxa, ang_canela)
       em GRAUS de desvio do 'para baixo' (0 = reto p/ baixo, + = frente/horario)."""
    d = math.hypot(fx, fy)
    d = min(d, L_thigh + L_shin - 0.5)
    d = max(d, abs(L_thigh - L_shin) + 0.5)
    # angulo do vetor hip->pe medido a partir do eixo 'para baixo' (y+)
    base = math.degrees(math.atan2(fx, fy))
    # lei dos cossenos
    a1 = math.degrees(math.acos((d*d + L_thigh*L_thigh - L_shin*L_shin) / (2*d*L_thigh)))
    thigh_ang = base - a1               # joelho aponta pra tras (dobra natural)
    a2 = math.degrees(math.acos((L_thigh*L_thigh + L_shin*L_shin - d*d) / (2*L_thigh*L_shin)))
    shin_ang = thigh_ang + (180 - a2)
    return thigh_ang, shin_ang


def foot_path(u):
    """u em [0,1). trajetoria do pe relativa ao quadril. y+ p/ baixo.
       stance (0..0.5): pe no chao, vai de frente(+) p/ tras(-).
       swing (0.5..1): pe levanta e volta pra frente."""
    ground = L_thigh + L_shin - 2      # extensao quase total = pe no chao
    if u < 0.5:
        t = u / 0.5
        fx = STRIDE/2 * (1 - 2*t)       # +stride/2 -> -stride/2
        fy = ground
    else:
        t = (u - 0.5) / 0.5
        fx = STRIDE/2 * (2*t - 1)       # -stride/2 -> +stride/2
        fy = ground - LIFT * math.sin(math.pi * t)
    return fx, fy


def build_leg(u, check=False):
    """monta a perna (coxa+canela) numa fase u; devolve img grande + pos do quadril nela.
       Encaixa joelho-com-joelho: coxa gira no quadril, canela gira no joelho e e
       colada exatamente na ponta da coxa."""
    fx, fy = foot_path(u)
    th, sh = ik_angles(fx, fy)
    # coxa: gira 'th' em torno do quadril
    tw, thh = thigh_img.size
    thigh_rot = rotexp(thigh_img, th); TW, TH = thigh_rot.size
    hipT = _map(hip_in_thigh, tw, thh, TW, TH, th)
    kneeT = _map(knee_in_thigh, tw, thh, TW, TH, th)
    # canela: gira 'sh' em torno do joelho
    sw, shh = shin_img.size
    shin_rot = rotexp(shin_img, sh); SW, SH = shin_rot.size
    kneeS = _map(knee_in_shin, sw, shh, SW, SH, sh)
    # monta
    W = H = 360
    leg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hipX, hipY = W // 2, 60
    leg.alpha_composite(thigh_rot, (round(hipX - hipT[0]), round(hipY - hipT[1])))
    kneeX = hipX + (kneeT[0] - hipT[0]); kneeY = hipY + (kneeT[1] - hipT[1])
    leg.alpha_composite(shin_rot, (round(kneeX - kneeS[0]), round(kneeY - kneeS[1])))
    if check:
        print(f'  u={u:.2f} th={th:.0f} sh={sh:.0f} joelho coxa=({kneeX:.0f},{kneeY:.0f})')
    return leg, (hipX, hipY)


def compose_frame(p):
    """p em [0,1). devolve quadro RGBA (escala fonte)."""
    W = H = 380
    canv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # ancora do quadril no canvas (alta o bastante p/ caber a cabeca acima)
    ax, ay = 150, 210
    bob = int(BODY_BOB * (0.5 - 0.5*math.cos(4*math.pi*p)))   # desce nos contatos
    # perna de tras (fase +0.5), escurecida
    far, far_hip = build_leg((p + 0.5) % 1.0)
    far = darken(far)
    canv.alpha_composite(far, (ax - far_hip[0], ay - far_hip[1] + bob))
    # corpo
    canv.alpha_composite(body_img, (ax - hip_in_body[0], ay - hip_in_body[1] + bob))
    # perna da frente
    near, near_hip = build_leg(p)
    canv.alpha_composite(near, (ax - near_hip[0], ay - near_hip[1] + bob))
    return canv, ax, ay      # canvas inteiro (nao cortado) + ancora do quadril


import sys
if '--debug' in sys.argv:
    from PIL import ImageDraw
    W = H = 380; ax, ay = 150, 120
    canv = Image.new('RGBA', (W, H), (40, 40, 46, 255))
    far, far_hip = build_leg(0.5); far = darken(far)
    canv.alpha_composite(far, (ax - far_hip[0], ay - far_hip[1]))
    canv.alpha_composite(body_img, (ax - hip_in_body[0], ay - hip_in_body[1]))
    near, near_hip = build_leg(0.0)
    canv.alpha_composite(near, (ax - near_hip[0], ay - near_hip[1]))
    d = ImageDraw.Draw(canv)
    d.ellipse([ax-4, ay-4, ax+4, ay+4], fill=(255, 0, 0, 255))          # ancora quadril
    # onde termina o corpo (ultimo pixel opaco do body):
    bm = np.asarray(body_img)[..., 3] >= 128
    by = np.nonzero(bm.any(1))[0].max()
    wy = ay - hip_in_body[1] + by
    d.line([0, wy, W, wy], fill=(0, 255, 255, 255))                     # base do corpo
    canv.save('tools/_dbg.png'); print('dbg base corpo y=', wy, 'ancora ay=', ay)
    sys.exit()

# ---- renderiza os N quadros no MESMO sistema de coords (quadril fixo em AX) ----
raw = [compose_frame(i / NFR) for i in range(NFR)]
AX = raw[0][1]                       # x do quadril (fixo em todos)
canvs = [c for c, ax, ay in raw]
# bbox global (uniao) -> mesma janela p/ todos => zero tremor
gxmin = gxmax = gymin = gymax = None
for c in canvs:
    m = np.asarray(c)[..., 3] >= 40
    ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
    a, b, u, v = xs.min(), xs.max(), ys.min(), ys.max()
    gxmin = a if gxmin is None else min(gxmin, a)
    gxmax = b if gxmax is None else max(gxmax, b)
    gymin = u if gymin is None else min(gymin, u)
    gymax = v if gymax is None else max(gymax, v)
GROUND = gymax + 1                    # base (pe) comum
half = max(AX - gxmin, gxmax - AX) + 2  # celula simetrica em torno do quadril
top = gymin - 1

# ---- preview grande (fundo claro) ----
PW = 2 * half + 8; PH = GROUND - top + 8
prev = Image.new('RGBA', (PW * NFR, PH), (150, 165, 175, 255))
for i, c in enumerate(canvs):
    prev.alpha_composite(c, (PW * i + (half + 4) - AX, 4 - top))
prev.save('tools/_preview_puppet.png')
print('preview:', prev.size)


# ---- fator de escala: casa com a idle (mesma fonte) => walk e idle mesmo tamanho ----
def content_h(imgpath):
    im = Image.open(imgpath).convert('RGB'); f = key(im)
    ys = np.nonzero(f.any(1))[0]; return ys.max() - ys.min() + 1

idle_h = content_h(SRC)
factor = STAND / idle_h              # idle vira STAND px de altura; walk usa o mesmo fator


def to_cell(canv):
    """recorta a janela comum (quadril centrado, pe no fundo) e escala."""
    cw = 2 * half
    cell = Image.new('RGBA', (cw, GROUND - top), (0, 0, 0, 0))
    cell.alpha_composite(canv, (half - AX, -top))
    nw = max(1, round(cw * factor)); nh = max(1, round((GROUND - top) * factor))
    return crisp_outline(cell.resize((nw, nh), Image.LANCZOS))


cells = [to_cell(c) for c in canvs]
CW = max(c.width for c in cells); CH = max(c.height for c in cells)
strip = Image.new('RGBA', (CW * NFR, CH), (0, 0, 0, 0))
for i, c in enumerate(cells):
    strip.alpha_composite(c, (CW * i + (CW - c.width) // 2, CH - c.height))
strip.save('art/char_vanita_walk.png')
print('walk:', strip.size, NFR, 'quadros, cw=', CW)


# ---- idle e apito (poses unicas, mesmo fator/tamanho) ----
def save_single(src_path, out, fac):
    im = Image.open(src_path).convert('RGB'); f = key(im)
    arr = np.asarray(im).astype('uint8')
    rgba = np.dstack([arr, np.where(f, 255, 0).astype('uint8')])
    ys = np.nonzero(f.any(1))[0]; xs = np.nonzero(f.any(0))[0]
    crop = Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')
    nw = max(1, round(crop.width * fac)); nh = max(1, round(crop.height * fac))
    im2 = crisp_outline(crop.resize((nw, nh), Image.LANCZOS))
    fc = foot_center(im2); hw = max(fc, im2.width - fc); cw = int(2 * hw) + 4
    c = Image.new('RGBA', (cw, im2.height + 2), (0, 0, 0, 0))
    c.alpha_composite(im2, (round(cw / 2 - fc), 1)); c.save(out); print(out, c.size)


def foot_center(img):
    a = np.asarray(img); al = a[..., 3] >= 128
    band = al[int(img.height * 0.9):, :]
    xs = np.nonzero(band.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else img.width / 2


APITO = 'art/fichas/vanita_unica_apito_nova.png'
save_single(SRC, 'art/char_vanita_idle.png', factor)
save_single(APITO, 'art/char_vanita_whistle.png', STAND / content_h(APITO))
print('OK factor=%.3f idle_h=%d' % (factor, idle_h))
