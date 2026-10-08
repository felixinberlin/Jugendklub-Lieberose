/**
 * Jugendklub Lieberose – Das Spiel (Matter.js 2D Physik-Edition)
 * 
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 */
const GAME_CONFIG = {
  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldSize: 70,
  cornEmoji: '🌽',
  cornSize: 74,

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Die angeklickte Figur wirft, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  dragThreshold: 8, // Kleine Fingerbewegungen zählen weiterhin als Antippen.

  // 🌲 Wald & Bäume Hintergrund (Lieberoser Zauberwald)
  forestTheme: true,
  moonEmoji: '🌙'
};

// Matter.js Module
const { Engine, Bodies, Body, Composite, Events } = Matter;

// Canvas & DOM Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const newRecordMsgEl = document.getElementById('newRecordMsg');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const soundToggle = document.getElementById('soundToggle');

// Web Audio API Synthesizer
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playSound(type) {
  if (type === 'point') {
    playTone(600, 'square', 0.08, 0.15);
    setTimeout(() => playTone(880, 'square', 0.12, 0.15), 60);
  } else if (type === 'gem') {
    playTone(750, 'triangle', 0.08, 0.2);
    setTimeout(() => playTone(1200, 'triangle', 0.18, 0.2), 70);
  } else if (type === 'hit') {
    playTone(180, 'sawtooth', 0.3, 0.25);
    setTimeout(() => playTone(90, 'sawtooth', 0.3, 0.25), 50);
  } else if (type === 'bounce') {
    playTone(320, 'sine', 0.05, 0.08);
  } else if (type === 'throw') {
    playTone(300, 'triangle', 0.1, 0.15);
    setTimeout(() => playTone(500, 'triangle', 0.1, 0.15), 60);
  } else if (type === 'boom') {
    playTone(120, 'sawtooth', 0.28, 0.28);
    playTone(70, 'square', 0.28, 0.2);
  }
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
});

// Dimensions & DPR Handling
let width = 360;
let height = 640;

// Game State
let isPlaying = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('lieberose_highscore') || '0', 10);
highScoreEl.textContent = highScore;

// Matter.js Physik Welt
let engine;
let leftWall, rightWall;
let koboldBody, cornBody;
let koboldWiggle = 0;
let cornWiggle = 0;
let fallingBodies = [];
let particles = [];
let forestData = {
  stars: [],
  fireflies: [],
  backTrees: [],
  midTrees: [],
  frontTrees: []
};


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

  Composite.add(engine.world, [leftWall, rightWall, koboldBody, cornBody]);

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
        if (other === koboldBody) koboldWiggle = 1;
        else cornWiggle = 1;
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

  for (const actor of ['kobold', 'corn']) {
    const body = actor === 'kobold' ? koboldBody : cornBody;
    if (body) moveActor(actor, body.position.x * width / oldWidth, body.position.y * height / oldHeight);
  }
  if (leftWall && rightWall) {
    Body.setPosition(leftWall, { x: -30, y: height / 2 });
    Body.setPosition(rightWall, { x: width + 30, y: height / 2 });
  }

  initForest();
}

window.addEventListener('resize', resizeCanvas);

// 🌲 Bäume zeichnen (Kiefern & Laubbäume für den Lieberoser Zauberwald)
function drawPineTree(ctx, x, baseY, w, h, foliageColor, trunkColor, sway = 0) {
  const trunkW = Math.max(4, Math.round(w * 0.16));
  const trunkH = Math.round(h * 0.26);

  // Baumstamm
  ctx.fillStyle = trunkColor;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  // Nadelkrone in 3 Etagen
  ctx.fillStyle = foliageColor;
  const tiers = 3;
  const tierH = (h - trunkH * 0.35) / tiers;
  const overlap = tierH * 0.35;

  for (let i = 0; i < tiers; i++) {
    const bY = baseY - trunkH * 0.5 - i * (tierH - overlap);
    const tY = bY - tierH;
    const tierW = w * (1 - i * 0.22);
    const tierSway = sway * ((i + 1) / tiers);

    ctx.beginPath();
    ctx.moveTo(x + tierSway, tY);
    ctx.lineTo(x + tierW / 2 + tierSway * 0.6, bY);
    ctx.quadraticCurveTo(x + tierSway * 0.3, bY - 3, x - tierW / 2 + tierSway * 0.6, bY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDeciduousTree(ctx, x, baseY, w, h, foliageColor, trunkColor, sway = 0) {
  const trunkW = Math.max(5, Math.round(w * 0.18));
  const trunkH = Math.round(h * 0.36);

  // Baumstamm
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.7, baseY);
  ctx.lineTo(x - trunkW * 0.4, baseY - trunkH);
  ctx.lineTo(x + trunkW * 0.4, baseY - trunkH);
  ctx.lineTo(x + trunkW * 0.7, baseY);
  ctx.closePath();
  ctx.fill();

  // Laubkrone (wolkenförmige Kreise)
  ctx.fillStyle = foliageColor;
  const crownY = baseY - trunkH - h * 0.25;
  const r = w * 0.42;

  ctx.beginPath();
  ctx.arc(x + sway, crownY, r, 0, Math.PI * 2);
  ctx.arc(x - r * 0.5 + sway * 0.8, crownY + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + r * 0.5 + sway * 0.8, crownY + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + sway * 1.1, crownY - r * 0.3, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function initForest() {
  // Sterne am Nachthimmel
  forestData.stars = [];
  for (let i = 0; i < 35; i++) {
    forestData.stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.55),
      size: Math.random() * 2 + 1,
      twinkleSpeed: Math.random() * 0.003 + 0.0015,
      phase: Math.random() * Math.PI * 2,
      baseAlpha: Math.random() * 0.5 + 0.3
    });
  }

  // Schwebende Glühwürmchen
  forestData.fireflies = [];
  for (let i = 0; i < 16; i++) {
    forestData.fireflies.push({
      x: Math.random() * width,
      y: height * 0.35 + Math.random() * (height * 0.58),
      size: Math.random() * 2.2 + 1.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Hintergrund-Bäume (ferne Silhouetten am Horizont)
  forestData.backTrees = [];
  const backCount = 8;
  for (let i = 0; i <= backCount; i++) {
    const x = (width / backCount) * i + (Math.random() - 0.5) * (width / backCount * 0.5);
    const h = 65 + Math.random() * 35;
    const w = 32 + Math.random() * 18;
    const type = (i % 3 === 0) ? 'deciduous' : 'pine';
    forestData.backTrees.push({
      x, baseY: height * 0.88, w, h, type,
      foliageColor: '#122e2e', trunkColor: '#0a1d1d'
    });
  }

  // Mittlere Baumreihe (dichter Mischwald)
  forestData.midTrees = [];
  const midCount = 7;
  for (let i = 0; i <= midCount; i++) {
    const x = (width / midCount) * (i + 0.25) + (Math.random() - 0.5) * 18;
    const h = 95 + Math.random() * 45;
    const w = 48 + Math.random() * 22;
    const type = (i % 2 === 0) ? 'pine' : 'deciduous';
    forestData.midTrees.push({
      x, baseY: height * 0.93, w, h, type,
      foliageColor: (i % 2 === 0) ? '#1a4933' : '#22583b',
      trunkColor: '#1d1912'
    });
  }

  // Vordergrund-Bäume (Rahmen an den Seiten und Waldboden)
  forestData.frontTrees = [];
  // Große Kiefer links am Rand
  forestData.frontTrees.push({
    x: 18, baseY: height + 8, w: 90, h: Math.min(240, height * 0.35), type: 'pine',
    foliageColor: '#133e26', trunkColor: '#28180f'
  });
  // Große Kiefer rechts am Rand
  forestData.frontTrees.push({
    x: width - 18, baseY: height + 8, w: 92, h: Math.min(245, height * 0.36), type: 'pine',
    foliageColor: '#16432b', trunkColor: '#28180f'
  });
  // Schöne Bäume dazwischen
  forestData.frontTrees.push({
    x: width * 0.28, baseY: height + 15, w: 72, h: Math.min(160, height * 0.24), type: 'deciduous',
    foliageColor: '#1a4a30', trunkColor: '#2c1b11'
  });
  forestData.frontTrees.push({
    x: width * 0.72, baseY: height + 15, w: 76, h: Math.min(170, height * 0.25), type: 'pine',
    foliageColor: '#16452c', trunkColor: '#28180f'
  });
}

function spawnParticles(x, y, color = '#ffde59', count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: Math.random() * 0.03 + 0.02,
      size: Math.random() * 4 + 2,
      color: color
    });
  }
}

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

// Start und Neustart
function clearAllBodies() {
  for (const b of fallingBodies) {
    Composite.remove(engine.world, b);
  }
  fallingBodies = [];
}

function startGame() {
  initAudio();
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;

  clearAllBodies();
  particles = [];
  moveActor('kobold', 46, height * 0.55);
  moveActor('corn', width - 46, height * 0.55);
  koboldWiggle = 0;
  cornWiggle = 0;

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Haupt-GameLoop
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime), 100);
  lastTime = now;

  // 1. Lieberoser Zauberwald: Nachthimmel & Dämmerung
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0.0, '#07111e');  // Tiefe Waldnacht
  skyGrad.addColorStop(0.45, '#0e232a'); // Geheimnisvolles Dämmergrün
  skyGrad.addColorStop(0.8, '#143628');  // Weicher Horizont über den Wipfeln
  skyGrad.addColorStop(1.0, '#0a1d14');  // Dunkler Waldboden
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Funkelnde Sterne
  for (const s of forestData.stars) {
    const alpha = s.baseAlpha + Math.sin(now * s.twinkleSpeed + s.phase) * 0.25;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, alpha))})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // Leuchtender Mond über den Bäumen
  const moonX = width * 0.82;
  const moonY = height * 0.12;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 42);
  moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
  moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '34px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_CONFIG.moonEmoji || '🌙', moonX, moonY);

  // 🌲 Schicht 1: Ferner Wald & sanfter Hügel im Hintergrund
  ctx.fillStyle = '#0a1f22';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.85);
  ctx.quadraticCurveTo(width * 0.5, height * 0.81, width, height * 0.86);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windBack = Math.sin(now * 0.0018) * 2;
  for (let i = 0; i < forestData.backTrees.length; i++) {
    const t = forestData.backTrees[i];
    const sway = windBack * Math.sin(i * 1.5 + 1);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

  // 🌲 Schicht 2: Mittlerer Waldboden & Mischwald
  ctx.fillStyle = '#0d2820';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.91);
  ctx.quadraticCurveTo(width * 0.45, height * 0.87, width, height * 0.92);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windMid = Math.sin(now * 0.0022 + 1) * 3.5;
  for (let i = 0; i < forestData.midTrees.length; i++) {
    const t = forestData.midTrees[i];
    const sway = windMid * Math.sin(i * 1.2 + 2);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

  // 🌲 Schicht 3: Vordergrund-Waldboden & große Randbäume
  ctx.fillStyle = '#081a14';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.96);
  ctx.quadraticCurveTo(width * 0.6, height * 0.92, width, height * 0.97);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windFront = Math.sin(now * 0.0025 + 2) * 5;
  for (let i = 0; i < forestData.frontTrees.length; i++) {
    const t = forestData.frontTrees[i];
    const sway = windFront * Math.sin(i * 1.7 + 3);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

  // ✨ Glühwürmchen, die durch den Wald schweben
  for (const f of forestData.fireflies) {
    f.x += f.speedX + Math.sin(now * 0.002 + f.phase) * 0.35;
    f.y += f.speedY + Math.cos(now * 0.0025 + f.phase) * 0.25;
    if (f.x < -10) f.x = width + 10;
    if (f.x > width + 10) f.x = -10;
    if (f.y < height * 0.35) f.y = height * 0.9;
    if (f.y > height * 0.95) f.y = height * 0.38;

    const glow = (Math.sin(now * 0.004 + f.phase) + 1) * 0.5;
    ctx.fillStyle = `rgba(254, 240, 138, ${glow * 0.85})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(110, 231, 183, ${glow * 0.25})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

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

  if (isPlaying) {
    // 2. Matter.js Physik-Schritt
    Engine.update(engine, dt);


    // 5. Physikalische Items zeichnen & aufräumen
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

  // 7. Partikel zeichnen
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  requestAnimationFrame(gameLoop);
}

// Initialisierung
initPhysics();
resizeCanvas();
requestAnimationFrame(gameLoop);
