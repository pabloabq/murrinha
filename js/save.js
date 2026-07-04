// save.js — progresso em localStorage
const KEY = 'murrinha-save-v1';

const defaults = () => ({
  cleared: {},        // { cad: true, praca: true, ... }
  fichasTotal: 0,     // fichas acumuladas (coleção)
  bestFichas: {},     // recorde de fichas por fase
});

let data = defaults();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = { ...defaults(), ...JSON.parse(raw) };
} catch (e) { /* localStorage indisponível: joga sem save */ }

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}
export function get() { return data; }
export function markCleared(id, fichas) {
  data.cleared[id] = true;
  data.fichasTotal += fichas;
  if (!data.bestFichas[id] || fichas > data.bestFichas[id]) data.bestFichas[id] = fichas;
  save();
}
export function reset() { data = defaults(); save(); }
