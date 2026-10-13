/**
 * ⚡ specials.js – Spezialkräfte! (eigener Knopf unten links)
 *
 *  ⚽ Musiala: RIESENBALL – zählt 3 Treffer. Du steuerst ihn mit dem Finger
 *             (auf den Bildschirm drücken und ziehen, der Ball fliegt hin).
 *  🧌 Kobold:  MINI-KOBOLDE – 3 kleine Kobolde kreisen 5 Sekunden um ihn
 *             und fangen gegnerische Bomben ab (Bomben auf den Kobold fliegen
 *             zu ihnen – Lockvögel!). Sie werfen selbst nicht.
 *  🐱 Katze:   WIRBELSPRUNG – springt auf einen Gegner (Schaden!), 🌪️ Wirbelwolke:
 *             Der Gegner kann sich 4 Sekunden nicht bewegen und nicht werfen.
 *  🌽 Mais:    POPCORN – poppt 10 Popcorn 🍿 im Bogen auf verschiedene Gegner.
 *  🐭 Maus:    VERSTECKEN – verschwindet 6 Sekunden im Mauseloch 🕳️:
 *             Alles fliegt durch sie durch, sie bekommt KEINEN Schaden.
 *  👺 Goblin:  FEUERSPEER – fliegt gerade DURCH alle Gegner durch und
 *             lässt sie brennen 🔥 (3 Sekunden lang Schaden).
 *
 * AUFLADEN: Triff Gegner 20-mal mit normalen Würfen (egal welche) –
 * dann leuchtet der Knopf „BEREIT!“ (`specialChargeHits` in config.js).
 * Nach dem Benutzen geht es wieder bei 0 los. Beim „WEITER“ ins nächste
 * Level behalten deine Figuren ihre gesammelten Treffer.
 * Auch Computer-Figuren laden auf und benutzen ihre Kräfte.
 */

const MINI_BIT = 1024; // Physik-Kategorie der Mini-Kobolde
let minis = [];        // Mini-Kobolde, die gerade da sind
const MINI_ORBIT = 0.035; // So schnell kreisen sie (pro Bild)
const MINI_RADIUS = 62;   // So weit weg vom Kobold
let steer = { active: false, id: null, x: 0, y: 0 }; // Wo zeigt dein Finger hin?

// Welche Figuren haben eine Spezialkraft?
// `desc` = Erklärung für den Startbildschirm (mit den echten Zahlen aus config.js)
const SPECIALS = {
  musiala: { name: 'RIESENBALL', icon: '⚽', use: bigBall,
    desc: () => `Riesiger Fußball, zählt ${GAME_CONFIG.bigBall.damage} Treffer. Du lenkst ihn mit dem Finger!` },
  kobold: { name: 'MINI-KOBOLDE', icon: '🧌', use: spawnMinis,
    desc: () => `${GAME_CONFIG.miniKobolds.count} Mini-Kobolde fangen ${GAME_CONFIG.miniKobolds.seconds} Sek. lang Bomben ab.` },
  katze: { name: 'WIRBELSPRUNG', icon: '🌪️', use: catJump,
    desc: () => `Springt auf einen Gegner (${GAME_CONFIG.catDamage} Schaden). Der ist ${GAME_CONFIG.catStunSeconds} Sek. im Wirbel gefangen.` },
  corn: { name: 'POPCORN', icon: '🍿', use: popcorn,
    desc: () => `${GAME_CONFIG.popcorn.count} Popcorn fliegen auf alle Gegner.` },
  goblin: { name: 'FEUERSPEER', icon: '🔥', use: fireSpear,
    desc: () => `Durchbohrt alle in einer Reihe und lässt sie ${GAME_CONFIG.fireSpear.burnSeconds} Sek. brennen.` },
  maus: { name: 'VERSTECKEN', icon: '🕳️', use: hideMouse,
    desc: () => `Versteckt sich ${GAME_CONFIG.hideSeconds} Sek. im Mauseloch – kein Schaden!` }
};

function hasSpecial(name) {
  return Boolean(SPECIALS[kindOf(name)]);
}

// Aufgeladen? (20 Treffer mit normalen Würfen)
function specialReady(name) {
  return hasSpecial(name) && (actors[name].specialCharge || 0) >= GAME_CONFIG.specialChargeHits;
}

// Aus physics.js: Ein normaler Wurf hat getroffen → Spezialkraft lädt auf
function chargeSpecial(name) {
  if (!hasSpecial(name)) return;
  const need = GAME_CONFIG.specialChargeHits;
  actors[name].specialCharge = Math.min(need, (actors[name].specialCharge || 0) + 1);
  if (actors[name].specialCharge === need && !isCpu(name)) playSound('ready'); // 🔔 Bereit!
  updateSpecialBar();
}

// Ist die Figur gerade im Wirbel gefangen? 🌪️
function isStunned(name) {
  return actors[name] && actors[name].stunnedUntil > performance.now();
}

// Kraft auslösen. Gibt true zurück, wenn es geklappt hat.
function trySpecial(name) {
  if (!isPlaying || !isAlive(name) || isStunned(name) || actors[name].jump) return false;
  if (!specialReady(name)) return false;
  const used = SPECIALS[kindOf(name)].use(name);
  if (used === false) return false;
  actors[name].specialCharge = 0; // Wieder von vorn aufladen
  actors[name].wiggle = 1;
  updateSpecialBar();
  return true;
}

// ---------- ⚡ Die Knöpfe unten links ----------
// Ein Knopf für jede Figur, die DU steuerst und die eine Spezialkraft hat.
function setupSpecialBar() {
  specialBar.innerHTML = '';
  const mine = Object.keys(actors).filter(n => !actors[n].kind && hasSpecial(n) && isAlive(n) &&
    (playerTeam === null || playerTeam.includes(n)));
  for (const name of mine) {
    const sp = SPECIALS[name];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'special-btn';
    btn.dataset.name = name;
    btn.setAttribute('aria-label', `${actors[name].name}: ${sp.name}`);
    btn.innerHTML = `<span class="sp-icon">${sp.icon}</span>` +
      '<span class="sp-bar"><i></i></span><span class="sp-count"></span>';
    btn.addEventListener('click', () => { initAudio(); trySpecial(name); });
    specialBar.appendChild(btn);
  }
  updateSpecialBar();
}

// Ladebalken, Zahl und „BEREIT!“ auf den Knöpfen auffrischen
function updateSpecialBar() {
  const need = GAME_CONFIG.specialChargeHits;
  for (const btn of specialBar.children) {
    const name = btn.dataset.name;
    const charge = actors[name].specialCharge || 0;
    const ready = specialReady(name) && isAlive(name);
    btn.classList.toggle('ready', ready);
    btn.hidden = !isAlive(name);
    btn.querySelector('.sp-bar i').style.width = `${(charge / need) * 100}%`;
    btn.querySelector('.sp-count').textContent = ready ? 'BEREIT!' : `${charge}/${need}`;
  }
}

// ---------- ⚽ Musiala: Riesenball ----------
function bigBall(name) {
  const targetName = targetOf(name);
  if (!targetName) return false;
  const cfg = GAME_CONFIG.bigBall;
  const from = actors[name].body.position;
  const to = actors[targetName].body.position;
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const radius = cfg.size * 0.42;
  const start = { x: from.x + (to.x - from.x) / d * (40 + radius), y: from.y + (to.y - from.y) / d * (40 + radius) };
  const ball = Bodies.circle(start.x, start.y, radius, {
    restitution: 0.6, frictionAir: 0, label: 'characterBomb',
    collisionFilter: { category: 2, mask: 1 | everyoneExcept(name) | MINI_BIT },
    customData: {
      emoji: '⚽', size: cfg.size, isPlayerBomb: true, shooter: name, target: targetName,
      born: performance.now(), damage: cfg.damage, special: true, steer: true, lifeMs: cfg.seconds * 1000
    }
  });
  Body.setVelocity(ball, { x: (to.x - from.x) / d * cfg.speed, y: (to.y - from.y) / d * cfg.speed });
  Composite.add(engine.world, ball);
  fallingBodies.push(ball);
  playSound('bigball');
}

// Den Riesenball lenken: Deine Bälle fliegen zum Finger, Computer-Bälle zu ihrem Ziel.
function steerBalls() {
  const speed = GAME_CONFIG.bigBall.speed;
  for (const b of fallingBodies) {
    const data = b.customData;
    if (!data.steer) continue;
    let goal = null;
    if (playerTeam === null || playerTeam.includes(data.shooter)) {
      if (steer.active) goal = steer; // 👆 Dein Finger
    } else if (isAlive(data.target)) {
      const decoy = decoyFor(data.target, b.position);
      goal = decoy ? decoy.position : actors[data.target].body.position; // 🤖 Zielsuchend (Minis lenken ab)
    }
    let vx = b.velocity.x;
    let vy = b.velocity.y;
    if (goal) {
      const dx = goal.x - b.position.x;
      const dy = goal.y - b.position.y;
      const d = Math.hypot(dx, dy) || 1;
      vx += (dx / d * speed - vx) * 0.12; // Sanft in die neue Richtung drehen
      vy += (dy / d * speed - vy) * 0.12;
    }
    const v = Math.hypot(vx, vy) || 1;
    Body.setVelocity(b, { x: vx / v * speed, y: vy / v * speed }); // Immer gleich schnell, keine Schwerkraft
  }
}

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

// ---------- 🌽 Mais: Popcorn ----------
// Alle, die der Mais treffen darf (Team-Modus: nur das andere Team)
function popcornTargets(name) {
  if (teamMode) return enemiesOf(name);
  return Object.keys(actors).filter(n => n !== name && isAlive(n));
}

function popcorn(name) {
  const targets = popcornTargets(name);
  if (!targets.length) return false;
  const cfg = GAME_CONFIG.popcorn;
  for (let i = 0; i < cfg.count; i++) {
    launchArc(name, targets[i % targets.length], {
      emoji: '🍿', size: cfg.size, damage: cfg.damage, special: true,
      flightFrames: 34 + Math.floor(Math.random() * 22) // Jedes Korn fliegt anders schnell
    });
  }
  spawnParticles(actors[name].body.position.x, actors[name].body.position.y, '#fef9c3', 25);
  playSound('popcorn');
}

// ---------- 👺 Goblin: Feuerspeer ----------
function fireSpear(name) {
  const targetName = targetOf(name);
  if (!targetName) return false;
  const cfg = GAME_CONFIG.fireSpear;
  const from = actors[name].body.position;
  const to = actors[targetName].body.position;
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const vx = (to.x - from.x) / d * cfg.speed;
  const vy = (to.y - from.y) / d * cfg.speed;
  const spear = Bodies.circle(from.x + vx / cfg.speed * 45, from.y + vy / cfg.speed * 45, 12, {
    isSensor: true, frictionAir: 0, label: 'characterBomb',
    // Keine Wände (fliegt einfach raus), trifft alle Figuren außer dem Werfer
    collisionFilter: { category: 2, mask: everyoneExcept(name) | MINI_BIT },
    customData: {
      spear: true, pierce: true, burn: true, special: true, isPlayerBomb: true,
      emoji: '🔥', size: 30, damage: cfg.damage, shooter: name, target: targetName,
      born: performance.now(), lifeMs: 3000, vx, vy
    }
  });
  spear.hitSet = new Set();
  Body.setVelocity(spear, { x: vx, y: vy });
  Composite.add(engine.world, spear);
  fallingBodies.push(spear);
  playSound('spear');
}

// Der Speer fliegt schnurgerade (keine Schwerkraft) und zieht Funken hinter sich her
function updateSpears() {
  for (const b of fallingBodies) {
    const data = b.customData;
    if (!data.spear) continue;
    Body.setVelocity(b, { x: data.vx, y: data.vy });
    if (Math.random() < 0.5) spawnParticles(b.position.x, b.position.y, '#f97316', 1);
  }
}

// Speer malen: Holzschaft, Spitze, Flamme vorn
function drawSpear(b, now) {
  const data = b.customData;
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(Math.atan2(data.vy, data.vx));
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#7c4a1e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();
  ctx.fillStyle = '#d1d5db'; // Spitze
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(8, -7);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.fill();
  drawEmoji('🔥', 16, -4, 26 + Math.sin(now / 50) * 4);
  ctx.restore();
}

// 🔥 Brennen: alle `burnEveryMs` einen Schaden, `burnSeconds` lang
function startBurn(victim, shooter) {
  if (isHidden(victim)) return; // 🐭🕳️ Im Mauseloch brennt nichts
  const cfg = GAME_CONFIG.fireSpear;
  const now = performance.now();
  actors[victim].burn = { shooter, until: now + cfg.burnSeconds * 1000, next: now + cfg.burnEveryMs };
}

function updateBurns(now) {
  const cfg = GAME_CONFIG.fireSpear;
  for (const name in actors) {
    const burn = actors[name].burn;
    if (!burn) continue;
    if (!isAlive(name) || now > burn.until) { actors[name].burn = null; continue; }
    if (now >= burn.next) {
      burn.next += cfg.burnEveryMs;
      const p = actors[name].body.position;
      spawnParticles(p.x, p.y - 20, '#f97316', 6);
      applyHit(name, burn.shooter, cfg.burnDamage, true);
    }
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

// ---------- Jedes Bild ----------
function updateSpecials(now) {
  steerBalls();
  updateSpears();
  updateMinis(now);
  updateJumps(now);
  updateBurns(now);
  updateHiding(now);
}

// Malt Mini-Kobolde und Wirbelwolken (nach den Figuren, damit sie obendrauf sind)
function drawSpecials(now) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const m of minis) {
    ctx.save();
    ctx.translate(m.body.position.x, m.body.position.y);
    ctx.rotate(Math.sin(now / 150 + m.angle) * 0.2 + m.wiggle * 0.5);
    drawEmoji(actorEmoji('kobold'), 0, 0, 30); // 🖼️ sprites.js
    ctx.restore();
  }
  for (const name in actors) {
    if (!isAlive(name) || !actors[name].burn) continue;
    const p = actors[name].body.position;
    const flame = 22 + Math.sin(now / 60) * 4; // 🔥 flackert
    drawEmoji('🔥', p.x - 18, p.y - 30 + Math.sin(now / 90) * 3, flame);
    drawEmoji('🔥', p.x + 18, p.y - 26 + Math.cos(now / 80) * 3, flame);
  }
  for (const name in actors) {
    if (!isAlive(name) || !isStunned(name)) continue;
    const p = actors[name].body.position;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 0.85;
    ctx.rotate(now / 120); // 🌪️ dreht sich
    drawEmoji('🌪️', 0, 0, 64);
    ctx.restore();
    drawEmoji('💫', p.x + Math.cos(now / 200) * 30, p.y - 40 + Math.sin(now / 200) * 6, 18);
  }
  ctx.restore();
}

// ⚡ Kleines Blitz-Zeichen an der Figur: leuchtet, wenn die Kraft bereit ist
function drawSpecialBadge(name, now) {
  if (!hasSpecial(name)) return;
  const ready = specialReady(name);
  ctx.save();
  ctx.globalAlpha = ready ? 1 : 0.35;
  drawEmoji('⚡', 30, -26, ready ? 18 + Math.sin(now / 150) * 2 : 15);
  ctx.restore();
}

// Alles zurücksetzen (bei jedem Start).
// keepCharge = true: DEINE Figuren behalten ihre Ladung fürs nächste Level.
function resetSpecials(keepCharge = false) {
  clearMinis();
  for (const name in actors) {
    const mine = playerTeam === null || playerTeam.includes(name);
    if (!keepCharge || !mine) actors[name].specialCharge = 0;
    actors[name].stunnedUntil = 0;
    actors[name].jump = null;
    actors[name].burn = null;
    actors[name].hiddenUntil = 0;
    actors[name].body.collisionFilter.mask = 0xFFFFFFFF;
  }
}

// 👆 Finger verfolgen, damit du den Riesenball lenken kannst
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  steer = { active: true, id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
});
window.addEventListener('pointermove', (event) => {
  if (!steer.active || event.pointerId !== steer.id) return;
  const rect = canvas.getBoundingClientRect();
  steer.x = event.clientX - rect.left;
  steer.y = event.clientY - rect.top;
});
for (const type of ['pointerup', 'pointercancel']) {
  window.addEventListener(type, (event) => {
    if (event.pointerId === steer.id) steer.active = false;
  });
}

// 📖 Startbildschirm: Spezialkräfte erklären + kleines Symbol auf jeder Figur-Kachel
function buildSpecialsInfo() {
  const list = document.getElementById('specialsList');
  let html = `<p class="sp-how">🎯 Triff ${GAME_CONFIG.specialChargeHits}-mal → der Knopf unten links leuchtet → antippen!</p>`;
  for (const name in SPECIALS) {
    const sp = SPECIALS[name];
    html += `<p class="sp-row"><b>${actorEmoji(name)} ${actors[name].name} · ${sp.icon} ${sp.name}</b><br>${sp.desc()}</p>`;
  }
  list.innerHTML = html;
  for (const tile of document.querySelectorAll('#pickGrid .pick-btn, #teamGrid .pick-btn')) {
    const sp = SPECIALS[tile.dataset.name];
    if (sp) tile.insertAdjacentHTML('beforeend', `<span class="pick-special">${sp.icon}</span>`);
  }
}
buildSpecialsInfo();
