/* Hand-drawn canvas sprites: Dhaka cycle rickshaws, people, hawker vans, shops, stands, flowers.
   All side-view, facing +x, origin = ground contact. No logos or external images. */
window.ART = function (E) {
  const { ctx, rr, txt, hash, mod } = E;
  const PAL = ['#ff8fab', '#ffb86b', '#8ecae6', '#b8f2c8', '#cdb4ff', '#ffd166', '#f4a3c4', '#9be3de'];
  const FRAME = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed'];
  const FLOWER = ['#ef4444', '#f472b6', '#fbbf24', '#ffffff', '#a78bfa', '#fb923c', '#e11d74'];
  const SKIN = ['#c68a5a', '#a86f45', '#d8a276', '#8d5a36'];
  const SHIRT = ['#2563eb', '#f59e0b', '#16a34a', '#e11d48', '#0ea5e9', '#a855f7', '#fb923c', '#f1f5f9'];
  const pickH = (arr, n) => arr[Math.floor(hash(n) * arr.length) % arr.length];
  const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };

  function spokeWheel(x, y, r, a, hub) {
    ctx.strokeStyle = '#0b0b0d'; ctx.lineWidth = Math.max(3.4, r * .17); ctx.beginPath(); ctx.arc(x, y, r - 1, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#d8dce3'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(x, y, r - 4.4, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(205,210,220,.9)'; ctx.lineWidth = .7; ctx.beginPath();
    for (let k = 0; k < 18; k++) { const an = a + k * Math.PI / 9; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * (r - 4.4), y + Math.sin(an) * (r - 4.4)); }
    ctx.stroke();
    if (hub) { ctx.fillStyle = hub; for (let k = 0; k < 6; k++) { const an = a * .5 + k * 1.047; ctx.beginPath(); ctx.ellipse(x + Math.cos(an) * r * .26, y + Math.sin(an) * r * .26, r * .17, r * .1, an, 0, 7); ctx.fill(); } }
    ctx.fillStyle = '#9ca3af'; circle(x, y, 3.2); ctx.fillStyle = '#374151'; circle(x, y, 1.3);
  }

  /* ---------- Dhaka cycle/battery rickshaw: tin-art panels, ribbed painted hood, fringe, tassels ---------- */
  function flower8(ex, ey, r, c1, c2, c3) {
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.ellipse(ex, ey, r * 1.15, r * 1.05, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(120,53,15,.7)'; ctx.lineWidth = .8;
    ctx.fillStyle = c1; for (let p = 0; p < 8; p++) { const an = p * .785; ctx.beginPath(); ctx.ellipse(ex + Math.cos(an) * r * .52, ey + Math.sin(an) * r * .52, r * .33, r * .22, an, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = c2; circle(ex, ey, r * .3); ctx.fillStyle = c3; circle(ex, ey, r * .13);
  }
  function rickshaw(x, y, sc, o) {
    o = o || {};
    const col = o.col || FRAME[0], seed = o.seed || 1, t = o.t || 0, wa = o.wa || 0, pa = o.pa || 0;
    const c1 = pickH(FLOWER, seed + 5), c2 = pickH(FLOWER, seed * 3 + 2), c3 = pickH(FLOWER, seed + 9);
    const hubc = pickH(['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899'], seed);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.ellipse(-4, 2, 98, 7, 0, 0, 7); ctx.fill();
    if (o.cycle) { spokeWheel(-46, -24, 24, wa, hubc); spokeWheel(62, -22, 22, wa, hubc); } else { spokeWheel(-46, -22, 22, wa, hubc); spokeWheel(70, -17, 17, wa, hubc); }
    // rear mudguard arching over the big wheel, painted with a gold line
    ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(-46, -22, 27, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-46, -22, 27, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    if (!o.cycle) { // battery-powered auto-rickshaw ("Tesla"): motor chassis, front cowl, handlebar, driver bench
      ctx.fillStyle = '#1f2937'; rr(-62, -27, 66, 11, 3); ctx.fill();
      ctx.fillStyle = '#374151'; rr(-58, -25, 24, 7, 2); ctx.fill(); ctx.fillStyle = '#22c55e'; circle(-30, -21, 1.8); // battery box + LED
      ctx.fillStyle = col; rr(-84, -33, 148, 7, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-82, -32, 144, 1.6);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(10, -64); ctx.quadraticCurveTo(44, -70, 66, -58); ctx.lineTo(82, -42); ctx.lineTo(80, -30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(12, -60); ctx.quadraticCurveTo(44, -66, 64, -55); ctx.lineTo(60, -52); ctx.quadraticCurveTo(40, -60, 14, -54); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, -41); ctx.quadraticCurveTo(48, -49, 78, -39); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(70, -17, 21, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.fillStyle = 'rgba(254,240,138,.35)'; ctx.beginPath(); ctx.moveTo(86, -53); ctx.lineTo(140, -64); ctx.lineTo(140, -30); ctx.lineTo(86, -45); ctx.fill(); // headlight beam
      ctx.fillStyle = '#fef08a'; rr(78, -57, 8, 11, 3); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.fillRect(8, -128, 4, 66); ctx.fillRect(60, -124, 4, 40);
      ctx.fillStyle = col; rr(0, -132, 68, 8, 3); ctx.fill(); ctx.fillStyle = '#fde047'; ctx.fillRect(2, -125, 64, 2);
      ctx.fillStyle = 'rgba(190,230,255,.38)'; ctx.beginPath(); ctx.moveTo(64, -124); ctx.lineTo(70, -66); ctx.lineTo(58, -66); ctx.lineTo(62, -124); ctx.fill();
      ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, -34); ctx.lineTo(62, -64); ctx.lineTo(56, -94); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, -96); ctx.lineTo(64, -97); ctx.stroke();
      ctx.fillStyle = '#d1d5db'; circle(66, -99, 2.6); ctx.fillStyle = '#facc15'; circle(51, -98, 2.2); // mirror + bell
      ctx.fillStyle = '#3f2a1d'; rr(10, -72, 38, 8, 3); ctx.fill();
    }
    if (o.cycle) {
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(62, -22); ctx.lineTo(52, -62); ctx.moveTo(52, -62); ctx.lineTo(30, -60); ctx.moveTo(30, -60); ctx.lineTo(18, -28);
    ctx.moveTo(18, -28); ctx.lineTo(54, -34); ctx.moveTo(18, -28); ctx.lineTo(-46, -24); ctx.stroke();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(52, -62); ctx.lineTo(50, -78); ctx.lineTo(61, -78); ctx.stroke();
    ctx.fillStyle = '#222'; rr(24, -66, 12, 5, 2); ctx.fill();
    }
    // carriage with the tin-art side panel: sunrise, hills, bird, big flowers, scalloped trim
    ctx.fillStyle = col; rr(-80, -62, 88, 32, 5); ctx.fill();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.6; rr(-78, -60, 84, 28, 4); ctx.stroke();
    ctx.save(); rr(-76, -58, 80, 24, 4); ctx.clip();
    const sg = ctx.createLinearGradient(0, -58, 0, -34); sg.addColorStop(0, '#7dd3fc'); sg.addColorStop(.6, '#fde68a'); sg.addColorStop(1, c1);
    ctx.fillStyle = sg; ctx.fillRect(-78, -60, 84, 28);
    ctx.fillStyle = '#facc15'; circle(-22, -42, 7); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1; for (let k = 0; k < 10; k++) { const an = k * .628; ctx.beginPath(); ctx.moveTo(-22 + Math.cos(an) * 9, -42 + Math.sin(an) * 9); ctx.lineTo(-22 + Math.cos(an) * 13, -42 + Math.sin(an) * 13); ctx.stroke(); }
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.ellipse(-48, -34, 34, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.ellipse(-4, -33, 30, 9, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-60, -44); ctx.quadraticCurveTo(-56, -50, -52, -46); ctx.moveTo(-52, -46); ctx.quadraticCurveTo(-48, -52, -44, -47); ctx.stroke();
    flower8(-64, -46, 8.5, c1, c2, '#fff'); flower8(-4, -46, 8.5, c3, c1, '#fff');
    ctx.restore();
    ctx.fillStyle = '#fde047'; for (let k = 0; k < 13; k++) { ctx.beginPath(); ctx.arc(-74 + k * 6.3, -31.5, 2.6, 0, Math.PI); ctx.fill(); }
    ctx.fillStyle = c3; for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.arc(-71 + k * 6.3, -31.5, 2.2, 0, Math.PI); ctx.fill(); }
    if (o.plate) { ctx.fillStyle = '#fff'; rr(-32, -42, 38, 10, 2); ctx.fill(); ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = .8; rr(-32, -42, 38, 10, 2); ctx.stroke(); txt(o.plate, -13, -34, 8.5, '#1e293b', 'center', 700); }
    ctx.fillStyle = ['#16a34a', '#ec4899', '#2563eb'][Math.floor(seed) % 3]; rr(-76, -70, 76, 9, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; rr(-72, -69, 64, 2.4, 1); ctx.fill();
    // ribbed, painted folding hood (concertina ribs, gold braid, flowers, fringe)
    ctx.save(); ctx.translate(-40, -68); ctx.rotate(-.12);
    const RIB = [c1, '#fbbf24', c3, '#fff7ed', c2, '#f97316'];
    for (let k = 0; k < 10; k++) { const a0 = Math.PI + k * Math.PI / 10; ctx.fillStyle = RIB[(k + Math.floor(seed)) % RIB.length]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.ellipse(0, 0, 50, 66, 0, a0, a0 + Math.PI / 10 + .01); ctx.closePath(); ctx.fill(); }
    const hg = ctx.createLinearGradient(-30, -60, 40, 6); hg.addColorStop(0, 'rgba(255,255,255,.22)'); hg.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, 0, 50, 66, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,30,10,.55)'; ctx.lineWidth = 1; for (let k = 1; k < 10; k++) { const an = Math.PI + k * Math.PI / 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 50, Math.sin(an) * 66); ctx.stroke(); }
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(0, 0, 50, 66, 0, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, 0, 45, 60, 0, Math.PI * 1.03, Math.PI * 1.97); ctx.stroke();
    for (let k = 0; k < 9; k++) { const an = Math.PI * (.08 + k * .105); flower8(Math.cos(an) * 38, -Math.sin(an) * 52, 4.8, pickH(FLOWER, seed + k * 2), pickH(FLOWER, seed + k * 5 + 1), '#fff'); }
    for (let k = 0; k < 14; k++) { const an = Math.PI + (k + .5) * Math.PI / 14; ctx.fillStyle = pickH(FLOWER, seed + k * 3); circle(Math.cos(an) * 50, Math.sin(an) * 66 + 3, 2.6); }
    ctx.restore();
    for (let k = 0; k < 8; k++) { ctx.strokeStyle = pickH(FLOWER, seed + k); ctx.lineWidth = 2.4; ctx.beginPath(); const sx = -90 + k * 1.5, sy = -78 + k * 3; ctx.moveTo(sx, sy); ctx.lineTo(sx - 4 + Math.sin(t * 6 + k) * 3, sy + 22); ctx.stroke(); }
    ctx.fillStyle = '#dc2626'; rr(-91, -62, 4, 9, 1); ctx.fill(); // rear reflector
    if (o.pass) {
      ctx.fillStyle = o.passCol || '#7c3aed'; rr(-52, -92, 18, 26, 5); ctx.fill();
      ctx.fillStyle = SKIN[1]; circle(-43, -100, 9); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-43, -103, 9, Math.PI, 0); ctx.fill();
    }
    if (!o.cycle && o.puller !== false) {
      const hip = [28, -72], skin = o.skin || SKIN[0], shirt = o.shirt || '#f1e4c8';
      ctx.lineCap = 'round'; ctx.strokeStyle = o.lungi || '#2563eb'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(50, -68); ctx.lineTo(54, -37); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(hip[0] + 8 + k * 3, hip[1] + k * 1.2); ctx.lineTo(51 + k, -66 + k * 2); ctx.stroke(); }
      ctx.fillStyle = skin; circle(54, -33, 4.5); ctx.fillStyle = '#7c2d12'; rr(49, -31, 13, 3.4, 1.5); ctx.fill(); // sandal
      ctx.fillStyle = shirt; rr(hip[0] - 9, hip[1] - 38, 20, 40, 7); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.12)'; rr(hip[0] - 9, hip[1] - 18, 20, 20, 7); ctx.fill();
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(hip[0] - 4, hip[1] - 36); ctx.lineTo(hip[0] + 10, hip[1] - 16); ctx.stroke(); // gamchha over the shoulder
      ctx.strokeStyle = '#fff'; ctx.lineWidth = .9; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(hip[0] - 4, hip[1] - 36); ctx.lineTo(hip[0] + 10, hip[1] - 16); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = shirt; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hip[0] + 3, hip[1] - 32); ctx.quadraticCurveTo(46, -92, 58, -96); ctx.stroke();
      ctx.fillStyle = skin; circle(58, -96, 3.5);
      ctx.fillStyle = skin; circle(hip[0] + 5, hip[1] - 50, 10);
      ctx.fillStyle = '#111'; circle(hip[0] + 10, hip[1] - 52, 1.3); ctx.fillRect(hip[0] + 9, hip[1] - 47, 6, 1.6); // eye + moustache
      if (o.mask) { ctx.fillStyle = '#e5f2ff'; rr(hip[0] + 6, hip[1] - 50, 9, 9, 2); ctx.fill(); }
      if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.arc(hip[0] + 5, hip[1] - 53, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(hip[0] + 8, hip[1] - 54, 12, 3); }
    }
    if (o.cycle && o.puller !== false) {
      const hip = [26, -64], crank = [18, -28], foot = [crank[0] + Math.cos(pa) * 12, crank[1] + Math.sin(pa) * 12];
      const knee = [(hip[0] + foot[0]) / 2 + 11, (hip[1] + foot[1]) / 2 - 2];
      const skin = o.skin || SKIN[0];
      ctx.strokeStyle = skin; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(knee[0], knee[1]); ctx.lineTo(foot[0], foot[1]); ctx.stroke();
      ctx.fillStyle = o.lungi || '#2563eb'; ctx.beginPath(); ctx.moveTo(hip[0] - 10, hip[1] - 2); ctx.lineTo(hip[0] + 10, hip[1] - 2); ctx.lineTo(knee[0] + 8, knee[1] + 6); ctx.lineTo(knee[0] - 8, knee[1] + 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(hip[0] + k * 6, hip[1]); ctx.lineTo(knee[0] + k * 5, knee[1] + 5); ctx.stroke(); }
      ctx.fillStyle = o.shirt || '#f1e4c8'; rr(hip[0] - 9, hip[1] - 42, 20, 44, 7); ctx.fill();
      ctx.strokeStyle = o.shirt || '#f1e4c8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hip[0] + 3, hip[1] - 36); ctx.lineTo(56, -78); ctx.stroke();
      ctx.fillStyle = skin; circle(hip[0] + 5, hip[1] - 54, 10);
      if (o.mask) { ctx.fillStyle = '#e5f2ff'; rr(hip[0] + 6, hip[1] - 54, 9, 9, 2); ctx.fill(); }
      if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.arc(hip[0] + 5, hip[1] - 57, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(hip[0] + 8, hip[1] - 58, 12, 3); }
      ctx.strokeStyle = '#222'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(crank[0], crank[1]); ctx.lineTo(foot[0], foot[1]); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- people ---------- */
  function person(x, y, sc, o) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); ctx.scale(sc * (o.dir || 1), sc);
    const ph = o.ph || 0, sw = Math.sin(ph) * (o.run ? 11 : 6);
    if (o.fall) { ctx.rotate(-1.45); ctx.translate(0, -8); }
    ctx.lineCap = 'round';
    ctx.strokeStyle = o.pants || '#334155'; ctx.lineWidth = 5; ctx.beginPath();
    if (o.sit) { ctx.moveTo(0, -26); ctx.lineTo(15, -26); ctx.lineTo(15, 0); }
    else { ctx.moveTo(0, -30); ctx.lineTo(sw, 0); ctx.moveTo(0, -30); ctx.lineTo(-sw, 0); }
    ctx.stroke();
    ctx.fillStyle = o.shirt || '#2563eb'; rr(-7, -58, 14, 31, 5); ctx.fill();
    ctx.strokeStyle = o.shirt || '#2563eb'; ctx.lineWidth = 4; ctx.beginPath();
    if (o.up) { const w = Math.sin(ph * 1.3) * 5; ctx.moveTo(0, -54); ctx.lineTo(9, -70 + w); ctx.moveTo(0, -54); ctx.lineTo(-4, -72 - w); }
    else { ctx.moveTo(0, -54); ctx.lineTo(-sw * .8, -33); ctx.moveTo(0, -54); ctx.lineTo(sw * .8, -33); }
    ctx.stroke();
    if (o.up) { ctx.fillStyle = o.skin || SKIN[0]; circle(9, -71, 3); circle(-4, -73, 3); }
    ctx.fillStyle = o.skin || SKIN[0]; circle(1, -66, 7.5);
    ctx.fillStyle = o.hair || '#111'; ctx.beginPath(); ctx.arc(1, -68, 7.5, Math.PI, 0); ctx.fill();
    if (o.long) { ctx.fillStyle = '#111'; rr(-7, -68, 6, 28, 3); ctx.fill(); }
    if (o.bag) { ctx.fillStyle = o.bag; rr(-12, -56, 8, 20, 3); ctx.fill(); }
    if (o.umb) { ctx.fillStyle = o.umb; ctx.beginPath(); ctx.arc(2, -80, 22, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(2, -80); ctx.lineTo(2, -58); ctx.stroke(); }
    ctx.restore();
  }
  function randPerson(i, t, rain) {
    return { shirt: pickH(SHIRT, i * 1.7), pants: pickH(['#334155', '#1e293b', '#475569', '#7c2d12'], i * 2.3), skin: pickH(SKIN, i * 3.1), bag: hash(i * 5) > .6 ? pickH(['#ef4444', '#111827', '#0ea5e9'], i) : null, umb: rain ? pickH(['#f43f5e', '#0ea5e9', '#a855f7', '#16a34a', '#f59e0b'], i * 1.9) : null, ph: t * 6 + i };
  }

  /* ---------- hawker van with hanging clothes ---------- */
  function hawkerVan(x, y, seed, t, rain) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 2, 70, 6, 0, 0, 7); ctx.fill();
    spokeWheel(-34, -16, 16, 0); spokeWheel(40, -16, 16, 0);
    ctx.fillStyle = '#92400e'; rr(-62, -34, 126, 10, 3); ctx.fill();
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-58, -34); ctx.lineTo(-58, -104); ctx.moveTo(58, -34); ctx.lineTo(58, -104); ctx.moveTo(-60, -102); ctx.lineTo(60, -102); ctx.stroke();
    for (let k = 0; k < 9; k++) {
      const gx = -52 + k * 13, c = pickH(SHIRT.concat(['#ec4899', '#facc15', '#14b8a6']), seed * 7 + k), sw = Math.sin(t * 2 + k + seed) * 1.5, h = 24 + hash(seed + k) * 22;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(gx - 7 + sw, -101); ctx.lineTo(gx + 7 + sw, -101); ctx.lineTo(gx + 9 + sw, -101 + h * .35); ctx.lineTo(gx + 5 + sw, -101 + h * .35); ctx.lineTo(gx + 5 + sw, -101 + h); ctx.lineTo(gx - 5 + sw, -101 + h); ctx.lineTo(gx - 5 + sw, -101 + h * .35); ctx.lineTo(gx - 9 + sw, -101 + h * .35); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = pickH(['#ef4444', '#2563eb', '#16a34a', '#f59e0b'], seed); ctx.beginPath(); ctx.arc(0, -120, 52, Math.PI, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let k = -2; k <= 2; k += 2) { ctx.beginPath(); ctx.moveTo(0, -120); ctx.arc(0, -120, 52, Math.PI + (k + 2) * .6, Math.PI + (k + 3) * .6); ctx.fill(); }
    ctx.fillStyle = '#fff'; rr(-30, -62, 60, 22, 3); ctx.fill(); txt('সব মাল ১০০', 0, -46, 13, '#b91c1c', 'center', 700);
    person(-72, 0, .85, { shirt: '#6b7280', pants: '#1f2937', ph: 0, skin: SKIN[2] });
    ctx.restore();
  }

  /* ---------- shops ---------- */
  function shopBody(cx, B, w, h, col) {
    ctx.fillStyle = col; ctx.fillRect(cx - w / 2, B - h, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(cx - w / 2, B - 52, w, 52);
  }
  function awning(cx, B, w, c1, c2, y) {
    for (let s = 0; s < 8; s++) { ctx.fillStyle = s % 2 ? c2 : c1; ctx.fillRect(cx - w / 2 + s * w / 8, B - y, w / 8, 13); }
  }
  function sign(cx, ty, w, label, bg, fg, size) {
    ctx.fillStyle = bg; rr(cx - w / 2, ty, w, 26, 5); ctx.fill();
    txt(label, cx, ty + 19, size || 15, fg, 'center', 700);
  }
  function shop(cx, B, kind, i, name) {
    if (kind === 'shwapno') return shwapno(cx, B);
    if (!name && kind !== 'chajoy' && kind !== 'hospital') name = poolName(kind, i);
    const w = 130 + hash(i * 1.9) * 50, h = 96 + hash(i * 2.7) * 56;
    const t = E.time();
    switch (kind) {
      case 'bkash': { // mobile banking + recharge agent: pink awning, glass counter
        shopBody(cx, B, w, h, '#f1f5f9'); awning(cx, B, w, '#e11d74', '#fff', 62);
        sign(cx, B - h + 4, w - 14, name || 'মা টেলিকম', '#e11d74', '#fff', 14);
        txt('ক্যাশ ইন • ক্যাশ আউট', cx, B - h + 44, 11, '#9d174d', 'center', 700);
        ctx.fillStyle = '#e11d74'; rr(cx - w / 2 + 6, B - 92, 44, 18, 3); ctx.fill(); txt('বিকাশ', cx - w / 2 + 28, B - 79, 11, '#fff', 'center', 700); ctx.fillStyle = '#f97316'; rr(cx - w / 2 + 54, B - 92, 44, 18, 3); ctx.fill(); txt('নগদ', cx - w / 2 + 76, B - 79, 11, '#fff', 'center', 700);
        txt('বিকাশ • মোবাইল রিচার্জ', cx, B - h + 58, 11, '#9d174d', 'center', 700);
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - w / 2 + 8, B - 46, w - 16, 28);
        ctx.fillStyle = '#334155'; for (let k = 0; k < 5; k++) rr(cx - w / 2 + 14 + k * ((w - 36) / 5), B - 42, 12, 20, 2), ctx.fill();
        ctx.fillStyle = '#16a34a'; ctx.fillRect(cx + w / 2 - 22, B - h + 62, 14, 18); ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - w / 2 + 8, B - h + 62, 14, 18);
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - w / 2 + 8, B - 20, w - 16, 20);
        break; }
      case 'tea': { // tea stall: tin roof, kettle steam, stools
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - w / 2 + 6, B - 86, w - 12, 86);
        ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.moveTo(cx - w / 2 - 6, B - 86); ctx.lineTo(cx + w / 2 + 6, B - 86); ctx.lineTo(cx + w / 2 - 4, B - 104); ctx.lineTo(cx - w / 2 + 4, B - 104); ctx.fill();
        sign(cx, B - 134, Math.min(w, 120), name || 'চা-নাস্তা', '#15803d', '#fef08a', 17);
        ctx.fillStyle = '#d97706'; rr(cx - 22, B - 58, 30, 24, 5); ctx.fill(); ctx.fillStyle = '#92400e'; ctx.fillRect(cx + 8, B - 52, 9, 4);
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; for (const dx of [-12, 0]) { ctx.beginPath(); ctx.moveTo(cx + dx, B - 62); ctx.bezierCurveTo(cx + dx - 7, B - 74, cx + dx + 7, B - 82, cx + dx, B - 92 - Math.sin(t * 3 + dx) * 4); ctx.stroke(); }
        ctx.fillStyle = '#fef3c7'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - w / 2 + 14 + k * 14, B - 38, 8, 9);
        ctx.fillStyle = '#b45309'; ctx.fillRect(cx - w / 2 - 28, B - 20, 22, 6); ctx.fillRect(cx - w / 2 - 24, B - 14, 4, 14); ctx.fillRect(cx - w / 2 - 12, B - 14, 4, 14);
        person(cx + w / 2 + 16, B, .8, { shirt: pickH(SHIRT, i), pants: '#475569', ph: 0, skin: pickH(SKIN, i) });
        break; }

      case 'chajoy': { // modern tea-outlet kiosk (generic look, text sign only)
        const W2 = 176;
        ctx.fillStyle = '#fff7ed'; ctx.fillRect(cx - W2 / 2, B - 138, W2, 138);
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - W2 / 2 - 6, B - 150, W2 + 12, 30);
        ctx.fillStyle = '#facc15'; ctx.fillRect(cx - W2 / 2 - 6, B - 122, W2 + 12, 4);
        txt('চা জয়', cx + 14, B - 126, 24, '#fef3c7', 'center', 700);
        ctx.fillStyle = '#fef3c7'; rr(cx - 62, B - 145, 26, 18, 6); ctx.fill(); ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - 58, B - 141, 18, 3); // cup glyph
        ctx.strokeStyle = 'rgba(254,243,199,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - 54, B - 148); ctx.quadraticCurveTo(cx - 50, B - 154 - Math.sin(t * 3) * 2, cx - 46, B - 148); ctx.stroke();
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - W2 / 2 + 8, B - 112, 84, 66); // glass front
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(cx - W2 / 2 + 8, B - 112); ctx.lineTo(cx - W2 / 2 + 40, B - 112); ctx.lineTo(cx - W2 / 2 + 8, B - 76); ctx.fill();
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - W2 / 2 + 8, B - 46, 84, 14); // counter
        ctx.fillStyle = '#fde68a'; for (let k = 0; k < 4; k++) rr(cx - W2 / 2 + 16 + k * 18, B - 58, 10, 12, 2), ctx.fill();
        ctx.fillStyle = '#fff'; rr(cx + 6, B - 112, 62, 70, 5); ctx.fill(); // menu board
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx + 6, B - 112, 62, 14); txt('মেনু', cx + 37, B - 101, 11, '#fef3c7', 'center', 700);
        txt('দুধ চা  ৳২০', cx + 37, B - 84, 10, '#451a03', 'center', 700); txt('মশলা চা ৳২৫', cx + 37, B - 70, 10, '#451a03', 'center', 700); txt('লাল চা  ৳১৫', cx + 37, B - 56, 10, '#451a03', 'center', 700);
        ctx.fillStyle = '#16a34a'; rr(cx + 74, B - 108, 10, 62, 3); ctx.fill(); ctx.fillStyle = '#fde047'; ctx.fillRect(cx + 74, B - 100, 10, 4);
        ctx.fillStyle = '#fbbf24'; for (let k = 0; k < 5; k++) circle(cx - W2 / 2 + 22 + k * 32, B - 124 + 3, 2.5); // string lights
        // outdoor stools + queue
        ctx.fillStyle = '#b45309'; for (const dx of [-W2 / 2 - 24, W2 / 2 + 26]) { ctx.fillRect(dx + cx - 8, B - 20, 16, 5); ctx.fillRect(dx + cx - 6, B - 15, 3, 15); ctx.fillRect(dx + cx + 3, B - 15, 3, 15); }
        person(cx - W2 / 2 - 24, B - 2, .8, { shirt: pickH(SHIRT, i), pants: '#334155', ph: 0, skin: pickH(SKIN, i), sit: true });
        person(cx + W2 / 2 + 34, B, .8, { shirt: '#2563eb', pants: '#475569', ph: t * 2, skin: pickH(SKIN, i + 3), dir: -1 });
        person(cx + W2 / 2 + 54, B, .8, { shirt: '#db2777', pants: '#1f2937', ph: 0, skin: pickH(SKIN, i + 5), dir: -1 });
        break; }
      case 'nagad': { // mobile banking agent: two coloured boards (text only), counter with phones and SIMs
        shopBody(cx, B, w, h, '#f8fafc'); awning(cx, B, w, '#e11d74', '#f97316', 62);
        ctx.fillStyle = '#e11d74'; rr(cx - w / 2 + 4, B - h + 4, w / 2 - 6, 26, 5); ctx.fill(); txt('বিকাশ', cx - w / 4, B - h + 23, 15, '#fff', 'center', 700);
        ctx.fillStyle = '#f97316'; rr(cx + 2, B - h + 4, w / 2 - 6, 26, 5); ctx.fill(); txt('নগদ', cx + w / 4 - 2, B - h + 23, 15, '#fff', 'center', 700);
        txt(name || 'নগদ-বিকাশ সেন্টার', cx, B - h + 44, 11, '#7c2d12', 'center', 700);
        txt('ক্যাশ ইন • ক্যাশ আউট • রিচার্জ • রকেট', cx, B - h + 58, 9, '#9d174d', 'center', 700);
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - w / 2 + 8, B - 46, w - 16, 28);
        ctx.fillStyle = '#0f172a'; for (let k = 0; k < 6; k++) rr(cx - w / 2 + 14 + k * ((w - 36) / 6), B - 42, 11, 20, 2), ctx.fill();
        ctx.fillStyle = '#facc15'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - w / 2 + 12 + k * 15, B - 66, 12, 9); // SIM packs
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - w / 2 + 8, B - 20, w - 16, 20);
        person(cx + w / 2 - 22, B - 20, .55, { shirt: '#0ea5e9', pants: '#334155', ph: 0, skin: pickH(SKIN, i) });
        break; }
      case 'confection': { // confectionery / general store: hanging chips, biscuit jars, fridge
        shopBody(cx, B, w + 14, h, '#e0f2fe'); awning(cx, B, w + 14, '#2563eb', '#fde047', 62);
        sign(cx, B - h + 4, w, name || 'রহিম স্টোর', '#1d4ed8', '#fef08a', 15);
        txt('চা • বিস্কুট • সিগারেট • ঠান্ডা পানীয়', cx, B - h + 44, 9, '#1e3a8a', 'center', 700);
        ctx.strokeStyle = '#78716c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - w / 2, B - 74); ctx.lineTo(cx + w / 2, B - 70); ctx.stroke();
        for (let k = 0; k < 9; k++) { ctx.fillStyle = pickH(['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#fb923c'], i + k); rr(cx - w / 2 + 6 + k * ((w - 12) / 9), B - 72 + k * .4, 10, 16, 2); ctx.fill(); }
        ctx.fillStyle = '#fef3c7'; for (let k = 0; k < 3; k++) { circle(cx - w / 2 + 18 + k * 20, B - 36, 9); ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - w / 2 + 12 + k * 20, B - 47, 12, 4); ctx.fillStyle = '#fef3c7'; }
        ctx.fillStyle = '#e5e7eb'; ctx.fillRect(cx + 8, B - 62, 40, 50); ctx.fillStyle = '#7dd3fc'; ctx.fillRect(cx + 11, B - 59, 34, 44);
        ctx.fillStyle = '#ef4444'; for (let k = 0; k < 4; k++) rr(cx + 15 + k * 8, B - 54, 5, 16, 1), ctx.fill();
        ctx.fillStyle = '#92400e'; ctx.fillRect(cx - w / 2 + 4, B - 22, w + 6, 22);
        break; }
      case 'tong': { // roadside tea tong: bamboo posts, tin roof, bench, kettle, biscuit jars
        const tw = 118;
        ctx.fillStyle = '#a16207'; ctx.fillRect(cx - tw / 2, B - 92, 5, 92); ctx.fillRect(cx + tw / 2 - 5, B - 92, 5, 92);
        ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.moveTo(cx - tw / 2 - 10, B - 90); ctx.lineTo(cx + tw / 2 + 10, B - 90); ctx.lineTo(cx + tw / 2 + 2, B - 108); ctx.lineTo(cx - tw / 2 - 2, B - 108); ctx.fill();
        ctx.fillStyle = '#6b7280'; for (let k = 0; k < 6; k++) ctx.fillRect(cx - tw / 2 - 4 + k * 21, B - 108, 2, 18);
        ctx.fillStyle = '#facc15'; rr(cx - 46, B - 132, 92, 20, 4); ctx.fill(); txt(name || 'চা-সিগারেট', cx, B - 117, 13, '#7f1d1d', 'center', 700);
        ctx.fillStyle = '#b45309'; ctx.fillRect(cx - tw / 2 + 5, B - 44, tw - 10, 8); // counter plank
        ctx.fillStyle = '#92400e'; ctx.fillRect(cx - tw / 2 + 10, B - 36, 5, 36); ctx.fillRect(cx + tw / 2 - 15, B - 36, 5, 36);
        ctx.fillStyle = '#d1d5db'; rr(cx - 36, B - 64, 22, 20, 4); ctx.fill(); ctx.fillStyle = '#6b7280'; ctx.fillRect(cx - 16, B - 58, 9, 4); // kettle
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 25, B - 66); ctx.bezierCurveTo(cx - 31, B - 76, cx - 19, B - 84, cx - 25, B - 94 - Math.sin(t * 3 + i) * 4); ctx.stroke();
        ctx.fillStyle = '#fef3c7'; for (let k = 0; k < 3; k++) { rr(cx + 2 + k * 15, B - 62, 11, 18, 3); ctx.fill(); ctx.fillStyle = '#dc2626'; ctx.fillRect(cx + 2 + k * 15, B - 64, 11, 3); ctx.fillStyle = '#fef3c7'; }
        ctx.fillStyle = '#fde047'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(cx + 28 + k * 5, B - 84 + k % 2 * 4, 3, 8, .3, 0, 7); ctx.fill(); } // hanging bananas
        ctx.fillStyle = '#2563eb'; ctx.fillRect(cx - tw / 2 - 28, B - 18, 24, 5); ctx.fillRect(cx - tw / 2 - 25, B - 13, 4, 13); ctx.fillRect(cx - tw / 2 - 11, B - 13, 4, 13); // bench
        person(cx - tw / 2 - 16, B - 14, .78, { shirt: pickH(SHIRT, i + 1), pants: '#475569', ph: 0, skin: pickH(SKIN, i + 2), sit: true });
        person(cx + tw / 2 + 14, B, .8, { shirt: pickH(SHIRT, i + 4), pants: '#1f2937', ph: 0, skin: pickH(SKIN, i), dir: -1 });
        break; }
      case 'hospital': { // multi-storey private hospital: glass entrance, red-cross board, ambulance
        const hw = 300, hh = 270;
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(cx - hw / 2, B - hh, hw, hh);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - hw / 2, B - hh, hw, 12);
        for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) { ctx.fillStyle = hash(r * 9 + c + i) > .3 ? '#bfdbfe' : '#fde68a'; ctx.fillRect(cx - hw / 2 + 16 + c * 34, B - hh + 54 + r * 34, 22, 22); }
        ctx.fillStyle = '#1d4ed8'; rr(cx - 128, B - hh + 16, 256, 30, 6); ctx.fill(); txt(name || 'হাসপাতাল', cx + 8, B - hh + 38, 20, '#fff', 'center', 700);
        ctx.fillStyle = '#fff'; rr(cx - 122, B - hh + 20, 24, 22, 4); ctx.fill(); ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 114, B - hh + 22, 8, 18); ctx.fillRect(cx - 119, B - hh + 27, 18, 8);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 50, B - 70, 100, 70); ctx.fillStyle = '#7dd3fc'; ctx.fillRect(cx - 42, B - 62, 40, 62); ctx.fillRect(cx + 2, B - 62, 40, 62);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 58, B - 84, 116, 14); txt('জরুরি বিভাগ ২৪/৭', cx, B - 73, 10, '#fff', 'center', 700);
        ctx.fillStyle = '#fff'; rr(cx + 108, B - 52, 78, 40, 6); ctx.fill(); ctx.fillStyle = '#dc2626'; ctx.fillRect(cx + 108, B - 34, 78, 5); ctx.fillRect(cx + 140, B - 48, 6, 18); ctx.fillRect(cx + 134, B - 42, 18, 6);
        ctx.fillStyle = '#111'; circle(cx + 124, B - 12, 8); circle(cx + 172, B - 12, 8);
        ctx.fillStyle = (Math.floor(t * 3) % 2) ? '#ef4444' : '#3b82f6'; ctx.fillRect(cx + 140, B - 58, 14, 6);
        break; }
      case 'chop': { // fritter / singara shop with kadai
        shopBody(cx, B, w, h, '#fde68a'); awning(cx, B, w, '#ea580c', '#fff', 64);
        sign(cx, B - h + 4, w - 14, name || 'চপ-সিঙ্গারা', '#b91c1c', '#fef08a', 14);
        txt('পেঁয়াজু • বেগুনি • চপ', cx, B - h + 50, 11, '#7c2d12', 'center', 700);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(cx - 18, B - 40, 32, 9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#f59e0b'; for (let k = 0; k < 6; k++) circle(cx - 38 + k * 12, B - 43 + (k % 2) * 3, 5);
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(cx - 40, B - 28); ctx.quadraticCurveTo(cx - 34 + Math.sin(t * 9) * 3, B - 44, cx - 28, B - 28); ctx.fill();
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx + 22, B - 66, 36, 40); ctx.fillStyle = '#f59e0b'; for (let k = 0; k < 6; k++) circle(cx + 30 + (k % 3) * 11, B - 56 + Math.floor(k / 3) * 16, 4.5);
        break; }
      case 'pharmacy': shopBody(cx, B, w, h, '#ecfeff'); awning(cx, B, w, '#16a34a', '#fff', 62); sign(cx, B - h + 4, w - 14, name || 'ফার্মেসি', '#15803d', '#fff', 16); ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 4, B - 44, 8, 22); ctx.fillRect(cx - 11, B - 37, 22, 8); break;
      case 'biryani': shopBody(cx, B, w, h, '#fed7aa'); awning(cx, B, w, '#b91c1c', '#fde68a', 62); sign(cx, B - h + 4, w - 14, name || 'কাচ্চি বিরিয়ানি', '#7f1d1d', '#fde68a', 14); ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.ellipse(cx, B - 34, 30, 12, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(cx, B - 40, 26, 7, 0, 0, 7); ctx.fill(); break;
      case 'mobile': shopBody(cx, B, w, h, '#e0e7ff'); awning(cx, B, w, '#2563eb', '#fff', 62); sign(cx, B - h + 4, w - 14, name || 'মোবাইল ঘর', '#1d4ed8', '#fff', 15); ctx.fillStyle = '#0f172a'; for (let k = 0; k < 6; k++) rr(cx - w / 2 + 12 + k * ((w - 36) / 6), B - 46, 12, 22, 2), ctx.fill(); break;
      case 'garments': shopBody(cx, B, w, h, '#fbcfe8'); awning(cx, B, w, '#a21caf', '#fff', 62); sign(cx, B - h + 4, w - 14, name || 'ফ্যাশন হাউস', '#86198f', '#fff', 14); for (let k = 0; k < 5; k++) { ctx.fillStyle = pickH(SHIRT, i + k); ctx.fillRect(cx - w / 2 + 12 + k * ((w - 30) / 5), B - 50, 14, 34); } break;
      case 'salon': shopBody(cx, B, w, h, '#ddd6fe'); awning(cx, B, w, '#7c3aed', '#fff', 62); sign(cx, B - h + 4, w - 14, name || 'জেন্টস সেলুন', '#5b21b6', '#fff', 14); ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - 24, B - 52, 48, 36); break;
      case 'fruits': shopBody(cx, B, w, h, '#fef9c3'); awning(cx, B, w, '#16a34a', '#fde047', 62); sign(cx, B - h + 4, w - 14, name || 'ফল-ফলাদি', '#166534', '#fff', 15); for (let k = 0; k < 8; k++) { ctx.fillStyle = pickH(['#ef4444', '#facc15', '#22c55e', '#fb923c'], i + k); circle(cx - w / 2 + 14 + k * ((w - 28) / 8), B - 20, 8); } break;
      case 'furniture': shopBody(cx, B, w + 20, h, '#fde4c8'); awning(cx, B, w + 20, '#92400e', '#fde68a', 62); sign(cx, B - h + 4, w + 6, name || 'আলমারি-খাট-সোফা', '#78350f', '#fde68a', 13);
        ctx.fillStyle = '#b45309'; rr(cx - w / 2 + 4, B - 40, 46, 24, 4); ctx.fill(); ctx.fillStyle = '#dc2626'; rr(cx - w / 2 + 8, B - 52, 38, 14, 5); ctx.fill();
        ctx.fillStyle = '#78350f'; ctx.fillRect(cx + 6, B - 70, 30, 56); ctx.fillStyle = '#a16207'; ctx.fillRect(cx + 9, B - 66, 11, 48); ctx.fillRect(cx + 22, B - 66, 11, 48);
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx + 44, B - 36, 34, 5); ctx.fillRect(cx + 46, B - 31, 4, 16); ctx.fillRect(cx + 72, B - 31, 4, 16); break;
      case 'restaurant': shopBody(cx, B, w + 16, h, '#fef2f2'); awning(cx, B, w + 16, '#be123c', '#fde68a', 62); sign(cx, B - h + 4, w, name || 'রেস্টুরেন্ট', '#9f1239', '#fef08a', 16);
        ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - w / 2 + 6, B - 52, w - 12, 34); ctx.fillStyle = '#7c2d12'; for (let k = 0; k < 3; k++) { ctx.fillRect(cx - w / 2 + 14 + k * 38, B - 36, 20, 4); ctx.fillRect(cx - w / 2 + 22 + k * 38, B - 32, 4, 12); }
        ctx.fillStyle = '#fde047'; circle(cx - w / 2 + 20, B - 44, 4); circle(cx + w / 2 - 20, B - 44, 4); break;
      default: shopBody(cx, B, w, h, pickH(PAL, i * 5.1)); awning(cx, B, w, '#ef4444', '#fff', 62); sign(cx, B - h + 4, w - 14, name || 'মুদি দোকান', '#fff', '#1f2937', 15); ctx.fillStyle = '#7c2d12'; ctx.fillRect(cx - 20, B - 46, 40, 46);
    }
  }

  function tree(cx, B, i, blossom) {
    ctx.fillStyle = '#7c4a21'; ctx.fillRect(cx - 5, B - 72, 10, 72);
    ctx.fillStyle = '#22a35a'; ctx.beginPath(); ctx.arc(cx, B - 92, 36, 0, 7); ctx.arc(cx - 24, B - 74, 24, 0, 7); ctx.arc(cx + 24, B - 74, 24, 0, 7); ctx.fill();
    if (blossom) { const c = pickH(['#ef4444', '#f97316', '#e11d74', '#facc15'], i); ctx.fillStyle = c; for (let k = 0; k < 16; k++) circle(cx - 36 + hash(i + k) * 72, B - 62 - hash(i * 2 + k) * 56, 4); }
  }
  function pole(cx, B) { ctx.fillStyle = '#6b7280'; ctx.fillRect(cx - 3, B - 140, 6, 140); ctx.fillRect(cx - 26, B - 132, 52, 5); ctx.fillRect(cx - 18, B - 112, 36, 4); }
  function billboard(cx, B, i, text) {
    ctx.fillStyle = '#555'; ctx.fillRect(cx - 40, B - 50, 5, 50); ctx.fillRect(cx + 35, B - 50, 5, 50);
    const g = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0); g.addColorStop(0, '#f43f5e'); g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g; rr(cx - 55, B - 112, 110, 62, 6); ctx.fill();
    ctx.font = '700 14px "Hind Siliguri",sans-serif'; txt(text, cx, B - 78, 14, '#fff', 'center', 700);
  }

  /* ---------- flower beds along the kerb ---------- */
  function flowerBed(cx, B, seed) {
    ctx.fillStyle = '#9ca3af'; rr(cx - 26, B - 12, 52, 12, 3); ctx.fill();
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.ellipse(cx, B - 16, 28, 14, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.ellipse(cx - 9, B - 20, 16, 11, 0, 0, 7); ctx.fill();
    for (let k = 0; k < 11; k++) { ctx.fillStyle = pickH(FLOWER, seed * 3 + k); circle(cx - 22 + hash(seed + k * 1.7) * 44, B - 14 - hash(seed * 2 + k) * 18, 3.2); }
  }

  /* ---------- parked rickshaw stand ---------- */
  function rickStand(cx, B, label, seed, count, plates) {
    const total = count * 82, left = cx - total / 2, t = E.time();
    ctx.fillStyle = '#4b5563'; ctx.fillRect(cx - 4, B - 150, 6, 150);
    ctx.fillStyle = '#15803d'; rr(cx - 140, B - 196, 280, 46, 8); ctx.fill();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; rr(cx - 136, B - 192, 272, 38, 6); ctx.stroke();
    txt(label, cx, B - 165, label.length > 18 ? 20 : 24, '#fff', 'center', 700);
    for (let k = 0; k < count; k++) {
      const rx = left + 41 + k * 82, col = FRAME[(seed + k) % FRAME.length];
      rickshaw(rx, B + (k % 2) * 6, .78, { col, seed: seed * 5 + k, t, wa: 0, pa: 0, plate: plates ? plates[k % plates.length] : null, mask: k % 3 === 0, cap: k % 2 ? '#e5e7eb' : null, lungi: pickH(['#2563eb', '#16a34a', '#b91c1c', '#0f766e'], seed + k), shirt: pickH(['#f1e4c8', '#f59e0b', '#94a3b8'], seed + k * 2), skin: pickH(SKIN, seed + k), puller: true });
    }
  }

  /* ---------- Vitamin Gate: arched campus-road gate with planters ---------- */
  function vitaminGate(cx, B) {
    const t = E.time();
    for (const dx of [-190, 160]) {
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + dx, B - 230, 40, 230);
      ctx.fillStyle = '#cbd5e1'; for (let k = 0; k < 9; k++) ctx.fillRect(cx + dx, B - 230 + k * 26, 40, 2);
      ctx.fillStyle = '#16a34a'; ctx.fillRect(cx + dx - 6, B - 244, 52, 14); ctx.fillStyle = '#fde047'; circle(cx + dx + 20, B - 258, 8);
      ctx.fillStyle = '#9ca3af'; rr(cx + dx - 8, B - 22, 56, 22, 3); ctx.fill();
    }
    ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.moveTo(cx - 190, B - 200); ctx.quadraticCurveTo(cx, B - 292, cx + 200, B - 200); ctx.lineTo(cx + 200, B - 250); ctx.quadraticCurveTo(cx, B - 342, cx - 190, B - 250); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 190, B - 250); ctx.quadraticCurveTo(cx, B - 342, cx + 200, B - 250); ctx.stroke();
    txt('বিটুমিন গেট', cx + 5, B - 268, 38, '#fef08a', 'center', 700, '#064e3b');
    txt('BITUMEN GATE', cx + 5, B - 246, 14, '#d1fae5', 'center', 700);
    ctx.fillStyle = '#ef4444'; rr(cx - 28, B - 316, 56, 24, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + 4, B - 304, 12, -1.57, 1.57); ctx.fillRect(cx, B - 316, 4, 24); ctx.fill();
    for (let k = 0; k < 9; k++) { const lx = cx - 150 + k * 38, sag = Math.sin((k / 8) * Math.PI) * 10; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, B - 222 - sag); ctx.lineTo(lx, B - 210 - sag); ctx.stroke(); ctx.fillStyle = k % 2 ? '#fde047' : '#fb923c'; circle(lx, B - 204 - sag, 5 + Math.sin(t * 4 + k) * .6); }
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx + 60, B - 64, 70, 64); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + 66, B - 58, 58, 26); ctx.fillStyle = '#334155'; ctx.fillRect(cx + 54, B - 70, 82, 8); // guard booth
    person(cx + 148, B, .85, { shirt: '#1e3a8a', pants: '#1e3a8a', ph: 0, skin: SKIN[1] });
    for (let k = 0; k < 6; k++) flowerBed(cx - 200 + k * 76, B + 2, 100 + k);
    avenue(cx + 300, B, 'বিটুমিন গেট রোড', 'BITUMEN GATE ROAD', 1);
  }

  /* ---------- real-Dhaka street kit: mid-rise facades, shutters, poles, footbridge, flyover ---------- */
  const WALL = ['#cfc9bd', '#d9d3c5', '#bdb8ad', '#dccab2', '#c6cdc7', '#cfc0aa', '#c0a892', '#e3dacb', '#aeb5ba', '#cdb7a8', '#d6d0c2', '#b9b3a6'];
  const CURT = ['#fbcfe8', '#bae6fd', '#fde68a', '#bbf7d0', '#fecaca', '#ddd6fe'];
  const ROOFAD = ['#ea580c', '#dc2626', '#f59e0b', '#2563eb', '#16a34a', '#be185d'];
  const ROOFTXT = ['ফ্ল্যাট বিক্রয়', 'ভর্তি চলছে', 'কোচিং সেন্টার', 'ডায়াগনস্টিক', 'জুয়েলার্স', 'আজই কিনুন', 'সেল সেল'];
  const HANG = ['ক্লিনিক', 'হোটেল', 'GYM', 'কোচিং', 'ল্যাব', 'বিউটি পার্লার'];
  function facade(cx, B, w, seed) {
    const floors = 3 + Math.floor(hash(seed * 1.3) * 6), hh = Math.min(B - 8, 100 + floors * 40), x0 = cx - w / 2;
    const base = pickH(WALL, seed * 2.7), n = Math.floor((hh - 98) / 40);
    const g = ctx.createLinearGradient(0, B - hh, 0, B); g.addColorStop(0, base); g.addColorStop(1, 'rgba(70,64,56,1)');
    ctx.fillStyle = base; ctx.fillRect(x0, B - hh, w, hh);
    ctx.globalAlpha = .22; ctx.fillStyle = g; ctx.fillRect(x0, B - hh, w, hh); ctx.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(40,36,30,.10)'; ctx.fillRect(x0 + 10 + hash(seed + k) * (w - 24), B - hh + 6, 4 + hash(seed * k) * 6, hh * (.35 + hash(seed + k * 2) * .4)); }
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x0 + w - 8, B - hh, 8, hh); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(x0, B - hh, 3, hh);
    ctx.fillStyle = 'rgba(40,36,30,.35)'; ctx.fillRect(x0 - 1, B - hh - 5, w + 2, 6);
    const cols = Math.max(2, Math.floor(w / 46));
    for (let r = 0; r < n; r++) {
      const fy = B - 98 - r * 40;
      ctx.fillStyle = 'rgba(40,36,30,.28)'; ctx.fillRect(x0, fy + 8, w, 3);
      for (let c = 0; c < cols; c++) {
        const wx = x0 + 9 + c * ((w - 18) / cols), q = hash(seed * 13 + r * 7 + c * 3.1);
        ctx.fillStyle = '#3f4650'; ctx.fillRect(wx - 1, fy - 24, 27, 27);
        ctx.fillStyle = q > .72 ? pickH(CURT, seed + r + c) : '#7d93a3'; ctx.fillRect(wx + 1, fy - 22, 23, 23);
        if (q <= .72) { ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(wx + 1, fy + 1); ctx.lineTo(wx + 10, fy - 22); ctx.lineTo(wx + 17, fy - 22); ctx.lineTo(wx + 8, fy + 1); ctx.fill(); }
        ctx.fillStyle = '#3f4650'; ctx.fillRect(wx + 12, fy - 22, 1.6, 23);
        if (q > .86) { ctx.strokeStyle = '#2b3038'; ctx.lineWidth = 1; for (let b = 0; b < 4; b++) { ctx.beginPath(); ctx.moveTo(wx + 2 + b * 6, fy - 22); ctx.lineTo(wx + 2 + b * 6, fy + 1); ctx.stroke(); } }
        if (q > .38 && q < .5) { ctx.fillStyle = '#e5e7eb'; ctx.fillRect(wx + 7, fy + 3, 16, 10); ctx.fillStyle = '#9ca3af'; circle(wx + 15, fy + 8, 3.4); ctx.fillStyle = '#64748b'; ctx.fillRect(wx + 7, fy + 12, 16, 2); }
        if (q > .56 && q < .66) { ctx.fillStyle = '#6b7280'; ctx.fillRect(wx - 4, fy + 2, 34, 4); ctx.fillStyle = 'rgba(55,60,70,.55)'; ctx.fillRect(wx - 4, fy - 12, 1.6, 14); ctx.fillRect(wx + 29, fy - 12, 1.6, 14);
          ctx.fillStyle = pickH(['#ef4444', '#3b82f6', '#f59e0b', '#f1f5f9', '#22c55e'], seed + c * 3 + r); ctx.fillRect(wx + 3, fy - 7, 8, 11); ctx.fillStyle = pickH(['#f1f5f9', '#ec4899', '#a855f7'], seed + c + r * 5); ctx.fillRect(wx + 14, fy - 5, 7, 9); }
      }
    }
    // roof: tank, antenna, or a bright rooftop ad board like the real Dhaka skyline
    const ry = B - hh - 5, q2 = hash(seed * 5.5);
    if (q2 > .62 && hh < 330) {
      const ac = pickH(ROOFAD, seed), bw = Math.min(w - 20, 118);
      ctx.fillStyle = '#475569'; ctx.fillRect(cx - bw / 2 + 8, ry - 12, 4, 12); ctx.fillRect(cx + bw / 2 - 12, ry - 12, 4, 12);
      ctx.fillStyle = ac; ctx.fillRect(cx - bw / 2, ry - 58, bw, 48); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.strokeRect(cx - bw / 2 + 4, ry - 54, bw - 8, 40);
      txt(pickH(ROOFTXT, seed * 1.9), cx, ry - 28, 15, '#fff', 'center', 700);
    } else if (q2 > .3) { ctx.fillStyle = hash(seed) > .5 ? '#1f2937' : '#3b82f6'; rr(cx - 12, ry - 26, 26, 24, 4); ctx.fill(); ctx.fillStyle = '#64748b'; ctx.fillRect(cx - 9, ry - 4, 3, 4); ctx.fillRect(cx + 7, ry - 4, 3, 4); }
    else { ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 20, ry); ctx.lineTo(cx + 20, ry - 52); ctx.moveTo(cx + 12, ry - 40); ctx.lineTo(cx + 28, ry - 40); ctx.moveTo(cx + 14, ry - 30); ctx.lineTo(cx + 26, ry - 30); ctx.stroke(); }
    // hanging vertical signboard on the corner
    if (hash(seed * 9.1) > .6 && n >= 2) {
      const sx = x0 + 6, sy = B - 140 - hash(seed) * 30, c = pickH(['#16a34a', '#facc15', '#2563eb', '#ef4444'], seed * 3);
      ctx.fillStyle = '#374151'; ctx.fillRect(sx - 6, sy, 6, 3); ctx.fillStyle = c; rr(sx, sy - 6, 40, 46, 4); ctx.fill();
      txt(pickH(HANG, seed * 2.3), sx + 20, sy + 22, 11, c === '#facc15' ? '#111' : '#fff', 'center', 700);
    }
  }
  function shutterShop(cx, B, w, seed) {
    const col = pickH(['#8b2e2a', '#2f5d8a', '#3f7a54', '#7a7f86', '#6d4c9a', '#b3873a'], seed * 2.1), h = 94, x0 = cx - w / 2 + 4;
    ctx.fillStyle = '#9b9488'; ctx.fillRect(cx - w / 2, B - h - 14, w, 14);
    txt(poolName('default', seed), cx, B - h - 3, 11, '#3f3a33', 'center', 700);
    ctx.fillStyle = col; ctx.fillRect(x0, B - h, w - 8, h);
    ctx.strokeStyle = 'rgba(0,0,0,.30)'; ctx.lineWidth = 1; ctx.beginPath(); for (let y = B - h + 5; y < B; y += 5) { ctx.moveTo(x0, y); ctx.lineTo(x0 + w - 8, y); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(x0, B - h, 10, h); ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x0, B - 22, w - 8, 22);
    ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 4, B - 14, 8, 7); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, B - 14, 3, Math.PI, 0); ctx.stroke();
    for (let k = 0; k < 2; k++) if (hash(seed * 4 + k) > .45) { ctx.fillStyle = pickH(['#fde68a', '#fecaca', '#bfdbfe', '#fff'], seed + k); ctx.fillRect(x0 + 14 + k * (w - 60) * .8 + hash(seed + k) * 10, B - h + 14 + k * 12, 14, 20); }
  }
  function utilityPole(cx, B, seed) {
    const hgt = 200 + hash(seed) * 20;
    ctx.fillStyle = '#8a8d93'; ctx.beginPath(); ctx.moveTo(cx - 4.5, B); ctx.lineTo(cx - 3, B - hgt); ctx.lineTo(cx + 3, B - hgt); ctx.lineTo(cx + 4.5, B); ctx.fill();
    ctx.fillStyle = '#6b7078'; ctx.fillRect(cx - 28, B - hgt + 6, 56, 4); ctx.fillRect(cx - 20, B - hgt + 26, 40, 3.5);
    ctx.fillStyle = '#e5e7eb'; for (const dx of [-24, -10, 10, 24]) ctx.fillRect(cx + dx - 1.5, B - hgt + 1, 3, 6);
    ctx.strokeStyle = 'rgba(20,20,28,.75)'; ctx.lineWidth = 1.1; for (let k = 0; k < 5; k++) { const sx = cx - 26 + k * 13, sag = 8 + hash(seed + k) * 14; ctx.beginPath(); ctx.moveTo(sx, B - hgt + 10); ctx.quadraticCurveTo(sx + 70, B - hgt + 10 + sag, sx + 150, B - hgt + 10 + hash(seed * k) * 6); ctx.stroke(); }
    if (hash(seed * 3.7) > .6) { ctx.fillStyle = '#4b5563'; rr(cx + 6, B - hgt + 34, 18, 26, 3); ctx.fill(); ctx.fillStyle = '#9ca3af'; ctx.fillRect(cx + 9, B - hgt + 38, 12, 3); }
    if (hash(seed * 6.1) > .55) { ctx.fillStyle = '#1e40af'; rr(cx - 9, B - 150, 18, 38, 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 6, B - 144, 12, 4); } // pasted poster
  }
  function streetLamp(cx, B) {
    ctx.fillStyle = '#4b5563'; ctx.fillRect(cx - 3, B - 190, 6, 190);
    ctx.beginPath(); ctx.moveTo(cx + 1, B - 188); ctx.quadraticCurveTo(cx + 18, B - 200, cx + 40, B - 190); ctx.lineWidth = 4; ctx.strokeStyle = '#4b5563'; ctx.stroke();
    ctx.fillStyle = '#e5e7eb'; rr(cx + 30, B - 192, 22, 7, 3); ctx.fill();
  }
  function footbridge(cx, B, w) {
    const dy = B - 215, x0 = cx - w / 2;
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(x0 - 6, dy, 14, B - dy); ctx.fillRect(cx + w / 2 - 8, dy, 14, B - dy);
    ctx.fillStyle = '#6b7280'; ctx.fillRect(x0 - 40, dy, w + 80, 12);
    ctx.fillStyle = '#d1d5db'; ctx.fillRect(x0 - 40, dy - 4, w + 80, 4);
    ctx.fillStyle = '#7c8794'; ctx.fillRect(x0 - 40, dy - 52, w + 80, 4);
    ctx.fillStyle = 'rgba(190,200,210,.45)'; ctx.fillRect(x0 - 40, dy - 48, w + 80, 44);
    ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = x0 - 40; x <= x0 + w + 40; x += 22) { ctx.moveTo(x, dy - 52); ctx.lineTo(x, dy - 4); } ctx.stroke();
    ctx.fillStyle = '#6b7280'; ctx.beginPath(); ctx.moveTo(x0 - 40, dy + 12); ctx.lineTo(x0 - 120, B); ctx.lineTo(x0 - 100, B); ctx.lineTo(x0 - 40, dy + 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x0 + w + 40, dy + 12); ctx.lineTo(x0 + w + 120, B); ctx.lineTo(x0 + w + 100, B); ctx.fill();
    ctx.fillStyle = '#1d4ed8'; ctx.fillRect(cx - 70, dy - 40, 140, 30); txt('ফুট ওভারব্রিজ', cx, dy - 19, 13, '#fff', 'center', 700);
  }
  function flyoverBand(scroll, par) {
    const seg = 1500, i0 = Math.floor((scroll - 100) / seg), i1 = Math.ceil((scroll + 1100) / seg), top = 196, dh = 24;
    for (let i = i0; i <= i1; i++) {
      if (hash(i * 3.3 + 1) < .35) continue;
      const x0 = i * seg - scroll, len = 700 + hash(i) * 700;
      ctx.fillStyle = 'rgba(120,126,134,.95)'; ctx.fillRect(x0, top, len, dh);
      ctx.fillStyle = 'rgba(80,86,94,1)'; ctx.fillRect(x0, top + dh, len, 6);
      for (let p = 40; p < len; p += 170) { ctx.fillStyle = 'rgba(138,142,150,1)'; ctx.fillRect(x0 + p, top + dh, 18, 190); ctx.fillStyle = 'rgba(100,105,112,1)'; ctx.fillRect(x0 + p - 8, top + dh, 34, 6); }
      ctx.fillStyle = '#d1d5db'; ctx.fillRect(x0, top - 10, len, 10);
      for (let p = 0; p < len; p += 60) { ctx.fillStyle = (Math.floor(p / 60) % 2) ? '#dc2626' : '#f8fafc'; ctx.fillRect(x0 + p, top - 9, 58, 7); }
      ctx.fillStyle = 'rgba(60,64,70,.8)'; for (let p = 0; p < len; p += 8) ctx.fillRect(x0 + p, top - 18, 1.5, 9);
    }
  }
  function farTown(scroll, spacing, minH, maxH, alpha, seed, haze) {
    const i0 = Math.floor((scroll - 120) / spacing), i1 = Math.ceil((scroll + 960 + 120) / spacing);
    for (let i = i0; i <= i1; i++) {
      const h = minH + hash(i + seed) * (maxH - minH), w = spacing * (.85 + hash(i * 2.1 + seed) * .35), x = i * spacing - scroll, q = hash(i * 3.7 + seed);
      ctx.globalAlpha = alpha; ctx.fillStyle = pickH(WALL, i + seed * 1.3); ctx.fillRect(x, 384 - h, w, h);
      ctx.fillStyle = 'rgba(60,64,72,.5)';
      for (let wy = 384 - h + 10; wy < 372; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 13) if (hash(wx * .13 + wy * .7 + seed) > .3) ctx.fillRect(wx, wy, 6, 9);
      ctx.fillStyle = 'rgba(40,40,46,.35)'; ctx.fillRect(x, 384 - h - 3, w, 4);
      if (q > .7) { ctx.fillStyle = pickH(ROOFAD, i + seed); ctx.fillRect(x + w * .15, 384 - h - 30, w * .62, 28); }
      else if (q > .45) { ctx.fillStyle = '#4b5563'; ctx.fillRect(x + w * .4, 384 - h - 10, 14, 10); }
      ctx.globalAlpha = 1; ctx.fillStyle = haze; ctx.fillRect(x, 384 - h - 32, w, h + 32);
    }
  }
  function garbage(cx, B, seed) {
    ctx.fillStyle = '#5b4b3b'; ctx.beginPath(); ctx.ellipse(cx, B - 4, 26, 9, 0, Math.PI, 0); ctx.fill();
    for (let k = 0; k < 9; k++) { ctx.fillStyle = pickH(['#e5e7eb', '#9ca3af', '#facc15', '#3b82f6', '#16a34a', '#f1f5f9'], seed + k); ctx.fillRect(cx - 22 + hash(seed + k) * 42, B - 14 - hash(seed * k) * 8, 5, 4); }
  }

  /* ---------- tangled overhead wires ---------- */
  function wires(scroll) {
    ctx.strokeStyle = 'rgba(20,20,30,.55)'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      for (let x = -10; x <= 970; x += 20) { const y = 118 + k * 13 + Math.sin((x + scroll) * .011 + k * 1.7) * 7 + Math.sin((x + scroll) * .031 + k) * 2; if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }


  /* ---------- big landmarks ---------- */
  function apartment(cx, B, w, h, seed) {
    ctx.fillStyle = pickH(['#fcd5b5', '#c7d2fe', '#bbf7d0', '#fecdd3', '#fde68a'], seed); ctx.fillRect(cx - w / 2, B - h, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(cx + w / 2 - 14, B - h, 14, h);
    for (let r = 0; r < Math.floor(h / 38); r++) for (let c = 0; c < Math.floor(w / 36); c++) {
      const x = cx - w / 2 + 8 + c * 36, y = B - h + 10 + r * 38;
      ctx.fillStyle = hash(r * 9 + c + seed) > .4 ? '#fde68a' : '#94a3b8'; ctx.fillRect(x, y, 22, 22);
      ctx.fillStyle = '#6b7280'; ctx.fillRect(x - 3, y + 22, 28, 4);
      if (hash(r * 5 + c * 3 + seed) > .75) { ctx.fillStyle = '#e5e7eb'; ctx.fillRect(x + 22, y + 4, 12, 12); }
      if (hash(r * 7 + c + seed) > .8) { ctx.fillStyle = pickH(SHIRT, r + c); ctx.fillRect(x + 2, y + 24, 12, 10); }
    }
    ctx.fillStyle = '#475569'; ctx.fillRect(cx - 16, B - 46, 32, 46);
  }
  function royalHouse(cx, B) {
    const t = E.time();
    ctx.fillStyle = '#bbf7d0'; ctx.fillRect(cx - 270, B - 24, 540, 24);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - 200, B - 200, 400, 176);
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 250, B - 150, 60, 126); ctx.fillRect(cx + 190, B - 150, 60, 126);
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.moveTo(cx - 110, B - 200); ctx.lineTo(cx, B - 262); ctx.lineTo(cx + 110, B - 200); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.arc(cx, B - 262, 38, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 2, B - 318, 4, 22); circle(cx, B - 322, 5);
    for (const dx of [-230, 230]) { ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.arc(cx + dx, B - 150, 28, Math.PI, 0); ctx.fill(); }
    for (let k = 0; k < 7; k++) { const x = cx - 150 + k * 50; ctx.fillStyle = '#fff'; ctx.fillRect(x - 6, B - 190, 12, 166); ctx.fillStyle = '#ca8a04'; ctx.fillRect(x - 9, B - 192, 18, 6); ctx.fillRect(x - 9, B - 30, 18, 6); }
    for (let k = 0; k < 6; k++) { const x = cx - 125 + k * 50; ctx.fillStyle = hash(k + 3) > .3 ? '#fde68a' : '#93c5fd'; rr(x - 11, B - 150, 22, 40, 11); ctx.fill(); }
    ctx.fillStyle = '#7c2d12'; rr(cx - 22, B - 80, 44, 56, 22); ctx.fill(); ctx.fillStyle = '#facc15'; rr(cx - 22, B - 80, 44, 56, 22); ctx.lineWidth = 2; ctx.strokeStyle = '#facc15'; ctx.stroke();
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 12; k++) { ctx.moveTo(cx - 270 + k * 45, B); ctx.lineTo(cx - 270 + k * 45, B - 30); } ctx.moveTo(cx - 270, B - 30); ctx.lineTo(cx + 270, B - 30); ctx.stroke();
    for (const dx of [-60, 60]) { ctx.fillStyle = '#fde047'; circle(cx + dx, B - 36, 5 + Math.sin(t * 3 + dx) * .5); }
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 296, B - 90, 6, 90); ctx.fillStyle = '#16a34a'; ctx.fillRect(cx - 290, B - 90, 30 + Math.sin(t * 4) * 3, 16);
    for (let k = 0; k < 5; k++) flowerBed(cx - 220 + k * 110, B + 4, 40 + k);
  }
  function sheshTable(cx, B) {
    const t = E.time();
    ctx.fillStyle = '#78350f'; for (const dx of [-120, -40, 40, 120]) ctx.fillRect(cx + dx - 4, B - 110, 8, 110);
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.moveTo(cx - 150, B - 104); ctx.lineTo(cx + 150, B - 104); ctx.lineTo(cx + 132, B - 130); ctx.lineTo(cx - 132, B - 130); ctx.fill();
    ctx.fillStyle = '#14532d'; ctx.fillRect(cx - 150, B - 106, 300, 6);
    const g = ctx.createLinearGradient(cx - 110, 0, cx + 110, 0); g.addColorStop(0, '#be123c'); g.addColorStop(1, '#f97316');
    ctx.fillStyle = g; rr(cx - 96, B - 176, 192, 44, 8); ctx.fill();
    txt('শেফস টেবিল', cx, B - 153, 27, '#fffbeb', 'center', 700, 'rgba(0,0,0,.35)');
    txt("CHEF'S TABLE", cx, B - 137, 12, '#fde68a', 'center', 700);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 140, B - 100); ctx.quadraticCurveTo(cx, B - 80, cx + 140, B - 100); ctx.stroke();
    for (let k = 0; k < 9; k++) { const lx = cx - 128 + k * 32, ly = B - 92 + Math.sin((k / 8) * Math.PI) * 10; ctx.fillStyle = k % 2 ? '#fde047' : '#fb7185'; circle(lx, ly, 4 + Math.sin(t * 5 + k) * .5); }
    ctx.fillStyle = '#92400e'; ctx.fillRect(cx - 120, B - 40, 100, 7); ctx.fillRect(cx + 20, B - 40, 100, 7);
    for (const dx of [-112, -32, 28, 108]) { ctx.fillRect(cx + dx, B - 33, 5, 33); }
    ctx.fillStyle = '#7c2d12'; for (const dx of [-120, -60, 30, 90]) ctx.fillRect(cx + dx, B - 18, 30, 5);
    ctx.fillStyle = '#fff'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(cx - 104 + k * 36, B - 44, 8, 3, 0, 0, 7); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; for (const dx of [-84, -12, 54, 100]) { ctx.beginPath(); ctx.moveTo(cx + dx, B - 48); ctx.bezierCurveTo(cx + dx - 6, B - 60, cx + dx + 6, B - 68, cx + dx, B - 78 - Math.sin(t * 3 + dx) * 4); ctx.stroke(); }
    person(cx - 86, B - 7, .8, { shirt: '#0ea5e9', pants: '#334155', sit: true, skin: SKIN[2] });
    person(cx - 6, B - 7, .8, { shirt: '#f43f5e', pants: '#1e293b', sit: true, skin: SKIN[1] });
    person(cx + 72, B - 7, .8, { shirt: '#22c55e', pants: '#475569', sit: true, skin: SKIN[0], dir: -1 });
  }
  function mosque(cx, B) {
    const t = E.time();
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 250, B - 36, 500, 36);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx - 150, B - 170, 300, 134);
    ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.arc(cx, B - 170, 92, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, B - 170, 92, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 2, B - 288, 4, 26); ctx.beginPath(); ctx.arc(cx, B - 296, 10, .4, 5.9); ctx.fill();
    for (const dx of [-120, 120]) { ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.arc(cx + dx, B - 170, 34, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#facc15'; ctx.fillRect(cx + dx - 1.5, B - 218, 3, 14); }
    for (const dx of [-200, 200]) { ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + dx - 16, B - 300, 32, 264); ctx.fillStyle = '#cbd5e1'; ctx.fillRect(cx + dx - 22, B - 230, 44, 8); ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.moveTo(cx + dx - 20, B - 300); ctx.lineTo(cx + dx, B - 342); ctx.lineTo(cx + dx + 20, B - 300); ctx.fill(); ctx.fillStyle = '#facc15'; circle(cx + dx, B - 346, 4); ctx.fillStyle = '#14532d'; for (let k = 0; k < 4; k++) rr(cx + dx - 5, B - 280 + k * 44, 10, 22, 5), ctx.fill(); }
    for (let k = 0; k < 5; k++) { ctx.fillStyle = '#14532d'; rr(cx - 120 + k * 52, B - 120, 36, 80, 18); ctx.fill(); ctx.fillStyle = hash(k + 7) > .3 ? 'rgba(253,230,138,.7)' : 'rgba(147,197,253,.6)'; rr(cx - 116 + k * 52, B - 116, 28, 72, 14); ctx.fill(); }
    ctx.fillStyle = '#065f46'; rr(cx - 128, B - 400, 256, 46, 10); ctx.fill(); txt('মসজিদ আল মুস্তাফা', cx, B - 369, 24, '#fff', 'center', 700);
    for (let k = 0; k < 10; k++) { ctx.fillStyle = `rgba(110,231,183,${.5 + Math.sin(t * 3 + k) * .25})`; circle(cx - 140 + k * 31, B - 44, 3.5); }
    ctx.fillStyle = '#9ca3af'; for (let k = 0; k <= 12; k++) ctx.fillRect(cx - 250 + k * 42, B - 36, 4, 36);
    for (let k = 0; k < 4; k++) person(cx - 60 + k * 36, B, .85, { shirt: k % 2 ? '#f8fafc' : '#e2e8f0', pants: '#f1f5f9', skin: pickH(SKIN, k), ph: 0, hair: '#e5e7eb' });
  }
  function uiu(cx, B) {
    const t = E.time();
    ctx.fillStyle = '#bbf7d0'; ctx.fillRect(cx - 330, B - 18, 660, 18);
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 260, B - 250, 520, 232);
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(cx - 330, B - 190, 80, 172); ctx.fillRect(cx + 250, B - 190, 80, 172);
    const g = ctx.createLinearGradient(0, B - 330, 0, B - 18); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#0369a1');
    ctx.fillStyle = g; ctx.fillRect(cx - 110, B - 330, 220, 312);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 11; k++) ctx.fillRect(cx - 104 + k * 20, B - 326, 3, 304);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) { ctx.fillStyle = (r + c) % 3 ? '#38bdf8' : '#bae6fd'; ctx.fillRect(cx - 252 + c * 21, B - 240 + r * 30, 15, 20); ctx.fillRect(cx + 4 + 100 + c * 0, B - 240 + r * 30, 0, 0); }
    for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = (r + c) % 3 ? '#38bdf8' : '#bae6fd'; ctx.fillRect(cx + 130 + c * 21, B - 240 + r * 30, 15, 20); }
    ctx.fillStyle = '#e11d48'; ctx.fillRect(cx - 110, B - 350, 220, 22);
    txt('UIU', cx, B - 262, 52, '#ffffff', 'center', 700, 'rgba(3,105,161,.7)');
    txt('United International University', cx, B - 332, 15, '#fff', 'center', 700);
    ctx.fillStyle = '#f8fafc'; rr(cx - 42, B - 86, 84, 68, 8); ctx.fill(); ctx.fillStyle = '#0c4a6e'; rr(cx - 34, B - 80, 68, 62, 6); ctx.fill();
    for (const dx of [-300, 300]) { ctx.fillStyle = '#64748b'; ctx.fillRect(cx + dx, B - 250, 5, 232); ctx.fillStyle = '#16a34a'; ctx.fillRect(cx + dx + 5, B - 250, 54 + Math.sin(t * 4) * 3, 34); ctx.fillStyle = '#dc2626'; circle(cx + dx + 31, B - 233, 9); }
    for (const dx of [-170, 170]) { ctx.fillStyle = '#111827'; rr(cx + dx - 38, B - 150, 76, 40, 3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(cx + dx - 32, B - 144, 64, 28); ctx.fillStyle = '#111'; for (let k = 0; k < 4; k++) ctx.fillRect(cx + dx - 28, B - 138 + k * 6, 56 - (k % 2) * 14, 2); }
    for (let k = 0; k < 7; k++) flowerBed(cx - 240 + k * 80, B + 4, 70 + k);
    for (let k = 0; k < 5; k++) person(cx - 130 + k * 64, B, .9, { shirt: pickH(SHIRT, k * 2.3), pants: '#334155', skin: pickH(SKIN, k), bag: ['#ef4444', '#2563eb', '#111827'][k % 3], ph: t * 4 + k, dir: k % 2 ? 1 : -1 });
  }


  /* ---------- named-shop pools: every shop gets its own name ---------- */
  const NAME_POOL = {
    biryani: ['হাজি বিরিয়ানি', 'নয়ন বিরিয়ানি', 'মা বিরিয়ানি', 'শাহী বিরিয়ানি হাউস', 'তাজ বিরিয়ানি', 'আলিফ বিরিয়ানি', 'ঢাকাইয়া বিরিয়ানি', 'বিসমিল্লাহ বিরিয়ানি'],
    restaurant: ['আলকারিম রেস্টুরেন্ট', 'স্বাদ রেস্টুরেন্ট', 'ভোজন বিলাস', 'মধুমতি হোটেল', 'রূপসী বাংলা', 'ঢাকা দরবার', 'বিসমিল্লাহ হোটেল', 'পান্তা-ইলিশ ঘর', 'খাঁটি খানা'],
    pharmacy: ['আরোগ্য ফার্মেসি', 'লাইফ কেয়ার ফার্মা', 'মেডিকেয়ার', 'নিউ আলো ফার্মেসি', 'আল-আমিন ফার্মেসি', 'হেলথ প্লাস', 'কল্যাণ ফার্মেসি', 'সেবা ফার্মেসি'],
    bkash: ['রহমান টেলিকম', 'মা টেলিকম', 'সাবিনা ইলেকট্রনিক্স ও টেলিকম', 'নতুন বাজার টেলিকম', 'আপন টেলিকম', 'সততা টেলিকম', 'বাবা-মায়ের দোয়া টেলিকম', 'রিয়াদ মোবাইল ব্যাংকিং'],
    nagad: ['নগদ-বিকাশ সেন্টার', 'ভাই ভাই টেলিকম', 'তানিয়া টেলিকম', 'আল-মদিনা টেলিকম', 'রাজ মোবাইল সার্ভিস', 'প্রিয় টেলিকম', 'শাপলা টেলিকম'],
    confection: ['রহিম স্টোর', 'মায়ের দোয়া স্টোর', 'বিসমিল্লাহ স্টোর', 'সততা স্টোর', 'ভাই ভাই স্টোর', 'আপন জেনারেল স্টোর', 'নিউ মদিনা স্টোর', 'সোনালী কনফেকশনারী'],
    tong: ['আলামিন চা-সিগারেট', 'মামুন টি-স্টল', 'কাদের ভাইয়ের চা', 'রফিক টি-স্টল', 'আড্ডা চা-ঘর', 'বাবুল চা-পান', 'সালাম ভাইয়ের চায়ের দোকান'],
    tea: ['মায়ের হাতের চা', 'ভাই ভাই টি-স্টল', 'হাসান চা', 'জাকির টি-স্টল', 'নতুন আড্ডা চা'],
    chop: ['রহমতের চপ-সিঙ্গারা', 'হাজির চপ', 'মায়ের হাতের সিঙ্গারা', 'ঝাল-মুড়ি ও চপ', 'নতুন চপ-পুরি'],
    garments: ['ফ্যাশন হাউস', 'আয়েশা বস্ত্রালয়', 'ট্রেন্ডি জোন', 'নিউ স্টাইল গার্মেন্টস', 'রংধনু ফ্যাশন', 'বিউটি বুটিক্স'],
    mobile: ['মোবাইল ঘর', 'স্মার্ট মোবাইল জোন', 'টেক হাব', 'রিয়াল মোবাইল শপ', 'নিউ ডিজিটাল পয়েন্ট'],
    salon: ['জেন্টস সেলুন', 'স্টাইল জোন সেলুন', 'ক্লাসিক হেয়ার কাট', 'বিউটি পার্লার', 'নিউ লুক সেলুন'],
    fruits: ['ফল-ফলাদি', 'তাজা ফল ভাণ্ডার', 'ফ্রেশ ফ্রুট কর্নার', 'রসালো ফল ঘর'],
    furniture: ['আলমারি-খাট-সোফা', 'কাঠের ঘর ফার্নিচার', 'ডিজাইন ফার্নিচার', 'নিউ হোম ফার্নিচার', 'সেগুন কাঠের মহল'],
    default: ['মুদি দোকান', 'সততা ডিপার্টমেন্টাল', 'মনিহারি ও কসমেটিক্স', 'ভাই ভাই ট্রেডার্স', 'নিউ মার্কেট মুদি']
  };
  const poolName = (kind, i) => { const p = NAME_POOL[kind] || NAME_POOL.default; return p[Math.floor(hash(i * 13.37 + 2.1) * p.length) % p.length]; };

  /* ---------- Shwapno-style supermarket outlet (wide, red/orange) ---------- */
  function shwapno(cx, B) {
    const t = E.time(), w = 300, h = 150;
    ctx.fillStyle = '#fff7ed'; ctx.fillRect(cx - w / 2, B - h, w, h);
    ctx.fillStyle = '#ea580c'; ctx.fillRect(cx - w / 2 - 6, B - h - 34, w + 12, 40);
    txt('স্বপ্ন', cx - 40, B - h - 4, 34, '#fff', 'center', 700);
    txt('SHWAPNO', cx + 56, B - h - 8, 18, '#fde68a', 'center', 700);
    txt('আউটলেট', cx + 10, B - h + 22, 14, '#9a3412', 'center', 700);
    ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - w / 2 + 12, B - 96, w - 24, 64);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 1; k < 5; k++) ctx.fillRect(cx - w / 2 + 12 + k * (w - 24) / 5, B - 96, 2, 64);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = pickH(['#ef4444', '#22c55e', '#facc15', '#3b82f6'], k + 4); ctx.fillRect(cx - w / 2 + 22 + k * 68, B - 84, 52, 10); ctx.fillRect(cx - w / 2 + 22 + k * 68, B - 62, 52, 10); }
    ctx.fillStyle = '#1e293b'; ctx.fillRect(cx - 18, B - 52, 36, 52); ctx.fillStyle = 'rgba(186,230,253,.7)'; ctx.fillRect(cx - 14, B - 48, 13, 48); ctx.fillRect(cx + 1, B - 48, 13, 48);
    ctx.fillStyle = '#9ca3af'; for (let k = 0; k < 5; k++) { ctx.fillRect(cx + w / 2 - 70 + k * 12, B - 18, 9, 10); }
    person(cx - 96, B, .85, { shirt: '#f97316', pants: '#334155', skin: pickH(SKIN, 2), bag: '#16a34a', ph: t * 3 });
  }

  /* ---------- big boulevard branching off the main road (Bitumen Gate road, road to UIU) ---------- */
  function avenue(cx, B, label, sub, bend) {
    bend = bend || 1;
    const y0 = B + 30, yt = B - 178, wb = 196, wt = 36;
    const half = f => (wb / 2) * (1 - f) + (wt / 2) * f;
    const shift = f => bend * 78 * f * f;           // the side street bends away as it recedes
    const ex = (s, f) => cx + shift(f) + s * half(f);
    const ey = f => y0 + (yt - y0) * f;
    // buildings lining both sides, far to near, shrinking with distance
    for (let k = 7; k >= 0; k--) for (const s of [-1, 1]) {
      const f = k / 8 + .03, x = ex(s, f), yb = ey(f), sc = 1 - f * .72;
      const bw = 78 * sc, bh = (120 + hash(k * 3.7 + s + (cx | 0) * .01) * 100) * sc;
      ctx.fillStyle = pickH(['#e2c9a0', '#c7d2e0', '#e9b7a6', '#b9d6c6', '#d8c2e6', '#f1d9a0'], k + (s > 0 ? 3 : 0) + (cx | 0));
      ctx.fillRect(s < 0 ? x - bw : x, yb - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let wy = yb - bh + 8 * sc; wy < yb - 10 * sc; wy += 17 * sc) for (let wx = (s < 0 ? x - bw : x) + 7 * sc; wx < (s < 0 ? x : x + bw) - 9 * sc; wx += 15 * sc) ctx.fillRect(wx, wy, 6 * sc, 9 * sc);
    }
    // road surface with curved edges
    ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.moveTo(ex(-1, 0), y0);
    ctx.quadraticCurveTo(ex(-1, .5) - 6, B - 78, ex(-1, 1), yt); ctx.lineTo(ex(1, 1), yt);
    ctx.quadraticCurveTo(ex(1, .5) + 6, B - 78, ex(1, 0), y0); ctx.closePath(); ctx.fill();
    // kerbs and rounded corners where it meets the main road
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex(s, 0) + s * 22, y0 + 2); ctx.quadraticCurveTo(ex(s, 0), y0 + 2, ex(s, 0) - s * 2, y0 - 26); ctx.quadraticCurveTo(ex(s, .5) + s * -4, B - 78, ex(s, 1), yt); ctx.stroke(); }
    // zebra crossing at the mouth
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let k = 0; k < 9; k++) ctx.fillRect(ex(-1, .05) + 6 + k * ((half(.05) * 2 - 12) / 9), ey(.06), (half(.05) * 2 - 12) / 18, 9);
    // dashed centre line following the bend
    ctx.fillStyle = '#facc15';
    for (let f = .14; f < .96; f += .1) { const sc = 1 - f * .75; ctx.fillRect(cx + shift(f) - 1.5 * sc, ey(f), 3 * sc, 15 * sc); }
    // street lamps and trees along both edges
    for (const s of [-1, 1]) for (const f of [.2, .45, .7]) {
      const x = ex(s, f) + s * 10, y = ey(f), sc = 1 - f * .7;
      ctx.fillStyle = '#6b7280'; ctx.fillRect(x - 1.5 * sc, y - 54 * sc, 3 * sc, 54 * sc);
      ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(x, y - 56 * sc, 5 * sc, 0, 7); ctx.fill();
      ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(x + s * 18 * sc, y - 30 * sc, 15 * sc, 0, 7); ctx.fill();
    }
    // hanging name board
    const bx = cx + shift(1);
    ctx.fillStyle = '#0f766e'; rr(bx - 76, yt - 34, 152, 36, 8); ctx.fill();
    txt(label, bx, yt - 15, 17, '#fff', 'center', 700); if (sub) txt(sub, bx, yt - 2, 10, '#ccfbf1', 'center', 600);
  }

  /* ---------- Chef's Table food court (United City) ---------- */
  function chefsTable(cx, B) {
    const t = E.time(), w = 380, h = 220;
    ctx.fillStyle = '#134e4a'; ctx.fillRect(cx - w / 2, B - h, w, h);
    ctx.fillStyle = '#0f3d3a'; ctx.fillRect(cx - w / 2, B - h, w, 16);
    ctx.fillStyle = '#7dd3fc'; ctx.fillRect(cx - w / 2 + 16, B - 160, w - 32, 112);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 1; k < 9; k++) ctx.fillRect(cx - w / 2 + 16 + k * (w - 32) / 9, B - 160, 2, 112);
    const boards = [['Sushi', '#e11d48'], ['Thai', '#16a34a'], ['Desi', '#f59e0b'], ['Pizza', '#dc2626'], ['Hakka', '#7c3aed'], ['Grill', '#0ea5e9']];
    boards.forEach((b, k) => { const bx = cx - w / 2 + 26 + k * 56; ctx.fillStyle = b[1]; rr(bx, B - 150, 50, 20, 4); ctx.fill(); txt(b[0], bx + 25, B - 135, 11, '#fff', 'center', 700); });
    for (let k = 0; k < 6; k++) { const bx = cx - w / 2 + 28 + k * 56; ctx.fillStyle = 'rgba(253,230,138,.8)'; circle(bx + 22, B - 108, 6); ctx.fillStyle = 'rgba(15,23,42,.45)'; ctx.fillRect(bx + 12, B - 100, 20, 36); }
    const g = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0); g.addColorStop(0, '#b45309'); g.addColorStop(.5, '#fbbf24'); g.addColorStop(1, '#b45309');
    ctx.fillStyle = g; rr(cx - 160, B - h - 54, 320, 62, 12); ctx.fill();
    txt("CHEF'S TABLE", cx, B - h - 18, 34, '#3b1d00', 'center', 700);
    txt('শেফস টেবিল • ফুড কোর্ট', cx, B - h + 2, 14, '#431407', 'center', 700);
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 24, B - 52, 48, 52); ctx.fillStyle = 'rgba(14,165,233,.5)'; ctx.fillRect(cx - 20, B - 48, 18, 48); ctx.fillRect(cx + 2, B - 48, 18, 48);
    // courtside: umbrellas, tables, fairy lights
    for (let k = 0; k < 4; k++) {
      const ux = cx - 150 + k * 100; ctx.fillStyle = '#92400e'; ctx.fillRect(ux - 1.5, B - 58, 3, 58);
      ctx.fillStyle = pickH(['#ef4444', '#facc15', '#22c55e', '#3b82f6'], k + 9); ctx.beginPath(); ctx.arc(ux, B - 58, 34, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#7c2d12'; ctx.fillRect(ux - 22, B - 20, 44, 4); ctx.fillRect(ux - 2, B - 16, 4, 16);
    }
    for (let k = 0; k < 14; k++) { ctx.fillStyle = k % 2 ? '#fde047' : '#fb7185'; circle(cx - w / 2 + k * 29 + 6, B - h + 14 + Math.sin(k) * 3, 3 + Math.sin(t * 5 + k) * .8); }
    person(cx - 112, B - 6, .8, { shirt: '#0ea5e9', pants: '#334155', sit: true, skin: pickH(SKIN, 1) });
    person(cx + 90, B - 6, .8, { shirt: '#f43f5e', pants: '#1e293b', sit: true, skin: pickH(SKIN, 2), dir: -1, long: true });
    txt('COURTSIDE • UNITED CITY', cx, B + 14, 11, '#134e4a', 'center', 700);
  }

  /* ---------- Masjid Al Mustafa: dark Kaaba-toned hall, golden dome, green minor domes, slim minarets ---------- */
  function mosque2(cx, B) {
    const t = E.time();
    ctx.save(); ctx.translate(cx, B); ctx.scale(.74, .74); ctx.translate(-cx, -B);
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(cx - 270, B - 30, 540, 30);
    ctx.fillStyle = '#1f2937'; ctx.fillRect(cx - 170, B - 150, 340, 120);
    ctx.fillStyle = '#d4a017'; ctx.fillRect(cx - 170, B - 112, 340, 8); ctx.fillRect(cx - 170, B - 150, 340, 5);
    ctx.fillStyle = '#374151'; for (let k = 0; k < 7; k++) ctx.fillRect(cx - 160 + k * 48, B - 100, 3, 70);
    const dg = ctx.createLinearGradient(cx - 90, B - 280, cx + 90, B - 190); dg.addColorStop(0, '#fde68a'); dg.addColorStop(.6, '#d4a017'); dg.addColorStop(1, '#92660a');
    ctx.fillStyle = '#1f2937'; ctx.fillRect(cx - 100, B - 190, 200, 44);
    ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, B - 190, 98, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 2; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.ellipse(cx, B - 190, 98 - k * 19, 98, 0, Math.PI, 0); ctx.stroke(); }
    ctx.fillStyle = '#d4a017'; ctx.fillRect(cx - 2, B - 312, 4, 26); ctx.beginPath(); ctx.arc(cx + 3, B - 318, 10, .5, 5.8); ctx.fill();
    for (const dx of [-130, 130]) { ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(cx + dx, B - 150, 30, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#facc15'; ctx.fillRect(cx + dx - 1.5, B - 190, 3, 12); }
    for (const dx of [-215, 215]) {
      ctx.fillStyle = '#f5f5f4'; ctx.fillRect(cx + dx - 11, B - 330, 22, 300); ctx.fillStyle = '#d4a017'; for (const yy of [-250, -200, -150]) ctx.fillRect(cx + dx - 14, B + yy, 28, 6);
      ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.moveTo(cx + dx - 14, B - 330); ctx.lineTo(cx + dx, B - 372); ctx.lineTo(cx + dx + 14, B - 330); ctx.fill();
      ctx.fillStyle = '#facc15'; circle(cx + dx, B - 376, 4);
    }
    for (let k = 0; k < 5; k++) { ctx.fillStyle = '#d4a017'; rr(cx - 120 + k * 52, B - 96, 34, 66, 17); ctx.fill(); ctx.fillStyle = 'rgba(253,230,138,.75)'; rr(cx - 116 + k * 52, B - 92, 26, 60, 13); ctx.fill(); }
    ctx.fillStyle = '#111827'; rr(cx - 150, B - 408, 300, 50, 10); ctx.fill();
    txt('মসজিদ আল মুস্তফা', cx, B - 382, 26, '#fde68a', 'center', 700); txt('MASJID AL MUSTAFA • UNITED CITY', cx, B - 366, 11, '#e5e7eb', 'center', 600);
    for (let k = 0; k < 10; k++) { ctx.fillStyle = `rgba(253,224,71,${.5 + Math.sin(t * 3 + k) * .25})`; circle(cx - 140 + k * 31, B - 40, 3.5); }
    for (let k = 0; k < 4; k++) person(cx - 60 + k * 36, B, .85, { shirt: k % 2 ? '#f8fafc' : '#e2e8f0', pants: '#f1f5f9', skin: pickH(SKIN, k), ph: 0, hair: '#e5e7eb' });
    ctx.restore();
    // junction: the road to UIU turns off to the left
    avenue(cx - 350, B, 'ইউআইইউ ⬅ বামে', 'ভার্সিটি রোড', -1);
  }

  /* ---------- UIU campus gate (drawn in front of the main block) ---------- */
  function uiuGate(cx, B) {
    for (const dx of [-120, 120]) { ctx.fillStyle = '#f1f5f9'; ctx.fillRect(cx + dx - 14, B - 96, 28, 96); ctx.fillStyle = '#e11d48'; ctx.fillRect(cx + dx - 16, B - 100, 32, 8); ctx.fillStyle = '#0369a1'; ctx.fillRect(cx + dx - 8, B - 84, 16, 22); }
    ctx.fillStyle = '#0c4a6e'; rr(cx - 120, B - 128, 240, 28, 6); ctx.fill(); txt('UIU • স্বাগতম', cx, B - 108, 17, '#fff', 'center', 700);
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(cx - 118, B - 22, 236, 5); ctx.fillStyle = '#ef4444'; for (let k = 0; k < 6; k++) ctx.fillRect(cx - 118 + k * 40, B - 22, 20, 5);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx + 150, B - 60, 52, 60); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + 155, B - 54, 42, 22);
    person(cx + 132, B, .85, { shirt: '#1e3a8a', pants: '#1e3a8a', ph: 0, skin: pickH(SKIN, 1) });
  }
  const uiuFull = (cx, B) => { uiu(cx, B); uiuGate(cx, B + 12); };

  return { apartment, royalHouse, sheshTable: chefsTable, mosque: mosque2, uiu: uiuFull, avenue, shwapno, rickshaw, person, randPerson, hawkerVan, shop, tree, pole, facade, shutterShop, utilityPole, streetLamp, footbridge, flyoverBand, farTown, garbage, billboard, flowerBed, rickStand, vitaminGate, wires, PAL, FRAME, FLOWER };
};
