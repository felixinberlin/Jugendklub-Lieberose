/**
 * 💣 bombs.js – Bomben werfen, fliegen lassen und explodieren
 */

// Alle Bomben, die gerade durch die Luft fliegen.
let fallingBodies = [];

// Eine angeklickte Figur wirft eine Bombe zur anderen Figur.
function shootBomb(actor) {
  if (!isPlaying || document.hidden) return;
  const source = actor === 'kobold' ? koboldBody : actor === 'corn' ? cornBody : null;
  if (!source) return;
  const target = source === koboldBody ? cornBody : koboldBody;
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  const distance = Math.hypot(dx, dy);
  const direction = distance ? dx / distance : 1;
  const radius = GAME_CONFIG.bombSize * 0.42;
  const x = source.position.x + direction * (34 + radius + 4);
  const y = source.position.y + (distance ? dy / distance : 0) * (34 + radius + 4);
  const flightFrames = 42;
  const gravityPerFrame = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2;
  const body = Bodies.circle(x, y, radius, {
    restitution: 0,
    frictionAir: 0,
    label: 'characterBomb',
    collisionFilter: { category: 2, mask: 1 | target.collisionFilter.category },
    customData: {
      emoji: GAME_CONFIG.bombEmoji,
      size: GAME_CONFIG.bombSize,
      isPlayerBomb: true,
      target: target.label,
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
  if (source === koboldBody) koboldWiggle = 1;
  else cornWiggle = 1;
  playSound('throw');
}

function explodeBomb(bomb) {
  bomb.exploded = true;
  const { x, y } = bomb.position;
  playSound('boom');
  spawnParticles(x, y, '#ff9f1c', 30);
  spawnParticles(x, y, '#ffde59', 16);

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
}

// Malt alle fliegenden Bomben und räumt verlorene Bomben weg.
function updateBombs(now) {
  for (let i = fallingBodies.length - 1; i >= 0; i--) {
    const b = fallingBodies[i];
    const pos = b.position;
    const angle = b.angle;
    const data = b.customData;

    // Aus dem Bildschirm gefallen?
    if (pos.y > height + 80) {
      Composite.remove(engine.world, b);
      fallingBodies.splice(i, 1);
      continue;
    }

    // Bombe nach 4 s ohne Treffer: leise verpuffen
    if (data.isPlayerBomb && now - data.born > 4000) {
      spawnParticles(pos.x, pos.y, '#9ca3af', 8);
      Composite.remove(engine.world, b);
      fallingBodies.splice(i, 1);
      continue;
    }

    // Mit Drehung zeichnen
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.font = `${data.size}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.emoji, 0, 0);
    ctx.restore();
  }
}
