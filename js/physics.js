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
  Events.on(engine, 'beforeUpdate', bewegeGeschosse);
  Events.on(engine, 'afterUpdate', zuendeGeschosse);

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
    if (!battleRunning()) return;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      const bomb = bodyA.customData?.isPlayerBomb ? bodyA
        : bodyB.customData?.isPlayerBomb ? bodyB : null;
      if (!bomb || bomb.exploded) continue;
      const other = bomb === bodyA ? bodyB : bodyA;
      if (other.customData?.isPlayerBomb) continue; // Waffen zerstören einander nicht.
      // Profil-Waffen enden an der Wand; der Flugplan darf sie nicht hindurchziehen.
      if ((bomb.customData.flugplan || bomb.customData.explosionsRadius > 0)
          && (other === leftWall || other === rightWall)) {
        explodeBomb(bomb);
        continue;
      }
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
        treffeMitGeschoss(victim, data);
        continue;
      }
      if (!(data.explosionsRadius > 0)) treffeMitGeschoss(victim, data);
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
  const currentMax = actors[victim].maxHp || 100;
  if (typeof actors[victim].hp !== 'number') actors[victim].hp = currentMax;
  // Auf 1 Kommastelle runden: Schaden wie 1,7 ergibt sonst Zahlen wie 3,4000000001
  const r1 = (v) => Math.round(v * 10) / 10;
  actors[victim].hp = r1(Math.max(0, actors[victim].hp - damage));
  actors[victim].hitsTaken = r1(currentMax - actors[victim].hp);
  const shooter = actors[shooterName];
  if (shooter) {
    shooter.hitsGiven = r1(shooter.hitsGiven + damage);
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
    score = r1(score + damage);
    scoreEl.textContent = score;
    if (typeof addSavedScore === 'function') addSavedScore(damage);
  }
  checkKnockout(victim); // 💀 Genug Treffer? Dann ist die Figur raus (knockout.js)
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  // Höchstens 2-fache Pixeldichte: Bei 3 müsste das Handy 2,25-mal so viele Pixel malen,
  // ohne dass man den Unterschied sieht. Das spart viel Tempo!
  const dpr = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.maxPixelRatio);
  const zoom = viewZoom(); // 🔭 Handy: herausgezoomt (actors.js)
  if (renderDpr !== dpr * zoom && typeof spriteCache !== 'undefined') {
    spriteCache.clear();
  }
  renderDpr = dpr * zoom; // Für den Bilder-Speicher (sprites.js)
  const oldWidth = width;
  const oldHeight = height;
  // Die Welt ist um den Zoom größer als der Bildschirm → mehr Platz zum Kämpfen
  width = rect.width / zoom;
  height = rect.height / zoom;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr * zoom, dpr * zoom);

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
