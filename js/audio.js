// audio.js — motor chiptune (Web Audio API). Sem arquivos: tudo sintetizado.
let ctx = null, masterGain = null, musicGain = null, sfxGain = null;
let muted = false;

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  masterGain = ctx.createGain(); masterGain.gain.value = 1; masterGain.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(masterGain);
  sfxGain = ctx.createGain(); sfxGain.gain.value = 0.3; sfxGain.connect(masterGain);
}
export function toggleMute() { muted = !muted; if (masterGain) masterGain.gain.value = muted ? 0 : 1; return muted; }
export function isMuted() { return muted; }

// ---------- notas ----------
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function freq(tok) {
  // ex: "C4", "F#3", "Eb5"
  let n = NAMES[tok[0]], i = 1;
  if (tok[i] === '#') { n++; i++; } else if (tok[i] === 'b') { n--; i++; }
  const oct = parseInt(tok.slice(i));
  const midi = 12 * (oct + 1) + n;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ---------- sequenciador ----------
// canal: { wave, vol, seq: "C4 . E4 - ..." } — cada token = 1 semicolcheia
// '.' = pausa, '-' = sustenta a nota anterior, 'x'/'X' = percussão (ruído)
function parseSeq(str) {
  const toks = str.trim().split(/\s+/);
  const events = []; // {t (16ths), dur, f} ou {t, noise}
  let cur = null;
  toks.forEach((tok, i) => {
    if (tok === '-') { if (cur) cur.dur++; }
    else if (tok === '.') { cur = null; }
    else if (tok === 'x' || tok === 'X') { events.push({ t: i, noise: tok === 'X' ? 1 : 0.5 }); cur = null; }
    else { cur = { t: i, dur: 1, f: freq(tok) }; events.push(cur); }
  });
  return { events, len: toks.length };
}

let noiseBuf = null;
function getNoise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function playNote(f, t, dur, wave, vol, dest) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = wave; o.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.02);
}
function playNoise(t, vol, dest, dur = 0.06) {
  const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  s.buffer = getNoise(); f.type = 'highpass'; f.frequency.value = 4000;
  g.gain.setValueAtTime(vol * 0.6, t);
  g.gain.linearRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t); s.stop(t + dur + 0.02);
}

// ---------- músicas ----------
const SONGS = {
  title: {
    bpm: 132, loop: false, ch: [
      { wave: 'square', vol: 0.5, seq: 'C4 . E4 . G4 . C5 - - - A4 . B4 . C5 - - -' },
      { wave: 'triangle', vol: 0.8, seq: 'C3 - - - G2 - - - F2 - - - G2 - C3 - - -' },
    ]
  },
  map: {
    bpm: 108, loop: true, ch: [
      { wave: 'square', vol: 0.45, seq: 'E4 . G4 . A4 - . A4 G4 . E4 . D4 - . . E4 . G4 . A4 - . C5 B4 . G4 . E4 - . .' },
      { wave: 'triangle', vol: 0.85, seq: 'C3 . . C3 . . G2 . A2 . . A2 . . E2 . F2 . . F2 . . C3 . G2 . . G2 . B2 . .' },
      { wave: 'square', vol: 0.12, seq: '. . C5 . . . C5 . . . C5 . . . C5 . . . A4 . . . A4 . . . B4 . . . B4 .' },
    ]
  },
  cad: { // tenso-cômico (fuga da escola)
    bpm: 140, loop: true, ch: [
      { wave: 'square', vol: 0.4, seq: 'A3 . A3 . C4 . A3 . E4 - . C4 A3 . G3 . A3 . A3 . C4 . A3 . F4 - . E4 C4 . D4 .' },
      { wave: 'triangle', vol: 0.85, seq: 'A2 . . . E2 . . . A2 . . . E2 . G2 . F2 . . . C2 . . . E2 . . . E2 . G2 .' },
      { wave: 'square', vol: 0.1, seq: 'x . . x . . x . x . . x . . x . x . . x . . x . x . . x . . X .' },
    ]
  },
  praca: { // ensolarado
    bpm: 126, loop: true, ch: [
      { wave: 'square', vol: 0.42, seq: 'G4 . E4 . C4 . E4 . G4 - A4 - G4 . E4 . F4 . D4 . B3 . D4 . F4 - E4 - D4 . C4 .' },
      { wave: 'triangle', vol: 0.85, seq: 'C3 . G2 . C3 . G2 . C3 . G2 . E3 . C3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . B2 .' },
      { wave: 'square', vol: 0.1, seq: 'x . x . X . x . x . x . X . x . x . x . X . x . x . x . X . x x' },
    ]
  },
  floriano: { // trânsito na hora do rush
    bpm: 158, loop: true, ch: [
      { wave: 'square', vol: 0.4, seq: 'D4 . D4 . F4 . D4 . A4 - . F4 D4 . C4 . D4 . D4 . F4 . G4 . A4 - . C5 A4 . G4 F4' },
      { wave: 'triangle', vol: 0.85, seq: 'D3 . D2 . D3 . D2 . B2 . B1 . B2 . B1 . C3 . C2 . C3 . C2 . A2 . A1 . C3 . E3 .' },
      { wave: 'square', vol: 0.1, seq: 'x . x x . x x . x . x x . x x . x . x x . x x . x . x x . X X X' },
    ]
  },
  clear: {
    bpm: 150, loop: false, ch: [
      { wave: 'square', vol: 0.5, seq: 'C4 . E4 . G4 . C5 . E5 - - - D5 . E5 - - - - -' },
      { wave: 'triangle', vol: 0.8, seq: 'C3 - - - E3 - - - G3 - - - G2 - C3 - - - - -' },
    ]
  },
  death: {
    bpm: 120, loop: false, ch: [
      { wave: 'square', vol: 0.5, seq: 'B3 . B3 . A3 . Ab3 . G3 - - - . . . .' },
      { wave: 'triangle', vol: 0.8, seq: 'G2 - - - F2 - - - G1 - - - . . . .' },
    ]
  },
  gameover: {
    bpm: 90, loop: false, ch: [
      { wave: 'square', vol: 0.5, seq: 'E4 - C4 - A3 - - - Ab3 - - - G3 - - - - - - -' },
      { wave: 'triangle', vol: 0.85, seq: 'A2 - - - F2 - - - E2 - - - E1 - - - - - - -' },
    ]
  },
};

let current = null, timer = null;

export function playSong(name) {
  if (!ctx || current === name && SONGS[name]?.loop) return;
  stopSong();
  const song = SONGS[name];
  if (!song) return;
  current = name;
  const chans = song.ch.map(c => ({ ...c, ...parseSeq(c.seq) }));
  const len = Math.max(...chans.map(c => c.len));
  const step = 60 / song.bpm / 4; // duração da semicolcheia
  let barStart = ctx.currentTime + 0.05;
  const schedule = () => {
    if (current !== name) return;
    while (barStart < ctx.currentTime + 0.35) {
      for (const c of chans) for (const e of c.events) {
        const t = barStart + e.t * step;
        if (e.noise) playNoise(t, c.vol * e.noise, musicGain);
        else playNote(e.f, t, e.dur * step * 0.92, c.wave, c.vol, musicGain);
      }
      barStart += len * step;
      if (!song.loop) { current = null; return; }
    }
  };
  schedule();
  if (song.loop) timer = setInterval(schedule, 120);
}

export function stopSong() {
  current = null;
  if (timer) { clearInterval(timer); timer = null; }
}

// ---------- efeitos ----------
export function sfx(name) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const o = (wave, f0, f1, dur, vol = 0.6) => {
    const os = ctx.createOscillator(), g = ctx.createGain();
    os.type = wave;
    os.frequency.setValueAtTime(f0, t);
    if (f1) os.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    os.connect(g); g.connect(sfxGain);
    os.start(t); os.stop(t + dur + 0.02);
  };
  switch (name) {
    case 'jump': o('square', 260, 660, 0.18, 0.4); break;
    case 'coin': o('square', 1000, 0, 0.05, 0.4); setTimeout(() => { const t2 = ctx.currentTime; const os = ctx.createOscillator(), g = ctx.createGain(); os.type = 'square'; os.frequency.value = 1400; g.gain.setValueAtTime(0.4, t2); g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25); os.connect(g); g.connect(sfxGain); os.start(t2); os.stop(t2 + 0.3); }, 50); break;
    case 'stomp': o('square', 300, 80, 0.12, 0.5); playNoise(t, 0.5, sfxGain, 0.08); break;
    case 'hurt': o('sawtooth', 400, 60, 0.35, 0.5); break;
    case 'splat': playNoise(t, 0.8, sfxGain, 0.15); o('sine', 200, 50, 0.2, 0.4); break;
    case 'powerup': o('square', 400, 800, 0.12, 0.4); setTimeout(() => sfxRaw(800, 1200, 0.15), 100); break;
    case 'life': [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => sfxRaw(f, 0, 0.12), i * 90)); break;
    case 'checkpoint': [659, 880].forEach((f, i) => setTimeout(() => sfxRaw(f, 0, 0.15), i * 100)); break;
    case 'apito': o('square', 2200, 2000, 0.4, 0.35); break; // apito da Liginha
    case 'select': o('square', 880, 0, 0.06, 0.35); break;
    case 'enter': o('square', 440, 880, 0.15, 0.4); break;
    case 'flap': playNoise(t, 0.3, sfxGain, 0.05); break;
    case 'kick': o('triangle', 150, 40, 0.15, 0.7); break;
  }
}
function sfxRaw(f0, f1, dur) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const os = ctx.createOscillator(), g = ctx.createGain();
  os.type = 'square';
  os.frequency.setValueAtTime(f0, t);
  if (f1) os.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  os.connect(g); g.connect(sfxGain);
  os.start(t); os.stop(t + dur + 0.02);
}
