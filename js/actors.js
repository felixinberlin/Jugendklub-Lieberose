/**
 * 🧌🌽🐱 actors.js – Die Figuren: Kobold, Mais und Katze
 *
 * Hier steht, wie die Figuren gebaut, bewegt, angetippt und gemalt werden.
 */

// Alle Figuren in einer Liste. Jede wirft ihre Bombe auf `target`:
// Kobold → Mais → Katze → Kobold (immer im Kreis).
// Neue Figur? Eintrag hier + Knopf in index.html + Werte in config.js.
const actors = {
  kobold: {
    name: 'KOBOLD', color: '#6ee7b7', category: 4, target: 'corn',
    sway: 420, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: Math.max(46, width * 0.1), y: height * 0.55 })
  },
  corn: {
    name: 'MAIS', color: '#fef08a', category: 8, target: 'katze',
    sway: 480, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width - Math.max(46, width * 0.1), y: height * 0.55 })
  },
  katze: {
    name: 'KATZE', color: '#f9a8d4', category: 16, target: 'kobold',
    sway: 360, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width / 2, y: height * 0.3 })
  }
};

// Emoji und Größe kommen aus config.js (z. B. koboldEmoji, katzeSize).
function actorEmoji(name) { return GAME_CONFIG[`${name}Emoji`]; }
function actorSize(name) { return GAME_CONFIG[`${name}Size`]; }

// Baut die Physik-Körper der Figuren und setzt sie in die Welt.
function createActors() {
  for (const name in actors) {
    const actor = actors[name];
    const { x, y } = actor.start();
    actor.body = Bodies.circle(x, y, 34, {
      isStatic: true,
      label: name,
      collisionFilter: { category: actor.category },
      restitution: 1.05 // Bounct Items extra stark weg!
    });
    Composite.add(engine.world, actor.body);
  }
}

// Physikkörper, sichtbare Figur und Trefferfläche bleiben an derselben Position.
function moveActor(name, x, y) {
  const actor = actors[name];
  if (!actor || !actor.body) return;
  const marginX = Math.min(46, width / 2);
  const marginY = Math.min(65, height / 2);
  const position = {
    x: Math.max(marginX, Math.min(width - marginX, x)),
    y: Math.max(marginY, Math.min(height - marginY, y))
  };
  Body.setPosition(actor.body, position);
  const button = document.getElementById(`${name}Btn`);
  button.style.left = `${position.x}px`;
  button.style.top = `${position.y}px`;
}

// Alle Figuren zurück an ihren Startplatz.
function resetActors() {
  for (const name in actors) {
    const { x, y } = actors[name].start();
    moveActor(name, x, y);
    actors[name].wiggle = 0;
    actors[name].hitsGiven = 0;
    actors[name].hitsTaken = 0;
  }
}

// Jede Figur hat ihren eigenen Pointer: auch mehrere Finger gleichzeitig gehen.
for (const name in actors) {
  const button = document.getElementById(`${name}Btn`);
  let drag = null;
  let suppressClick = false;
  button.addEventListener('pointerdown', (event) => {
    if (!isPlaying || drag || event.button !== 0) return;
    initAudio();
    const body = actors[name].body;
    drag = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: body.position.x, y: body.position.y, moved: false
    };
    suppressClick = false;
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) >= GAME_CONFIG.dragThreshold) drag.moved = true;
    if (drag.moved) {
      suppressClick = true;
      moveActor(name, drag.x + dx, drag.y + dy);
    }
  });
  function finishDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved || event.type !== 'pointerup';
    drag = null;
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
  }
  button.addEventListener('pointerup', finishDrag);
  button.addEventListener('pointercancel', finishDrag);
  button.addEventListener('lostpointercapture', finishDrag);
  button.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    initAudio();
    shootBomb(name);
  });
}

// Malt alle Figuren. Nach einem Wurf oder Treffer wackeln sie kurz (Wiggle).
function drawActors(now) {
  for (const name in actors) {
    const actor = actors[name];
    ctx.save();
    ctx.translate(actor.body.position.x, actor.body.position.y);
    ctx.rotate(Math.sin(now / actor.sway) * 0.07 + (actor.wiggle * 0.25));
    ctx.font = `${actorSize(name)}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(actorEmoji(name), 0, 0);
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)'; // Dunkler Rand: lesbar bei Tag und Nacht
    ctx.strokeText(actor.name, 0, 42);
    ctx.fillStyle = actor.color;
    ctx.fillText(actor.name, 0, 42);

    // Treffer-Zähler: gegeben (🎯) / eingesteckt (💥)
    const statsText = `🎯${actor.hitsGiven} 💥${actor.hitsTaken}`;
    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeText(statsText, 0, 56);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(statsText, 0, 56);
    ctx.restore();

    // Wiggle-Dämpfung
    actor.wiggle *= 0.88;
  }
}
