/**
 * 🎮 game.js – Jugendklub Lieberose – Das Spiel (Matter.js 2D Physik-Edition)
 *
 * Das Herz des Spiels: Start, Neustart und die Spielschleife,
 * die ungefähr 60-mal pro Sekunde alles berechnet und neu malt.
 *
 * Die anderen Dateien:
 *   config.js    ⚙️ Stellschrauben (Emojis, Schwerkraft, …)
 *   state.js     🧠 gemeinsame Variablen (Canvas, Punkte, …)
 *   audio.js     🔊 Töne
 *   forest.js    🌲 Hintergrund
 *   particles.js ✨ Funken
 *   weather.js   🌧️ Regen und wachsende Bäume
 *   actors.js    🧌🌽🐱🐭 Kobold, Mais, Katze und Maus
 *   bombs.js     💣 Bomben
 *   physics.js   🧪 Physik-Welt und Zusammenstöße
 */

// Start und Neustart
function startGame() {
  initAudio();
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;

  clearAllBodies();
  particles = [];
  resetActors();

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

  // 1. Hintergrund, Regen & Bäume und Figuren malen
  drawForest(now);
  drawWeather(now);
  drawActors(now);

  if (isPlaying) {
    // 2. Matter.js Physik-Schritt
    Engine.update(engine, dt);

    // 3. Bomben malen & aufräumen
    updateBombs(now);
  }

  // 4. Partikel malen
  drawParticles();

  requestAnimationFrame(gameLoop);
}

// Initialisierung
initPhysics();
resizeCanvas();
requestAnimationFrame(gameLoop);
