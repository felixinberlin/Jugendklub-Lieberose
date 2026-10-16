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


