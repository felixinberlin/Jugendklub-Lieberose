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
 *   actors.js    🧌🌽🐱🐭👺⚽ Kobold, Mais, Katze, Maus, Goblin, Musiala
 *   bombs.js     💣 Bomben
 *   physics.js   🧪 Physik-Welt und Zusammenstöße
 */

// Start und Neustart
function startGame() {
  initAudio();
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;

  removeClones(); // Alte Gegner-Kopien weg (teams.js)
  resetSpecials(); // ⚡ Mini-Kobolde weg, Wirbel aus (specials.js)
  clearAllBodies();
  particles = [];
  resetActors();
  setupTeams();   // ⚔️ Team-Modus aufstellen (teams.js)
  startLevel();   // 🏅 Level-Schild & Anzeige (levels.js)
  setupPlayers(); // Wer spielt wen? (cpu.js)
  setupSpecialBar(); // ⚡ Knöpfe unten links (specials.js)

  startScreen.classList.remove('active');
  teamScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';
}

// NOCHMAL / WEITER: startet das Level, das finishLevel() ausgesucht hat
restartBtn.addEventListener('click', () => {
  currentLevel = nextLevel;
  startGame();
});

// Haupt-GameLoop
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime), 100);
  lastTime = now;

  // 1. Hintergrund, Regen & Bäume und Figuren malen
  drawForest(now);
  drawWeather(now);
  drawActors(now);
  drawSpecials(now); // 🧌🌪️ Mini-Kobolde & Wirbelwolken (specials.js)

  if (isPlaying) {
    // 2. Matter.js Physik-Schritt
    Engine.update(engine, dt);

    // 3. Fußballer dribbeln lassen, Bomben malen & aufräumen
    updateFootballers();
    updateCpu(now); // 🤖 Computer-Figuren werfen (cpu.js)
    updateSpecials(now); // ⚡ Riesenball lenken, Minis, Katzensprung (specials.js)
    updateBombs(now);
  }

  // 4. Partikel malen
  drawParticles();
  drawLevelBanner(now); // 📣 „LEVEL 2“ (levels.js)

  requestAnimationFrame(gameLoop);
}

// Initialisierung
initPhysics();
resizeCanvas();
requestAnimationFrame(gameLoop);
