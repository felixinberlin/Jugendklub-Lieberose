/**
 * 💣 bombs.js – Bomben werfen, fliegen lassen und explodieren
 */

// Alle Bomben, die gerade durch die Luft fliegen.
let fallingBodies = [];
// 🐾 Kratzspuren, die beim Treffer kurz am Gegner nachleuchten
let scratchMarks = [];

// Alle Figuren-Kategorien außer `actor` (für den collisionFilter der Bombe).
function everyoneExcept(actor) {
  // ⚔️ Team-Modus: nur das andere Team (kein Eigentor)
  if (teamMode) return teamOf(actor) === 'mine' ? TEAM_BITS.enemy : TEAM_BITS.mine;
  let mask = 0;
  for (const name in actors) {
    if (name !== actor) mask |= actors[name].category;
  }
  return mask;
}

// Eine angeklickte Figur wirft eine Bombe zu ihrem Ziel (siehe `target` in actors.js).
// Unterwegs trifft die Bombe aber jede Figur, die im Weg steht!
// `forcedTarget` (optional): auf diese Figur zielen statt aufs normale Ziel.
function shootBomb(actor, forcedTarget) {
  if (!isPlaying || document.hidden) return;
  if (!isAlive(actor)) return;
  if (isStunned(actor) || actors[actor].jump) return; // 🌪️ Im Wirbel / im Sprung wird nicht geworfen (specials.js)
  // Kleine Pause zwischen zwei Würfen, sonst gewinnt, wer am schnellsten tippt
  const now = performance.now();
  if (now - (actors[actor].lastThrow || 0) < GAME_CONFIG.throwCooldownMs) return;
  actors[actor].lastThrow = now;
  const targetName = (forcedTarget && isAlive(forcedTarget) && forcedTarget !== actor)
    ? forcedTarget
    : targetOf(actor); // Ist das Ziel raus, geht's an die Nächste im Kreis (knockout.js)
  if (!targetName) return;
  const isScratch = Boolean(actorCfg(actor, 'Scratch'));
  const scale = GAME_CONFIG.mapScale || 0.76;
  launchArc(actor, targetName, {
    emoji: actorCfg(actor, 'Bomb') || GAME_CONFIG.bombEmoji,
    size: Math.round((actorCfg(actor, 'BombSize') || GAME_CONFIG.bombSize) * scale),
    trail: actorCfg(actor, 'Trail'), // z. B. 🪙 Goldmünzen aus dem Goldsack
    scratch: isScratch
  });
  actors[actor].wiggle = 1;
  playAttackSound(actor);
}

// 🎯 Ein Geschoss im Bogen von `actor` zu `targetName` werfen.
// opts: emoji, size, damage (Standard 1), special (Spezialattacke?), flightFrames (Standard 42)
function launchArc(actor, targetName, opts) {
  const source = actors[actor].body;
  const flightFrames = opts.flightFrames || 42;
  // 🧌 Hat das Ziel Mini-Kobolde? Dann fliegt die Bombe zum Lockvogel (specials.js)
  const target = decoyFor(targetName, source.position, flightFrames) || actors[targetName].body;
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  const distance = Math.hypot(dx, dy);
  const direction = distance ? dx / distance : 1;
  const radius = opts.size * 0.42;
  const actorR = 34 * (GAME_CONFIG.mapScale || 0.76);
  const x = source.position.x + direction * (actorR + radius + 4);
  const y = source.position.y + (distance ? dy / distance : 0) * (actorR + radius + 4);
  const gravityPerFrame = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2;
  const body = Bodies.circle(x, y, radius, {
    restitution: 0,
    frictionAir: 0,
    label: 'characterBomb',
    // Trifft JEDE Figur im Weg – nur nicht die, die geworfen hat
    collisionFilter: { category: 2, mask: 1 | everyoneExcept(actor) | MINI_BIT }, // + Mini-Kobolde fangen ab
    customData: {
      emoji: opts.emoji,
      size: opts.size,
      damage: opts.damage || 1,
      special: Boolean(opts.special),
      trail: opts.trail,
      scratch: Boolean(opts.scratch),
      isPlayerBomb: true,
      shooter: actor,
      target: targetName,
      born: performance.now()
    }
  });
  Body.setVelocity(body, {
    x: (target.position.x - x) / flightFrames,
    y: (target.position.y - y) / flightFrames - gravityPerFrame * (flightFrames + 1) / 2
  });
  Body.setAngularVelocity(body, direction * 0.2);
  Composite.add(engine.world, body);
  fallingBodies.push(body);
}

function explodeBomb(bomb) {
  bomb.exploded = true;
  const { x, y } = bomb.position;
  if (bomb.customData && bomb.customData.scratch) {
    scratchMarks.push({ x, y, angle: Math.atan2(bomb.velocity.y, bomb.velocity.x), born: performance.now() });
    playSound('scratch');
    spawnParticles(x, y, '#ef4444', 24);
    spawnParticles(x, y, '#fef08a', 14);
  } else {
    playSound('boom');
    spawnParticles(x, y, '#ff9f1c', 30);
    spawnParticles(x, y, '#ffde59', 16);
  }

  // Entfernen (nach der Schleife, damit das Array stabil bleibt)
  fallingBodies = fallingBodies.filter(b => {
    if (b.exploded) { Composite.remove(engine.world, b); return false; }
    return true;
  });
}

function clearAllBodies() {
  for (const b of fallingBodies) {
    Composite.remove(engine.world, b);
  }
  fallingBodies = [];
  scratchMarks = [];
}

// 🐾 Malt 3 glühende Drachen-Krallenspuren (beim Fliegen und beim Treffer)
function drawClawLines(size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  for (const offset of [-11, 0, 11]) {
    // Äußeres rotes Glühen
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-size * 0.55, offset - 5);
    ctx.quadraticCurveTo(0, offset - 1, size * 0.55, offset + 5);
    ctx.stroke();
    // Heller gelb-weißer Kern der Kralle
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.48, offset - 4);
    ctx.quadraticCurveTo(0, offset - 1, size * 0.48, offset + 4);
    ctx.stroke();
  }
  ctx.restore();
}

// Malt alle fliegenden Bomben und räumt verlorene Bomben weg.
function updateBombs(now) {
  // Nachleuchtende Kratzspuren an getroffenen Gegnern malen
  for (let i = scratchMarks.length - 1; i >= 0; i--) {
    const m = scratchMarks[i];
    const age = now - m.born;
    if (age > 520) { scratchMarks.splice(i, 1); continue; }
    const p = age / 520;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.angle - 0.35);
    drawClawLines(48 + p * 18, 1 - p);
    ctx.restore();
  }

  for (let i = fallingBodies.length - 1; i >= 0; i--) {
    const b = fallingBodies[i];
    const pos = b.position;
    const angle = b.angle;
    const data = b.customData;

    // Aus dem Bildschirm gefallen oder seitlich rausgeflogen?
    if (pos.y > height + 80 || pos.x < -150 || pos.x > width + 150) {
      Composite.remove(engine.world, b);
      fallingBodies.splice(i, 1);
      continue;
    }

    // Bombe nach 4 s ohne Treffer: leise verpuffen
    if (data.isPlayerBomb && now - data.born > (data.lifeMs || 4000)) {
      spawnParticles(pos.x, pos.y, '#9ca3af', 8);
      Composite.remove(engine.world, b);
      fallingBodies.splice(i, 1);
      continue;
    }

    // 🔥 Feuerspeer wird extra gemalt (specials.js)
    if (data.spear) { drawSpear(b, now); continue; }

    // 🐾 Kratzspur des Drachen: 3 glühende Krallen-Striche + Funken
    if (data.scratch) {
      if (Math.random() < 0.45) spawnParticles(pos.x, pos.y, '#f87171', 1);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(Math.atan2(b.velocity.y, b.velocity.x));
      drawClawLines(data.size || 38, 0.95);
      ctx.restore();
      continue;
    }

    // 🪙 Spur: Beim Fliegen purzelt etwas heraus (z. B. Goldmünzen)
    if (data.trail && Math.random() < 0.3) spawnEmojiParticle(pos.x, pos.y, data.trail);

    // Mit Drehung zeichnen
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    drawEmoji(data.emoji, 0, 0, data.size); // 🖼️ sprites.js
    ctx.restore();
  }
}
