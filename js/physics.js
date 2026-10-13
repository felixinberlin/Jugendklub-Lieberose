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
      if (other.label === bomb.customData.target) {
        actors[other.label].wiggle = 1;
        actors[other.label].hitsTaken++;
        if (bomb.customData.shooter && actors[bomb.customData.shooter]) {
          const shooter = actors[bomb.customData.shooter];
          shooter.hitsGiven++;
          // 🤲 Fußballer mit sixSeven jubeln nach einem Treffer (footballer.js)
          const shirt = GAME_CONFIG[`${bomb.customData.shooter}Shirt`];
          if (shirt && shirt.sixSeven) {
            shooter.sixSevenUntil = performance.now() + 1600;
            playSound('sixseven');
          }
        }
        score++;
        scoreEl.textContent = score;
        explodeBomb(bomb);
      }
    }
  });
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
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
