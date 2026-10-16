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

