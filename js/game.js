/* টেসলা মামা: সিট ধরে রাখো! — Natun Bazar → UIU
   Plain canvas game, no build step. */
(() => {
'use strict';
const L = window.LINES;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const W = 960, H = 540;
cv.width = W; cv.height = H;

const PPM = 40;          // pixels per metre
const GY = 492;          // ground line for vehicles
const SIDEY = 384;       // sidewalk top (building bases)
const SEG = 330;         // metres per stage
const FONT = '"Hind Siliguri","Noto Sans Bengali",sans-serif';

const STAGES = [
  { bn: 'নতুন বাজার',          short: 'নতুনবাজার', en: 'Natun Bazar',  sky: ['#ffb36b', '#ffe6a8'], rough: 1.0, puddle: .15 },
  { bn: 'ফ্যামিলি বাজার',      short: 'ফ্যামিলি',  en: 'Family Bazar', sky: ['#7ec8ff', '#dff4ff'], rough: 1.1, puddle: .20 },
  { bn: 'সাহেবনগর',           short: 'সাহেবনগর', en: 'Sahebnagar',   sky: ['#59b8ff', '#c8efff'], rough: 1.5, puddle: .45 },
  { bn: 'দশতলা',              short: 'দশতলা',    en: '10 Tola',      sky: ['#4aa8ff', '#bfe9ff'], rough: 1.4, puddle: .30 },
  { bn: 'ভিটামিন গেট',         short: 'ভিটামিন',  en: 'Vitamin Gate', sky: ['#6cb4ff', '#ffeec2'], rough: 1.3, puddle: .25 },
  { bn: 'শেষ টেবিল (ইউ-টার্ন)', short: 'ইউ-টার্ন',  en: 'U-turn',       sky: ['#ff9a62', '#ffd9a0'], rough: 1.2, puddle: .20 },
  { bn: 'মসজিদ আল মুস্তাফা',    short: 'মসজিদ',    en: 'Al Mustafa',   sky: ['#c77dff', '#ffc2d6'], rough: 1.1, puddle: .15 },
  { bn: 'ইউআইইউ',             short: 'UIU',      en: 'UIU',          sky: ['#ff7aa2', '#ffd27a'], rough: .6,  puddle: .05 }
];
STAGES.forEach((s, i) => s.at = i * SEG);
const FINISH = 7 * SEG + 140;
const LM = STAGES.map((s, i) => i < 7 ? i * SEG + 140 : FINISH + 8); // landmark centres (m)
const UTURN_AT = 5 * SEG + 150;
const UTURN_DUR = 3.2;

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

/* ---------- audio (synthesised; nothing downloaded) ---------- */
const settings = { voice: true, mute: false };
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
let bnVoice = null;
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  bnVoice = vs.find(v => /^bn/i.test(v.lang)) || null;
  const el = $('voiceNote');
  if (el) el.textContent = bnVoice ? 'বাংলা ভয়েস পাওয়া গেছে: ' + bnVoice.name
    : 'এই ডিভাইসে বাংলা TTS ভয়েস নেই — শুধু বাবল ও সাউন্ড ইফেক্ট চলবে।';
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speak(text, who, force) {
  if (!settings.voice || settings.mute || !bnVoice || !('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking && !force) return;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = bnVoice; u.lang = bnVoice.lang; u.rate = 1.05;
  u.pitch = who === 'driver' ? .75 : who === 'other' ? .55 : 1.2;
  if (force) speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------- state ---------- */
let S = null;
const inp = { grip: false, left: false, right: false, slow: false };
const VT = {
  car: { len: 4.4, v: [6, 9] },
  bus: { len: 9, v: [5, 7.5] },
  rick: { len: 2.6, v: [3, 4.2] },
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
    wheel: 0, deathT: 0, cause: '', name: '', hint: 9, confetti: []
  };
}

function say(who, text, opts) {
  opts = opts || {};
  S.bubbles.push({ who, text, t: 0, life: opts.life || 2.8, ref: opts.ref || null });
  if (S.bubbles.length > 5) S.bubbles.shift();
  if (opts.speak) speak(text, who, opts.force);
}
function later(t, fn) { S.pend.push({ t, fn }); }
function jolt(mag, sign) {
  sign = sign || (Math.random() < .5 ? -1 : 1);
  S.va += sign * mag * (S.gripping ? .32 : 1);
  S.bobV -= 60 * Math.min(1.5, mag);
  S.shake = Math.max(S.shake, Math.min(8, mag * 3));
}
function inSafeZone(x) { return (x > UTURN_AT - 25 && x < UTURN_AT + 45) || x > FINISH - 15; }
function stageOf(x) { return Math.min(7, Math.max(0, Math.floor(x / SEG))); }

function spawnRoad(x) {
  if (inSafeZone(x)) return;
  const st = STAGES[stageOf(x)], r = Math.random();
  let type = 'pothole', w = rand(1.6, 3);
  if (r < st.puddle) { type = 'puddle'; w = rand(4, 7); }
  else if (r < st.puddle + .22) { type = 'breaker'; w = 1.6; }
  S.objs.push({ type, x, w, done: false });
}
function spawnVeh(x) {
  if (inSafeZone(x)) return;
  const type = pick(['car', 'car', 'bus', 'rick', 'rick', 'cng']), d = VT[type];
  S.vehs.push({
    type, x, len: d.len, v: rand(d.v[0], d.v[1]), hit: false, leaving: false, yoff: 0, tail: 0,
    exit: S.clock + rand(7, 11), col: pick(VCOL), seed: Math.random() * 100
  });
}

/* ---------- game flow ---------- */
function startGame() {
  audioInit();
  const name = ($('nameInput').value || '').trim() || 'বন্ধু';
  store.set('tm_name', name);
  S = newState(); S.mode = 'play'; S.name = name;
  settings.voice = $('voiceChk').checked;
  $('menu').classList.add('hidden'); $('end').classList.add('hidden');
  const l = pick(L.start);
  say('driver', l, { speak: true, force: true });
  later(1.4, () => say('player', pick(L.playerIdle), { speak: true }));
  S.banner = { text: STAGES[0].bn, sub: 'যাত্রা শুরু!', t: 0 };
}
function toMenu() {
  S = newState(); $('end').classList.add('hidden'); $('menu').classList.remove('hidden');
  const b = store.get('tm_best'); $('bestNote').textContent = b ? 'সর্বোচ্চ স্কোর: ' + b : '';
}
function die(cause) {
  if (S.mode !== 'play') return;
  S.mode = 'dying'; S.deathT = 0; S.cause = cause; S.deathStage = S.stageIdx;
  S.flash = 1; S.flashCol = '#ef4444'; sfx.die();
  say('player', pick(L.nearFall), { speak: true, force: true, life: 1.8 });
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
    ['গুঁতা', S.hits], ['হর্ন', S.honks], ['নিখুঁত গ্রিপ', S.goodGrips]
  ];
  $('endTitle').textContent = won
    ? `🎓 ${S.name}, ইউআইইউতে পৌঁছে গেছ!` : `💀 ${S.name} আর নেই…`;
  let rating = '';
  if (won) rating = S.score > 6500 ? 'রেটিং: ⭐⭐⭐ টেসলা-মাস্টার!' : S.score > 4500 ? 'রেটিং: ⭐⭐ পাকা যাত্রী' : 'রেটিং: ⭐ কোনোমতে টিকে গেছ';
  $('endBody').innerHTML = '<table>' + rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</table>' +
    (rating ? `<p>${rating}</p>` : `<p>মৃত্যুস্থান: ${placeOf(S.deathStage)}</p>`);
  const el = $('end');
  el.classList.remove('hidden'); el.classList.add('low');
}
function placeOf(i) { return i === 5 ? 'শেষ টেবিলের ইউ-টার্ন' : STAGES[i].bn + ' এলাকা'; }

/* ---------- update ---------- */
function update(dt) {
  S.t += dt; S.clock += dt; S.hint -= dt;
  const prog = clamp(S.dist / FINISH, 0, 1);
  S.honkCool -= dt; S.warnCool -= dt; S.recover -= dt; S.nearT -= dt;

  // delayed callbacks
  for (let i = S.pend.length - 1; i >= 0; i--) { S.pend[i].t -= dt; if (S.pend[i].t <= 0) { const f = S.pend[i].fn; S.pend.splice(i, 1); f(); } }

  // speed
  const cruise = 12.5 + 5 * prog;
  let target = inp.slow ? 5.5 : cruise;
  if (S.uturn.state === 1) target = 6;
  if (S.recover > 0) target = Math.min(target, 7);
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
  if (inp.grip && !S.gripLocked && S.stamina > 0) {
    if (!S.gripping) sfx.grip();
    S.gripping = true; S.stamina -= 20 * dt;
    if (S.stamina <= 0) { S.stamina = 0; S.gripLocked = true; S.gripping = false; say('player', 'হাত অবশ হয়ে গেল!', { life: 1.6 }); }
  } else {
    S.gripping = false;
    S.stamina = Math.min(100, S.stamina + (inp.grip ? 4 : 14) * dt);
    if (S.gripLocked && S.stamina >= 30) S.gripLocked = false;
  }

  // balance physics
  const lean = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const rough = STAGES[S.stageIdx].rough;
  let ac = .9 * S.a + lean * (S.gripping ? 2.4 : 4.4);
  ac += (Math.random() - .5) * .5 * rough * (S.speed / 15) * 4;
  if (S.gripping) ac -= S.a * 5;
  if (u.state === 1) ac += u.sign * 3.8 * Math.sin(Math.PI * clamp(u.t / UTURN_DUR, 0, 1));
  S.va += ac * dt;
  S.va *= Math.exp(-(S.gripping ? 7 : 2.2) * dt);
  S.a += S.va * dt;
  if (Math.abs(S.a) > .8 && S.nearT <= 0 && S.recover <= 0) {
    S.nearT = 3; say('player', pick(L.nearFall), { speak: true, life: 1.8 });
  }
  if (Math.abs(S.a) >= 1 && S.recover <= 0) {
    S.falls++; S.life -= 25; S.a = 0; S.va = 0; S.recover = 1.6; S.score -= 40;
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

function honk() {
  S.honkCool = 1.2; S.honks++; S.score -= 5; sfx.horn();
  say('driver', pick(L.honk), { life: 1 });
  jolt(.25);
  if (S.honks > 10 && S.honks % 3 === 0) {
    S.life -= 3; say('player', pick(L.honkFine), { speak: true, life: 2.2 });
  }
}
function collide(v) {
  v.hit = true; v.leaving = true; v.v = Math.max(v.v, 9);
  S.hits++; S.life -= 12; S.score -= 50;
  S.speed = Math.min(S.speed, 4);
  jolt(2.3); S.shake = 10; S.flash = .5; S.flashCol = '#f59e0b'; sfx.thud();
  say('other', pick(L.carYell), { ref: v, speak: true, force: true, life: 2.6 });
  later(1.3, () => {
    if (S.mode !== 'play') return;
    if (v.type === 'rick') say('other', pick(L.rickApology), { ref: v, speak: true, life: 2.2 });
    else say('driver', pick(L.driverSorry), { speak: true, life: 2.2 });
  });
}

/* ---------- drawing: scene ---------- */
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

const SHOPS = ['ফার্মেসি', 'চা-নাস্তা', 'মুদি দোকান', 'বিরিয়ানি', 'মোবাইল', 'সেলুন', 'ফল-ফলাদি', 'ফটোকপি', 'কসমেটিক্স', 'হোটেল'];
const BOARDS = ['ভর্তি চলছে', 'সেল সেল সেল!', 'ভাঙা রাস্তা সংস্কার চাই!', 'আজই ডেলিভারি', 'খাঁটি মধু'];
function drawRoadside() {
  const lo = Math.floor((S.dist - 30) / 5), hi = Math.ceil((S.dist + 30) / 5);
  for (let i = lo; i <= hi; i++) {
    const wx = i * 5 + hash(i) * 1.5;
    if (LM.some(l => Math.abs(wx - l) < 11)) continue;
    const cx = X(wx), k = hash(i * 3.3);
    if (cx < -200 || cx > W + 200) continue;
    if (k < .55) {
      const w = 120 + hash(i * 1.9) * 50, h = 90 + hash(i * 2.7) * 60, col = BPAL[Math.floor(hash(i * 5.1) * BPAL.length)];
      ctx.fillStyle = col; ctx.fillRect(cx - w / 2, SIDEY - h, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cx - w / 2, SIDEY - 50, w, 50);
      for (let s = 0; s < 6; s++) { ctx.fillStyle = s % 2 ? '#fff' : mix('#ef4444', '#f97316', hash(i)); ctx.fillRect(cx - w / 2 + s * w / 6, SIDEY - 56, w / 6, 12); }
      ctx.fillStyle = '#fff'; rr(cx - w / 2 + 6, SIDEY - h + 6, w - 12, 24, 4); ctx.fill();
      txt(SHOPS[Math.floor(hash(i * 7.7) * SHOPS.length)], cx, SIDEY - h + 24, 16, '#222', 'center', 700);
    } else if (k < .78) {
      ctx.fillStyle = '#7c4a21'; ctx.fillRect(cx - 5, SIDEY - 70, 10, 70);
      ctx.fillStyle = '#22a35a'; ctx.beginPath(); ctx.arc(cx, SIDEY - 90, 36, 0, 7); ctx.arc(cx - 24, SIDEY - 72, 24, 0, 7); ctx.arc(cx + 24, SIDEY - 72, 24, 0, 7); ctx.fill();
    } else if (k < .9) {
      ctx.fillStyle = '#6b7280'; ctx.fillRect(cx - 3, SIDEY - 130, 6, 130); ctx.fillRect(cx - 24, SIDEY - 124, 48, 5);
    } else {
      ctx.fillStyle = '#555'; ctx.fillRect(cx - 40, SIDEY - 50, 5, 50); ctx.fillRect(cx + 35, SIDEY - 50, 5, 50);
      const g = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0); g.addColorStop(0, '#f43f5e'); g.addColorStop(1, '#f59e0b');
      ctx.fillStyle = g; rr(cx - 55, SIDEY - 110, 110, 62, 6); ctx.fill();
      wrapText(BOARDS[Math.floor(hash(i * 4.4) * BOARDS.length)], cx, SIDEY - 80, 96, 14, 17, '#fff', 'center', 700);
    }
  }
}

function drawLandmark(i) {
  const cx = X(LM[i]);
  if (cx < -320 || cx > W + 320) return;
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
      txt('সাহেবনগর', cx + 130, B - 220, 32, '#fff', 'center', 700);
      break; }
    case 3: { // 10 tola
      ctx.fillStyle = '#6366f1'; ctx.fillRect(cx - 80, B - 340, 160, 340);
      for (let r = 0; r < 10; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = hash(r * 7 + c) > .35 ? '#fde68a' : '#c7d2fe'; ctx.fillRect(cx - 68 + c * 36, B - 328 + r * 32, 24, 20); }
      ctx.fillStyle = '#f43f5e'; rr(cx - 90, B - 395, 180, 46, 8); ctx.fill(); txt('১০ তলা', cx, B - 360, 32, '#fff', 'center', 700);
      ctx.fillStyle = '#4338ca'; ctx.fillRect(cx - 24, B - 50, 48, 50);
      break; }
    case 4: { // Vitamin Gate
      ctx.fillStyle = '#fff'; ctx.fillRect(cx - 170, B - 210, 36, 210); ctx.fillRect(cx + 134, B - 210, 36, 210);
      ctx.fillStyle = '#10b981'; ctx.fillRect(cx - 190, B - 250, 380, 50);
      txt('VITAMIN GATE', cx, B - 214, 34, '#fff', 'center', 700);
      ctx.fillStyle = '#ef4444'; rr(cx - 36, B - 330, 72, 36, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(cx, B - 330, 36, 36);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx + 18, B - 312, 18, -1.57, 1.57); ctx.fill();
      txt('💊 ভিটামিন গেট', cx, B - 340, 20, '#065f46', 'center', 700);
      ctx.fillStyle = '#fde047'; ctx.fillRect(cx - 120, B - 40, 240, 6);
      break; }
    case 5: { // U-turn stop + tea table
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 200, B - 12, 400, 12);
      ctx.fillStyle = '#111'; for (let k = 0; k < 10; k++) ctx.fillRect(cx - 200 + k * 40, B - 12, 20, 12);
      ctx.fillStyle = '#ea580c'; rr(cx - 130, B - 240, 260, 64, 10); ctx.fill();
      txt('↩ ইউ-টার্ন', cx, B - 196, 36, '#fff', 'center', 700);
      ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx + 140, B - 62, 90, 8); ctx.fillRect(cx + 150, B - 54, 6, 54); ctx.fillRect(cx + 214, B - 54, 6, 54);
      ctx.fillStyle = '#fff'; ctx.fillRect(cx + 160, B - 78, 14, 16); ctx.fillRect(cx + 192, B - 78, 14, 16);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
      for (const dx of [167, 199]) { ctx.beginPath(); ctx.moveTo(dx, B - 82); ctx.bezierCurveTo(dx - 8, B - 96, dx + 8, B - 104, dx, B - 118 - Math.sin(S.t * 3) * 4); ctx.stroke(); }
      ctx.fillStyle = '#b45309'; rr(cx + 130, B - 150, 110, 40, 8); ctx.fill(); txt('শেষ টেবিল', cx + 185, B - 122, 22, '#fff', 'center', 700);
      break; }
    case 6: { // Masjid Al Mustafa
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - 130, B - 150, 260, 150);
      ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.arc(cx, B - 150, 80, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 2, B - 250, 4, 22); ctx.beginPath(); ctx.arc(cx, B - 258, 9, 0.4, 5.9); ctx.fill();
      for (const dx of [-170, 170]) { ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + dx - 14, B - 270, 28, 270); ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.moveTo(cx + dx - 18, B - 270); ctx.lineTo(cx + dx, B - 310); ctx.lineTo(cx + dx + 18, B - 270); ctx.fill(); }
      ctx.fillStyle = '#14532d'; for (let k = 0; k < 4; k++) { rr(cx - 100 + k * 54, B - 100, 34, 70, 17); ctx.fill(); }
      ctx.fillStyle = '#065f46'; rr(cx - 120, B - 380, 240, 44, 10); ctx.fill(); txt('🕌 মসজিদ আল মুস্তাফা', cx, B - 350, 24, '#fff', 'center', 700);
      break; }
    case 7: { // UIU campus
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 230, B - 300, 460, 300);
      ctx.fillStyle = '#fb7185'; ctx.fillRect(cx - 230, B - 300, 460, 40);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) { ctx.fillStyle = (r + c) % 3 ? '#7dd3fc' : '#bae6fd'; ctx.fillRect(cx - 212 + c * 42, B - 240 + r * 38, 30, 26); }
      txt('UIU', cx, B - 266, 34, '#fff', 'center', 700);
      txt('United International University', cx, B - 316, 18, '#334155', 'center', 700);
      ctx.fillStyle = '#334155'; ctx.fillRect(cx - 30, B - 70, 60, 70);
      for (const dx of [-280, 280]) { ctx.fillStyle = '#64748b'; ctx.fillRect(cx + dx, B - 220, 5, 220); ctx.fillStyle = '#16a34a'; ctx.fillRect(cx + dx + 5, B - 220, 46 + Math.sin(S.t * 4) * 3, 30); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx + dx + 26, B - 205, 8, 0, 7); ctx.fill(); }
      break; }
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

function drawVeh(v) {
  const cx = X(v.x + v.len / 2);
  if (cx < -300 || cx > W + 300) return;
  ctx.save();
  ctx.translate(cx, GY - v.yoff * .3); ctx.scale(S.dir, 1);
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
    wheel(-hw * .5, -24, 24, wa); wheel(hw * .75, -20, 20, wa);
    ctx.fillStyle = v.col; rr(-hw * .8, -62, hw * 1, 22, 6); ctx.fill();
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(-hw * .3, -62, hw * .6, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#2563eb'; ctx.fillRect(hw * .25, -70, 12, 30); ctx.beginPath(); ctx.arc(hw * .31, -78, 8, 0, 7); ctx.fillStyle = '#d6a77a'; ctx.fill();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hw * .3, -42); ctx.lineTo(hw * .55, -30 + Math.sin(S.t * 6) * 6); ctx.stroke();
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
  ctx.translate(S.camX, GY + S.bobY);
  ctx.rotate(S.tilt * S.face);
  ctx.scale(S.face * S.turnSx, 1);
  const wa = S.wheel;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 4 - S.bobY, 90, 8, 0, 0, 7); ctx.fill();
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
  // passenger
  const th = S.a * .6, hipx = -38, hipy = -72;
  ctx.save(); ctx.translate(hipx, hipy); ctx.rotate(th);
  ctx.fillStyle = '#3b82f6'; rr(-10, -40, 20, 40, 5); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(-14, -36, 6, 26);
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
  for (let k = 0; k < 2; k++) {
    const hx = S.gripping ? rail[0] + k * 14 : shx + 16 + Math.sin(S.t * 9 + k * 2) * 12 + k * 8;
    const hy = S.gripping ? rail[1] : shy - 6 + Math.cos(S.t * 11 + k) * 14;
    ctx.strokeStyle = '#e0b48a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(shx, shy); ctx.quadraticCurveTo((shx + hx) / 2 + 8, (shy + hy) / 2 - 6, hx, hy); ctx.stroke();
    if (S.gripping) { ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 7); ctx.fill(); }
  }
  // rail + canopy (drawn after so arms look like they grip)
  ctx.fillStyle = '#d97706'; ctx.fillRect(-78, -118, 8, 58); ctx.fillRect(40, -118, 6, 58);
  ctx.fillStyle = '#fbbf24'; rr(-84, -126, 134, 12, 5); ctx.fill();
  ctx.strokeStyle = S.gripping ? '#fde047' : '#9ca3af'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -101); ctx.lineTo(0, -101); ctx.stroke();
  ctx.fillStyle = 'rgba(190,230,255,.45)'; ctx.beginPath(); ctx.moveTo(44, -114); ctx.lineTo(66, -62); ctx.lineTo(44, -62); ctx.closePath(); ctx.fill();
  wheel(-48, -19, 19, wa); wheel(52, -19, 19, wa);
  ctx.fillStyle = '#fde68a'; ctx.fillRect(78, -48, 6, 8);
  ctx.restore();
  txt(S.name, S.camX - S.face * 38, GY - 178 + S.bobY, 14, '#fff', 'center', 700, 'rgba(0,0,0,.6)');
}

function drawParts() {
  for (const p of S.parts) { ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}

function bubbleAnchor(b) {
  if (b.who === 'driver') return { x: S.camX + S.face * 30, y: GY - 150 + S.bobY, c: '#f59e0b' };
  if (b.who === 'player') return { x: S.camX - S.face * 38, y: GY - 196 + S.bobY, c: '#3b82f6' };
  const v = b.ref;
  return { x: v ? X(v.x + v.len / 2) : W / 2, y: GY - (v && v.type === 'bus' ? 130 : 100) - (v ? v.yoff * .3 : 0), c: '#ef4444' };
}
function drawBubbles() {
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
    txt('SPACE = সিট ধরো  |  ← → = ব্যালান্স  |  ↓ = ধীরে মামা', W / 2, H - 56, 18, '#fff', 'center', 700, 'rgba(0,0,0,.65)');
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
  drawRoadside();
  for (let i = 0; i < 8; i++) drawLandmark(i);
  drawGround();
  drawRoadObjs();
  S.vehs.forEach(drawVeh);
  if (S.mode === 'win' || S.dist >= FINISH - 4) {
    const fx = X(FINISH);
    ctx.fillStyle = '#fde047'; ctx.fillRect(fx - 3, 392, 6, 140);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(fx - 3, 392, 70 * -S.dir, 20);
  }
  drawAuto();
  drawParts();
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
  const B = [
    { x: 40, t1: 'শোক সংবাদ', body: `${name} আর আমাদের মাঝে নেই।`, small: `নতুন বাজার–ইউআইইউ রুটে অটোরিকশার সিট আঁকড়ে ধরে রাখতে না পেরে ${place}-এ অকালে চলে গেছেন।` },
    { x: 350, t1: 'গভীর শোক প্রকাশ', body: `প্রিয় সহপাঠী ${name}`, small: 'ইউআইইউ ক্লাসমেট ও টেসলা মামা পরিবারের পক্ষ থেকে গভীর সমবেদনা। তাঁর খালি সিটটি আজ অনেক ঝাঁকুনি মিস করছে।' },
    { x: 660, t1: 'বিজ্ঞপ্তি', body: 'আগামীকালের কুইজ বহাল', small: 'এটেন্ডেন্স নিয়ে শিক্ষকেরা এখনো মন্তব্য করেননি। — ভাঙা রাস্তা সংস্কার কমিটি (গঠনের অপেক্ষায়)' }
  ];
  B.forEach((b, i) => {
    const appear = clamp((t - .3 - i * .45) * 2.5, 0, 1); if (appear <= 0) return;
    const sw = Math.sin(S.t * 1.6 + i) * 1.2, bw = 250, bh = 235, by = 205 - (1 - appear) * 60;
    ctx.save(); ctx.globalAlpha = appear; ctx.translate(b.x + bw / 2, by); ctx.rotate(sw * .012);
    ctx.fillStyle = '#475569'; ctx.fillRect(-bw / 2 + 20, 0, 4, 165 + bh * .2); ctx.fillRect(bw / 2 - 24, 0, 4, 165 + bh * .2);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 8; rr(-bw / 2, 0, bw, bh, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(-bw / 2 + 10, 10, bw - 20, 38);
    txt(b.t1, 0, 38, 24, '#fff', 'center', 700);
    wrapText(b.body, 0, 80, bw - 34, 19, 24, '#111', 'center', 700);
    wrapText(b.small, 0, 134, bw - 34, 13.5, 17, '#333', 'center', 600);
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
  ctx.save();
  if (S.mode === 'dead') { drawDeathScene(); ctx.restore(); return; }
  if (S.shake > 0) ctx.translate((Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake);
  drawScene();
  if (S.mode === 'play' || S.mode === 'dying' || S.mode === 'win') { drawBubbles(); drawHUD(); }
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
  if (S.mode === 'play') update(dt);
  else if (S.mode === 'dying') {
    S.deathT += dt; S.t += dt; S.flash = Math.max(0, S.flash - 1.5 * dt); S.shake = Math.max(0, S.shake - 25 * dt);
    S.speed *= Math.exp(-3 * dt); S.dist += S.speed * dt;
    if (S.deathT > 1.5) { S.mode = 'dead'; S.deathT = 0; finishUi(false); }
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

/* ---------- input ---------- */
function setKey(e, down) {
  const k = e.key;
  let used = true;
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
  const on = e => { e.preventDefault(); inp[key] = true; audioInit(); };
  const off = e => { e.preventDefault(); inp[key] = false; };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
hold('bG', 'grip'); hold('bL', 'left'); hold('bR', 'right'); hold('bS', 'slow');
$('startBtn').addEventListener('click', startGame);
$('retryBtn').addEventListener('click', () => { $('end').classList.remove('low'); startGame(); });
$('menuBtn').addEventListener('click', () => { $('end').classList.remove('low'); toMenu(); });
$('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
$('voiceChk').addEventListener('change', e => { settings.voice = e.target.checked; });

/* ---------- boot ---------- */
S = newState();
const savedName = store.get('tm_name'); if (savedName) $('nameInput').value = savedName;
const best = store.get('tm_best'); $('bestNote').textContent = best ? 'সর্বোচ্চ স্কোর: ' + best : '';
requestAnimationFrame(frame);

// exposed for headless tests only
window.__tm = { get S() { return S; }, update, render, startGame, inp };
})();
