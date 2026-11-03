/**
 * 🦇 fledermaus.js – Tobias' Fledermaus und ihr BLUTSAUGEN 🩸
 *
 * Spezialkraft: Die Fledermaus flattert zu einem Gegner, saugt mehrmals
 * Leben ab (Schaden!) und heilt sich selbst um genau so viel ❤️.
 * Zahlen stehen in config.js unter `batSuck`.
 */

// Rote Tropfen, die vom Gegner zur Fledermaus fliegen
let bloodDrops = [];

// ⚡ Spezialkraft starten (aus SPECIALS in specials.js)
function batSuck(name) {
  const victim = targetOf(name);
  if (!victim) return false;
  const from = { ...actors[name].body.position };
  actors[name].jump = { type: 'suck', victim, from, start: performance.now(), sips: 0 };
  playSound('squeak');
}

// Leben heilen (nie mehr als das volle Leben)
function healActor(name, amount) {
  const a = actors[name];
  const maxHp = a.maxHp || 100;
  if (typeof a.hp !== 'number') a.hp = maxHp;
  a.hp = Math.min(maxHp, a.hp + amount);
  a.hitsTaken = maxHp - a.hp;
}

// Jedes Bild: hinfliegen → saugen → zurückfliegen (aufgerufen aus updateJumps)
function updateBatSuck(name, now) {
  const actor = actors[name];
  const j = actor.jump;
  const cfg = GAME_CONFIG.batSuck;
  const victimPos = isAlive(j.victim) ? actors[j.victim].body.position : j.from;
  const goal = { x: victimPos.x, y: victimPos.y - 38 };
  const fly = 350, suck = cfg.sips * cfg.sipMs, back = 380;
  const t = now - j.start;

  if (t < fly) {
    // 🦇 Hinflattern im Zickzack
    const p = t / fly;
    const flap = Math.sin(p * Math.PI * 4) * 14;
    moveActor(name, j.from.x + (goal.x - j.from.x) * p, j.from.y + (goal.y - j.from.y) * p + flap);
  } else if (t < fly + suck) {
    // 🩸 Über dem Gegner hängen und saugen
    moveActor(name, goal.x + Math.sin(t / 60) * 4, goal.y + Math.sin(t / 90) * 3);
    const sip = Math.floor((t - fly) / cfg.sipMs) + 1;
    if (sip > j.sips && sip <= cfg.sips) {
      j.sips = sip;
      actor.wiggle = 0.8;
      if (isAlive(j.victim) && !isHidden(j.victim)) {
        playSound('suck');
        applyHit(j.victim, name, cfg.damage, true);
        healActor(name, cfg.heal);
        bloodDrops.push({ x: victimPos.x, y: victimPos.y, start: now, owner: name });
        spawnParticles(victimPos.x, victimPos.y, '#dc2626', 8);
      }
    }
  } else if (t < fly + suck + back) {
    // Satt zurückflattern 😋
    const p = (t - fly - suck) / back;
    const flap = Math.sin(p * Math.PI * 4) * 14;
    moveActor(name, goal.x + (j.from.x - goal.x) * p, goal.y + (j.from.y - goal.y) * p + flap);
  } else {
    moveActor(name, j.from.x, j.from.y);
    actor.jump = null;
  }
}

// Malt die fliegenden Bluttropfen und „+3 ❤️“ über der Fledermaus
function drawBloodDrops(now) {
  for (let i = bloodDrops.length - 1; i >= 0; i--) {
    const d = bloodDrops[i];
    const age = now - d.start;
    if (age > 700 || !actors[d.owner] || !isAlive(d.owner)) { bloodDrops.splice(i, 1); continue; }
    const p = Math.min(1, age / 250);
    const to = actors[d.owner].body.position;
    if (p < 1) {
      drawEmoji('🩸', d.x + (to.x - d.x) * p, d.y + (to.y - d.y) * p, 20);
    } else {
      const up = (age - 250) / 450;
      ctx.save();
      ctx.globalAlpha = 1 - up;
      drawLabel(`+${GAME_CONFIG.batSuck.heal} ❤️`, to.x, to.y - 40 - up * 30,
        { size: 16, weight: '900', fill: '#4ade80', stroke: '#0f172a', lineWidth: 3 });
      ctx.restore();
    }
  }
}

function clearBloodDrops() { bloodDrops = []; }

// ---------- 🗡️⛓️ Normale Angriffe: Speer und Stachelkugel, immer abwechselnd ----------
// (config.js: fledermausWeapons: ['spear', 'flail'] – shootBomb in bombs.js wählt reihum)
// Malt die Waffe bei (0, 0); vorher wurde in Flugrichtung gedreht.
function drawBatWeapon(kind, size) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (kind === 'spear') {
    const L = size * 1.7;
    // Holzschaft
    ctx.strokeStyle = '#3b2412';
    ctx.lineWidth = size * 0.16;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.22, 0); ctx.stroke();
    ctx.strokeStyle = '#7c4a21';
    ctx.lineWidth = size * 0.09;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L * 0.22, 0); ctx.stroke();
    // Gezackte Eisenspitze
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath();
    ctx.moveTo(L / 2, 0);
    ctx.lineTo(L * 0.3, -size * 0.2);
    ctx.lineTo(L * 0.34, -size * 0.07);
    ctx.lineTo(L * 0.2, -size * 0.13);
    ctx.lineTo(L * 0.2, size * 0.13);
    ctx.lineTo(L * 0.34, size * 0.07);
    ctx.lineTo(L * 0.3, size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Umwickelte Schnur
    ctx.strokeStyle = '#d6b98c';
    ctx.lineWidth = Math.max(1, size * 0.05);
    for (let i = 0; i < 3; i++) {
      const x = L * 0.12 + i * size * 0.08;
      ctx.beginPath(); ctx.moveTo(x, -size * 0.09); ctx.lineTo(x + size * 0.04, size * 0.09); ctx.stroke();
    }
  } else {
    // ⛓️ Kette mit Stachelkugel (Morgenstern)
    const r = size * 0.32;
    ctx.fillStyle = '#9ca3af';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(-r - i * size * 0.13, 0, size * 0.06, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = Math.max(1, size * 0.04);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.28) * r * 0.85, Math.sin(a - 0.28) * r * 0.85);
      ctx.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6);
      ctx.lineTo(Math.cos(a + 0.28) * r * 0.85, Math.sin(a + 0.28) * r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#9ca3af');
    g.addColorStop(1, '#374151');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
