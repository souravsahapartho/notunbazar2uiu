// Usage: node tools/dump_lines.js > tools/lines_dump.json
// Lists every spoken line with the voice keys that will say it (keys must match js/game.js packKey()).
global.window = {};
require('../js/lines.js');
const L = window.LINES, out = [];
const add = (text, keys) => { if (typeof text === 'string' && text.trim()) keys.forEach(k => out.push({ key: k, text })); };
const walk = (v, keys) => Array.isArray(v) ? v.forEach(x => walk(x, keys)) : add(v, keys);
const P = ['player_m', 'player_f'], CARS = ['car', 'rick', 'bus', 'cng'];
const map = {
  carYell: CARS, abuse: [...CARS, ...P], angry: P, hardHit: P, pedHit: ['ped'], pedWarn: ['ped'], mob: ['crowd'], mobRude: ['crowd'], mobCatch: ['crowd'], mobRun: P,
  driverIdle: ['driver'], dyingDriver: ['driver'], playerIdle: P, moreIdle: P, nearFall: P, fall: P, dying: P,
  dyingWarn: P, start: P, win: P, brake: P, jam: ['car']
};
for (const [name, keys] of Object.entries(map)) if (L[name]) walk(L[name], keys);
for (const [name, v] of Object.entries(L.haggle || {})) {
  if (/^(say|player|goOk|poor|much|student)/.test(name) && !/No$|Ok$/.test(name)) walk(v, P); else walk(v, ['driver']);
}
const seen = new Set(), uniq = out.filter(o => { const k = o.key + '|' + o.text; if (seen.has(k)) return false; seen.add(k); return true; });
console.log(JSON.stringify(uniq, null, 1));
