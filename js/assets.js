// assets.js — carrega imagens de cenário (fundos gerados) e as mantém em cache
const cache = {};

export function load(paths) {
  for (const p of paths) {
    if (cache[p]) continue;
    const im = new Image();
    im.src = p;
    cache[p] = im;
  }
}

// retorna a imagem se já estiver pronta, senão null (o jogo cai no fundo em código)
export function get(p) {
  const im = cache[p];
  return (im && im.complete && im.naturalWidth) ? im : null;
}
