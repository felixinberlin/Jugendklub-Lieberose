/**
 * ⚽🍿🔥 special-weapons.js – Die fliegenden Spezialwaffen
 *
 * Riesenball, Popcorn und Feuerspeer samt Brandschaden.
 * Neue Waffen nutzen everyoneExcept() und applyHit() wie normale Bomben.
 */

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

// ---------- 👺 Goblin: Brennender Dreizack 🔱🔥 ----------
function fireSpear(name) {
  const targetName = targetOf(name);
  if (!targetName) return false;
  const cfg = GAME_CONFIG.fireSpear;
  const from = actors[name].body.position;
  const to = actors[targetName].body.position;
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const vx = (to.x - from.x) / d * cfg.speed;
  const vy = (to.y - from.y) / d * cfg.speed;
  const spear = Bodies.circle(from.x + vx / cfg.speed * 45, from.y + vy / cfg.speed * 45, 14, {
    isSensor: true, frictionAir: 0, label: 'characterBomb',
    // Keine Wände (fliegt einfach raus), trifft alle Figuren außer dem Werfer
    collisionFilter: { category: 2, mask: everyoneExcept(name) | MINI_BIT },
    customData: {
      spear: true, pierce: true, burn: true, special: true, isPlayerBomb: true,
      emoji: '🔱', size: 32, damage: cfg.damage, shooter: name, target: targetName,
      born: performance.now(), lifeMs: 3000, vx, vy
    }
  });
  spear.hitSet = new Set();
  Body.setVelocity(spear, { x: vx, y: vy });
  Composite.add(engine.world, spear);
  fallingBodies.push(spear);
  playSound('spear');
}

// Der brennende Dreizack fliegt schnurgerade (keine Schwerkraft) und zieht Feuerfunken hinter sich her
function updateSpears() {
  for (const b of fallingBodies) {
    const data = b.customData;
    if (!data.spear) continue;
    Body.setVelocity(b, { x: data.vx, y: data.vy });
    if (Math.random() < 0.65) spawnParticles(b.position.x, b.position.y, '#f97316', 1);
  }
}

// 🔱🔥 Brennenden Dreizack malen: Schaft + 3 Zacken + lodernde Flammen an den Spitzen
function drawSpear(b, now) {
  const data = b.customData;
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(Math.atan2(data.vy, data.vx));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Schaft
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();

  // Dreizack-Gabel (3 Zacken: oben, Mitte, unten)
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  // Querbügel
  ctx.moveTo(6, -12);
  ctx.lineTo(6, 12);
  // Obere Zacke
  ctx.moveTo(6, -12);
  ctx.lineTo(22, -12);
  // Mittlere Zacke
  ctx.moveTo(6, 0);
  ctx.lineTo(26, 0);
  // Untere Zacke
  ctx.moveTo(6, 12);
  ctx.lineTo(22, 12);
  ctx.stroke();

  // 3 Spitzen
  ctx.fillStyle = '#fef08a';
  for (const [tx, ty] of [[25, -12], [29, 0], [25, 12]]) {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 6, ty - 3.5);
    ctx.lineTo(tx - 6, ty + 3.5);
    ctx.closePath();
    ctx.fill();
  }

  // Flammen an den 3 Dreizack-Zacken
  const fl = 20 + Math.sin(now / 50) * 3;
  drawEmoji('🔥', 22, -12, fl * 0.85);
  drawEmoji('🔥', 26, 0, fl);
  drawEmoji('🔥', 22, 12, fl * 0.85);
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

// ---------- ⚡ ZEUS: Roter Blitz-Regen (4 Sekunden im markierten Kreis) ----------
let zeusStorms = [];

function zeusStorm(name) {
  const targetName = targetOf(name);
  if (!targetName || !isAlive(targetName)) return false;
  const cfg = GAME_CONFIG.zeusStorm;
  const pos = actors[targetName].body.position;
  const now = performance.now();
  zeusStorms.push({
    shooter: name,
    x: pos.x,
    y: pos.y,
    radius: cfg.radius,
    born: now,
    until: now + cfg.seconds * 1000,
    nextStrike: now + 120,
    bolts: []
  });
  playSound('thunder');
  return true;
}

function clearStorms() {
  zeusStorms = [];
}

function updateStorms(now) {
  const cfg = GAME_CONFIG.zeusStorm;
  for (let i = zeusStorms.length - 1; i >= 0; i--) {
    const s = zeusStorms[i];
    if (now > s.until) {
      zeusStorms.splice(i, 1);
      continue;
    }
    // Alte Blitz-Einschläge ausblenden
    s.bolts = s.bolts.filter(b => now - b.born < 220);

    if (now >= s.nextStrike) {
      s.nextStrike = now + cfg.strikeEveryMs;
      // 3 Blitze schlagen im roten Kreis ein
      for (let k = 0; k < 3; k++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * (s.radius - 10);
        const bx = s.x + Math.cos(angle) * dist;
        const by = s.y + Math.sin(angle) * dist;
        s.bolts.push({ x: bx, y: by, born: now });
        spawnParticles(bx, by, '#38bdf8', 7);
        spawnParticles(bx, by, '#facc15', 5);
      }
      playSound('zap');

      // Trifft alle Gegner, die im roten Kreis stehen!
      for (const victim in actors) {
        if (victim === s.shooter || !isAlive(victim) || isHidden(victim)) continue;
        if (teamMode && teamOf(victim) === teamOf(s.shooter)) continue;
        const p = actors[victim].body.position;
        if (Math.hypot(p.x - s.x, p.y - s.y) <= s.radius + 22) {
          applyHit(victim, s.shooter, cfg.damage, true);
        }
      }
    }
  }
}

function drawStorms(now) {
  for (const s of zeusStorms) {
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.018);
    ctx.save();
    // 🔴 Rot markierter runder Bereich auf der Map
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 38, 38, ${0.22 + pulse * 0.14})`;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();

    // Innerer Warnring + Countdown-Restanzeige
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.65, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(252, 165, 165, 0.8)';
    ctx.stroke();
    ctx.setLineDash([]);

    // ⚡ Einschlagende Blitze von oben in den roten Kreis
    for (const b of s.bolts) {
      const alpha = 1 - (now - b.born) / 220;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(b.x - 10, b.y - 130);
      ctx.lineTo(b.x + 8, b.y - 80);
      ctx.lineTo(b.x - 7, b.y - 40);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.x - 10, b.y - 130);
      ctx.lineTo(b.x + 8, b.y - 80);
      ctx.lineTo(b.x - 7, b.y - 40);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------- 🌟⚽ Lamine Yamal: Gold-Schuss & YAMAL × MUSIALA KOMBO (20 Treffer gemeinsam!) ----------
let activeComboLinks = [];

// Prüft, ob für diese Figur ein lebender Kombo-Partner (Yamal + Musiala) im selben Team steht
function findComboPartner(name) {
  const kind = kindOf(name);
  if (kind !== 'yamal' && kind !== 'musiala') return null;
  const wantedKind = kind === 'yamal' ? 'musiala' : 'yamal';
  for (const other in actors) {
    if (other === name || !isAlive(other) || kindOf(other) !== wantedKind) continue;
    if (teamMode) {
      if (teamOf(other) === teamOf(name)) return other;
    } else if (playerTeam === null) {
      return other;
    }
  }
  return null;
}

// 🤝⚽🌟 Doppelpass-Kombo von Lamine Yamal & Musiala/GOAT!
function yamalMusialaCombo(name, partnerName) {
  const targets = popcornTargets(name);
  if (!targets.length) return false;
  const cfg = GAME_CONFIG.yamalMusialaCombo || { balls: 14, damage: 3, size: 42 };
  const p1 = actors[name].body.position;
  const p2 = actors[partnerName] ? actors[partnerName].body.position : p1;
  const now = performance.now();

  activeComboLinks.push({
    a: name,
    b: partnerName,
    born: now,
    until: now + 1800
  });

  spawnParticles(p1.x, p1.y, '#facc15', 30);
  spawnParticles(p2.x, p2.y, '#38bdf8', 30);
  playSound('combo');

  // Beide schießen abwechselnd eine Salve goldener Traumtor-Fußbälle auf alle Gegner!
  for (let i = 0; i < cfg.balls; i++) {
    const shooter = (i % 2 === 0 || !actors[partnerName]) ? name : partnerName;
    const target = targets[i % targets.length];
    launchArc(shooter, target, {
      emoji: i % 2 === 0 ? '⚽' : '🌟',
      size: Math.round(cfg.size * (GAME_CONFIG.mapScale || 0.72)),
      damage: cfg.damage,
      special: true,
      trail: '✨',
      flightFrames: 26 + (i % 5) * 4
    });
  }
  return true;
}

let yamalStars = [];

function clearYamalStars() {
  yamalStars = [];
}

// 🌟💥 Lamine Yamal: Stern fliegt in die Mitte, explodiert dort und fügt einem zufälligen Spieler 12 Schaden zu!
function yamalSpecial(name) {
  const enemies = Object.keys(actors).filter(n => isAlive(n) && (teamMode ? teamOf(n) !== teamOf(name) : n !== name));
  const victim = enemies.length ? enemies[Math.floor(Math.random() * enemies.length)] : targetOf(name);
  if (!victim) return false;

  const from = { ...actors[name].body.position };
  const center = { x: width / 2, y: height / 2 };
  const now = performance.now();

  yamalStars.push({
    shooter: name,
    victim,
    from,
    center,
    born: now,
    exploded: false,
    lifeMs: 1400
  });

  spawnParticles(from.x, from.y, '#facc15', 25);
  playSound('bigball');
  return true;
}

function updateYamalStars(now) {
  for (let i = yamalStars.length - 1; i >= 0; i--) {
    const s = yamalStars[i];
    const elapsed = now - s.born;
    if (elapsed > s.lifeMs) {
      yamalStars.splice(i, 1);
      continue;
    }

    // In der Mitte angekommen -> BUMM!
    if (elapsed >= 360 && !s.exploded) {
      s.exploded = true;
      spawnParticles(s.center.x, s.center.y, '#facc15', 35);
      spawnParticles(s.center.x, s.center.y, '#f59e0b', 25);
      spawnParticles(s.center.x, s.center.y, '#ffffff', 20);
      playSound('hit');

      if (isAlive(s.victim) && !isHidden(s.victim)) {
        applyHit(s.victim, s.shooter, 12, true); // 🌟💥 12 Schaden auf zufälligen Spieler!
        const vPos = actors[s.victim].body.position;
        spawnParticles(vPos.x, vPos.y, '#facc15', 25);
        spawnParticles(vPos.x, vPos.y, '#ec4899', 15);
      }
    }
  }
}

function drawYamalStars(now) {
  for (const s of yamalStars) {
    const elapsed = now - s.born;
    ctx.save();
    if (elapsed < 360) {
      // 🌟 Stern fliegt in die Mitte
      const p = elapsed / 360;
      const curX = s.from.x + (s.center.x - s.from.x) * p;
      const curY = s.from.y + (s.center.y - s.from.y) * p - Math.sin(p * Math.PI) * 45;
      const starSize = 34 + p * 26;
      ctx.translate(curX, curY);
      ctx.rotate(elapsed * 0.02);
      drawEmoji('🌟', 0, 0, starSize);
      if (Math.random() < 0.6) spawnParticles(curX, curY, '#facc15', 1);
    } else {
      // 💥 Schockwelle und Laser-Strahl zum getroffenen Ziel
      const post = (elapsed - 360) / (s.lifeMs - 360);
      const alpha = Math.max(0, 1 - post);
      ctx.globalAlpha = alpha;

      // Goldener Schockwellen-Ring in der Mitte
      const ringR = 25 + post * 90;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4 * (1 - post);
      ctx.beginPath();
      ctx.arc(s.center.x, s.center.y, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Stern in der Mitte leuchtet kurz nach
      if (post < 0.4) {
        drawEmoji('💥', s.center.x, s.center.y, 60 * (1 - post * 1.5));
      }

      // Goldener Sternen-Blitzstrahl zum Ziel
      if (isAlive(s.victim)) {
        const vPos = actors[s.victim].body.position;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4 * (1 - post);
        ctx.beginPath();
        ctx.moveTo(s.center.x, s.center.y);
        ctx.lineTo(vPos.x, vPos.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawComboEffects(now) {
  for (let i = activeComboLinks.length - 1; i >= 0; i--) {
    const c = activeComboLinks[i];
    if (now > c.until || !isAlive(c.a) || !isAlive(c.b)) {
      activeComboLinks.splice(i, 1);
      continue;
    }
    const pa = actors[c.a].body.position;
    const pb = actors[c.b].body.position;
    const alpha = Math.min(1, (c.until - now) / 400);
    ctx.save();
    ctx.globalAlpha = alpha;
    // Goldener Doppelpass-Energiestrahl zwischen Yamal & GOAT
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2 - 26;
    drawLabel('🤝 YAMAL × GOAT KOMBO! ⚽🌟', mx, my, {
      size: 16, weight: '900', fill: '#facc15', stroke: '#0f172a', lineWidth: 4
    });
    ctx.restore();
  }
}



