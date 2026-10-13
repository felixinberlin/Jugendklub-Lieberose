/**
 * 💀 knockout.js – Wer zu oft getroffen wird, ist raus!
 *
 * Jede Figur hält `maxHits` Treffer aus (config.js). Danach explodiert sie
 * und verschwindet. Wer auf sie geworfen hat, wirft ab jetzt auf die nächste
 * Figur im Kreis. Bleibt nur noch eine Figur übrig, hat sie gewonnen 🏆.
 */

// Ist die Figur noch im Spiel?
function isAlive(name) {
  return actors[name] && actors[name].alive !== false;
}

// Auf wen wirft diese Figur? Ihr Ziel – oder, wenn das raus ist,
// das nächste lebende Ziel im Kreis.
function targetOf(name) {
  let next = actors[name].target;
  for (let i = 0; i < Object.keys(actors).length; i++) {
    if (next === name) return null; // Einmal rum: niemand mehr da
    if (isAlive(next)) return next;
    next = actors[next].target;
  }
  return null;
}

// Wird in physics.js nach jedem Treffer aufgerufen.
function checkKnockout(name) {
  const actor = actors[name];
  if (!isAlive(name) || actor.hitsTaken < GAME_CONFIG.maxHits) return;

  // 💥 Raus!
  actor.alive = false;
  const { x, y } = actor.body.position;
  spawnParticles(x, y, '#ff5e7e', 40);
  spawnParticles(x, y, '#ffde59', 30);
  spawnParticles(x, y, '#ffffff', 20);
  playSound('hit');
  Composite.remove(engine.world, actor.body);
  document.getElementById(`${name}Btn`).style.display = 'none';

  // 🏆 Nur noch eine Figur übrig? Dann hat sie gewonnen!
  const alive = Object.keys(actors).filter(isAlive);
  if (alive.length <= 1) endGame(alive[0]);
}

// Spiel vorbei: Gewinner anzeigen.
function endGame(winner) {
  isPlaying = false;
  finalScoreEl.textContent = score;
  winnerMsgEl.textContent = winner
    ? `🏆 ${actors[winner].name} gewinnt! 🏆`
    : 'Alle sind raus! 🤯';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('lieberose_highscore', String(highScore));
    highScoreEl.textContent = highScore;
    newRecordMsgEl.style.display = 'block';
  }
  setTimeout(() => gameOverScreen.classList.add('active'), 1200); // Erst die Explosion sehen
}

// Alle Figuren wieder ins Spiel holen (bei Start / Neustart).
function reviveActors() {
  for (const name in actors) {
    const actor = actors[name];
    actor.alive = true;
    actor.sixSevenUntil = 0;
    if (!Composite.get(engine.world, actor.body.id, 'body')) {
      Composite.add(engine.world, actor.body);
    }
    document.getElementById(`${name}Btn`).style.display = '';
  }
}

// ❤️ Lebensleiste unter einer Figur malen (wird in drawActors aufgerufen).
function drawLifeBar(actor) {
  const life = Math.max(0, 1 - actor.hitsTaken / GAME_CONFIG.maxHits);
  const w = 44;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(-w / 2 - 1, 63, w + 2, 6);
  // Grün → Gelb → Rot, je weniger Leben übrig ist
  ctx.fillStyle = life > 0.5 ? '#4ade80' : life > 0.2 ? '#facc15' : '#ef4444';
  ctx.fillRect(-w / 2, 64, w * life, 4);
}
