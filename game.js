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

  // Die beiden werfen abwechselnd, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  bombCooldownMs: 1100,
  cleanBackground: true // Sauberer, ruhiger Bildschirm
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
let stars = [];

let nextThrower = 'kobold';

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
    restitution: 1.05 // Bounct Items extra stark weg!
  });

  // Maispflanze auf der rechten Seite (Physik-Bumper)
  cornBody = Bodies.circle(width - 46, height * 0.55, 34, {
    isStatic: true,
    label: 'corn',
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
  width = rect.width;
  height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  if (koboldBody) {
    Body.setPosition(koboldBody, { x: 46, y: height * 0.55 });
  }
  if (cornBody) {
    Body.setPosition(cornBody, { x: width - 46, y: height * 0.55 });
  }
  if (leftWall && rightWall) {
    Body.setPosition(leftWall, { x: -30, y: height / 2 });
    Body.setPosition(rightWall, { x: width + 30, y: height / 2 });
  }
}

window.addEventListener('resize', resizeCanvas);

function createStars() {
  stars = [];
  for (let i = 0; i < GAME_CONFIG.backgroundStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.7 + 0.3
    });
  }
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

// Beide Figuren werfen abwechselnd einen gezielten Bogen zur anderen Seite.
let lastBombTime = 0;

function throwBomb() {
  if (!isPlaying) return;
  const source = nextThrower === 'kobold' ? koboldBody : cornBody;
  const target = source === koboldBody ? cornBody : koboldBody;
  const direction = source === koboldBody ? 1 : -1;
  const radius = GAME_CONFIG.bombSize * 0.42;
  const x = source.position.x + direction * (34 + radius + 4);
  const y = source.position.y - 12;
  const flightFrames = 42;
  const gravityPerFrame = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2;
  const body = Bodies.circle(x, y, radius, {
    restitution: 0,
    frictionAir: 0,
    label: 'characterBomb',
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
  nextThrower = target.label;
  lastBombTime = performance.now();
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
  lastBombTime = 0;
  nextThrower = 'kobold';
  koboldWiggle = 0;
  cornWiggle = 0;

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';

  createStars();
  throwBomb();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Haupt-GameLoop
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime), 100);
  lastTime = now;

  // 1. Sauberer, ruhiger Hintergrund (Lieberoser Zauberwald)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0.0, '#0b132b');  // Klares Nachtblau
  bgGrad.addColorStop(0.65, '#1c2541'); // Sanftes Schieferblau
  bgGrad.addColorStop(1.0, '#064e3b');  // Grüner Waldboden
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Sanfte Sterne am Nachthimmel
  ctx.fillStyle = '#ffffff';
  for (const s of stars) {
    s.y += s.speed * 0.3;
    if (s.y > height * 0.7) s.y = 0;
    ctx.globalAlpha = s.alpha * 0.5;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1.0;

  // 🧌 Kobold auf der linken Seite zeichnen
  ctx.save();
  const kY = height * 0.55 + Math.sin(now / 350) * 4;
  ctx.translate(46, kY);
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
  const cY = height * 0.55 + Math.cos(now / 380) * 4;
  ctx.translate(width - 46, cY);
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

    if (now - lastBombTime >= GAME_CONFIG.bombCooldownMs) throwBomb();

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
createStars();
requestAnimationFrame(gameLoop);
