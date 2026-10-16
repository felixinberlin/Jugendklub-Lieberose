/**
 * 🧪 physics.js – Die Physik-Welt (Matter.js)
 *
 * Schwerkraft, Wände, und was passiert, wenn zwei Dinge zusammenstoßen.
 * Außerdem: das Spielfeld an die Bildschirmgröße anpassen.
 */

let leftWall, rightWall;

function initPhysics() {
  engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = GAME_CONFIG.gravityY;

  // Seitenwände
  const wallThickness = 60;
  leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    restitution: 0.8
  });
  rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    restitution: 0.8
  });

  Composite.add(engine.world, [leftWall, rightWall]);
  createActors();

  // Kollisions-Events
  Events.on(engine, 'collisionStart', (event) => {
    if (!isPlaying) return;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      const bomb = bodyA.customData?.isPlayerBomb ? bodyA
        : bodyB.customData?.isPlayerBomb ? bodyB : null;
      if (!bomb || bomb.exploded) continue;
      const other = bomb === bodyA ? bodyB : bodyA;
      // 🧌 Mini-Kobold fängt die Bombe ab (specials.js)
      if (other.label === 'miniKobold') { blockByMini(bomb, other); continue; }
      const data = bomb.customData;
      const victim = other.label;
      // Getroffen wird jede lebende Figur – nicht nur das Ziel (nur der Werfer nicht)
      if (!isAlive(victim) || victim === data.shooter) continue;
      if (data.pierce) {
        // 🔥 Feuerspeer fliegt DURCH alle durch – jede Figur nur einmal (specials.js)
        if (bomb.hitSet.has(victim)) continue;
        bomb.hitSet.add(victim);
        if (data.burn) startBurn(victim, data.shooter);
        applyHit(victim, data.shooter, data.damage || 1, data.special);
        continue;
      }
      applyHit(victim, data.shooter, data.damage || 1, data.special);
      explodeBomb(bomb);
    }
  });
}

// 💥 Eine Figur bekommt Schaden. Wird von Bomben, Katzensprung und Feuer benutzt.
// `special` = kam von einer Spezialattacke (die lädt die Spezialkraft nicht auf).
function applyHit(victim, shooterName, damage, special) {
  if (!isAlive(victim)) return;
  if (isHidden(victim)) return; // 🐭🕳️ Versteckt = kein Schaden (specials.js)
  actors[victim].wiggle = 1;
  actors[victim].hitsTaken += damage;
  const shooter = actors[shooterName];
  if (shooter) {
    shooter.hitsGiven += damage;
    if (!special) chargeSpecial(shooterName); // ⚡ Aufladen (specials.js)
    // 🤲 Fußballer mit sixSeven jubeln nach einem Treffer (footballer.js)
    const shirt = actorCfg(shooterName, 'Shirt');
    if (shirt && shirt.sixSeven) {
      shooter.sixSevenUntil = performance.now() + 1600;
      playSound('sixseven');
    }
  }
  // TREFFER oben zählt nur deine eigenen (bei „Alle zusammen“: alle)
  if (playerTeam === null || playerTeam.includes(shooterName)) {
    score += damage;
    scoreEl.textContent = score;
  }
  checkKnockout(victim); // 💀 Genug Treffer? Dann ist die Figur raus (knockout.js)
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  // Höchstens 2-fache Pixeldichte: Bei 3 müsste das Handy 2,25-mal so viele Pixel malen,
  // ohne dass man den Unterschied sieht. Das spart viel Tempo!
  const dpr = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.maxPixelRatio);
  renderDpr = dpr; // Für den Bilder-Speicher (sprites.js)
  const oldWidth = width;
  const oldHeight = height;
  width = rect.width;
  height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  for (const name in actors) {
    const body = actors[name].body;
    if (body) moveActor(name, body.position.x * width / oldWidth, body.position.y * height / oldHeight);
  }
  if (leftWall && rightWall) {
    Body.setPosition(leftWall, { x: -30, y: height / 2 });
    Body.setPosition(rightWall, { x: width + 30, y: height / 2 });
  }

  initForest();
}

window.addEventListener('resize', resizeCanvas);
