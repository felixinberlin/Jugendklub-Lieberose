/**
 * Jugendklub Lieberose – Das Spiel
 * 
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops die Ideen der Kinder eintragen!
 */
const GAME_CONFIG = {
  // Was ist der Spieler? (Emoji oder Form)
  playerEmoji: '🚀',
  playerSize: 46,

  // Gute Items, die Punkte geben
  goodItems: [
    { emoji: '⭐', points: 1, speed: 3 },
    { emoji: '🍕', points: 2, speed: 3.5 },
    { emoji: '🥤', points: 2, speed: 3.5 },
    { emoji: '💎', points: 5, speed: 4.5 }
  ],

  // Gefahren, denen man ausweichen muss
  badItems: [
    { emoji: '💣', damage: 1, speed: 3.5 },
    { emoji: '👾', damage: 1, speed: 4 },
    { emoji: '⚡', damage: 1, speed: 4.5 }
  ],

  // Spieltempo & Hintergrund
  baseSpeed: 1.0,
  speedIncrement: 0.05, // Wird mit jedem Punkt ein bisschen schneller
  spawnRateMs: 800,
  backgroundStars: 40,
  rainbowBackground: true // 🌈 Regenbogen-Hintergrund!
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const newRecordMsgEl = document.getElementById('newRecordMsg');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const soundToggle = document.getElementById('soundToggle');

// Web Audio API Synthesizer (Zero asset loading friction!)
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
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
  } catch (e) {
    // Silently handle any browser audio block
  }
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
  }
}

// Sound toggle
soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
});

// Canvas Auto-Resizing (Retina/High-DPI sharp rendering)
let width = 360;
let height = 640;

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  width = rect.width;
  height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  if (player) {
    player.y = height - 90;
    player.x = Math.min(Math.max(player.x, player.size / 2), width - player.size / 2);
  }
}

window.addEventListener('resize', resizeCanvas);

// Game State
let isPlaying = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('lieberose_highscore') || '0', 10);
highScoreEl.textContent = highScore;

// Player Object
const player = {
  x: 180,
  y: 550,
  size: GAME_CONFIG.playerSize,
  speed: 7,
  targetX: 180,
  movingLeft: false,
  movingRight: false
};

// Falling Items & Particles & Stars
let fallingItems = [];
let particles = [];
let stars = [];
let lastSpawn = 0;

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

function spawnItem() {
  const isBad = Math.random() < 0.38; // 38% Chance Gefahren
  const pool = isBad ? GAME_CONFIG.badItems : GAME_CONFIG.goodItems;
  const template = pool[Math.floor(Math.random() * pool.length)];

  const speedFactor = 1 + (score * GAME_CONFIG.speedIncrement);
  fallingItems.push({
    x: Math.random() * (width - 60) + 30,
    y: -40,
    size: 38,
    speed: template.speed * speedFactor,
    emoji: template.emoji,
    isBad: isBad,
    points: template.points || 0,
    rot: Math.random() * 0.4 - 0.2
  });
}

function spawnParticles(x, y, color = '#ffde59', count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
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

// Touch & Controls Input Handling
let touchStartX = null;

function handleTouchMove(clientX) {
  const rect = container.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  player.targetX = Math.min(Math.max(relativeX, player.size / 2), width - player.size / 2);
}

// Touch listeners on container
container.addEventListener('touchstart', (e) => {
  initAudio();
  if (!isPlaying) return;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  handleTouchMove(touch.clientX);
}, { passive: true });

container.addEventListener('touchmove', (e) => {
  if (!isPlaying) return;
  handleTouchMove(e.touches[0].clientX);
}, { passive: true });

container.addEventListener('touchend', () => {
  touchStartX = null;
});

// Mouse support for desktop testing
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

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// Keyboard Controls (Arrow keys / A & D)
window.addEventListener('keydown', (e) => {
  initAudio();
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.movingLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.movingRight = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.movingLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.movingRight = false;
});

// Start & Restart Game
function startGame() {
  initAudio();
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;
  fallingItems = [];
  particles = [];
  player.x = width / 2;
  player.targetX = width / 2;
  player.y = height - 90;
  lastSpawn = performance.now();

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';

  createStars();
}

function gameOver() {
  isPlaying = false;
  playSound('hit');
  spawnParticles(player.x, player.y, '#ff4757', 30);

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

// Main Game Loop
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // 1. Draw Background (Regenbogen!)
  if (GAME_CONFIG.rainbowBackground) {
    const rainbowGrad = ctx.createLinearGradient(0, 0, 0, height);
    const hueShift = (now / 25) % 360; // Fließende Regenbogenfarben
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

  // Draw Starfield on top
  ctx.fillStyle = '#ffffff';
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > height) s.y = 0;
    ctx.globalAlpha = s.alpha;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1.0;

  if (isPlaying) {
    // 2. Update Player
    if (player.movingLeft) player.targetX -= player.speed * 60 * dt;
    if (player.movingRight) player.targetX += player.speed * 60 * dt;
    
    // Smooth interpolation towards targetX
    player.x += (player.targetX - player.x) * 0.22;
    player.x = Math.min(Math.max(player.x, player.size / 2), width - player.size / 2);

    // 3. Spawn Items
    if (now - lastSpawn > GAME_CONFIG.spawnRateMs) {
      spawnItem();
      lastSpawn = now;
    }

    // 4. Update & Draw Falling Items
    for (let i = fallingItems.length - 1; i >= 0; i--) {
      const item = fallingItems[i];
      item.y += item.speed * 60 * dt;

      // Draw Item
      ctx.font = `${item.size}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, item.x, item.y);

      // Collision Detection with Player
      const dist = Math.hypot(item.x - player.x, item.y - player.y);
      const hitRadius = (item.size + player.size) * 0.38;

      if (dist < hitRadius) {
        if (item.isBad) {
          gameOver();
          break;
        } else {
          // Point collected!
          score += item.points;
          scoreEl.textContent = score;
          playSound(item.points > 2 ? 'gem' : 'point');
          spawnParticles(item.x, item.y, item.points > 2 ? '#67e8f9' : '#ffde59', 14);
          fallingItems.splice(i, 1);
          continue;
        }
      }

      // Remove items off-screen
      if (item.y > height + 50) {
        fallingItems.splice(i, 1);
      }
    }
  }

  // 5. Draw Player
  ctx.font = `${player.size}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_CONFIG.playerEmoji, player.x, player.y);

  // 6. Update & Draw Particles
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

// Initial setup
resizeCanvas();
createStars();
requestAnimationFrame(gameLoop);
