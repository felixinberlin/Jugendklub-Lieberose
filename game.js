/**
 * Jugendklub Lieberose – Das Spiel (Matter.js 2D Physik-Edition)
 * 
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 */
const GAME_CONFIG = {
  // Spieler
  playerEmoji: '🚀',
  playerSize: 52,

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Gute Items (geben Punkte & bouncen!)
  goodItems: [
    { emoji: '⭐', points: 1, size: 38, density: 0.001 },
    { emoji: '🍕', points: 2, size: 42, density: 0.0015 },
    { emoji: '🥤', points: 2, size: 38, density: 0.001 },
    { emoji: '💎', points: 5, size: 44, density: 0.002 }
  ],

  // Gefahren (Game Over bei Berührung!)
  badItems: [
    { emoji: '💣', damage: 1, size: 42, density: 0.002 },
    { emoji: '👾', damage: 1, size: 44, density: 0.0015 },
    { emoji: '⚡', damage: 1, size: 40, density: 0.001 }
  ],

  spawnRateMs: 850,
  backgroundStars: 40,
  rainbowBackground: true // 🌈 Animierter Regenbogen
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
let playerBody;
let leftWall, rightWall;
let fallingBodies = [];
let particles = [];
let stars = [];
let lastSpawn = 0;

const player = {
  x: 180,
  y: 550,
  size: GAME_CONFIG.playerSize,
  speed: 8,
  targetX: 180,
  movingLeft: false,
  movingRight: false,
  tilt: 0
};

function initPhysics() {
  engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = GAME_CONFIG.gravityY;

  // Seitenwände, damit physikalische Items abprallen können!
  const wallThickness = 60;
  leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    restitution: 0.8
  });
  rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    restitution: 0.8
  });

  // Spieler-Physikkörper
  playerBody = Bodies.circle(player.x, player.y, player.size * 0.42, {
    isStatic: true,
    label: 'player',
    restitution: 0.9
  });

  Composite.add(engine.world, [leftWall, rightWall, playerBody]);

  // Kollisions-Events (Kollision zwischen Spieler und Items / Items untereinander)
  Events.on(engine, 'collisionStart', (event) => {
    if (!isPlaying) return;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      let targetItem = null;

      if (bodyA.label === 'player' && bodyB.customData) targetItem = bodyB;
      else if (bodyB.label === 'player' && bodyA.customData) targetItem = bodyA;

      if (targetItem && !targetItem.collected) {
        if (targetItem.customData.isBad) {
          gameOver();
          return;
        } else {
          // Gutes Item gefangen!
          targetItem.collected = true;
          score += targetItem.customData.points;
          scoreEl.textContent = score;
          playSound(targetItem.customData.points > 2 ? 'gem' : 'point');
          spawnParticles(targetItem.position.x, targetItem.position.y, '#67e8f9', 16);

          // Aus Matter.js entfernen
          Composite.remove(engine.world, targetItem);
          fallingBodies = fallingBodies.filter(b => b !== targetItem);
        }
      } else if (bodyA.customData && bodyB.customData) {
        // Items prallen aufeinander ab! Leises Plopp-Geräusch
        playSound('bounce');
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

  player.y = height - 90;
  player.x = Math.min(Math.max(player.x, player.size / 2), width - player.size / 2);

  if (playerBody) {
    Body.setPosition(playerBody, { x: player.x, y: player.y });
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

function spawnPhysicsItem() {
  const isBad = Math.random() < 0.36;
  const pool = isBad ? GAME_CONFIG.badItems : GAME_CONFIG.goodItems;
  const template = pool[Math.floor(Math.random() * pool.length)];

  const startX = Math.random() * (width - 80) + 40;
  const startY = -40;
  const radius = template.size * 0.42;

  // Erstelle Matter.js Kreis-Körper mit echtem Gewicht und Bounciness
  const body = Bodies.circle(startX, startY, radius, {
    restitution: GAME_CONFIG.restitution,
    frictionAir: GAME_CONFIG.frictionAir,
    density: template.density || 0.001,
    label: isBad ? 'badItem' : 'goodItem',
    customData: {
      emoji: template.emoji,
      size: template.size,
      points: template.points || 0,
      isBad: isBad
    }
  });

  // Ein leichter zufälliger Dreh- und Seitwärtsimpuls für mehr Chaos & Spaß
  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
  Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: Math.random() * 2 + 1 });

  Composite.add(engine.world, body);
  fallingBodies.push(body);
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

// Touch & Steuerung
function handleTouchMove(clientX) {
  const rect = container.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  player.targetX = Math.min(Math.max(relativeX, player.size / 2), width - player.size / 2);
}

container.addEventListener('touchstart', (e) => {
  initAudio();
  if (!isPlaying) return;
  handleTouchMove(e.touches[0].clientX);
}, { passive: true });

container.addEventListener('touchmove', (e) => {
  if (!isPlaying) return;
  handleTouchMove(e.touches[0].clientX);
}, { passive: true });

// Maus für Desktop
let isMouseDown = false;
container.addEventListener('mousedown', (e) => {
  initAudio();
  if (!isPlaying) return;
  isMouseDown = true;
  handleTouchMove(e.clientX);
});

window.addEventListener('mousemove', (e) => {
  if (!isPlaying || !isMouseDown) return;
  handleTouchMove(e.clientX);
});

window.addEventListener('mouseup', () => { isMouseDown = false; });

// Tastatur (Pfeile / A & D)
window.addEventListener('keydown', (e) => {
  initAudio();
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.movingLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.movingRight = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.movingLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.movingRight = false;
});

// Start & Game Over
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

  player.x = width / 2;
  player.targetX = width / 2;
  player.y = height - 90;
  Body.setPosition(playerBody, { x: player.x, y: player.y });

  lastSpawn = performance.now();

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';

  createStars();
}

function gameOver() {
  isPlaying = false;
  playSound('hit');
  spawnParticles(player.x, player.y, '#ff4757', 35);

  finalScoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('lieberose_highscore', highScore);
    highScoreEl.textContent = highScore;
    newRecordMsgEl.style.display = 'block';
  }

  gameOverScreen.classList.add('active');
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Haupt-GameLoop
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime), 100);
  lastTime = now;

  // 1. Hintergrund zeichnen (Regenbogen & Sterne)
  if (GAME_CONFIG.rainbowBackground) {
    const rainbowGrad = ctx.createLinearGradient(0, 0, 0, height);
    const hueShift = (now / 25) % 360;
    rainbowGrad.addColorStop(0.0, `hsl(${hueShift}, 85%, 22%)`);
    rainbowGrad.addColorStop(0.2, `hsl(${(hueShift + 60) % 360}, 85%, 25%)`);
    rainbowGrad.addColorStop(0.4, `hsl(${(hueShift + 120) % 360}, 85%, 24%)`);
    rainbowGrad.addColorStop(0.6, `hsl(${(hueShift + 180) % 360}, 85%, 22%)`);
    rainbowGrad.addColorStop(0.8, `hsl(${(hueShift + 240) % 360}, 85%, 20%)`);
    rainbowGrad.addColorStop(1.0, `hsl(${(hueShift + 300) % 360}, 85%, 18%)`);
    ctx.fillStyle = rainbowGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  // Sterne
  ctx.fillStyle = '#ffffff';
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > height) s.y = 0;
    ctx.globalAlpha = s.alpha;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1.0;

  if (isPlaying) {
    // 2. Matter.js Physik-Schritt
    Engine.update(engine, dt);

    // 3. Spieler bewegen & synchronisieren
    if (player.movingLeft) player.targetX -= player.speed * 4;
    if (player.movingRight) player.targetX += player.speed * 4;

    const diff = (player.targetX - player.x);
    player.x += diff * 0.22;
    player.x = Math.min(Math.max(player.x, player.size / 2), width - player.size / 2);
    player.tilt = (diff * 0.04); // Neigung beim Bewegen

    Body.setPosition(playerBody, { x: player.x, y: player.y });

    // 4. Neue Items spawnen
    if (now - lastSpawn > GAME_CONFIG.spawnRateMs) {
      spawnPhysicsItem();
      lastSpawn = now;
    }

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

  // 6. Spieler zeichnen
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.tilt);
  ctx.font = `${player.size}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_CONFIG.playerEmoji, 0, 0);
  ctx.restore();

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
