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
// `shotOpts` (optional): { charge } aus dem Ziel-Modus (zielen.js) – schneller + vorhalten
function shootBomb(actor, forcedTarget, shotOpts) {
  if (!battleRunning() || document.hidden) return;
  if (!isAlive(actor)) return;
  if (isStunned(actor) || actors[actor].jump) return; // 🌪️ Im Wirbel / im Sprung wird nicht geworfen (specials.js)
  // Individuelle Angriffs-Pause je nach Charakter (z. B. Goat = alle 1.2s, Mais = alle 0.6s)
  const now = performance.now();
  const cdSec = getCharStat(actor, 'attackCooldown') || 1.2;
  const cooldownMs = cdSec * 1000;
  if (now - (actors[actor].lastThrow ?? -Infinity) < cooldownMs) return;
  const targetName = (forcedTarget && isAlive(forcedTarget) && forcedTarget !== actor)
    ? forcedTarget
    : targetOf(actor); // Ist das Ziel raus, geht's an die Nächste im Kreis (knockout.js)
  if (!targetName && !shotOpts?.aimPoint) return;
  const opts = normalerWurf(actor, shotOpts?.charge || 0);
  opts.vorhalten = shotOpts?.vorhalten ?? opts.lead;
  if (shotOpts?.aimPoint) opts.aimPoint = { ...shotOpts.aimPoint };
  launchArc(actor, targetName, opts);
  actors[actor].lastThrow = now;
  // Erst nach dem echten Wurf weiterschalten, nie beim Zeichnen der Vorschau.
  const weapons = actorCfg(actor, 'Weapons');
  if (weapons && weapons.length) {
    actors[actor].weaponIdx = ((actors[actor].weaponIdx ?? -1) + 1) % weapons.length;
  }
  actors[actor].wiggle = 1;
  playAttackSound(actor);
}

// 🎯 Ein Geschoss im Bogen von `actor` zu `targetName` werfen.
// opts: emoji, size, damage (Standard 1), special (Spezialattacke?), flightFrames (Standard 42)
// Vorschau und echter Wurf benutzen dieselbe Startposition und Geschwindigkeit.
function berechneWurfbogen(figur, zielFigur, wurf) {
  if (wurf.waffenProfil) return berechneFlugplan(figur, zielFigur, wurf);
  const startKoerper = actors[figur].body;
  const flugBilder = wurf.flightFrames || 42;
  // 🧌 Hat das Ziel Mini-Kobolde? Dann fliegt die Bombe zum Lockvogel (specials.js)
  // 🎯 Gezielter Schuss (wurf.lead > 0): dorthin werfen, wo der Gegner gleich sein wird (zielen.js)
  const zielKoerper = decoyFor(zielFigur, startKoerper.position, flugBilder)
    || (wurf.lead > 0 ? { position: leadPosition(zielFigur, flugBilder, wurf.lead) } : actors[zielFigur].body);
  const wegX = zielKoerper.position.x - startKoerper.position.x;
  const wegY = zielKoerper.position.y - startKoerper.position.y;
  const entfernung = Math.hypot(wegX, wegY);
  const richtung = entfernung ? wegX / entfernung : 1;
  const radius = wurf.size * 0.42;
  const figurenRadius = 34 * (mapScale());
  const x = startKoerper.position.x + richtung * (figurenRadius + radius + 4);
  const y = startKoerper.position.y + (entfernung ? wegY / entfernung : 0) * (figurenRadius + radius + 4);
  const schwerkraftProBild = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2;
  return {
    x, y, radius, richtung, flugBilder,
    vx: (zielKoerper.position.x - x) / flugBilder,
    vy: (zielKoerper.position.y - y) / flugBilder - schwerkraftProBild * (flugBilder + 1) / 2
  };
}

function launchArc(actor, targetName, opts) {
  const flugplan = berechneWurfbogen(actor, targetName, opts);
  const { x, y, radius, richtung, vx, vy } = flugplan;
  const body = Bodies.circle(x, y, radius, {
    restitution: 0,
    frictionAir: 0,
    label: 'characterBomb',
    // Trifft JEDE Figur im Weg – nur nicht die, die geworfen hat
    collisionFilter: { category: 2, mask: 1 | everyoneExcept(actor) | MINI_BIT }, // + Mini-Kobolde fangen ab
    customData: {
      emoji: opts.emoji,
      size: opts.size,
      damage: opts.damage ?? 1,
      special: Boolean(opts.special),
      trail: opts.trail,
      scratch: Boolean(opts.scratch),
      bolt: Boolean(opts.bolt),
      weapon: opts.weapon || null,
      isPlayerBomb: true,
      shooter: actor,
      target: targetName,
      lifeMs: opts.lifeMs,
      flugplan: opts.waffenProfil ? flugplan : null,
      flugAlter: 0,
      explosionsRadius: opts.explosionsRadius || 0,
      trefferfolgen: opts.trefferfolgen || [],
      zuendBild: opts.explosionsRadius > 0
        ? Math.min(opts.waffenProfil && flugplan.frei ? flugplan.vorschauBilder : flugplan.flugBilder,
          (opts.lifeMs || 4000) * 60 / 1000) : null,
      born: performance.now()
    }
  });
  Body.setVelocity(body, {
    x: vx,
    y: vy
  });
  if (opts.waffenProfil) Body.setAngle(body, Math.atan2(vy, vx));
  Body.setAngularVelocity(body, richtung * (opts.waffenProfil ? opts.waffenProfil.drehung : 0.2));
  Composite.add(engine.world, body);
  fallingBodies.push(body);
}

function explodeBomb(bomb) {
  if (bomb.exploded) return;
  bomb.exploded = true;
  if (bomb.customData?.explosionsRadius > 0) explosionsTreffer(bomb);
  const { x, y } = bomb.position;
  if (bomb.customData && bomb.customData.scratch) {
    scratchMarks.push({ x, y, angle: Math.atan2(bomb.velocity.y, bomb.velocity.x), born: performance.now() });
    playSound('scratch');
    spawnParticles(x, y, '#ef4444', 24);
    spawnParticles(x, y, '#fef08a', 14);
  } else if (bomb.customData && bomb.customData.bolt) {
    playSound('zap');
    spawnParticles(x, y, '#38bdf8', 24);
    spawnParticles(x, y, '#facc15', 16);
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

// ⚡ Malt einen gezackten elektrischen Blitz für ZEUS
function drawLightningBolt(size) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = [
    [-size * 0.65, -4],
    [-size * 0.15, 7],
    [-size * 0.05, -5],
    [size * 0.65, 3]
  ];
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
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
    const flugDauerMs = data.flugplan || data.zuendBild ? data.flugAlter * 1000 / 60 : now - data.born;
    if (data.isPlayerBomb && flugDauerMs > (data.lifeMs || 4000)) {
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

    // ⚔️ Eigene Waffe der Figur (waffen.js): Spitze zeigt in Flugrichtung, Keulen & Kugeln drehen sich
    if (data.weapon) {
      if (data.weapon === 'fireball' && Math.random() < 0.5) spawnParticles(pos.x, pos.y, '#f97316', 1);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      const drehtSich = data.flugplan ? data.flugplan.waffenProfil.drehung !== 0 : SPINNING_WEAPONS.includes(data.weapon);
      ctx.rotate(drehtSich ? angle : Math.atan2(b.velocity.y, b.velocity.x));
      drawWeapon(data.weapon, (data.size || 32) * (GAME_CONFIG.weaponScale || 1)); // ⚔️ größer = besser sichtbar
      ctx.restore();
      continue;
    }

    // ⚡ Blitz-Geschoss von ZEUS
    if (data.bolt) {
      if (Math.random() < 0.5) spawnParticles(pos.x, pos.y, '#38bdf8', 1);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(Math.atan2(b.velocity.y, b.velocity.x));
      drawLightningBolt(data.size || 36);
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
