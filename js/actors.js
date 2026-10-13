/**
 * 🧌🌽 actors.js – Die beiden Figuren: Kobold und Mais
 *
 * Hier steht, wie die Figuren gebaut, bewegt, angetippt und gemalt werden.
 */

let koboldBody, cornBody;
let koboldWiggle = 0;
let cornWiggle = 0;

// Baut die Physik-Körper der beiden Figuren und setzt sie in die Welt.
function createActors() {
  // Kobold auf der linken Seite (Physik-Bumper)
  koboldBody = Bodies.circle(46, height * 0.55, 34, {
    isStatic: true,
    label: 'kobold',
    collisionFilter: { category: 4 },
    restitution: 1.05 // Bounct Items extra stark weg!
  });

  // Maispflanze auf der rechten Seite (Physik-Bumper)
  cornBody = Bodies.circle(width - 46, height * 0.55, 34, {
    isStatic: true,
    label: 'corn',
    collisionFilter: { category: 8 },
    restitution: 1.05 // Bounct Items extra stark weg!
  });

  Composite.add(engine.world, [koboldBody, cornBody]);
}

// Physikkörper, sichtbare Figur und Trefferfläche bleiben an derselben Position.
function moveActor(actor, x, y) {
  const body = actor === 'kobold' ? koboldBody : actor === 'corn' ? cornBody : null;
  if (!body) return;
  const marginX = Math.min(46, width / 2);
  const marginY = Math.min(65, height / 2);
  const position = {
    x: Math.max(marginX, Math.min(width - marginX, x)),
    y: Math.max(marginY, Math.min(height - marginY, y))
  };
  Body.setPosition(body, position);
  const button = document.getElementById(`${actor}Btn`);
  button.style.left = `${position.x}px`;
  button.style.top = `${position.y}px`;
}

// Jede Figur hat ihren eigenen Pointer: auch zwei Finger gleichzeitig gehen.
for (const actor of ['kobold', 'corn']) {
  const button = document.getElementById(`${actor}Btn`);
  let drag = null;
  let suppressClick = false;
  button.addEventListener('pointerdown', (event) => {
    if (!isPlaying || drag || event.button !== 0) return;
    initAudio();
    const body = actor === 'kobold' ? koboldBody : cornBody;
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
      moveActor(actor, drag.x + dx, drag.y + dy);
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
    shootBomb(actor);
  });
}

// Malt beide Figuren. Nach einem Wurf oder Treffer wackeln sie kurz (Wiggle).
function drawActors(now) {
  // 🧌 Kobold auf der linken Seite zeichnen
  ctx.save();
  const kY = koboldBody.position.y;
  ctx.translate(koboldBody.position.x, kY);
  ctx.rotate(Math.sin(now / 420) * 0.06 + (koboldWiggle * 0.25));
  ctx.font = `${GAME_CONFIG.koboldSize}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_CONFIG.koboldEmoji, 0, 0);
  ctx.font = 'bold 10px -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('KOBOLD', 0, 42);
  ctx.restore();

  // 🌽 Maispflanze auf der rechten Seite zeichnen
  ctx.save();
  const cY = cornBody.position.y;
  ctx.translate(cornBody.position.x, cY);
  ctx.rotate(Math.sin(now / 480) * 0.08 + (cornWiggle * 0.25));
  ctx.font = `${GAME_CONFIG.cornSize}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_CONFIG.cornEmoji, 0, 0);
  ctx.font = 'bold 10px -apple-system, sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('MAIS', 0, 42);
  ctx.restore();

  // Wiggle-Dämpfung
  koboldWiggle *= 0.88;
  cornWiggle *= 0.88;
}
