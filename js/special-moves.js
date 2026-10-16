/**
 * 🧌🐱🐭 special-moves.js – Schutz und Bewegung
 *
 * Mini-Kobolde, Katzensprung und Mauseloch.
 * Laufende Effekte hier aktualisieren und in resetSpecials() zurücksetzen.
 */

const MINI_BIT = 1024; // Physik-Kategorie der Mini-Kobolde
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

// ---------- 🐱 Katze: Wirbelsprung ----------
function catJump(name) {
  const victim = targetOf(name);
  if (!victim) return false;
  const from = { ...actors[name].body.position };
  actors[name].jump = { victim, from, start: performance.now(), landed: false };
  playSound('jump');
}

function updateJumps(now) {
  const T = 450; // ms pro Sprung (hin und zurück je 450 ms)
  for (const name in actors) {
    const actor = actors[name];
    const j = actor.jump;
    if (!j) continue;
    if (!isAlive(name)) { actor.jump = null; continue; }
    const victimPos = isAlive(j.victim) ? actors[j.victim].body.position : j.from;
    const goal = { x: victimPos.x, y: victimPos.y - 45 };
    const t = (now - j.start) / T;
    let a, b, p;
    if (t < 1) { a = j.from; b = goal; p = t; }                  // Hinspringen
    else if (t < 2) {                                             // Landung + zurück
      if (!j.landed) {
        j.landed = true;
        if (isAlive(j.victim)) {
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

