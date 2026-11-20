/* টেসলা মামা: সিট ধরে রাখো! — Natun Bazar → UIU
   Plain canvas game, no build step. */
(() => {
'use strict';
const L = window.LINES;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const W = 960, H = 540;
let K = 1; // backing-store scale (sharp on any screen / devicePixelRatio)
function resize() {
  let w = W; try { w = cv.getBoundingClientRect().width || W; } catch (e) { /* ignore */ }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.max(320, Math.round(w * dpr)); cv.height = Math.round(cv.width * H / W); K = cv.width / W;
}
resize();

const PPM = 40;          // pixels per metre
const GY = 492;          // ground line for vehicles
const SIDEY = 384;       // sidewalk top (building bases)
const SEG = 330;         // metres per stage
const FONT = '"Hind Siliguri","Noto Sans Bengali",sans-serif';

const STAGES = [
  { bn: 'নতুন বাজার',          short: 'নতুনবাজার', en: 'Natun Bazar',  sky: ['#ffb36b', '#ffe6a8'], rough: 1.0, puddle: .15 },
  { bn: 'ফ্যামিলি বাজার',      short: 'ফ্যামিলি',  en: 'Family Bazar', sky: ['#7ec8ff', '#dff4ff'], rough: 1.1, puddle: .20 },
  { bn: 'সাঈদ নগর',           short: 'সাঈদ নগর', en: 'Sayed Nagar',   sky: ['#59b8ff', '#c8efff'], rough: 1.5, puddle: .45 },
  { bn: 'দশতলা',              short: 'দশতলা',    en: '10 Tola',      sky: ['#4aa8ff', '#bfe9ff'], rough: 1.4, puddle: .30 },
  { bn: 'বিটুমিন গেট',         short: 'বিটুমিন',  en: 'Bitumen Gate', sky: ['#6cb4ff', '#ffeec2'], rough: 1.3, puddle: .25 },
  { bn: 'শেষ টেবিল (ইউ-টার্ন)', short: 'ইউ-টার্ন',  en: 'U-turn',       sky: ['#ff9a62', '#ffd9a0'], rough: 1.2, puddle: .20 },
  { bn: 'মসজিদ আল মুস্তাফা',    short: 'মসজিদ',    en: 'Al Mustafa',   sky: ['#c77dff', '#ffc2d6'], rough: 1.1, puddle: .15 },
  { bn: 'ইউআইইউ',             short: 'UIU',      en: 'UIU',          sky: ['#ff7aa2', '#ffd27a'], rough: .6,  puddle: .05 }
];
STAGES.forEach((s, i) => s.at = i * SEG);
const FINISH = 7 * SEG + 140;
const LM = STAGES.map((s, i) => i < 7 ? i * SEG + 140 : FINISH + 8); // landmark centres (m)
const UTURN_AT = 5 * SEG + 150;
const UTURN_DUR = 3.2;
// fair fare ranges in taka: [low, high]. Edit freely.
const BOARDINGS = [
  { id: 'natun',  bn: 'নতুন বাজার',     at: 0,                 dry: [50, 50], rain: [50, 70] },
  { id: 'family', bn: 'ফ্যামিলি বাজার', at: 1 * SEG + 140 - 70, dry: [40, 40], rain: [40, 60] },
  { id: 'sayed',  bn: 'সাঈদ নগর',       at: 2 * SEG + 140 - 70, dry: [30, 40], rain: [40, 50] },
  { id: 'tola',   bn: 'দশতলা',          at: 3 * SEG + 140 - 70, dry: [30, 30], rain: [30, 40] }
];

/* ---------- helpers ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const mod = (a, n) => ((a % n) + n) % n;
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`; }
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function txt(s, x, y, size, color, align, weight, stroke) {
  ctx.font = `${weight || 600} ${size}px ${FONT}`;
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  if (stroke) { ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size, weight) {
  ctx.font = `${weight || 600} ${size}px ${FONT}`;
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function wrapText(s, x, y, maxW, size, lh, color, align, weight) {
  const ls = wrap(s, maxW, size, weight);
  ls.forEach((l, i) => txt(l, x, y + i * lh, size, color, align || 'center', weight));
  return ls.length * lh;
}
const $ = id => document.getElementById(id);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
};

const A = window.ART({ ctx, rr, txt, hash, mod, time: () => (S ? S.t : 0) });
const isTouch = () => (window.matchMedia && matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window);

/* ---------- audio (synthesised; nothing downloaded) ---------- */
const settings = { voice: true, mute: false, subs: true, abuse: true };
let AC = null, eng = null, engG = null;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    eng = AC.createOscillator(); eng.type = 'sawtooth';
    engG = AC.createGain(); engG.gain.value = 0;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    eng.connect(f); f.connect(engG); engG.connect(AC.destination); eng.start();
  } catch (e) { AC = null; }
}
function tone(f, d, type, v, delay) {
  if (!AC || settings.mute) return;
  const t = AC.currentTime + (delay || 0);
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(v || .1, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02);
}
function noise(d, v, freq, type) {
  if (!AC || settings.mute) return;
  const n = Math.floor(AC.sampleRate * d), buf = AC.createBuffer(1, n, AC.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = AC.createBufferSource(); s.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq || 600;
  const g = AC.createGain(); g.gain.value = v || .3;
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
}
const sfx = {
  horn() { tone(392, .3, 'square', .09); tone(494, .3, 'square', .07); },
  thud() { noise(.28, .6, 300); tone(80, .22, 'sine', .3); },
  bump() { noise(.12, .4, 500); tone(110, .12, 'sine', .22); },
  splash() { noise(.35, .25, 1800, 'bandpass'); },
  squeal() { noise(.6, .12, 3000, 'highpass'); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .28, 'triangle', .14, i * .13)); },
  die() { [300, 250, 200, 140].forEach((f, i) => tone(f, .45, 'sawtooth', .09, i * .28)); },
  grip() { tone(220, .05, 'square', .04); }
};
let bnVoices = [], subsTouched = false, speaking = 0, lastSpoke = {}, lastAny = -99;
const MALE_RE = /pradeep|bashkar|male|man\b|ahnaf|tanvir|rafi/i;
const FEMALE_RE = /nabanita|tanishaa|female|woman|ananya|google|aria|jenny/i;
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  bnVoices = speechSynthesis.getVoices().filter(v => /^bn/i.test(v.lang)).sort((a, b) => a.name.localeCompare(b.name));
  const el = $('voiceNote');
  if (el) el.textContent = bnVoices.length ? `🔊 ${bnVoices.length}টি বাংলা ভয়েস পাওয়া গেছে — ছেলে/মেয়ে ভেদে ভয়েস বদলাবে।`
    : '🔇 এই ডিভাইসে বাংলা ভয়েস নেই — লেখা (সাবটাইটেল) দেখানো হবে।';
  if (!subsTouched && $('subsChk')) { $('subsChk').checked = !bnVoices.length; settings.subs = !bnVoices.length; }
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function voiceFor(g) {
  if (!bnVoices.length) return null;
  const want = g === 'f' ? FEMALE_RE : MALE_RE, other = g === 'f' ? MALE_RE : FEMALE_RE;
  return bnVoices.find(v => want.test(v.name) && !other.test(v.name)) || bnVoices.find(v => want.test(v.name)) || bnVoices[g === 'f' ? bnVoices.length - 1 : 0];
}
// fixed profile per character; the student follows the gender chosen in the menu
const VP = {
  driver: { g: 'm', p: .72, r: .98 }, car: { g: 'm', p: .62, r: 1 }, bus: { g: 'm', p: .5, r: .9 }, rick: { g: 'm', p: .85, r: 1 },
  cng: { g: 'm', p: .8, r: 1.05 }, crowd: { g: 'm', p: .6, r: 1.12 }, ped: { g: 'f', p: 1.2, r: 1.05 }, hawker: { g: 'm', p: .95, r: 1.15 },
  tea: { g: 'm', p: .9, r: 1.05 }, chop: { g: 'm', p: .78, r: 1.1 }
};
function profOf(key) {
  if (key === 'player') return FARE.gender === 'f' ? { g: 'f', p: 1.12, r: 1.04 } : { g: 'm', p: .98, r: 1.06 };
  return VP[key] || VP.driver;
}
function voiceKey(who, ref) {
  if (who === 'other') return (ref && ref.type) || 'car';
  if (who === 'amb') return (ref && ref.key) || 'hawker';
  return who;
}
const nowS = () => performance.now() / 1000;
// the street is not a radio: characters speak only now and then (student rarest)
function canSpeak(key) {
  const gap = key === 'player' ? 16 : key === 'driver' ? 10 : 7, n = nowS();
  return n - (lastSpoke[key] === undefined ? -99 : lastSpoke[key]) > gap && n - lastAny > 3.2;
}
// optional pre-recorded voice pack (audio/manifest.json, built by tools/gen_voices.py from a realistic Bangla TTS)
const PACK = { map: {} };
if (typeof fetch === 'function') fetch('audio/manifest.json').then(r => r.ok ? r.json() : {}).then(m => { PACK.map = m || {}; }).catch(() => {});
function fnv(str) {
  const b = new TextEncoder().encode(str); let h = 0x811c9dc5;
  for (const x of b) { h ^= x; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
const packKey = key => key === 'player' ? 'player_' + FARE.gender : key;
function playPack(text, key, cb) {
  if (typeof Audio === 'undefined' || typeof TextEncoder === 'undefined') return false;
  const f = PACK.map[fnv(packKey(key) + '|' + text)]; if (!f) return false;
  try {
    if (PACK.cur) PACK.cur.pause();
    const a = new Audio('audio/' + f); PACK.cur = a; a.onended = a.onerror = () => { if (cb) cb(); };
    const pr = a.play(); if (pr && pr.catch) pr.catch(() => { if (cb) cb(); });
    return true;
  } catch (e) { return false; }
}
function speak(text, key, force, cb) {
  if (!settings.voice || settings.mute) return false;
  if (!force && (speaking >= 2 || !canSpeak(key))) return false;
  if (playPack(text, key, cb)) { lastSpoke[key] = lastAny = nowS(); return true; }
  if (!bnVoices.length || !('speechSynthesis' in window)) return false;
  const prof = profOf(key), v = voiceFor(prof.g);
  const u = new SpeechSynthesisUtterance(text);
  u.voice = v; u.lang = v.lang; u.pitch = prof.p; u.rate = prof.r;
  if (force) { speechSynthesis.cancel(); speaking = 0; }
  lastSpoke[key] = lastAny = nowS();
  speaking++; u.onend = u.onerror = () => { speaking = Math.max(0, speaking - 1); if (cb) cb(); };
  speechSynthesis.speak(u);
  return true;
}

/* ---------- state ---------- */
let S = null;
const inp = { grip: false, left: false, right: false, slow: false };
// control modes: manual (buttons/keys), tilt (phone sensors), auto (game balances for you; you only grip/brake)
const CTRL = { mode: 'manual', invert: false, lean: 0, pitch: 0, base: null, live: false, ok: false };
function screenAngle() { return (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (typeof window.orientation === 'number' ? window.orientation : 0); }
function onTilt(e) {
  if (e.beta == null && e.gamma == null) return;
  const a = screenAngle(), b = e.beta || 0, g = e.gamma || 0;
  let side, fwd; // side = roll about screen's vertical axis, fwd = tip top edge toward you
  if (a === 90) { side = -b; fwd = g; } else if (a === 270 || a === -90) { side = b; fwd = -g; } else if (a === 180) { side = -g; fwd = -b; } else { side = g; fwd = b; }
  if (!CTRL.base) CTRL.base = { side, fwd };
  CTRL.ok = true;
  CTRL.lean = clamp((side - CTRL.base.side) / 18, -1, 1) * (CTRL.invert ? -1 : 1);
  CTRL.pitch = clamp((fwd - CTRL.base.fwd) / 18, -1, 1);
}
function calibrateTilt() { CTRL.base = null; }
function enableTilt() {
  if (CTRL.live || typeof window.addEventListener !== 'function') return;
  const go = () => { window.addEventListener('deviceorientation', onTilt); CTRL.live = true; };
  const DO = window.DeviceOrientationEvent;
  if (DO && typeof DO.requestPermission === 'function') DO.requestPermission().then(r => { if (r === 'granted') go(); }).catch(() => {});
  else if (DO) go();
}
function ctrlLean() { // -1..1
  const kb = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  return CTRL.mode === 'tilt' && CTRL.ok ? clamp(kb + CTRL.lean, -1, 1) : kb;
}
const VT = {
  car: { len: 4.4, v: [6, 9] },
  bus: { len: 9, v: [5, 7.5] },
  rick: { len: 3.2, v: [3, 4.2] },
  cng: { len: 3.2, v: [6, 8] }
};
const VCOL = ['#ef4444', '#3b82f6', '#a855f7', '#f97316', '#14b8a6', '#eab308', '#ec4899', '#22c55e'];

function newState() {
  return {
    mode: 'menu', t: 0, clock: 0, dist: 0, speed: 0, life: 100, stamina: 100,
    gripping: false, gripLocked: false, a: 0, va: 0, score: 0, honks: 0, falls: 0, hits: 0, goodGrips: 0,
    objs: [], vehs: [], parts: [], bubbles: [], pend: [], banner: null,
    shake: 0, bobY: 0, bobV: 0, tilt: 0, turnSx: 1, face: 1, dir: 1, camX: 300,
    nextRoadX: 30, nextVehX: 75, honkCool: 0, warnCool: 0, recover: 0, idleT: 4, nearT: 0,
    stageIdx: 0, uturn: { state: 0, t: 0, sign: 1, flipped: false }, flash: 0, flashCol: '#fff',
    wheel: 0, rain: false, deal: null, mood: 'ok', peds: [], mob: null, onc: [], wrong: null, nextPedX: 60, nextOncT: 1, amb: {}, stopT: 0, jams: {}, jamDone: {}, deathT: 0, cause: '', name: '', hint: 9, confetti: []
  };
}

function say(who, text, opts) {
  opts = opts || {};
  const b0 = { who, text, t: 0, life: opts.life || 2.8, ref: opts.ref || null, silent: false };
  S.bubbles.push(b0);
  if (S.bubbles.length > 5) S.bubbles.shift();
  if (opts.speak !== false && !speak(text, voiceKey(who, opts.ref), opts.force)) b0.silent = true;
}
function later(t, fn) { S.pend.push({ t, fn }); }
function jolt(mag, sign) {
  sign = sign || (Math.random() < .5 ? -1 : 1);
  S.va += sign * mag * .55 * (S.gripping ? .32 : 1);
  S.bobV -= 60 * Math.min(1.5, mag);
  S.shake = Math.max(S.shake, Math.min(8, mag * 3));
}
function inSafeZone(x) { return (x > UTURN_AT - 25 && x < UTURN_AT + 45) || x > FINISH - 15; }
function stageOf(x) { return Math.min(7, Math.max(0, Math.floor(x / SEG))); }

function spawnRoad(x) {
  if (inSafeZone(x)) return;
  const st = STAGES[stageOf(x)], r = Math.random();
  let type = 'pothole', w = rand(1.6, 3);
  const pu = st.puddle + (S.rain ? .25 : 0);
  if (r < pu) { type = 'puddle'; w = rand(4, 7); }
  else if (r < pu + .22) { type = 'breaker'; w = 1.6; }
  S.objs.push({ type, x, w, done: false });
}
function spawnVeh(x) {
  if (inSafeZone(x)) return;
  const type = pick(['car', 'car', 'bus', 'rick', 'rick', 'cng']), d = VT[type];
  const v0 = (type === 'rick' && Math.random() < .35) ? .4 : rand(d.v[0], d.v[1]); // some rickshaws wait at the corner
  S.vehs.push({
    type, x, len: d.len, v: v0, stopped: v0 < 1, wrongSide: Math.random() < .15, hit: false, leaving: false, yoff: 0, tail: 0,
    exit: S.clock + rand(7, 11), col: pick(VCOL), seed: Math.random() * 100
  });
}

/* ---------- game flow ---------- */
function startGame() { // menu -> haggle screen
  audioInit();
  FARE.name = ($('nameInput').value || '').trim() || 'বন্ধু';
  store.set('tm_name', FARE.name);
  settings.voice = $('voiceChk').checked; settings.subs = $('subsChk').checked; subsTouched = true; settings.abuse = $('abuseChk').checked;
  FARE.weather = $('weatherSel').value;
  CTRL.invert = $('invChk').checked; store.set('tm_inv', CTRL.invert ? '1' : '0');
  if (CTRL.mode === 'tilt') enableTilt();
  calibrateTilt();
  goFullscreen();
  if (!store.get('tm_tut')) showTutorial(openFare); else openFare();
}
function beginRide() { // haggle done -> ride
  calibrateTilt(); document.body.classList.toggle('tiltmode', CTRL.mode === 'tilt');
  const deal = FARE.deal; if (!deal) return;
  audioInit();
  S = newState(); S.mode = 'play'; S.name = FARE.name; S.deal = deal; S.rain = deal.rain; S.mood = deal.mood;
  S.gender = FARE.gender;
  S.dist = deal.at; S.stageIdx = stageOf(deal.at); S.nextRoadX = S.dist + 30; S.nextVehX = S.dist + 75; S.nextPedX = S.dist + 60;
  S.jams = { 2: Math.random() < .5, 4: Math.random() < .55 };
  S.score = deal.skip ? 0 : Math.max(0, deal.ask0 - deal.paid) * 3 - Math.max(0, deal.paid - deal.hi) * 2;
  $('fare').classList.add('hidden'); $('menu').classList.add('hidden'); $('end').classList.add('hidden');
  document.body.classList.add('playing'); document.body.classList.remove('ended'); layout();
  say('driver', pick(L.start), { speak: true, force: true });
  if (S.mood === 'angry') later(2.4, () => say('driver', pick(L.moodAngry), { speak: true }));
  if (S.mood === 'happy') later(2.4, () => say('driver', pick(L.moodHappy), { speak: true }));
  later(1.2, () => say('player', pick(L.playerIdle), { speak: true }));
  S.banner = { text: STAGES[S.stageIdx].bn, sub: 'যাত্রা শুরু!' + (S.rain ? ' ☔' : ''), t: 0 };
}
function toMenu() {
  S = newState(); document.body.classList.remove('playing', 'ended'); $('end').classList.add('hidden'); $('fare').classList.add('hidden'); $('menu').classList.remove('hidden');
  const b = store.get('tm_best'); $('bestNote').textContent = b ? 'সর্বোচ্চ স্কোর: ' + b : '';
}
function die(cause) {
  if (S.mode !== 'play') return;
  S.mode = 'dying'; S.deathT = 0; S.cause = cause; S.deathStage = S.stageIdx;
  S.flash = 1; S.flashCol = '#ef4444'; sfx.die();
  say('player', pick(L.dying), { speak: true, force: true, life: 2.8 });
  later(1.1, () => say('driver', pick(L.dyingDriver), { speak: true, force: true, life: 1.8 }));
}
function win() {
  if (S.mode !== 'play') return;
  S.mode = 'win'; S.deathT = 0; sfx.win();
  const bonus = Math.round(S.life * 8 + S.stamina * 2 - S.honks * 5);
  S.score += Math.max(0, bonus);
  say('driver', pick(L.win), { speak: true, force: true, life: 4 });
  for (let i = 0; i < 120; i++) S.confetti.push({ x: rand(0, W), y: rand(-200, 0), vy: rand(60, 180), vx: rand(-30, 30), c: pick(VCOL), r: rand(3, 6) });
  finishUi(true);
}
function finishUi(won) {
  const best = Math.max(+store.get('tm_best') || 0, Math.round(S.score));
  store.set('tm_best', String(best));
  const rows = [
    ['পয়েন্ট', Math.round(S.score)], ['সর্বোচ্চ স্কোর', best],
    ['দূরত্ব', Math.round(S.dist) + ' মি'], ['পড়ে যাওয়ার উপক্রম', S.falls],
    ['গুঁতা', S.hits], ['হর্ন', S.honks], ['নিখুঁত গ্রিপ', S.goodGrips],
    ['ভাড়া', S.deal ? '৳' + S.deal.paid + ' (ন্যায্য ৳' + fairTxt(S.deal) + ')' : '-']
  ];
  $('endTitle').textContent = won
    ? `🎓 ${S.name}, ইউআইইউতে পৌঁছে গেছ!` : `💀 ${S.name} আর নেই…`;
  let rating = '';
  if (won) rating = S.score > 6500 ? 'রেটিং: ⭐⭐⭐ টেসলা-মাস্টার!' : S.score > 4500 ? 'রেটিং: ⭐⭐ পাকা যাত্রী' : 'রেটিং: ⭐ কোনোমতে টিকে গেছ';
  $('endBody').innerHTML = '<table>' + rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</table>' +
    (rating ? `<p>${rating}</p>` : `<p>মৃত্যুস্থান: ${placeOf(S.deathStage)}</p>`);
  $('end').classList.remove('hidden');
  document.body.classList.remove('playing'); document.body.classList.add('ended');
}
function placeOf(i) { return i === 5 ? 'শেষ টেবিলের ইউ-টার্ন' : STAGES[i].bn + ' এলাকা'; }

/* ---------- update ---------- */
function update(dt) {
  S.t += dt; S.clock += dt; S.hint -= dt;
  const prog = clamp(S.dist / FINISH, 0, 1);
  if (S.life < 25 && !S.lowWarned) { S.lowWarned = true; say('player', pick(L.dyingWarn), { speak: true, force: true, life: 2.2 }); }
  S.honkCool -= dt; S.warnCool -= dt; S.recover -= dt; S.nearT -= dt;

  // delayed callbacks
  for (let i = S.pend.length - 1; i >= 0; i--) { S.pend[i].t -= dt; if (S.pend[i].t <= 0) { const f = S.pend[i].fn; S.pend.splice(i, 1); f(); } }

  // speed
  const cruise = 11.5 + 4.5 * prog + (S.mood === 'angry' ? 2.5 : S.mood === 'happy' ? -1.5 : 0);
  const slowOn = inp.slow || (CTRL.mode === 'tilt' && CTRL.ok && CTRL.pitch < -.55);
  let target = slowOn ? 5.5 : cruise;
  if (S.uturn.state === 1) target = 6;
  if (S.recover > 0) target = Math.min(target, 7);
  if (S.stopT > 0) target = 0;
  const acc = target > S.speed ? 5 : 16;
  S.speed += clamp(target - S.speed, -acc * dt, acc * dt);
  S.dist += S.speed * dt;
  S.wheel += S.speed * dt * PPM / 19;
  S.score += S.speed * dt * 1.6;

  // stage change
  const si = stageOf(S.dist);
  if (si !== S.stageIdx) {
    S.stageIdx = si;
    S.banner = { text: STAGES[si].bn, sub: STAGES[si].en, t: 0 };
    say('driver', L.stage[si], { speak: true, force: true });
    S.score += 50;
  }

  // U-turn
  const u = S.uturn;
  if (u.state === 0 && S.dist >= UTURN_AT) {
    u.state = 1; u.t = 0; u.sign = Math.random() < .5 ? -1 : 1; S.vehs = [];
    sfx.squeal(); say('driver', pick(L.uturn), { speak: true, force: true });
    S.banner = { text: '↩ ইউ-টার্ন!', sub: 'ধরো শক্ত করে!', t: 0 };
  }
  if (u.state === 1) {
    u.t += dt; const p = clamp(u.t / UTURN_DUR, 0, 1);
    S.turnSx = Math.max(.08, Math.abs(Math.cos(Math.PI * p)));
    S.face = p < .5 ? 1 : -1;
    if (p >= .5 && !u.flipped) { u.flipped = true; S.dir = -1; S.camX = 660; S.flash = 1; S.flashCol = '#fff'; }
    if (p >= 1) { u.state = 2; S.turnSx = 1; S.face = -1; S.score += 100; }
  }

  // grip & stamina
  const gripOn = (inp.grip || (CTRL.mode === 'tilt' && CTRL.ok && CTRL.pitch > .55) || (CTRL.mode === 'auto' && Math.abs(S.a) > .55));
  if (gripOn && !S.gripLocked && S.stamina > 0) {
    if (!S.gripping) sfx.grip();
    S.gripping = true; S.stamina -= 13 * dt;
    if (S.stamina <= 0) { S.stamina = 0; S.gripLocked = true; S.gripping = false; say('player', 'হাত অবশ হয়ে গেল!', { life: 1.6 }); }
  } else {
    S.gripping = false;
    S.stamina = Math.min(100, S.stamina + (gripOn ? 6 : 18) * dt);
    if (S.gripLocked && S.stamina >= 30) S.gripLocked = false;
  }

  // balance physics
  const lean = ctrlLean();
  const rough = STAGES[S.stageIdx].rough * (S.rain ? 1.12 : 1);
  let ac = .15 * S.a + lean * (S.gripping ? 3 : 5.4);
  ac += (Math.random() - .5) * .3 * rough * (S.speed / 15) * 4;
  if (CTRL.mode === 'auto') ac -= S.a * 4.2 + S.va * .8;
  if (S.gripping) ac -= S.a * 5;
  if (u.state === 1) ac += u.sign * 3.8 * Math.sin(Math.PI * clamp(u.t / UTURN_DUR, 0, 1));
  S.va += ac * dt;
  S.va *= Math.exp(-(S.gripping ? 7 : 3.2) * dt);
  S.a += S.va * dt;
  if (Math.abs(S.a) > .9 && S.nearT <= 0 && S.recover <= 0) {
    S.nearT = 3; say('player', pick(L.nearFall), { speak: true, life: 1.8 });
  }
  if (Math.abs(S.a) >= 1.15 && S.recover <= 0) {
    S.falls++; S.life -= 11; S.a = 0; S.va = 0; S.recover = 1.6; S.score -= 40;
    S.shake = 10; S.flash = .7; S.flashCol = '#ef4444'; sfx.thud();
    say('player', pick(L.fall), { speak: true, force: true });
    if (S.life <= 0) { S.life = 0; die('fall'); return; }
  }
  S.a = clamp(S.a, -1.05, 1.05);

  // bobbing
  S.bobV += (-S.bobY * 180 - S.bobV * 9) * dt; S.bobY += S.bobV * dt;
  S.bobY = clamp(S.bobY, -14, 14);
  S.tilt = clamp(S.bobY * .004 + S.a * .03, -.12, .12);
  S.shake = Math.max(0, S.shake - 25 * dt);
  S.flash = Math.max(0, S.flash - 2.2 * dt);

  // spawn
  while (S.nextRoadX < S.dist + 45) { spawnRoad(S.nextRoadX); S.nextRoadX += rand(11, 20) / STAGES[stageOf(S.nextRoadX)].rough; }
  while (S.nextVehX < S.dist + 50) { spawnVeh(S.nextVehX); S.nextVehX += rand(55, 95); }

  // road hazards
  for (const o of S.objs) {
    if (!o.done && S.dist + 1.6 >= o.x) {
      o.done = true;
      const size = o.type === 'breaker' ? 1.25 : o.type === 'puddle' ? .55 : 1;
      const mag = (.9 + .09 * S.speed) * size;
      const wasGrip = S.gripping;
      jolt(mag); sfx[o.type === 'puddle' ? 'splash' : 'bump']();
      later(.28, () => jolt(mag * .6));
      for (let i = 0; i < 12; i++) S.parts.push({ x: S.camX + 50 * S.face, y: GY, vx: rand(-80, 120) * S.face, vy: rand(-220, -80), life: rand(.4, .8), col: o.type === 'puddle' ? '#9bd7ff' : '#b8a080', r: rand(2, 4) });
      if (wasGrip && mag > 1.4) later(.9, () => { if (S.mode === 'play' && Math.abs(S.a) < .5) { S.goodGrips++; S.score += 15; if (Math.random() < .35) say('driver', pick(L.goodGrip), { life: 1.8 }); } });
      if (Math.random() < .3 && S.bubbles.length < 3) say('player', pick(L.playerIdle), { speak: false, life: 2 });
    }
  }
  S.objs = S.objs.filter(o => o.x + o.w > S.dist - 40);

  // vehicles
  for (const v of S.vehs) {
    if (!v.leaving) {
      v.x += v.v * dt;
      const gap = v.x - (S.dist + 1.7);
      if (gap > 0 && gap < 10 && v.wrongSide && !inp.slow && !S.wrong && S.speed > v.v + 3 && S.uturn.state !== 1) { startWrong(v); continue; }
      if (gap < 0 && !v.hit) collide(v);
      else if (gap > 0 && gap < 16 && S.speed > v.v + 1.5) {
        if (S.honkCool <= 0) honk();
        if (gap < 11 && S.warnCool <= 0) { S.warnCool = 3.5; say('player', pick(L.brake), { speak: true, life: 1.6 }); }
      }
      if (gap < 22) v.tail += dt; else v.tail = 0;
      if (v.tail > 2.8 || S.clock > v.exit) { v.leaving = true; v.v += 4; }
    } else {
      v.x += (v.v + 3) * dt; v.yoff = Math.min(70, v.yoff + 45 * dt);
    }
  }
  S.vehs = S.vehs.filter(v => v.x > S.dist - 30 && v.x < S.dist + 110);
  updateWorld(dt);

  // idle chatter
  S.idleT -= dt;
  if (S.idleT <= 0 && S.bubbles.length < 2 && S.uturn.state !== 1) {
    S.idleT = rand(6, 10);
    if (Math.random() < .5) say('driver', pick(L.driverIdle), { speak: true });
    else say('player', pick(L.playerIdle), { speak: true });
  }

  // bubbles, particles
  S.bubbles.forEach(b => b.t += dt); S.bubbles = S.bubbles.filter(b => b.t < b.life);
  S.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt; });
  S.parts = S.parts.filter(p => p.life > 0);
  if (S.banner) { S.banner.t += dt; if (S.banner.t > 2.6) S.banner = null; }

  // engine sound
  if (AC && engG) {
    engG.gain.setTargetAtTime(settings.mute ? 0 : .045, AC.currentTime, .1);
    eng.frequency.setTargetAtTime(48 + S.speed * 6 + Math.random() * 4, AC.currentTime, .05);
  }

  if (S.life <= 0) { S.life = 0; die('hit'); return; }
  if (S.dist >= FINISH) win();
}

const AMB = [
  { x: 30, key: 'hawker', t: 'জামা একশো টাকা, একশো টাকা! যা নেন একশো!' }, { x: 55, key: 'tea', t: 'চা, গরম চা! চা জয়!' },
  { x: 110, key: 'rick', t: 'ভাই রিক্সা লাগবে? ইউআইইউ!' }, { x: SEG + 60, key: 'chop', t: 'গরম গরম চপ, পেঁয়াজু!' },
  { x: SEG + 130, key: 'hawker', t: 'ভাই, এই শার্ট একশো টাকা!' }, { x: 2 * SEG + 95, key: 'rick', t: 'রিক্সা, রিক্সা! সাঈদ নগর!' },
  { x: 2 * SEG + 170, key: 'tea', t: 'চা-পান, চা-পান!' }, { x: 3 * SEG + 100, key: 'ped', t: 'ওই ভাই, দেইখা চালান!' },
  { x: 4 * SEG + 90, key: 'bus', t: 'বিটুমিন গেট, বিটুমিন গেট! নামেন নামেন!' }, { x: 6 * SEG + 80, key: 'ped', t: 'ইউআইইউ, ইউআইইউ!' }
];
function spawnPed(x) {
  if (inSafeZone(x)) return;
  S.peds.push({ x, lat: 0, go: false, hit: false, fall: 0, shirt: pick(['#2563eb', '#f59e0b', '#16a34a', '#e11d48', '#0ea5e9', '#a855f7']), skin: pick(['#c68a5a', '#a86f45', '#d8a276']), bag: Math.random() < .5 ? '#2563eb' : null, umb: pick(['#f43f5e', '#0ea5e9', '#a855f7', '#16a34a']) });
}
function hitPed(p) {
  p.hit = true; p.fall = 0; S.hits++; S.life -= 6; S.score -= 100; S.speed = Math.min(S.speed, 8);
  jolt(1.8); sfx.thud(); S.flash = .5; S.flashCol = '#f59e0b';
  say('ped', pick(settings.abuse && Math.random() < .5 ? L.abuse : L.pedHit), { ref: p, force: true, life: 2.4 });
  if (!S.mob) {
    S.mob = { x: S.dist - 4.5, v: 11, t: 0, n: 8, caught: false };
    S.banner = { text: '🏃 জনতা তাড়া করছে!', sub: 'থেমো না! ধীরে চালাতে বোলো না!', t: 0 };
    later(.9, () => say('crowd', pick(settings.abuse && Math.random() < .5 ? L.mobRude : L.mob), { force: true, life: 2.6 }));
    later(2.2, () => { if (S.mob && S.mode === 'play') say('player', pick(L.mobRun), { life: 1.8 }); });
  }
}
function startWrong(v) {
  S.wrong = { t: 0, dur: 2.4 }; v.leaving = true; v.v += 3;
  S.banner = { text: '⚠ রং সাইড!', sub: 'সামনে থেকে গাড়ি আসছে!', t: 0 };
  say('driver', pick(L.wrong), { force: true, life: 2.2 });
  S.onc.push({ type: 'car', x: S.dist + 24, v: 15, col: '#dc2626', seed: 3, len: 4.4, yoff: 0 });
  later(1.1, () => {
    if (S.mode !== 'play') return;
    sfx.horn(); jolt(1.3); S.score += 25;
    say('other', pick(L.carYell), { ref: { type: 'car', x: S.dist + 3, len: 4.4, yoff: 0 }, life: 2 });
  });
}
function updateWorld(dt) {
  S.stopT = Math.max(0, S.stopT - dt);
  const at0 = S.deal ? S.deal.at : 0;
  for (const a of AMB) if (!S.amb[a.x] && S.dist >= a.x && S.dist < a.x + 25 && a.x >= at0 - 1) { S.amb[a.x] = 1; say('amb', a.t, { ref: a, life: 2.6 }); }
  // random jams at Sahebnagar auto stand and Vitamin Gate
  for (const idx of [2, 4]) {
    const at = LM[idx];
    if (!S.jamDone[idx] && S.dist > at - 70 && S.dist < at - 20) {
      S.jamDone[idx] = true;
      if (S.jams[idx] && at0 < at - 70) {
        for (let k = 0; k < 6; k++) { const type = pick(['car', 'cng', 'rick', 'car', 'bus']), d = VT[type]; S.vehs.push({ type, x: S.dist + 26 + k * 8, len: d.len, v: rand(1.5, 3), stopped: false, wrongSide: false, hit: false, leaving: false, yoff: 0, tail: 0, exit: S.clock + rand(9, 15), col: pick(VCOL), seed: Math.random() * 100 }); }
        S.banner = { text: '🚦 জ্যাম!', sub: idx === 2 ? 'অটো স্ট্যান্ডের মোড়' : 'বিটুমিন গেটের সামনে', t: 0 };
        say('driver', pick(L.jam), { force: true, life: 2.6 });
      }
    }
  }
  // pedestrians crossing the road
  while (S.nextPedX < S.dist + 40) { spawnPed(S.nextPedX); const st = stageOf(S.nextPedX); S.nextPedX += (st === 0 || st === 2) ? rand(85, 130) : rand(120, 190); }
  for (const p of S.peds) {
    const d0 = p.x - S.dist;
    if (!p.go && d0 < 22 && d0 > 0) p.go = true;
    if (p.go && !p.hit) p.lat += .5 * dt;
    if (p.hit) p.fall += dt;
    const onLane = p.lat > .7 && p.lat < 1.3;
    if (p.go && !p.hit && d0 < 15 && d0 > 1 && S.speed > 8 && S.warnCool <= 0) { S.warnCool = 3; say('player', pick(L.pedWarn), { life: 1.6 }); }
    if (!p.hit && onLane && !S.wrong && S.dist + 1.7 >= p.x && S.dist - .6 <= p.x + .6) hitPed(p);
  }
  S.peds = S.peds.filter(p => p.x > S.dist - 30 && !(p.lat > 1.4 && !p.hit) && !(p.hit && p.fall > 3));
  // angry crowd
  if (S.mob) {
    const m = S.mob; m.t += dt; m.x += m.v * dt; const gap = S.dist - m.x;
    if (!m.caught && gap < 1.5) {
      m.caught = true; m.v = 0; S.life -= 12; S.score -= 80; S.shake = 12; S.flash = .8; S.flashCol = '#ef4444'; S.stopT = 1.2; sfx.thud();
      say('crowd', pick(L.mobCatch), { force: true, life: 2.4 }); later(1.6, () => { S.mob = null; });
    } else if (!m.caught && (m.t > 12 || gap > 60)) { say('crowd', pick(L.mobGiveUp), { life: 2.4 }); S.score += 60; S.mob = null; }
  }
  // oncoming traffic + wrong-side overtake
  S.nextOncT -= dt;
  if (S.nextOncT <= 0) { S.nextOncT = rand(1.8, 4); const type = pick(['car', 'car', 'bus', 'cng', 'rick']); S.onc.push({ type, x: S.dist + 60, v: rand(8, 15), col: pick(VCOL), seed: Math.random() * 100, len: VT[type].len, yoff: 0 }); }
  S.onc.forEach(o => { o.x -= o.v * dt; }); S.onc = S.onc.filter(o => o.x > S.dist - 40);
  if (S.wrong) { S.wrong.t += dt; if (S.wrong.t >= S.wrong.dur) S.wrong = null; }
}

function honk() {
  S.honkCool = S.mood === 'angry' ? .7 : 1.2; S.honks++; S.score -= 5; sfx.horn();
  say('driver', pick(L.honk), { life: 1 });
  jolt(.25);
  if (S.honks > 10 && S.honks % 3 === 0) {
    S.life -= 2; say('player', pick(L.honkFine), { speak: true, life: 2.2 });
  }
}
function collide(v) {
  v.hit = true; v.leaving = true; v.v = Math.max(v.v, 9);
  S.hits++; S.life -= 5; S.score -= 50;
  S.speed = Math.min(S.speed, 4);
  jolt(2.3); S.shake = 10; S.flash = .5; S.flashCol = '#f59e0b'; sfx.thud();
  say('other', pick(settings.abuse && Math.random() < .6 ? L.abuse : L.carYell), { ref: v, speak: true, force: true, life: 2.6 });
  later(1.3, () => {
    if (S.mode !== 'play') return;
    if (v.type === 'rick') say('other', pick(L.rickApology), { ref: v, speak: true, life: 2.2 });
    else say('driver', pick(L.driverSorry), { speak: true, life: 2.2 });
  });
}

/* ---------- drawing: scene ---------- */
function drawRain() {
  ctx.fillStyle = 'rgba(30,45,80,.22)'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(210,228,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i < 110; i++) {
    const x = mod(i * 97.3 + S.t * 140, W + 40) - 20, y = mod(i * 53.1 + S.t * (520 + (i % 5) * 60), H + 40) - 20;
    ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16);
  }
  ctx.stroke();
}
const X = mx => S.camX + (mx - S.dist) * PPM * S.dir;

function drawSky() {
  const f = clamp(S.dist / SEG, 0, 7), i = Math.floor(f), j = Math.min(7, i + 1), tt = f - i;
  const g = ctx.createLinearGradient(0, 0, 0, SIDEY);
  g.addColorStop(0, mix(STAGES[i].sky[0], STAGES[j].sky[0], tt));
  g.addColorStop(1, mix(STAGES[i].sky[1], STAGES[j].sky[1], tt));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const prog = clamp(S.dist / FINISH, 0, 1);
  const sx = 800 - prog * 420, sy = 95 + prog * 120;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(S.t * .2);
  ctx.fillStyle = 'rgba(255,230,120,.35)';
  for (let k = 0; k < 12; k++) { ctx.rotate(Math.PI / 6); ctx.fillRect(34, -4, 30 + Math.sin(S.t * 2 + k) * 8, 8); }
  ctx.restore();
  ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(sx, sy, 30, 0, 7); ctx.fill();
  // clouds
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (let k = 0; k < 6; k++) {
    const cx = mod(k * 230 - S.dir * S.dist * PPM * .05 + S.t * 8, W + 300) - 150, cy = 50 + (k % 3) * 38;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.arc(cx + 24, cy - 8, 26, 0, 7); ctx.arc(cx + 52, cy, 20, 0, 7); ctx.fill();
  }
  // birds
  ctx.strokeStyle = '#334'; ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) {
    const bx = mod(k * 300 + S.t * 40, W + 100) - 50, by = 120 + k * 22 + Math.sin(S.t * 3 + k) * 6, fl = Math.sin(S.t * 9 + k) * 5;
    ctx.beginPath(); ctx.moveTo(bx - 8, by + fl); ctx.quadraticCurveTo(bx - 4, by - 4, bx, by); ctx.quadraticCurveTo(bx + 4, by - 4, bx + 8, by + fl); ctx.stroke();
  }
}

const BPAL = ['#ff8fab', '#ffb86b', '#8ecae6', '#b8f2c8', '#cdb4ff', '#ffd166', '#f4a3c4', '#9be3de'];
function drawFarLayer(par, spacing, minH, maxH, alpha, seed) {
  const sc = S.dir * S.dist * PPM * par;
  const i0 = Math.floor((sc - 120) / spacing), i1 = Math.ceil((sc + W + 120) / spacing);
  ctx.globalAlpha = alpha;
  for (let i = i0; i <= i1; i++) {
    const h = minH + hash(i + seed) * (maxH - minH), w = spacing * (.7 + hash(i * 2.1 + seed) * .35);
    const x = i * spacing - sc;
    ctx.fillStyle = BPAL[Math.floor(hash(i * 3.7 + seed) * BPAL.length)];
    ctx.fillRect(x, SIDEY - h, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let wy = SIDEY - h + 10; wy < SIDEY - 14; wy += 18)
      for (let wx = x + 8; wx < x + w - 10; wx += 16)
        if (hash(wx * .13 + wy * .7 + seed) > .4) ctx.fillRect(wx, wy, 7, 10);
  }
  ctx.globalAlpha = 1;
}

const BOARDS = ['ভর্তি চলছে', 'সেল সেল সেল!', 'ভাঙা রাস্তা সংস্কার চাই!', 'আজই ডেলিভারি', 'খাঁটি মধু'];
// real-world-style named shops along the route (edit freely)
const NAMED = [
  { x: 6,   kind: 'nagad',     name: 'নগদ-বিকাশ সেন্টার' },
  { x: 36,  kind: 'chajoy',    name: 'চা জয়' },
  { x: 66,  kind: 'confection', name: 'রহিম স্টোর' },
  { x: 90,  kind: 'tong',      name: 'আলামিন চা-সিগারেট' },
  { x: 112, kind: 'pharmacy',  name: 'লাস্ট ফার্মা' },
  { x: 168, kind: 'restaurant', name: 'নতুন বাজার রেস্টুরেন্ট' },
  { x: 196, kind: 'bkash',     name: 'রহমান টেলিকম' },
  { x: 222, kind: 'confection', name: 'মায়ের দোয়া স্টোর' },
  { x: 250, kind: 'tong',      name: 'মামুন টি-স্টল' },
  { x: 305, kind: 'hospital',  name: 'পরাজয় হাসপাতাল' },
  { x: SEG + 28, kind: 'biryani', name: 'কাচ্চি ঘর' }, { x: SEG + 60, kind: 'chop', name: 'চপ-সিঙ্গারা' }, { x: SEG + 92, kind: 'nagad', name: 'মা টেলিকম' },
  { x: SEG + 150, kind: 'confection', name: 'ফ্যামিলি স্টোর' }, { x: SEG + 215, kind: 'garments', name: 'ফ্যামিলি ফ্যাশন' },
  { x: 2 * SEG + 40, kind: 'furniture', name: 'আলমারি-খাট-সোফা' }, { x: 2 * SEG + 70, kind: 'furniture', name: 'কাঠের ঘর ফার্নিচার' },
  { x: 2 * SEG + 120, kind: 'tong', name: 'সাঈদ নগর চা' }, { x: 2 * SEG + 215, kind: 'furniture', name: 'ডিজাইন ফার্নিচার' },
  { x: 3 * SEG + 30, kind: 'pharmacy', name: 'সেবা ফার্মেসি' }, { x: 4 * SEG + 30, kind: 'pharmacy', name: 'বিটুমিন ফার্মেসি' },
  { x: 4 * SEG + 215, kind: 'biryani', name: 'বিরিয়ানি হাউস' }, { x: 6 * SEG + 30, kind: 'nagad', name: 'আল মুস্তাফা টেলিকম' }
];
const KINDS = [
  ['nagad', 'tong', 'confection', 'garments', 'mobile', 'pharmacy', 'tong', 'confection', 'restaurant', 'default'],
  ['biryani', 'chop', 'garments', 'garments', 'restaurant', 'nagad', 'confection', 'pharmacy', 'fruits', 'default'],
  ['furniture', 'furniture', 'tong', 'mobile', 'default', 'confection', 'pharmacy', 'salon'],
  ['pharmacy', 'restaurant', 'bkash', 'garments', 'default', 'salon'],
  ['pharmacy', 'biryani', 'restaurant', 'bkash', 'tea'],
  ['tea', 'default', 'fruits', 'chop'],
  ['bkash', 'default', 'tea', 'pharmacy'],
  ['default', 'tea', 'restaurant', 'bkash']
];
function drawRoadside() {
  const lo = Math.floor((S.dist - 30) / 5), hi = Math.ceil((S.dist + 30) / 5);
  for (let i = lo; i <= hi; i++) {
    const wx = i * 5 + hash(i) * 1.5;
    if (LM.some(l => Math.abs(wx - l) < 11) || NAMED.some(n => Math.abs(wx - n.x) < 11)) continue;
    const cx = X(wx), k = hash(i * 3.3), st = stageOf(wx);
    if (cx < -220 || cx > W + 220) continue;
    if (k < .66) { const arr = KINDS[st]; A.shop(cx, SIDEY, arr[Math.floor(hash(i * 7.7) * arr.length)], i); }
    else if (k < .8) A.tree(cx, SIDEY, i, hash(i * 2.2) > .5);
    else if (k < .9) A.pole(cx, SIDEY);
    else A.billboard(cx, SIDEY, i, BOARDS[Math.floor(hash(i * 4.4) * BOARDS.length)]);
  }
  for (const n of NAMED) { const cx = X(n.x); if (cx > -220 && cx < W + 220) A.shop(cx, SIDEY, n.kind, n.x, n.name); }
}
function drawStreetLife() {
  const f0 = Math.floor((S.dist - 30) / 3), f1 = Math.ceil((S.dist + 30) / 3);
  for (let i = f0; i <= f1; i++) if (hash(i * 9.1) > .45) { const cx = X(i * 3 + 1); if (cx > -60 && cx < W + 60) A.flowerBed(cx, SIDEY + 26, i); }
  const h0 = Math.floor((S.dist - 30) / 9), h1 = Math.ceil((S.dist + 30) / 9);
  for (let i = h0; i <= h1; i++) {
    const wx = i * 9 + hash(i) * 3, st = stageOf(wx), pr = st === 0 ? .85 : st === 1 ? .7 : st === 2 ? .3 : .12;
    if (hash(i * 5.3) > pr || LM.some(l => Math.abs(wx - l) < 6) || NAMED.some(n => (n.kind === 'chajoy' || n.kind === 'hospital') && Math.abs(wx - n.x) < 7)) continue;
    const cx = X(wx); if (cx < -150 || cx > W + 150) continue;
    A.hawkerVan(cx, SIDEY + (hash(i * 8.2) > .55 ? 50 : 34), i, S.t, S.rain);
  }
  const p0 = Math.floor((S.dist - 30) / 5), p1 = Math.ceil((S.dist + 30) / 5);
  for (let i = p0; i <= p1; i++) {
    const sw = Math.sin(S.t * .35 + i), wx = i * 5 + hash(i * 1.3) * 3 + sw * 1.2, st = stageOf(wx);
    if (hash(i * 6.1) > (st <= 2 ? .75 : .5)) continue;
    const cx = X(wx); if (cx < -60 || cx > W + 60) continue;
    const o = A.randPerson(i, S.t, S.rain); o.dir = sw > 0 ? S.dir : -S.dir;
    A.person(cx, SIDEY + 20 + (hash(i) > .5 ? 6 : 0), 1, o);
  }
}
function drawLandmarkFront(i) {
  if (i === 0) A.rickStand(X(LM[0] - 14), SIDEY + 40, 'নতুন বাজার রিক্সা স্ট্যান্ড', 1, 4, ['সমাজখানা', 'সমাজখানা', 'নতুন বাজার', 'ঢাকা-১২']);
  if (i === 2) A.rickStand(X(LM[2] - 10), SIDEY + 40, 'সাঈদ নগর রিক্সা স্ট্যান্ড', 3, 6, ['সাঈদ নগর', 'সমাজখানা', 'বাড্ডা']);
}
function drawPeds() {
  for (const p of S.peds) {
    const cx = X(p.x + .3), y = SIDEY + 20 + clamp(p.lat, 0, 1.3) * (GY + 8 - SIDEY - 20);
    A.person(cx, p.hit ? y + 4 : y, 1.05, { shirt: p.shirt, pants: '#334155', skin: p.skin, ph: p.hit ? 0 : S.t * 7 + p.x, dir: S.dir, bag: p.bag, fall: p.hit, umb: S.rain ? p.umb : null });
    if (p.go && !p.hit && p.lat < .7) txt('!', cx, y - 92, 24, '#facc15', 'center', 700, '#000');
  }
}
function drawMob() {
  if (!S.mob) return;
  for (let k = 0; k < S.mob.n; k++) {
    const mx = S.mob.x - (k % 4) * 1.1 - Math.floor(k / 4) * .6, cx = X(mx), y = GY + 8 + (k % 3) * 8 - 8;
    A.person(cx, y, 1.05, { shirt: ['#dc2626', '#2563eb', '#16a34a', '#f59e0b'][k % 4], pants: '#334155', skin: ['#c68a5a', '#a86f45', '#d8a276'][k % 3], ph: S.t * 12 + k * 1.3, run: !S.mob.caught, up: true, dir: S.dir });
  }
}
function drawOnc() {
  for (const o of S.onc) drawVeh(o, { fx: -1, sc: .85, dy: -58 });
}

function drawLandmark(i) {
  const cx = X(LM[i]);
  if (cx < -620 || cx > W + 620) return;
  const B = SIDEY;
  ctx.save();
  switch (i) {
    case 0: { // Natun Bazar: bus stop + flyover pillar + sign
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(cx + 90, B - 250, 46, 250); ctx.fillStyle = '#6b7280'; ctx.fillRect(cx + 40, B - 260, 150, 24);
      ctx.fillStyle = '#fde68a'; ctx.fillRect(cx - 150, B - 110, 130, 8);
      ctx.fillStyle = '#92400e'; ctx.fillRect(cx - 145, B - 110, 6, 110); ctx.fillRect(cx - 35, B - 110, 6, 110);
      ctx.fillStyle = '#0ea5e9'; rr(cx - 120, B - 150, 100, 28, 6); ctx.fill(); txt('বাস স্ট্যান্ড', cx - 70, B - 130, 16, '#fff', 'center', 700);
      ctx.fillStyle = '#16a34a'; rr(cx - 60, B - 340, 240, 60, 10); ctx.fill();
      txt('নতুন বাজার', cx + 60, B - 298, 34, '#fff', 'center', 700);
      break; }
    case 1: { // Family Bazar
      ctx.fillStyle = '#fb923c'; ctx.fillRect(cx - 190, B - 190, 380, 190);
      ctx.fillStyle = '#fff'; ctx.fillRect(cx - 190, B - 210, 380, 24);
      ctx.fillStyle = '#7dd3fc'; ctx.fillRect(cx - 170, B - 140, 160, 100); ctx.fillRect(cx + 10, B - 140, 160, 100);
      ctx.fillStyle = '#dc2626'; rr(cx - 150, B - 300, 300, 80, 12); ctx.fill();
      txt('🛒 ফ্যামিলি বাজার', cx, B - 244, 36, '#fff', 'center', 700);
      txt('Family Bazar', cx, B - 228, 14, '#ffe', 'center', 600);
      break; }
    case 2: { // Sahebnagar
      ctx.fillStyle = '#92400e'; ctx.fillRect(cx - 160, B - 90, 120, 90); ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.moveTo(cx - 175, B - 90); ctx.lineTo(cx - 100, B - 140); ctx.lineTo(cx - 25, B - 90); ctx.fill();
      txt('চা', cx - 100, B - 40, 28, '#fff', 'center', 700);
      for (const dx of [40, 120]) { ctx.fillStyle = '#5b3a1a'; ctx.fillRect(cx + dx, B - 100, 8, 100); ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.ellipse(cx + dx + 4, B - 110, 44, 16, .4, 0, 7); ctx.ellipse(cx + dx + 4, B - 110, 44, 16, -.4, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#374151'; ctx.fillRect(cx + 170, B - 200, 8, 200); ctx.fillStyle = '#0d9488'; rr(cx + 10, B - 260, 240, 56, 10); ctx.fill();
      txt('সাঈদ নগর', cx + 130, B - 220, 32, '#fff', 'center', 700);
      break; }
    case 3: { // 10 tola: tower + apartment blocks in front
      A.apartment(cx - 250, B, 130, 230, 3); A.apartment(cx + 250, B, 120, 190, 5); A.apartment(cx - 380, B, 110, 150, 8);
      ctx.fillStyle = '#6366f1'; ctx.fillRect(cx - 80, B - 340, 160, 340);
      for (let r = 0; r < 10; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = hash(r * 7 + c) > .35 ? '#fde68a' : '#c7d2fe'; ctx.fillRect(cx - 68 + c * 36, B - 328 + r * 32, 24, 20); }
      ctx.fillStyle = '#f43f5e'; rr(cx - 90, B - 395, 180, 46, 8); ctx.fill(); txt('১০ তলা', cx, B - 360, 32, '#fff', 'center', 700);
      ctx.fillStyle = '#4338ca'; ctx.fillRect(cx - 24, B - 50, 48, 50);
      break; }
    case 4: A.vitaminGate(cx, B); break;
    case 5: { // U-turn: royal house on the left, Shesh Table on the right
      A.royalHouse(cx - 330, B);
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 200, B - 12, 400, 12);
      ctx.fillStyle = '#111'; for (let k = 0; k < 10; k++) ctx.fillRect(cx - 200 + k * 40, B - 12, 20, 12);
      ctx.fillStyle = '#ea580c'; rr(cx - 110, B - 250, 220, 56, 10); ctx.fill(); txt('↩ ইউ-টার্ন', cx, B - 212, 32, '#fff', 'center', 700);
      A.sheshTable(cx + 260, B);
      break; }
    case 6: A.mosque(cx, B); break;
    case 7: A.uiu(cx, B); break;
  }
  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = '#d1d5db'; ctx.fillRect(0, SIDEY, W, 22);
  ctx.fillStyle = '#9ca3af'; ctx.fillRect(0, SIDEY + 22, W, 5);
  ctx.fillStyle = '#4b5060'; ctx.fillRect(0, SIDEY + 27, W, H - SIDEY - 27);
  // patches
  const lo = Math.floor(S.dist - 30), hi = Math.ceil(S.dist + 30);
  for (let m = lo; m <= hi; m += 2) {
    const h = hash(m * .37);
    if (h > .6) { ctx.fillStyle = h > .8 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.06)'; ctx.fillRect(X(m), SIDEY + 40 + hash(m) * 100, 30 + h * 50, 6 + h * 8); }
  }
  // centre dashes
  ctx.fillStyle = '#fbbf24';
  for (let m = Math.floor(S.dist - 30); m <= S.dist + 30; m += 4) ctx.fillRect(X(m), 452, 90, 5);
  ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 534, W, 3);
}

function drawRoadObjs() {
  for (const o of S.objs) {
    const x0 = X(o.x), x1 = X(o.x + o.w), cx = (x0 + x1) / 2, w = Math.abs(x1 - x0);
    if (cx < -300 || cx > W + 300) continue;
    const y = GY + 12;
    if (o.type === 'pothole') {
      ctx.fillStyle = '#2a2d35'; ctx.beginPath(); ctx.ellipse(cx, y, w / 2, 14, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#7a7f8c'; ctx.lineWidth = 2; ctx.stroke();
    } else if (o.type === 'puddle') {
      ctx.fillStyle = 'rgba(100,170,230,.8)'; ctx.beginPath(); ctx.ellipse(cx, y, w / 2, 15, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, y, w / 2 * (.5 + .15 * Math.sin(S.t * 3)), 6, 0, 0, 7); ctx.stroke();
    } else {
      ctx.fillStyle = '#8b8f99'; ctx.beginPath(); ctx.moveTo(cx - w / 2 - 8, y + 10); ctx.lineTo(cx - w / 2, y - 14); ctx.lineTo(cx - 6, y - 16); ctx.lineTo(cx + 2, y - 8); ctx.lineTo(cx + w / 2, y - 14); ctx.lineTo(cx + w / 2 + 8, y + 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a2d35'; ctx.beginPath(); ctx.moveTo(cx - 6, y - 16); ctx.lineTo(cx + 2, y - 8); ctx.lineTo(cx - 2, y + 8); ctx.lineTo(cx - 10, y + 2); ctx.fill();
    }
  }
}

function wheel(x, y, r, a) {
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.arc(x, y, r * .55, 0, 7); ctx.fill();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r * .55, y + Math.sin(an) * r * .55); ctx.stroke(); }
}

function drawVeh(v, o) {
  const cx = X(v.x + v.len / 2);
  if (cx < -300 || cx > W + 300) return;
  ctx.save();
  const oo = o || {};
  ctx.translate(cx, GY - v.yoff * .3 + (oo.dy || 0)); ctx.scale(S.dir * (oo.fx || 1) * (oo.sc || 1), oo.sc || 1);
  ctx.globalAlpha = 1 - v.yoff / 140;
  const hw = v.len * PPM / 2, wa = S.t * v.v * 2;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 2, hw, 7, 0, 0, 7); ctx.fill();
  if (v.type === 'car') {
    ctx.fillStyle = v.col; rr(-hw, -52, hw * 2, 34, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-hw * .55, -52); ctx.lineTo(-hw * .3, -80); ctx.lineTo(hw * .35, -80); ctx.lineTo(hw * .62, -52); ctx.fill();
    ctx.fillStyle = '#bfe6ff'; ctx.beginPath(); ctx.moveTo(-hw * .45, -54); ctx.lineTo(-hw * .27, -76); ctx.lineTo(hw * .3, -76); ctx.lineTo(hw * .5, -54); ctx.fill();
    ctx.fillStyle = '#fde68a'; ctx.fillRect(hw - 8, -44, 8, 8);
    wheel(-hw * .6, -16, 16, wa); wheel(hw * .6, -16, 16, wa);
  } else if (v.type === 'bus') {
    ctx.fillStyle = v.col; rr(-hw, -112, hw * 2, 96, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-hw, -62, hw * 2, 8);
    ctx.fillStyle = '#bfe6ff'; for (let k = 0; k < 8; k++) ctx.fillRect(-hw + 14 + k * ((hw * 2 - 70) / 8), -102, ((hw * 2 - 70) / 8) - 8, 32);
    ctx.fillStyle = '#bfe6ff'; ctx.fillRect(hw - 44, -102, 36, 40);
    ctx.fillStyle = '#fff'; txt('বাস সার্ভিস', -hw / 2, -32, 15, '#fff', 'center', 700);
    wheel(-hw * .65, -18, 20, wa); wheel(hw * .6, -18, 20, wa);
  } else if (v.type === 'rick') {
    A.rickshaw(0, 0, 1, { col: A.FRAME[Math.floor(v.seed) % 5], seed: v.seed, t: S.t, wa: S.t * (v.v + 1) * 2, pa: S.t * (v.stopped ? 0 : 7), puller: true, mask: v.seed > 50, cap: v.seed > 30 ? '#e5e7eb' : null, lungi: ['#2563eb', '#16a34a', '#b91c1c'][Math.floor(v.seed) % 3], shirt: '#f1e4c8', plate: v.seed > 60 ? 'সমাজখানা' : null, pass: v.seed > 70 });
  } else {
    drawAutoBody(.82, v.col, hw, wa);
  }
  ctx.restore();
}
function drawAutoBody(sc, col, hw, wa) {
  ctx.save(); ctx.scale(sc, sc);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-70, -26); ctx.lineTo(-70, -62); ctx.lineTo(40, -62); ctx.quadraticCurveTo(66, -60, 76, -36); ctx.lineTo(76, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(-72, -118, 118, 8);
  ctx.fillStyle = '#d97706'; ctx.fillRect(-70, -112, 5, 50); ctx.fillRect(38, -112, 5, 50);
  wheel(-44, -19, 19, wa); wheel(48, -19, 19, wa);
  ctx.restore();
}

/* the player's auto */
function drawAuto() {
  ctx.save();
  const wy = S.wrong ? -Math.sin(Math.PI * S.wrong.t / S.wrong.dur) * 46 : 0;
  ctx.translate(S.camX, GY + S.bobY + wy);
  ctx.rotate(S.tilt * S.face + (S.mode === 'dying' ? -.3 * clamp(S.deathT / .8, 0, 1) : 0));
  ctx.scale(S.face * S.turnSx, 1);
  const wa = S.wheel;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 4 - S.bobY, 90, 8, 0, 0, 7); ctx.fill();
  const rick = true;
  A.rickshaw(0, 0, 1.12, { col: '#16a34a', seed: 12, t: S.t, wa: wa, puller: true, cap: '#e5e7eb', lungi: '#2563eb', shirt: '#f1e4c8', plate: 'টেসলা' });
  if (!rick) {
  // seats
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-70, -74, 70, 12); ctx.fillRect(-74, -112, 8, 40);
  ctx.fillStyle = '#3f2a1d'; ctx.fillRect(2, -72, 38, 10);
  // body
  ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.moveTo(-78, -26); ctx.lineTo(-78, -62); ctx.lineTo(40, -62); ctx.quadraticCurveTo(70, -60, 82, -36); ctx.lineTo(82, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#facc15'; ctx.fillRect(-78, -46, 150, 6);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(-78, -40, 150, 3);
  // driver
  ctx.fillStyle = '#9a3412'; ctx.fillRect(14, -104, 18, 34);
  ctx.fillStyle = '#d6a77a'; ctx.beginPath(); ctx.arc(24, -114, 11, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(24, -118, 11, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(34, -92); ctx.lineTo(50, -80); ctx.stroke();
  ctx.fillStyle = '#d6a77a'; ctx.beginPath(); ctx.arc(34, -92, 4, 0, 7); ctx.fill();
  }
  // passenger
  const dying = S.mode === 'dying', du = dying ? clamp(S.deathT / 1.3, 0, 1) : 0;
  const th = S.a * .6 + du * 5.5, hipx = -38 - du * 150, hipy = Math.min(-8, -72 - du * 150 + du * du * 230);
  ctx.save(); ctx.translate(hipx, hipy); ctx.rotate(th);
  const fem = S.gender === 'f';
  ctx.fillStyle = fem ? '#ec4899' : '#3b82f6'; rr(-10, -40, 20, 40, 5); ctx.fill();
  ctx.fillStyle = fem ? '#a855f7' : '#f59e0b'; ctx.fillRect(-14, -36, 6, 26);
  if (fem) { ctx.fillStyle = '#111'; ctx.fillRect(-14, -58, 7, 40); }
  ctx.fillStyle = '#e0b48a'; ctx.beginPath(); ctx.arc(0, -52, 12, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, -56, 12, Math.PI, 0); ctx.fill();
  const scared = Math.abs(S.a) > .55 || S.recover > 0;
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(4, -52, scared ? 2.6 : 1.8, 0, 7); ctx.arc(-3, -52, scared ? 2.6 : 1.8, 0, 7); ctx.fill();
  ctx.beginPath(); if (scared) ctx.ellipse(1, -45, 3, 4.5, 0, 0, 7); else ctx.arc(1, -46, 3, 0, Math.PI);
  scared ? ctx.fill() : ctx.stroke();
  ctx.restore();
  // arms
  const shx = hipx + 32 * Math.sin(th), shy = hipy - 32 * Math.cos(th);
  const rail = [-14, -101];
  ctx.lineCap = 'round';
  for (let k = 0; k < (dying ? 0 : 2); k++) {
    const hx = S.gripping ? rail[0] + k * 14 : shx + 16 + Math.sin(S.t * 9 + k * 2) * 12 + k * 8;
    const hy = S.gripping ? rail[1] : shy - 6 + Math.cos(S.t * 11 + k) * 14;
    ctx.strokeStyle = '#e0b48a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(shx, shy); ctx.quadraticCurveTo((shx + hx) / 2 + 8, (shy + hy) / 2 - 6, hx, hy); ctx.stroke();
    if (S.gripping) { ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 7); ctx.fill(); }
  }
  // rail + canopy (drawn after so arms look like they grip)
  if (!rick) {
  ctx.fillStyle = '#d97706'; ctx.fillRect(-78, -118, 8, 58); ctx.fillRect(40, -118, 6, 58);
  ctx.fillStyle = '#fbbf24'; rr(-84, -126, 134, 12, 5); ctx.fill();
  ctx.strokeStyle = S.gripping ? '#fde047' : '#9ca3af'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -101); ctx.lineTo(0, -101); ctx.stroke();
  ctx.fillStyle = 'rgba(190,230,255,.45)'; ctx.beginPath(); ctx.moveTo(44, -114); ctx.lineTo(66, -62); ctx.lineTo(44, -62); ctx.closePath(); ctx.fill();
  wheel(-48, -19, 19, wa); wheel(52, -19, 19, wa);
  ctx.fillStyle = '#fde68a'; ctx.fillRect(78, -48, 6, 8);
  } else { ctx.strokeStyle = S.gripping ? '#fde047' : '#9ca3af'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -101); ctx.lineTo(0, -101); ctx.stroke(); }
  ctx.restore();
  txt(S.name, S.camX - S.face * 38, GY - 178 + S.bobY, 14, '#fff', 'center', 700, 'rgba(0,0,0,.6)');
}

function drawParts() {
  for (const p of S.parts) { ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}

function bubbleAnchor(b) {
  if (S.mode === 'stand' && S.stand) {
    const st = S.stand, sl = SLOTS[st.idx];
    if (b.who === 'driver') return { x: sl.x + 33 * sl.sc, y: sl.y - 128 * sl.sc, c: '#f59e0b' };
    if (b.who === 'player') return { x: st.px, y: st.py - 104, c: '#3b82f6' };
    if (b.who === 'rick' && b.ref) return { x: b.ref.sx, y: b.ref.sy, c: '#16a34a' };
  }
  if (b.who === 'driver') return { x: S.camX + S.face * 30, y: GY - 150 + S.bobY, c: '#f59e0b' };
  if (b.who === 'player') return { x: S.camX - S.face * 38, y: GY - 196 + S.bobY, c: '#3b82f6' };
  if (b.who === 'ped') return { x: b.ref ? X(b.ref.x) : W / 2, y: GY - 100, c: '#a855f7' };
  if (b.who === 'crowd') return { x: S.mob ? X(S.mob.x) : W / 2, y: GY - 110, c: '#b91c1c' };
  if (b.who === 'amb') return { x: b.ref ? X(b.ref.x) : W / 2, y: SIDEY - 40, c: '#0ea5e9' };
  const v = b.ref;
  return { x: v ? X(v.x + v.len / 2) : W / 2, y: GY - (v && v.type === 'bus' ? 130 : 100) - (v ? v.yoff * .3 : 0), c: '#ef4444' };
}
function drawBubbles() {
  if (!settings.subs) return;
  const placed = [];
  for (const b of S.bubbles) {
    const a = bubbleAnchor(b), size = 17;
    const ls = wrap(b.text, 230, size, 600), lh = 21, bw = Math.min(250, Math.max(...ls.map(l => ctx.measureText(l).width)) + 22), bh = ls.length * lh + 14;
    let bx = clamp(a.x - bw / 2, 8, W - bw - 8), by = a.y - bh - 14;
    for (let k = 0; k < 6; k++) { if (placed.some(p => bx < p.x + p.w + 4 && bx + bw + 4 > p.x && by < p.y + p.h + 4 && by + bh + 4 > p.y)) by -= bh + 8; else break; }
    placed.push({ x: bx, y: by, w: bw, h: bh });
    const al = clamp(Math.min(b.t * 6, (b.life - b.t) * 4), 0, 1);
    ctx.globalAlpha = al;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = a.c; ctx.lineWidth = 3; rr(bx, by, bw, bh, 12); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(clamp(a.x, bx + 14, bx + bw - 14) - 7, by + bh - 1); ctx.lineTo(a.x, a.y - 4); ctx.lineTo(clamp(a.x, bx + 14, bx + bw - 14) + 7, by + bh - 1); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(clamp(a.x, bx + 14, bx + bw - 14) - 6, by + bh - 4, 12, 5);
    ls.forEach((l, i) => txt(l, bx + bw / 2, by + 20 + i * lh, size, '#1f2937', 'center', 600));
    ctx.globalAlpha = 1;
  }
}

/* ---------- HUD ---------- */
function bar(x, y, w, h, v, col, label) {
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = col; if (v > .01) { rr(x, y, Math.max(h, w * clamp(v, 0, 1)), h, h / 2); ctx.fill(); }
  txt(label, x + 8, y + h - 4, 12, '#fff', 'left', 700);
}
function drawHUD() {
  bar(12, 12, 190, 20, S.life / 100, S.life > 35 ? '#ef4444' : '#b91c1c', '❤ জীবন ' + Math.round(S.life));
  bar(12, 38, 190, 16, S.stamina / 100, S.gripLocked ? '#6b7280' : '#22c55e', '✋ গ্রিপ' + (S.gripLocked ? ' (অবশ)' : ''));
  txt('পয়েন্ট ' + Math.max(0, Math.round(S.score)), W - 12, 28, 22, '#fff', 'right', 700, 'rgba(0,0,0,.55)');
  txt(Math.round(S.speed * 3.6) + ' কিমি/ঘ • হর্ন ' + S.honks, W - 12, 50, 14, '#fff', 'right', 600, 'rgba(0,0,0,.55)');
  if (S.deal) txt((S.rain ? '☔ ' : '') + 'ভাড়া ' + (S.deal.skip ? '?' : '৳' + S.deal.paid), W - 12, 68, 14, '#fde047', 'right', 700, 'rgba(0,0,0,.55)');
  // route strip
  const x0 = 270, x1 = 690, y = 26;
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  STAGES.forEach((s, i) => {
    const x = x0 + (x1 - x0) * i / 7;
    ctx.fillStyle = i <= S.stageIdx ? '#22c55e' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.stroke();
    txt(s.short, x, y + 24, 11, '#fff', 'center', 700, 'rgba(0,0,0,.6)');
  });
  const si = S.stageIdx, end = si === 7 ? FINISH : STAGES[si].at + SEG;
  const frac = clamp((S.dist - STAGES[si].at) / (end - STAGES[si].at), 0, 1);
  const px = x0 + (x1 - x0) * (si + frac) / 7;
  txt('🛺', px, y - 8, 20, '#fff', 'center');
  // balance gauge
  const gx = W / 2 - 110, gy = H - 30;
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(gx, gy, 220, 16, 8); ctx.fill();
  ctx.fillStyle = 'rgba(34,197,94,.6)'; ctx.fillRect(gx + 88, gy + 2, 44, 12);
  ctx.fillStyle = 'rgba(239,68,68,.55)'; ctx.fillRect(gx + 6, gy + 2, 22, 12); ctx.fillRect(gx + 192, gy + 2, 22, 12);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gx + 110 + clamp(S.a, -1, 1) * 98, gy + 8, 9, 0, 7); ctx.fill();
  txt('ব্যালান্স', W / 2, gy - 4, 12, '#fff', 'center', 700, 'rgba(0,0,0,.6)');
  if (S.hint > 0) {
    ctx.globalAlpha = clamp(S.hint, 0, 1);
    txt(isTouch() ? '✋ ধরো = সিট শক্ত করে ধরো  |  ◀ ▶ = ব্যালান্স  |  🐢 = ধীরে মামা' : 'SPACE = সিট ধরো  |  ← → = ব্যালান্স  |  ↓ = ধীরে মামা', W / 2, H - 56, 18, '#fff', 'center', 700, 'rgba(0,0,0,.65)');
    ctx.globalAlpha = 1;
  }
  if (S.banner) {
    const b = S.banner, a = clamp(Math.min(b.t * 4, (2.6 - b.t) * 3), 0, 1), dy = (1 - clamp(b.t * 5, 0, 1)) * -30;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(15,23,42,.7)'; rr(W / 2 - 190, 80 + dy, 380, 70, 14); ctx.fill();
    txt('📍 ' + b.text, W / 2, 116 + dy, 32, '#fde047', 'center', 700);
    txt(b.sub, W / 2, 140 + dy, 14, '#fff', 'center', 600);
    ctx.globalAlpha = 1;
  }
}

/* ---------- scene render ---------- */
function drawScene() {
  drawSky();
  drawFarLayer(.18, 70, 90, 200, .55, 1);
  drawFarLayer(.4, 52, 60, 140, .85, 9);
  A.wires(S.dir * S.dist * PPM * .9);
  drawRoadside();
  for (let i = 0; i < 8; i++) drawLandmark(i);
  drawGround();
  drawStreetLife();
  for (let i = 0; i < 8; i++) drawLandmarkFront(i);
  drawRoadObjs();
  drawOnc();
  S.vehs.forEach(v => drawVeh(v));
  drawPeds();
  if (S.mode === 'win' || S.dist >= FINISH - 4) {
    const fx = X(FINISH);
    ctx.fillStyle = '#fde047'; ctx.fillRect(fx - 3, 392, 6, 140);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(fx - 3, 392, 70 * -S.dir, 20);
  }
  drawMob();
  if (S.mode === 'stand') drawStand(); else drawAuto();
  drawParts();
  if (S.rain) drawRain();
}

/* ---------- death scene: notice banners in front of UIU ---------- */
function drawDeathScene() {
  const t = S.deathT;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e2235'); g.addColorStop(1, '#3a3f58');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(hash(i) * W, hash(i * 2) * 140, 2, 2); }
  // UIU building
  ctx.fillStyle = '#cbd5e1'; ctx.fillRect(120, 70, 720, 300);
  ctx.fillStyle = '#64748b'; ctx.fillRect(120, 70, 720, 36);
  txt('UIU — United International University', W / 2, 96, 22, '#fff', 'center', 700);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 17; c++) { ctx.fillStyle = hash(r * 13 + c) > .5 ? '#fde68a' : '#475569'; ctx.fillRect(138 + c * 41, 122 + r * 46, 28, 30); }
  ctx.fillStyle = '#334155'; ctx.fillRect(0, 370, W, 170);
  ctx.fillStyle = '#475569'; ctx.fillRect(0, 370, W, 12);
  // banners
  const name = S.name, place = placeOf(S.deathStage);
  const side = window.innerWidth >= window.innerHeight, sc = side ? .66 : 1;
  const fem = S.gender === 'f', late = fem ? 'মরহুমা' : 'মরহুম';
  const B = [
    { x: 24, t1: 'শোকবার্তা', body: `${name}-এর অকাল মৃত্যুতে ইউআইইউ পরিবার গভীরভাবে শোকাহত`, small: 'নতুন বাজার–ইউআইইউ পথে রিক্সার ঝাঁকুনিতে তিনি আমাদের ছেড়ে চলে গেছেন।' },
    { x: 500, t1: 'দোয়া প্রার্থনা', body: `${late} ${name}-এর রূহের মাগফিরাতের জন্য দোয়া প্রার্থনা করছি`, small: 'ইতি — ইউআইইউ পরিবার, ঢাকা' }
  ];
  B.forEach((b, i) => {
    const appear = clamp((t - .3 - i * .45) * 2.5, 0, 1); if (appear <= 0) return;
    const sw = Math.sin(S.t * 1.6 + i) * 1.2, bw = 430, bh = 250, by = 205 - (1 - appear) * 60;
    const bx = side ? 14 + i * (bw * sc + 10) : b.x;
    ctx.save(); ctx.globalAlpha = appear; ctx.translate(bx + bw * sc / 2, side ? by - 20 : by); ctx.scale(sc, sc); ctx.rotate(sw * .012);
    ctx.fillStyle = '#475569'; ctx.fillRect(-bw / 2 + 20, 0, 4, 165 + bh * .2); ctx.fillRect(bw / 2 - 24, 0, 4, 165 + bh * .2);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 8; rr(-bw / 2, 0, bw, bh, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(-bw / 2 + 10, 10, bw - 20, 52);
    txt(b.t1, 0, 49, 34, '#fff', 'center', 700);
    wrapText(b.body, 0, 108, bw - 40, 26, 34, '#111', 'center', 700);
    wrapText(b.small, 0, 190, bw - 40, 16, 21, '#333', 'center', 600);
    ctx.fillStyle = '#111'; ctx.fillRect(-bw / 2 + 10, bh - 28, bw - 20, 3);
    ctx.restore();
  });
  txt('* গেমের ব্যঙ্গ — কাল্পনিক; কোনো প্রকৃত নোটিশ বা ব্যক্তি নয়।', W / 2, 24, 13, 'rgba(255,255,255,.7)', 'center', 600);
  // candles + petals
  for (let i = 0; i < 9; i++) {
    const cx = 120 + i * 90, f = 1 + Math.sin(S.t * 8 + i) * .12;
    ctx.fillStyle = '#fef3c7'; ctx.fillRect(cx, 460, 10, 28);
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(cx + 5, 452, 4 * f, 9 * f, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(251,191,36,.18)'; ctx.beginPath(); ctx.arc(cx + 5, 455, 26, 0, 7); ctx.fill();
  }
  for (let i = 0; i < 26; i++) {
    const px = mod(hash(i) * W + Math.sin(S.t + i) * 30, W), py = mod(hash(i * 3) * H + S.t * 40 * (.5 + hash(i * 5)), H);
    ctx.fillStyle = i % 2 ? '#fda4af' : '#fde68a'; ctx.beginPath(); ctx.ellipse(px, py, 4, 2.5, S.t + i, 0, 7); ctx.fill();
  }
}

/* ---------- main render ---------- */
function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.save();
  if (S.mode === 'dead') { drawDeathScene(); ctx.restore(); return; }
  if (S.shake > 0) ctx.translate((Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake);
  if (S.mode === 'stand' && standLift) { ctx.translate(0, -standLift); ctx.fillStyle = '#374151'; ctx.fillRect(0, H - 2, W, standLift + 4); }
  drawScene();
  if (S.mode === 'play' || S.mode === 'dying' || S.mode === 'win') { drawBubbles(); drawHUD(); }
  if (S.mode === 'stand') drawBubbles();
  if (S.mode === 'win') {
    S.confetti.forEach(c => { ctx.fillStyle = c.c; ctx.fillRect(c.x, c.y, c.r, c.r * 1.6); });
    txt('🎓 পৌঁছে গেছ!', W / 2, 190, 44, '#fde047', 'center', 700, 'rgba(0,0,0,.6)');
  }
  if (S.mode === 'dying') txt('আআআআআ…!', W / 2, 200, 52, '#fff', 'center', 700, '#b91c1c');
  ctx.restore();
  if (S.flash > 0) { ctx.globalAlpha = clamp(S.flash, 0, 1) * .6; ctx.fillStyle = S.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

function ambient(dt) {
  S.t += dt; S.clock += dt;
  S.speed += clamp(7 - S.speed, -10 * dt, 5 * dt);
  S.dist += S.speed * dt; S.wheel += S.speed * dt * PPM / 19;
  S.bobV += (-S.bobY * 180 - S.bobV * 9) * dt; S.bobY += S.bobV * dt;
  if (Math.random() < dt * 1.5) S.bobV -= 40;
  S.bobY = clamp(S.bobY, -10, 10); S.tilt = S.bobY * .004;
  S.shake = Math.max(0, S.shake - 25 * dt); S.flash = Math.max(0, S.flash - 2.2 * dt);
  S.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt; });
  S.parts = S.parts.filter(p => p.life > 0);
  S.vehs = []; S.objs = [];
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (document.body.classList.contains('needrot')) { /* waiting for the phone to be rotated */ }
  else if (S.mode === 'play') update(dt);
  else if (S.mode === 'stand') standTick(dt);
  else if (S.mode === 'dying') {
    S.deathT += dt; S.t += dt; S.flash = Math.max(0, S.flash - 1.5 * dt); S.shake = Math.max(0, S.shake - 25 * dt);
    S.speed *= Math.exp(-3 * dt); S.dist += S.speed * dt;
    S.pend.forEach(q => q.t -= dt); for (let i = S.pend.length - 1; i >= 0; i--) if (S.pend[i].t <= 0) { const f = S.pend[i].fn; S.pend.splice(i, 1); f(); }
    if (S.deathT > 2.8) { S.mode = 'dead'; S.deathT = 0; finishUi(false); }
  } else if (S.mode === 'dead') { S.deathT += dt; S.t += dt; }
  else if (S.mode === 'win') {
    S.t += dt; S.speed *= Math.exp(-1.2 * dt); S.dist += S.speed * dt; S.wheel += S.speed * dt * PPM / 19;
    S.bubbles.forEach(b => b.t += dt); S.bubbles = S.bubbles.filter(b => b.t < b.life);
    S.confetti.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; if (c.y > H) c.y = -10; });
    S.flash = Math.max(0, S.flash - 2 * dt);
  } else ambient(dt);
  if (AC && engG && S.mode !== 'play') engG.gain.setTargetAtTime(0, AC.currentTime, .1);
  render();
  requestAnimationFrame(frame);
}

/* ---------- fare haggling at the stand (spoken; the student answers with buttons) ---------- */
const HG = L.haggle;
const FARE = { name: 'বন্ধু', gender: 'm', boarding: 'natun', weather: 'auto', rain: false, driver: null, deal: null, busy: false, idx: 0, drivers: [] };
const MAX_DRIVERS = 7;
const r5 = v => Math.round(v / 5) * 5;
const bnum = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const fmt = (s, p) => s.replace(/\{p\}/g, bnum(p));
const fairOf = (b, rain) => rain ? b.rain : b.dry;
const fairTxt = d => d.lo === d.hi ? '' + d.lo : d.lo + '–' + d.hi;
const boardingOf = id => BOARDINGS.find(x => x.id === id) || BOARDINGS[0];
// a jumble of rickshaws parked bumper to bumper (screen slots; visited front to back)
const SLOTS = [
  { x: 585, y: GY + 16, sc: 1.0 }, { x: 650, y: GY - 12, sc: .9 }, { x: 710, y: GY + 18, sc: 1.0 }, { x: 775, y: GY - 14, sc: .9 },
  { x: 835, y: GY + 12, sc: .98 }, { x: 895, y: GY - 10, sc: .9 }, { x: 945, y: GY + 16, sc: .96 }
];
const slotTarget = i => SLOTS[i].x - 104 * SLOTS[i].sc;

function newDriver(b, rain) {
  const f = fairOf(b, rain), lo = f[0], hi = f[1], kind = Math.random() < .3;
  const ask = kind ? hi : r5(hi + (rain ? rand(15, 30) : rand(10, 20)));
  const min = kind ? lo : r5(rand(lo, hi + 5));
  return {
    lo, hi, kind, ask, ask0: ask, min: Math.min(min, ask), rounds: 0, patience: 4, final: false, gone: false,
    look: { col: pick(A.FRAME), seed: Math.random() * 100, skin: pick(['#c68a5a', '#a86f45', '#d8a276']), cap: Math.random() < .5 ? '#e5e7eb' : null, mask: Math.random() < .3, lungi: pick(['#2563eb', '#16a34a', '#b91c1c', '#7c3aed']), shirt: pick(['#f1e4c8', '#cbd5e1', '#fde68a', '#bbf7d0']) }
  };
}
function respond(d, offer) {
  if (offer >= d.ask) return { r: 'accept', price: d.ask };
  if (offer >= d.min) return { r: 'accept', price: offer };
  if (offer < d.lo * .6 || d.final) return { r: 'refuse' };
  d.rounds++;
  if (d.rounds >= d.patience) { d.final = true; d.ask = d.min; return { r: 'counter', price: d.min, final: true }; }
  let na = r5(Math.max(d.min, (d.ask + offer) / 2));
  if (na >= d.ask) na = Math.max(d.min, d.ask - 5);
  d.ask = na; return { r: 'counter', price: na };
}
function runPend(dt) {
  for (let i = S.pend.length - 1; i >= 0; i--) { S.pend[i].t -= dt; if (S.pend[i].t <= 0) { const f = S.pend[i].fn; S.pend.splice(i, 1); f(); } }
}
// plays a short spoken exchange one line at a time (waits for the voice to finish)
function seq(steps, done) {
  FARE.busy = true; setFareButtons();
  const my = S;
  const run = i => {
    if (S !== my || S.mode !== 'stand') return;
    if (i >= steps.length) { FARE.busy = false; setFareButtons(); if (done) done(); return; }
    const who = steps[i][0], text = steps[i][1], dur = text.length * .07 + .9;
    let fired = false;
    const next = () => { if (fired) return; fired = true; later(.25, () => run(i + 1)); };
    say(who, text, { speak: false, life: dur + .5 });
    const spoke = speak(text, who, true, next);
    later(spoke ? text.length * .25 + 4 : dur, next);
  };
  run(0);
}
function updateOffer() { $('offerVal').textContent = '৳' + $('offer').value; }
function setFareButtons() {
  const d = FARE.driver, free = !FARE.busy && !FARE.deal && !!d && !d.gone;
  ['offerBtn', 'payBtn', 'muchBtn', 'poorBtn', 'stuBtn', 'skipBtn'].forEach(id => { $(id).disabled = !free; });
  $('offer').disabled = !free;
  $('payBtn').textContent = d && !d.gone ? `✅ ৳${d.ask}-এ রাজি` : '✅ রাজি';
  const left = MAX_DRIVERS - 1 - FARE.idx;
  $('nextBtn').disabled = FARE.busy || !!FARE.deal || left <= 0;
  $('nextBtn').textContent = `↪ অন্য রিক্সা (${Math.max(0, left)})`;
}
function askLine(d) {
  const f = d.kind ? fmt(pick(HG.kind), d.ask) : fmt(pick(FARE.rain ? HG.askRain : HG.ask), d.ask);
  return !d.kind && Math.random() < .45 ? f + ' ' + pick(HG.reasons) : f;
}
function onArrive() {
  const d = FARE.driver, first = FARE.idx === 0, steps = [];
  if (!first) steps.push(['driver', pick(HG.calls)]);
  steps.push(['driver', pick(HG.where)], ['player', pick(HG.dest)], ['driver', askLine(d)]);
  const f = fairOf(boardingOf(FARE.boarding), FARE.rain);
  if (d.ask > f[1] + 10 && Math.random() < .6) steps.push(['player', pick(HG.playerOvercharge)]);
  seq(steps);
}
function showFareInfo() {
  const b = boardingOf(FARE.boarding), f = fairOf(b, FARE.rain);
  $('fareTitle').textContent = `${b.bn} রিক্সা স্ট্যান্ড → ইউআইইউ`;
  $('fareInfo').textContent = (FARE.rain ? '☔ বৃষ্টি' : '☀️ রোদ') + ' • ন্যায্য ভাড়া ৳' + (f[0] === f[1] ? f[0] : f[0] + '–' + f[1]);
}
function openFare() {
  const b = boardingOf(FARE.boarding);
  FARE.rain = FARE.weather === 'rain' || (FARE.weather === 'auto' && Math.random() < .4);
  FARE.deal = null; FARE.busy = false;
  $('menu').classList.add('hidden'); $('end').classList.add('hidden'); document.body.classList.remove('ended'); document.body.classList.add('playing');
  $('fare').classList.remove('hidden'); layout();
  S = newState(); S.mode = 'stand'; S.rain = FARE.rain; S.dist = b.at; S.camX = 300; S.stageIdx = stageOf(b.at); S.name = FARE.name; S.gender = FARE.gender;
  layout();
  FARE.drivers = Array.from({ length: MAX_DRIVERS }, () => newDriver(b, FARE.rain)); FARE.idx = 0; FARE.driver = FARE.drivers[0];
  S.stand = { px: -60, py: GY + 34, state: 'walk', idx: 0, bt: 0, callT: 7, walking: true, boarded: -1, hop: 0 };
  const sl = $('offer'); sl.max = 120; sl.value = Math.max(10, fairOf(b, FARE.rain)[0]); updateOffer();
  showFareInfo(); setFareButtons();
}
let standLift = 0;
function calcLift() {
  standLift = 0;
  if (typeof document.querySelector !== 'function') return;
  const card = document.querySelector('#fare .card'); if (!card || !cv.getBoundingClientRect) return;
  const cr = cv.getBoundingClientRect(), br = card.getBoundingClientRect();
  if (!cr.height || !br.height) return;
  const k = H / cr.height, topL = (br.top - cr.top) * k, rightL = (br.right - cr.left) * k;
  if (br.top >= cr.bottom - 2 || rightL < 440) return;
  standLift = clamp(536 - topL, 0, 240);
}
function standTick(dt) {
  S.t += dt; S.clock += dt; S.speed = 0;
  S.liftT = (S.liftT || 0) - dt; if (S.liftT <= 0) { S.liftT = .4; calcLift(); }
  runPend(dt);
  S.bubbles.forEach(b => b.t += dt); S.bubbles = S.bubbles.filter(b => b.t < b.life);
  const st = S.stand; if (!st) return;
  if (st.state === 'walk') {
    const tx = slotTarget(st.idx), dx = tx - st.px, step = 150 * dt;
    st.walking = true;
    if (Math.abs(dx) <= step) { st.px = tx; st.walking = false; st.state = 'talk'; onArrive(); } else st.px += Math.sign(dx) * step;
  } else if (st.state === 'talk') {
    st.callT -= dt;
    if (st.callT <= 0 && !FARE.busy && !FARE.deal) {
      st.callT = rand(9, 14);
      const j = Math.min(SLOTS.length - 1, st.idx + 1 + Math.floor(Math.random() * 3)), sl = SLOTS[j];
      say('rick', pick(HG.calls), { life: 2.6, ref: { sx: sl.x + 33 * sl.sc, sy: sl.y - 128 * sl.sc } });
    }
  } else if (st.state === 'board') {
    st.bt += dt;
    if (st.bt > 1.55 && st.state === 'board') { st.state = 'seated'; st.bt = 0; }
  } else if (st.state === 'seated') {
    st.bt += dt; if (st.bt > .55 && !st.go) { st.go = true; beginRide(); }
  }
}
function drawStand() {
  const st = S.stand; if (!st) return;
  A.rickStand(X(S.dist + 760 / PPM), SIDEY + 44, boardingOf(FARE.boarding).bn + ' রিক্সা স্ট্যান্ড', 5, 0, null);
  const order = SLOTS.map((_, i) => i).sort((a, b) => SLOTS[a].y - SLOTS[b].y);
  for (const i of order) {
    const sl = SLOTS[i], d = FARE.drivers[i], lk = d.look;
    A.rickshaw(sl.x, sl.y, sl.sc, { col: lk.col, seed: lk.seed, t: S.t, wa: 0, puller: true, skin: lk.skin, cap: lk.cap, mask: lk.mask, lungi: lk.lungi, shirt: lk.shirt, plate: i % 2 ? 'টেসলা' : null, pass: st.boarded === i && (st.state === 'seated') });
  }
  const sl = SLOTS[st.idx];
  if (st.state !== 'seated') {
    let x = st.px, y = st.py, hop = 0;
    if (st.state === 'board') {
      const u = clamp((st.bt - .35) / .9, 0, 1);
      const sx = sl.x - 40 * sl.sc, sy = sl.y - 52 * sl.sc;
      x = st.px + (sx - st.px) * u; y = st.py + (sy - st.py) * u; hop = Math.sin(Math.PI * u) * 34;
    }
    A.person(x, y - hop, 1.05, { shirt: FARE.gender === 'f' ? '#ec4899' : '#3b82f6', pants: '#334155', skin: '#e0b48a', ph: st.walking ? S.t * 9 : (st.state === 'board' ? S.t * 12 : 0), dir: 1, bag: '#f59e0b', long: FARE.gender === 'f' });
  }
}
function startBoarding(price, skip) {
  const st = S.stand; st.state = 'board'; st.bt = 0; st.boarded = st.idx; FARE.busy = true; setFareButtons();
}
function finishDeal(price, skip) {
  const d = FARE.driver;
  const mood = (!skip && !d.kind && price <= d.lo && d.ask0 - price >= 20) ? 'angry' : (!skip && price >= d.hi + 10) ? 'happy' : 'ok';
  FARE.deal = { paid: price, ask0: d.ask0, lo: d.lo, hi: d.hi, rain: FARE.rain, at: boardingOf(FARE.boarding).at, boarding: FARE.boarding, mood, skip: !!skip };
  d.gone = true;
  if (S && S.mode === 'stand') startBoarding(price, skip);
}
function driverLeaves() {
  const d = FARE.driver; d.gone = true;
  if (FARE.idx >= MAX_DRIVERS - 1) { // nobody else around: he calls you back
    d.gone = false; d.final = true; d.ask = d.min;
    seq([['driver', fmt(pick(HG.last), d.min)]]);
  } else seq([['driver', pick(settings.abuse && Math.random() < .5 ? HG.refuseRude : HG.refuse)]]);
}
function onOffer() {
  const d = FARE.driver; if (!d || d.gone || FARE.deal || FARE.busy) return;
  const off = +$('offer').value, res = respond(d, off), pl = ['player', fmt(pick(HG.playerCounter), off)];
  if (res.r === 'accept') { seq([pl, ['driver', pick(HG.accept)]], () => finishDeal(res.price)); return; }
  if (res.r === 'refuse') { seq([pl]); later(0, () => {}); const dd = d; setTimeout0(() => { if (FARE.driver === dd) driverLeaves(); }, pl[1]); return; }
  seq([pl, ['driver', fmt(pick(res.final ? HG.final : HG.counter), res.price)]]);
}
const setTimeout0 = (fn, txt) => later(txt.length * .07 + 2.2, fn);
function plead(kind) {
  const d = FARE.driver; if (!d || d.gone || FARE.deal || FARE.busy) return;
  const say1 = ['player', pick(HG['say' + kind])];
  if (d.final || d.ask <= d.min) { seq([say1, ['driver', pick(HG.noMore)]]); return; }
  const chance = d.kind ? .95 : kind === 'Much' ? .6 : kind === 'Poor' ? .55 : .5;
  d.rounds++;
  if (Math.random() < chance) {
    let na = r5(Math.max(d.min, d.ask - (kind === 'Much' ? rand(5, 15) : rand(5, 10))));
    if (na >= d.ask) na = Math.max(d.min, d.ask - 5);
    d.ask = na; if (d.rounds >= d.patience) { d.final = true; }
    seq([say1, ['driver', fmt(pick(HG[kind.toLowerCase() + 'Ok'] || HG.muchOk), na)]]);
  } else {
    if (d.rounds >= d.patience) { d.final = true; d.ask = d.min; }
    seq([say1, ['driver', pick(HG[kind.toLowerCase() + 'No'] || HG.muchNo)]]);
  }
}
function onNextAuto() {
  if (FARE.busy || FARE.deal || FARE.idx >= MAX_DRIVERS - 1) return;
  seq([['player', pick(HG.sayNext)], ['driver', pick(HG.leave)]], () => {
    FARE.idx++; FARE.driver = FARE.drivers[FARE.idx]; S.stand.idx = FARE.idx; S.stand.state = 'walk'; S.stand.callT = 10;
    $('offer').value = Math.max(10, FARE.driver.lo); updateOffer(); setFareButtons();
  });
}
function onSkip() {
  const d = FARE.driver; if (!d || d.gone || FARE.deal || FARE.busy) return;
  seq([['player', pick(HG.sayGo)], ['driver', pick(HG.goOk)]], () => finishDeal(r5(rand(d.lo, d.ask0)), true));
}

/* ---------- tutorial, fullscreen, layout ---------- */
const TUT = () => {
  const t = isTouch();
  return [
    ['🛺', 'যাত্রা শুরু!', 'নতুন বাজার থেকে ইউআইইউ — ভাঙা রাস্তা, গর্ত, জ্যাম আর হকারের ভিড় পেরিয়ে অটোর সিট ধরে বেঁচে পৌঁছাও।'],
    ['✋', 'সিট ধরো', t ? 'ডানদিকের সবুজ <b>✋ ধরো</b> বাটন চেপে ধরে রাখো। গর্তে পড়ার ঠিক আগে ধরো — নইলে ঝাঁকুনিতে ছিটকে পড়বে। ধরে রাখলে স্ট্যামিনা কমে!' : '<b>SPACE</b> চেপে ধরে রাখো। গর্তে পড়ার ঠিক আগে ধরো — নইলে ঝাঁকুনিতে ছিটকে পড়বে। ধরে রাখলে স্ট্যামিনা কমে!'],
    ['⚖️', 'ব্যালান্স', t ? 'বাঁয়ের <b>◀ ▶</b> বাটনে উল্টো দিকে কাত হয়ে ব্যালান্স রাখো। নিচের মিটার সবুজ অংশে রাখো।' : '<b>← →</b> (বা A / D) দিয়ে উল্টো দিকে কাত হয়ে ব্যালান্স রাখো। নিচের মিটার সবুজ অংশে রাখো।'],
    ['🐢', 'ধীরে মামা!', (t ? '<b>🐢 ধীরে</b> বাটন' : '<b>↓</b> (বা S)') + ' চেপে সামনের গাড়ি আর রাস্তা-পার-হওয়া মানুষের সাথে গুঁতা এড়াও। মানুষকে মারলে জনতা তাড়া করবে — তখন থেমো না!'],
    ['💰', 'দরদাম', 'স্ট্যান্ডে মামার সাথে কথা বলে ভাড়া ঠিক করো — দর বলো, “গরিব মানুষ মামা” বা “এখনো বিয়ে করি নাই” বলে অনুরোধ করো। চাইলে ভাড়া না ঠিক করেই উঠে পড়তে পারো, কিন্তু নামার সময় কত লাগে কে জানে!']
  ];
};
let tutI = 0, tutDone = null;
function showTutorial(done) {
  tutDone = done || null; tutI = 0; $('menu').classList.add('hidden'); $('tut').classList.remove('hidden'); renderTut();
}
function renderTut() {
  const sl = TUT(), s = sl[tutI];
  $('tutBody').innerHTML = `<div class="tutIcon">${s[0]}</div><h2>${s[1]}</h2><p>${s[2]}</p>`;
  $('tutDots').innerHTML = sl.map((_, i) => `<i class="${i === tutI ? 'on' : ''}"></i>`).join('');
  $('tutNext').textContent = tutI === sl.length - 1 ? 'চলো খেলি! ▶' : 'পরের ▶';
  $('tutPrev').style.visibility = tutI ? 'visible' : 'hidden';
}
function endTutorial() {
  store.set('tm_tut', '1'); $('tut').classList.add('hidden');
  const f = tutDone; tutDone = null;
  if (f) f(); else $('menu').classList.remove('hidden');
}
function goFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      const p = el.requestFullscreen(); if (p && p.catch) p.catch(() => {});
      if (isTouch() && screen.orientation && screen.orientation.lock) { const q = screen.orientation.lock('landscape'); if (q && q.catch) q.catch(() => {}); }
    }
  } catch (e) { /* ignore */ }
}
function toggleFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else goFullscreen();
  } catch (e) { /* ignore */ }
}
let rotSkipped = false;
function layout() {
  resize();
  const b = document.body; if (!b || !b.classList) return;
  const touch = isTouch(), land = window.innerWidth >= window.innerHeight;
  b.classList.toggle('touch', touch); b.classList.toggle('land', land); b.classList.toggle('port', !land);
  b.classList.toggle('riding', !!S && (S.mode === 'play' || S.mode === 'dying'));
  b.classList.toggle('needrot', touch && !land && !rotSkipped && b.classList.contains('playing'));
  try { document.documentElement.style.setProperty('--stageBottom', cv.getBoundingClientRect().bottom + 'px'); } catch (e) { /* ignore */ }
}

/* ---------- input ---------- */
function setKey(e, down) {
  const k = e.key;
  let used = true;
  if ((k === 'f' || k === 'F') && down) { toggleFullscreen(); return; }
  if (k === ' ' || k === 'Spacebar') inp.grip = down;
  else if (k === 'ArrowLeft' || k === 'a' || k === 'A') inp.left = down;
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') inp.right = down;
  else if (k === 'ArrowDown' || k === 's' || k === 'S') inp.slow = down;
  else if ((k === 'm' || k === 'M') && down) { settings.mute = !settings.mute; if (settings.mute && 'speechSynthesis' in window) speechSynthesis.cancel(); }
  else used = false;
  if (used && S && S.mode === 'play') e.preventDefault();
}
window.addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; setKey(e, true); });
window.addEventListener('keyup', e => setKey(e, false));
window.addEventListener('blur', () => { inp.grip = inp.left = inp.right = inp.slow = false; });
function hold(id, key) {
  const el = $(id); if (!el) return;
  const on = e => { e.preventDefault(); inp[key] = true; audioInit(); el.classList.add('down'); try { el.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } if (navigator.vibrate) navigator.vibrate(8); };
  const off = e => { e.preventDefault(); inp[key] = false; el.classList.remove('down'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
if (document.addEventListener) ['gesturestart', 'gesturechange', 'dblclick'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
if (document.documentElement && !document.documentElement.requestFullscreen && $('fsBtn') && $('fsBtn').classList) $('fsBtn').classList.add('hidden');
hold('bG', 'grip'); hold('bL', 'left'); hold('bR', 'right'); hold('bS', 'slow');
$('startBtn').addEventListener('click', startGame);
$('retryBtn').addEventListener('click', openFare);
$('offerBtn').addEventListener('click', onOffer);
$('payBtn').addEventListener('click', () => { const d = FARE.driver; if (!d || d.gone || FARE.deal || FARE.busy) return; const price = d.ask; seq([['player', pick(HG.sayAccept)], ['driver', pick(HG.accept)]], () => finishDeal(price)); });
$('muchBtn').addEventListener('click', () => plead('Much'));
$('poorBtn').addEventListener('click', () => plead('Poor'));
$('stuBtn').addEventListener('click', () => plead('Student'));
$('skipBtn').addEventListener('click', onSkip);
$('nextBtn').addEventListener('click', onNextAuto);
$('offer').addEventListener('input', updateOffer);
$('genBtns').addEventListener('click', e => { const t = e.target; if (!t || !t.dataset || !t.dataset.g) return; FARE.gender = t.dataset.g; store.set('tm_gender', t.dataset.g); Array.from($('genBtns').children).forEach(c => c.classList.toggle('on', c === t)); });
$('boardBtns').addEventListener('click', e => { const t = e.target; if (!t || !t.dataset || !t.dataset.b) return; FARE.boarding = t.dataset.b; Array.from($('boardBtns').children).forEach(c => c.classList.toggle('on', c === t)); });
window.addEventListener('resize', layout); window.addEventListener('orientationchange', () => setTimeout(layout, 200));
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(layout).observe(cv);
$('tutBtn').addEventListener('click', () => showTutorial(null));
$('tutNext').addEventListener('click', () => { if (tutI >= TUT().length - 1) endTutorial(); else { tutI++; renderTut(); } });
$('tutPrev').addEventListener('click', () => { if (tutI > 0) { tutI--; renderTut(); } });
$('tutSkip').addEventListener('click', endTutorial);
$('fsBtn').addEventListener('click', toggleFullscreen);
$('rotSkip').addEventListener('click', () => { rotSkipped = true; layout(); });
$('subsChk').addEventListener('change', e => { subsTouched = true; settings.subs = e.target.checked; });
$('weatherBtns').addEventListener('click', e => { const t = e.target; if (!t || !t.dataset || !t.dataset.w) return; $('weatherSel').value = t.dataset.w; Array.from($('weatherBtns').children).forEach(c => c.classList.toggle('on', c === t)); });
$('menuBtn').addEventListener('click', toMenu);
$('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
$('voiceChk').addEventListener('change', e => { settings.voice = e.target.checked; });

/* ---------- boot ---------- */
S = newState();
const savedName = store.get('tm_name'); if (savedName) $('nameInput').value = savedName;
CTRL.mode = ['manual', 'tilt', 'auto'].includes(store.get('tm_ctrl')) ? store.get('tm_ctrl') : 'manual';
$('invChk').checked = store.get('tm_inv') === '1';
Array.from($('ctrlBtns').children).forEach(c => c.classList.toggle('on', c.dataset.c === CTRL.mode));
$('ctrlBtns').addEventListener('click', e => { const t = e.target; if (!t || !t.dataset || !t.dataset.c) return; CTRL.mode = t.dataset.c; store.set('tm_ctrl', CTRL.mode); Array.from($('ctrlBtns').children).forEach(c => c.classList.toggle('on', c === t)); if (CTRL.mode === 'tilt') enableTilt(); $('ctrlNote').textContent = CTRL_NOTE[CTRL.mode]; });
const CTRL_NOTE = { manual: 'বাটন বা কিবোর্ড: ◀ ▶ হেলাও, ✋ ধরো, 🐢 ধীরে।', tilt: 'ফোন ডানে-বামে কাত করলে অটো হেলবে। ফোনের উপরের দিক নিজের দিকে টানলে হাত ধরবে, দূরে ঠেললে ধীরে চলবে। উল্টো মনে হলে "উল্টো" টিক দাও।', auto: 'গেম নিজেই ব্যালান্স রাখবে। শুধু দরকারে ✋ আর 🐢 চাপো — সবচেয়ে সহজ।' };
$('ctrlNote').textContent = CTRL_NOTE[CTRL.mode];
FARE.gender = store.get('tm_gender') === 'f' ? 'f' : 'm';
Array.from($('genBtns').children).forEach(c => c.classList.toggle('on', c.dataset && c.dataset.g === FARE.gender));
const best = store.get('tm_best'); $('bestNote').textContent = best ? 'সর্বোচ্চ স্কোর: ' + best : '';
requestAnimationFrame(frame);

layout();
// exposed for headless tests only
window.__tm = { CTRL, onTilt, get S() { return S; }, update, render, startGame, beginRide, openFare, inp, FARE, BOARDINGS, newDriver, respond, finishDeal, resize, layout, updateWorld, hitPed, startWrong, AMB, NAMED, standTick, plead, onOffer, onNextAuto, onSkip, SLOTS };
})();
