/**
 * 🧌🐱🐭 special-moves.js – Schutz und Bewegung
 *
 * Mini-Kobolde, Katzensprung und Mauseloch.
 * Laufende Effekte hier aktualisieren und in resetSpecials() zurücksetzen.
 */

const MINI_BIT = 1 << 22; // Physik-Kategorie der Mini-Kobolde (weit oben, damit Figuren-Bits frei bleiben)
let minis = [];        // Mini-Kobolde, die gerade da sind
const MINI_ORBIT = 0.035; // So schnell kreisen sie (pro Bild)
const MINI_RADIUS = 62;   // So weit weg vom Kobold
let steer = { active: false, id: null, x: 0, y: 0 }; // Wo zeigt dein Finger hin?

// ---------- 🧌 Kobold: Mini-Kobolde ----------
function spawnMinis(name) {
  const cfg = GAME_CONFIG.miniKobolds;
  const now = performance.now();
  for (let i = 0; i < cfg.count; i++) {
    const body = Bodies.circle(0, 0, 24, {
      isStatic: true, isSensor: true, label: 'miniKobold',
      collisionFilter: { category: MINI_BIT }
    });
    const mini = { owner: name, body, angle: (i / cfg.count) * Math.PI * 2, until: now + cfg.seconds * 1000, wiggle: 0 };
    body.mini = mini;
    Composite.add(engine.world, body);
    minis.push(mini);
  }
  playSound('minis');
}

// 🎯 Lockvogel: Wer auf den Kobold zielt, trifft stattdessen einen Mini-Kobold.
// Gibt zurück, wo der nächste Mini-Kobold in `frames` Bildern sein wird (oder null) –
// denn er kreist weiter, während die Bombe fliegt.
function decoyFor(targetName, from, frames = 0) {
  let best = null;
  let bestDist = Infinity;
  for (const m of minis) {
    if (m.owner !== targetName) continue;
    const c = actors[m.owner].body.position;
    const a = m.angle + MINI_ORBIT * frames;
    const p = { x: c.x + Math.cos(a) * MINI_RADIUS, y: c.y + Math.sin(a) * MINI_RADIUS };
    const d = Math.hypot(p.x - from.x, p.y - from.y);
    if (d < bestDist) { best = { position: p }; bestDist = d; }
  }
  return best;
}

// Gehört diese Bombe zur selben Seite wie der Mini-Kobold? Dann fliegt sie durch.
function isFriendlyToMini(bomb, mini) {
  const shooter = bomb.customData.shooter;
  if (shooter === mini.owner) return true;
  return teamMode && actors[shooter] && teamOf(shooter) === teamOf(mini.owner);
}

// Aus physics.js: Bombe trifft Mini-Kobold → Bombe ist abgefangen!
function blockByMini(bomb, miniBody) {
  const mini = miniBody.mini;
  if (!mini || isFriendlyToMini(bomb, mini)) return false;
  mini.wiggle = 1;
  explodeBomb(bomb);
  return true;
}

function updateMinis(now) {
  for (let i = minis.length - 1; i >= 0; i--) {
    const m = minis[i];
    if (now > m.until || !isAlive(m.owner)) {
      spawnParticles(m.body.position.x, m.body.position.y, '#6ee7b7', 12); // Puff!
      Composite.remove(engine.world, m.body);
      minis.splice(i, 1);
      continue;
    }
    // Im Kreis um den großen Kobold fliegen
    m.angle += MINI_ORBIT;
    const c = actors[m.owner].body.position;
    Body.setPosition(m.body, { x: c.x + Math.cos(m.angle) * MINI_RADIUS, y: c.y + Math.sin(m.angle) * MINI_RADIUS });
    m.wiggle *= 0.88;
  }
}

function clearMinis() {
  for (const m of minis) Composite.remove(engine.world, m.body);
  minis = [];
}

// ---------- 🐱 Katze: Wirbelsprung & 🐉 Drache: Drachenbiss ----------
function catJump(name) {
  const victim = targetOf(name);
  if (!victim) return false;
  const from = { ...actors[name].body.position };
  actors[name].jump = { victim, from, start: performance.now(), landed: false };
  playSound('jump');
}

function dragonBite(name) {
  const victim = targetOf(name);
  if (!victim) return false;
  const from = { ...actors[name].body.position };
  actors[name].jump = { type: 'bite', victim, from, start: performance.now(), landed: false, chomps: 0 };
  playSound('jump');
}

function updateJumps(now) {
  const T = 450; // ms pro Sprung-Abschnitt
  for (const name in actors) {
    const actor = actors[name];
    const j = actor.jump;
    if (!j) continue;
    if (!isAlive(name)) { actor.jump = null; continue; }
    const victimPos = isAlive(j.victim) ? actors[j.victim].body.position : j.from;

    // 🐉🦷 Tobis Drachenbiss: Hinfliegen, 3-mal kräftig zubeißen, zurückfliegen
    if (j.type === 'bite') {
      const goal = { x: victimPos.x, y: victimPos.y - 12 };
      const elapsed = now - j.start;
      if (elapsed < 320) {
        const p = elapsed / 320;
        const hop = Math.sin(p * Math.PI) * 45;
        moveActor(name, j.from.x + (goal.x - j.from.x) * p, j.from.y + (goal.y - j.from.y) * p - hop);
      } else if (elapsed < 1050) {
        // Direkt am Gegner festhalten und zubeißen!
        const shake = Math.sin(elapsed / 28) * 7;
        moveActor(name, goal.x + shake, goal.y);
        const chompStep = Math.floor((elapsed - 320) / 230) + 1;
        if (chompStep > j.chomps && chompStep <= 3) {
          j.chomps = chompStep;
          playSound('bite');
          actor.wiggle = 1.2;
          if (isAlive(j.victim) && !isHidden(j.victim)) {
            actors[j.victim].wiggle = 1.4;
            spawnParticles(victimPos.x, victimPos.y, '#ef4444', 18);
            spawnParticles(victimPos.x, victimPos.y, '#fef08a', 12);
            if (chompStep === 1) {
              const cfg = GAME_CONFIG.dragonBite;
              actors[j.victim].stunnedUntil = Math.max(actors[j.victim].stunnedUntil || 0, now + cfg.stunSeconds * 1000);
              applyHit(j.victim, name, cfg.damage, true); // 💥🦷 Kräftiger Drachenbiss!
            }
          }
        }
      } else if (elapsed < 1400) {
        const p = (elapsed - 1050) / 350;
        const hop = Math.sin(p * Math.PI) * 45;
        moveActor(name, goal.x + (j.from.x - goal.x) * p, goal.y + (j.from.y - goal.y) * p - hop);
      } else {
        moveActor(name, j.from.x, j.from.y);
        actor.jump = null;
      }
      continue;
    }

    const goal = { x: victimPos.x, y: victimPos.y - 45 };
    const t = (now - j.start) / T;
    let a, b, p;
    if (t < 1) { a = j.from; b = goal; p = t; }                  // Hinspringen
    else if (t < 2) {                                             // Landung + zurück
      if (!j.landed) {
        j.landed = true;
        if (isAlive(j.victim) && !isHidden(j.victim)) {
          actors[j.victim].stunnedUntil = now + GAME_CONFIG.catStunSeconds * 1000;
          spawnParticles(victimPos.x, victimPos.y, '#e2e8f0', 25);
          playSound('whirl');
          applyHit(j.victim, name, GAME_CONFIG.catDamage, true); // 💥 Sprung tut weh!
        }
      }
      a = goal; b = j.from; p = t - 1;
    } else { moveActor(name, j.from.x, j.from.y); actor.jump = null; continue; }
    const hop = Math.sin(p * Math.PI) * 70; // Bogen nach oben
    moveActor(name, a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p - hop);
  }
}

// 🦷 Malt das riesige schnappende Drachengebiss über dem gebissenen Gegner
function drawDragonBites(now) {
  for (const name in actors) {
    const j = actors[name].jump;
    if (!j || j.type !== 'bite' || !isAlive(j.victim)) continue;
    const elapsed = now - j.start;
    if (elapsed < 240 || elapsed > 1100) continue;
    const pos = actors[j.victim].body.position;
    // Kiefer schnappen 3-mal auf und zu
    const snap = Math.abs(Math.sin((elapsed - 240) / 230 * Math.PI));
    const gap = 4 + snap * 26;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    // Roter Rachen-Schein
    ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();
    // Obere und untere Zahnreihe (je 5 spitze weiße Drachenzähne)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5;
    for (let i = -2; i <= 2; i++) {
      const tx = i * 13;
      // Oberkiefer-Zahn (zeigt nach unten)
      ctx.beginPath();
      ctx.moveTo(tx - 6, -gap - 14);
      ctx.lineTo(tx + 6, -gap - 14);
      ctx.lineTo(tx, -gap + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Unterkiefer-Zahn (zeigt nach oben)
      ctx.beginPath();
      ctx.moveTo(tx - 6, gap + 14);
      ctx.lineTo(tx + 6, gap + 14);
      ctx.lineTo(tx, gap - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ---------- 🐭 Maus: Verstecken ----------
// Versteckt? Dann gibt es keinen Schaden (physics.js fragt das in applyHit).
function isHidden(name) {
  return actors[name] && actors[name].hiddenUntil > performance.now();
}

function hideMouse(name) {
  const actor = actors[name];
  actor.hiddenUntil = performance.now() + GAME_CONFIG.hideSeconds * 1000;
  actor.body.collisionFilter.mask = 0; // Kollidiert mit gar nichts mehr – alles fliegt durch
  actor.burn = null;                   // Im Loch geht das Feuer aus
  spawnParticles(actor.body.position.x, actor.body.position.y, '#a8a29e', 20);
  playSound('hide');
}

// Wieder auftauchen, wenn die Zeit um ist
function updateHiding(now) {
  for (const name in actors) {
    const actor = actors[name];
    if (actor.hiddenUntil && now > actor.hiddenUntil) {
      actor.hiddenUntil = 0;
      actor.body.collisionFilter.mask = 0xFFFFFFFF; // Wieder treffbar
      spawnParticles(actor.body.position.x, actor.body.position.y, '#fde68a', 15);
    }
  }
}

