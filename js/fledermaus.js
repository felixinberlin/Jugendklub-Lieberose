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
