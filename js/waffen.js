/**
 * ⚔️ waffen.js – Jede Figur wirft ihre EIGENE Waffe (wie auf ihrem Bild)!
 *
 *  🧌 Kobold: gezackte Klinge      🌽 Mais: grüne Zacken-Lanze
 *  🐱 Katze: Stachelkeule (dreht)  🐭 Maus: Lanze mit Hackmesser-Klinge
 *  👺 Goblin: glühender Dreizack    🐉 Drache: Feuerball
 *  🦇 Fledermaus: Speer & Morgenstern abwechselnd (fledermaus.js)
 *
 * Einschalten in config.js: `<name>Weapons: ['blade']` (mehrere = reihum abwechselnd).
 * Neue Waffe? Hier einen neuen `else if (kind === '…')` dazumalen.
 * Gemalt wird bei (0, 0), Spitze zeigt nach rechts (+x) = Flugrichtung.
 */

// Diese Waffen drehen sich im Flug, alle anderen zeigen mit der Spitze nach vorne
const SPINNING_WEAPONS = ['flail', 'club'];

function drawWeapon(kind, size) {
  if (kind === 'bomb') { drawEmoji('💣', 0, 0, size); return; }
  if (kind === 'popcorn') { drawEmoji('🍿', 0, 0, size); return; }
  if (kind === 'venom') { drawEmoji('🧪', 0, 0, size); return; }
  if (kind === 'spear' || kind === 'flail') { drawBatWeapon(kind, size); return; }
  const L = size * 1.6;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, size * 0.05);
  if (kind === 'blade') {
    // 🧌 Gezackte Klinge: dunkler Griff, Parierstange, Stahlklinge mit Zacken oben
    ctx.fillStyle = '#3b2412';
    ctx.fillRect(-L / 2, -size * 0.07, L * 0.28, size * 0.14);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-L * 0.23, -size * 0.17, size * 0.09, size * 0.34);
    const g = ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.12);
    g.addColorStop(0, '#f1f5f9');
    g.addColorStop(1, '#64748b');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-L * 0.18, size * 0.1);
    ctx.lineTo(L * 0.5, -size * 0.02);           // Spitze
    ctx.lineTo(L * 0.36, -size * 0.2);
    ctx.lineTo(L * 0.3, -size * 0.1);
    ctx.lineTo(L * 0.2, -size * 0.22);
    ctx.lineTo(L * 0.12, -size * 0.1);
    ctx.lineTo(L * 0.02, -size * 0.2);
    ctx.lineTo(-L * 0.06, -size * 0.08);
    ctx.lineTo(-L * 0.18, -size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'lance') {
    // 🌽 Mais-Lanze: Holzschaft mit Bast, grün-goldene Zackenspitze
    ctx.strokeStyle = '#4a2c14';
    ctx.lineWidth = size * 0.14;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.18, 0); ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.strokeStyle = '#1a2e05';
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath();
    ctx.moveTo(L * 0.55, 0);
    ctx.lineTo(L * 0.38, -size * 0.12);
    ctx.lineTo(L * 0.4, -size * 0.24);
    ctx.lineTo(L * 0.26, -size * 0.12);
    ctx.lineTo(L * 0.15, -size * 0.16);
    ctx.lineTo(L * 0.15, size * 0.16);
    ctx.lineTo(L * 0.26, size * 0.12);
    ctx.lineTo(L * 0.4, size * 0.24);
    ctx.lineTo(L * 0.38, size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#facc15';
    for (let i = 0; i < 3; i++) {
      const x = -L * 0.1 + i * size * 0.1;
      ctx.beginPath(); ctx.moveTo(x, -size * 0.08); ctx.lineTo(x + size * 0.05, size * 0.08); ctx.stroke();
    }
  } else if (kind === 'club') {
    // 🐱 Stachelkeule: Holz, vorne dick, mit Eisennägeln
    ctx.fillStyle = '#7c4a21';
    ctx.strokeStyle = '#2b1608';
    ctx.beginPath();
    ctx.moveTo(-L / 2, -size * 0.07);
    ctx.lineTo(L * 0.15, -size * 0.2);
    ctx.quadraticCurveTo(L * 0.55, -size * 0.26, L * 0.5, 0);
    ctx.quadraticCurveTo(L * 0.55, size * 0.26, L * 0.15, size * 0.2);
    ctx.lineTo(-L / 2, size * 0.07);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    for (const [x, y, dir] of [[0.22, -0.2, -1], [0.38, -0.22, -1], [0.3, 0.2, 1], [0.45, 0.16, 1], [0.52, -0.02, 0]]) {
      const px = L * x;
      const py = size * y;
      const tipX = dir === 0 ? px + size * 0.22 : px;
      const tipY = dir === 0 ? py : py + dir * size * 0.2;
      ctx.beginPath();
      ctx.moveTo(px - size * 0.05, py);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(px + size * 0.05, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (kind === 'glaive') {
    // 🐭 Mäuse-Lanze: Schaft mit Seil, breite gezackte Hackmesser-Klinge
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = size * 0.12;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.12, 0); ctx.stroke();
    const g = ctx.createLinearGradient(0, -size * 0.25, 0, size * 0.1);
    g.addColorStop(0, '#e5e7eb');
    g.addColorStop(1, '#78716c');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath();
    ctx.moveTo(L * 0.08, -size * 0.06);
    ctx.lineTo(L * 0.52, -size * 0.3);
    ctx.lineTo(L * 0.5, -size * 0.12);
    ctx.lineTo(L * 0.42, -size * 0.08);
    ctx.lineTo(L * 0.46, size * 0.02);
    ctx.lineTo(L * 0.34, size * 0.06);
    ctx.lineTo(L * 0.08, size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#d6b98c';
    for (let i = 0; i < 3; i++) {
      const x = L * 0.0 + i * size * 0.07;
      ctx.beginPath(); ctx.moveTo(x, -size * 0.08); ctx.lineTo(x + size * 0.04, size * 0.08); ctx.stroke();
    }
  } else if (kind === 'trident') {
    // 👺 Lava-Dreizack: dunkler Schaft, drei glühende Zacken
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = size * 0.12;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.2, 0); ctx.stroke();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.2, 0); ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = Math.max(1, size * 0.05);
    // Querstange
    ctx.fillRect(L * 0.17, -size * 0.3, size * 0.1, size * 0.6);
    ctx.strokeRect(L * 0.17, -size * 0.3, size * 0.1, size * 0.6);
    for (const y of [-0.27, 0, 0.27]) {
      const py = size * y;
      ctx.beginPath();
      ctx.moveTo(L * 0.2, py - size * 0.05);
      ctx.lineTo(L * (y === 0 ? 0.55 : 0.47), py);
      ctx.lineTo(L * 0.2, py + size * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (kind === 'fireball') {
    // 🐉 Feuerball mit Flammenschweif nach hinten
    const r = size * 0.36;
    ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r);
    ctx.quadraticCurveTo(-r * 2, -r * 0.7, -r * 3.2, 0);
    ctx.quadraticCurveTo(-r * 2, r * 0.7, r * 0.3, r);
    ctx.closePath();
    ctx.fill();
    const g = ctx.createRadialGradient(r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#fef9c3');
    g.addColorStop(0.45, '#fbbf24');
    g.addColorStop(1, '#dc2626');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
