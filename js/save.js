// save.js — progresso em localStorage
const KEY = 'murrinha-save-v1';

const defaults = () => ({
  cleared: {},        // { cad: true, praca: true, ... }
  fichasTotal: 0,     // fichas acumuladas (coleção)
  bestFichas: {},     // recorde de fichas por fase
  tickets: {},        // melhor nº de tickets estudantis por fase (0-3)
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
export function markCleared(id, fichas, tickets = 0) {
  data.cleared[id] = true;
  data.fichasTotal += fichas;
  if (!data.bestFichas[id] || fichas > data.bestFichas[id]) data.bestFichas[id] = fichas;
  if (!data.tickets[id] || tickets > data.tickets[id]) data.tickets[id] = tickets;
  save();
}
export function reset() { data = defaults(); save(); }
