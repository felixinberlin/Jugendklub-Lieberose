/**
 * Jugendklub Lieberose – Das Spiel (Matter.js 2D Physik-Edition)
 * 
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 */
const GAME_CONFIG = {
  // Spieler (Korb / Sammler zwischen Kobold und Maispflanze)
  playerEmoji: '🧺',
  playerSize: 52,

  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldSize: 70,
  cornEmoji: '🌽',
  cornSize: 74,

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Gute Items (Popcorn, Maiskolben, Waldpilze, Kobold-Kristalle)
  goodItems: [
    { emoji: '🍿', points: 1, size: 36, density: 0.001 },
    { emoji: '🌽', points: 2, size: 40, density: 0.0015 },
    { emoji: '🍄', points: 3, size: 42, density: 0.0012 },
    { emoji: '💎', points: 5, size: 44, density: 0.002 }
  ],

  // Gefahren (Steine, Feuer, Bomben)
  badItems: [
    { emoji: '🪨', damage: 1, size: 42, density: 0.002 },
    { emoji: '🔥', damage: 1, size: 40, density: 0.001 },
    { emoji: '💣', damage: 1, size: 42, density: 0.002 }
  ],

  // 💣 Mais-Bombe (Doppeltippen / Doppelklick / Leertaste)
  bombEmoji: '💣',
  bombSize: 44,
  bombCooldownMs: 1000,   // Wartezeit zwischen zwei Bomben
  bombRadius: 110,        // Explosions-Größe: alle Gefahren darin verschwinden
  doubleTapMs: 320,       // Max. Zeit zwischen zwei Taps

  spawnRateMs: 850,
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
let playerBody;
let leftWall, rightWall;
let koboldBody, cornBody;
let koboldWiggle = 0;
let cornWiggle = 0;
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

  // Spieler-Physikkörper
  playerBody = Bodies.circle(player.x, player.y, player.size * 0.42, {
    isStatic: true,
    label: 'player',
    restitution: 0.9
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

  Composite.add(engine.world, [leftWall, rightWall, playerBody, koboldBody, cornBody]);

  // Kollisions-Events
  Events.on(engine, 'collisionStart', (event) => {
    if (!isPlaying) return;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      let targetItem = null;

      // 💣 Mais-Bombe: explodiert an Gefahren, sonst prallt sie ab
      const bomb = (bodyA.customData && bodyA.customData.isPlayerBomb) ? bodyA
                 : (bodyB.customData && bodyB.customData.isPlayerBomb) ? bodyB : null;
      if (bomb) {
        const other = bomb === bodyA ? bodyB : bodyA;
        if (other.customData && other.customData.isBad && !bomb.exploded) explodeBomb(bomb);
        continue;
      }

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
          spawnParticles(targetItem.position.x, targetItem.position.y, '#fef08a', 16);

          // Aus Matter.js entfernen
          Composite.remove(engine.world, targetItem);
          fallingBodies = fallingBodies.filter(b => b !== targetItem);
        }
      } else if (bodyA.label === 'kobold' || bodyB.label === 'kobold') {
        // Kobold getroffen!
        playSound('bounce');
        koboldWiggle = 1.0;
        spawnParticles(46, height * 0.55, '#a7f3d0', 6);
      } else if (bodyA.label === 'corn' || bodyB.label === 'corn') {
        // Maispflanze getroffen!
        playSound('bounce');
        cornWiggle = 1.0;
        spawnParticles(width - 46, height * 0.55, '#fef08a', 6);
      } else if (bodyA.customData && bodyB.customData) {
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

// 💣 Mais wirft eine Bombe
let lastBombTime = 0;

function throwBomb() {
  if (!isPlaying) return;
  const now = performance.now();
  if (now - lastBombTime < GAME_CONFIG.bombCooldownMs) return;
  lastBombTime = now;

  const radius = GAME_CONFIG.bombSize * 0.42;
  const body = Bodies.circle(width - 46 - 34 - radius - 4, height * 0.55 - 20, radius, {
    restitution: 0.5,
    frictionAir: GAME_CONFIG.frictionAir,
    density: 0.002,
    label: 'playerBomb',
    customData: {
      emoji: GAME_CONFIG.bombEmoji,
      size: GAME_CONFIG.bombSize,
      points: 0,
      isBad: false,
      isPlayerBomb: true,
      born: now
    }
  });
  Body.setVelocity(body, { x: -6, y: -8 });
  Body.setAngularVelocity(body, -0.25);

  Composite.add(engine.world, body);
  fallingBodies.push(body);

  cornWiggle = 1.0;
  playSound('throw');
}

function explodeBomb(bomb) {
  bomb.exploded = true;
  const { x, y } = bomb.position;
  playSound('boom');
  spawnParticles(x, y, '#ff9f1c', 30);
  spawnParticles(x, y, '#ffde59', 16);

  for (const b of fallingBodies) {
    if (b === bomb) continue;
    if (b.customData.isBad && Math.hypot(b.position.x - x, b.position.y - y) < GAME_CONFIG.bombRadius) {
      b.exploded = true;
      spawnParticles(b.position.x, b.position.y, '#ff6b6b', 10);
    }
  }
  // Entfernen (nach der Schleife, damit das Array stabil bleibt)
  fallingBodies = fallingBodies.filter(b => {
    if (b.exploded) { Composite.remove(engine.world, b); return false; }
    return true;
  });
}

// Doppeltippen / Doppelklick erkennen (dblclick ist auf iOS unzuverlässig)
let lastTapTime = 0;
let lastTouchTime = 0;

function registerTap() {
  const now = performance.now();
  if (now - lastTapTime < GAME_CONFIG.doubleTapMs) {
    lastTapTime = 0;
    throwBomb();
  } else {
    lastTapTime = now;
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
  lastTouchTime = performance.now();
  registerTap();
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
  // Handys schicken nach dem Touch noch ein Maus-Event – das nicht doppelt zählen
  if (performance.now() - lastTouchTime > 800) registerTap();
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
  if (e.key === ' ') { e.preventDefault(); throwBomb(); }
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
  lastBombTime = 0;
  lastTapTime = 0;

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
