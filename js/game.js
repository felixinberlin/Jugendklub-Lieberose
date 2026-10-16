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
// keepCharge = true: Deine Spezialkraft-Ladung bleibt (beim Weiter ins nächste Level)
function startGame(keepCharge = false) {
  initAudio();
  applyModeLives(); // 🏆 100 Leben im Pokal-Modus, sonst die gewählten Leben (trophies.js)
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;

  removeClones(); // Alte Gegner-Kopien weg (teams.js)
  resetSpecials(keepCharge); // ⚡ Mini-Kobolde weg, Wirbel aus (specials.js)
  clearAllBodies();
  particles = [];
  resetActors();
  setupTeams();   // ⚔️ Team-Modus aufstellen (teams.js)
  startLevel();   // 🏅 Level-Schild & Anzeige (levels.js)
  setupPlayers(); // Wer spielt wen? (cpu.js)
  setupSpecialBar(); // ⚡ Knöpfe aktualisieren (specials.js)
  tryLockLandscape(); // 🔄 Querformat auf dem Handy (controls.js)
  updateControlHud(); // 🕹️ Joystick + Schuss- & Fähigkeits-Knopf einblenden (controls.js)

  startScreen.classList.remove('active');
  modeScreen.classList.remove('active');
  teamScreen.classList.remove('active');
  hideLeaderboard();
  hideCredits();
  gameOverScreen.classList.remove('active');
  newRecordMsgEl.style.display = 'none';
}

// NOCHMAL / WEITER: startet das Level, das finishLevel() ausgesucht hat
restartBtn.addEventListener('click', () => {
  const nextOne = nextLevel > currentLevel; // „WEITER“ ins nächste Level?
  if (teamMode) {
    // Nach Level 8 komplett neu starten → wieder bei Level 1 mit 1. Figur anfangen
    if (nextLevel === 0 && currentLevel > 0) {
      gameOverScreen.classList.remove('active');
      startNewTeamRun();
      return;
    }
    // Neues Level im Team-Modus & noch nicht alle Figuren im Team → nächste Figur wählen!
    if (nextOne && chosenTeam.length < baseActorNames().length) {
      currentLevel = nextLevel;
      gameOverScreen.classList.remove('active');
      openTeamPickForLevel(true);
      return;
    }
  }
  currentLevel = nextLevel;
  startGame(nextOne); // ⚡ Beim Weiter bleiben deine gesammelten Treffer für die Spezialkraft
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

    // 3. Eigene Steuerung (WASD / Joystick), Fußballer, Computer & Bomben
    updatePlayerControls(); // 🕹️ WASD & Joystick-Bewegung (controls.js)
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
