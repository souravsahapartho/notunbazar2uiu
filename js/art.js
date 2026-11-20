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

  function spokeWheel(x, y, r, a) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#b8bdc7'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.stroke();
    ctx.lineWidth = .8; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const an = a + k * Math.PI / 5; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * (r - 3), y + Math.sin(an) * (r - 3)); }
    ctx.stroke(); ctx.fillStyle = '#9ca3af'; circle(x, y, 3);
  }

  /* ---------- cycle rickshaw (painted hood, flower panels, tassels, puller) ---------- */
  function rickshaw(x, y, sc, o) {
    o = o || {};
    const col = o.col || FRAME[0], seed = o.seed || 1, t = o.t || 0, wa = o.wa || 0, pa = o.pa || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, 2, 92, 7, 0, 0, 7); ctx.fill();
    spokeWheel(-46, -24, 24, wa); spokeWheel(62, -22, 22, wa);
    // bicycle frame
    ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(62, -22); ctx.lineTo(52, -62); ctx.moveTo(52, -62); ctx.lineTo(30, -60); ctx.moveTo(30, -60); ctx.lineTo(18, -28);
    ctx.moveTo(18, -28); ctx.lineTo(54, -34); ctx.moveTo(18, -28); ctx.lineTo(-46, -24); ctx.stroke();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(52, -62); ctx.lineTo(50, -78); ctx.lineTo(61, -78); ctx.stroke();
    ctx.fillStyle = '#222'; rr(24, -66, 12, 5, 2); ctx.fill(); // saddle
    // carriage body with painted ovals
    ctx.fillStyle = col; rr(-80, -62, 88, 32, 5); ctx.fill();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; rr(-78, -60, 84, 28, 4); ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const ex = -62 + k * 26, c1 = pickH(FLOWER, seed + k), c2 = pickH(FLOWER, seed * 3 + k + 2);
      ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.ellipse(ex, -46, 11, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = c1; for (let p = 0; p < 5; p++) { const an = p * 1.256; ctx.beginPath(); ctx.ellipse(ex + Math.cos(an) * 5, -46 + Math.sin(an) * 5, 3.4, 3.4, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = c2; circle(ex, -46, 3);
    }
    if (o.plate) { ctx.fillStyle = '#fff'; rr(-32, -40, 38, 10, 2); ctx.fill(); txt(o.plate, -13, -32, 8.5, '#1e293b', 'center', 700); }
    ctx.fillStyle = ['#16a34a', '#ec4899', '#2563eb'][Math.floor(seed) % 3]; rr(-76, -70, 76, 9, 4); ctx.fill(); // cushion
    // painted hood
    ctx.save(); ctx.translate(-40, -68); ctx.rotate(-.12);
    const g = ctx.createLinearGradient(-50, -70, 50, 0); g.addColorStop(0, pickH(FLOWER, seed + 5)); g.addColorStop(.5, '#fbbf24'); g.addColorStop(1, pickH(FLOWER, seed + 9));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 50, 66, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 66, 0, Math.PI, 0); ctx.stroke();
    for (let k = 0; k < 11; k++) { const an = Math.PI * (.06 + k * .088); ctx.fillStyle = pickH(FLOWER, seed + k * 2); circle(Math.cos(an) * 41, -Math.sin(an) * 55, 4.2); ctx.fillStyle = '#fff'; circle(Math.cos(an) * 41, -Math.sin(an) * 55, 1.4); }
    ctx.restore();
    // tassels
    for (let k = 0; k < 7; k++) { ctx.strokeStyle = pickH(FLOWER, seed + k); ctx.lineWidth = 2.4; ctx.beginPath(); const sx = -88 + k * 1.5, sy = -78 + k * 3; ctx.moveTo(sx, sy); ctx.lineTo(sx - 4 + Math.sin(t * 6 + k) * 3, sy + 22); ctx.stroke(); }
    // passenger
    if (o.pass) {
      ctx.fillStyle = o.passCol || '#7c3aed'; rr(-52, -92, 18, 26, 5); ctx.fill();
      ctx.fillStyle = SKIN[1]; circle(-43, -100, 9); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-43, -103, 9, Math.PI, 0); ctx.fill();
    }
    // puller
    if (o.puller !== false) {
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
    const w = 130 + hash(i * 1.9) * 50, h = 96 + hash(i * 2.7) * 56;
    const t = E.time();
    switch (kind) {
      case 'bkash': { // mobile banking + recharge agent: pink awning, glass counter
        shopBody(cx, B, w, h, '#f1f5f9'); awning(cx, B, w, '#e11d74', '#fff', 62);
        sign(cx, B - h + 4, w - 14, name || 'মা টেলিকম', '#e11d74', '#fff', 14);
        txt('ক্যাশ ইন • ক্যাশ আউট', cx, B - h + 44, 11, '#9d174d', 'center', 700);
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
    txt('ভিটামিন গেট', cx + 5, B - 268, 38, '#fef08a', 'center', 700, '#064e3b');
    txt('VITAMIN GATE', cx + 5, B - 246, 14, '#d1fae5', 'center', 700);
    ctx.fillStyle = '#ef4444'; rr(cx - 28, B - 316, 56, 24, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + 4, B - 304, 12, -1.57, 1.57); ctx.fillRect(cx, B - 316, 4, 24); ctx.fill();
    for (let k = 0; k < 9; k++) { const lx = cx - 150 + k * 38, sag = Math.sin((k / 8) * Math.PI) * 10; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, B - 222 - sag); ctx.lineTo(lx, B - 210 - sag); ctx.stroke(); ctx.fillStyle = k % 2 ? '#fde047' : '#fb923c'; circle(lx, B - 204 - sag, 5 + Math.sin(t * 4 + k) * .6); }
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx + 60, B - 64, 70, 64); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + 66, B - 58, 58, 26); ctx.fillStyle = '#334155'; ctx.fillRect(cx + 54, B - 70, 82, 8); // guard booth
    person(cx + 148, B, .85, { shirt: '#1e3a8a', pants: '#1e3a8a', ph: 0, skin: SKIN[1] });
    for (let k = 0; k < 6; k++) flowerBed(cx - 200 + k * 76, B + 2, 100 + k);
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
    txt('শেষ টেবিল', cx, B - 144, 32, '#fffbeb', 'center', 700, 'rgba(0,0,0,.35)');
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

  return { apartment, royalHouse, sheshTable, mosque, uiu, rickshaw, person, randPerson, hawkerVan, shop, tree, pole, billboard, flowerBed, rickStand, vitaminGate, wires, PAL, FRAME, FLOWER };
};
