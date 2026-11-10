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
// das nächste lebende Ziel im Kreis (versteckte Figuren im Mauseloch möglichst überspringen).
function targetOf(name) {
  const forced = actors[name] && actors[name].cpuAim;
  if (forced && isAlive(forced) && forced !== name) return forced;
  if (teamMode) return nearestEnemy(name); // ⚔️ teams.js
  let next = actors[name].target;
  let fallback = null;
  const maxSteps = Object.keys(actors).length;
  for (let i = 0; i < maxSteps; i++) {
    if (next === name) break; // Einmal rum
    if (isAlive(next)) {
      if (!isHidden(next)) return next;
      if (!fallback) fallback = next;
    }
    next = actors[next].target;
  }
  return fallback;
}

// Wird in physics.js nach jedem Treffer aufgerufen.
function checkKnockout(name) {
  const actor = actors[name];
  if (!isAlive(name)) return;
  const maxHp = actor.maxHp || (GAME_CONFIG.maxHits * 5);
  const hp = typeof actor.hp === 'number' ? actor.hp : (maxHp - actor.hitsTaken);
  if (hp > 0 && actor.hitsTaken < maxHp) return;

  // 💥 Raus!
  actor.alive = false;
  const { x, y } = actor.body.position;
  spawnParticles(x, y, '#ff5e7e', 40);
  spawnParticles(x, y, '#ffde59', 30);
  spawnParticles(x, y, '#ffffff', 20);
  playSound('hit');
  Composite.remove(engine.world, actor.body);
  const btn = actorBtn(name);
  if (btn) btn.style.display = 'none';
  updateSpecialBar(); // ⚡ Knopf der Figur verschwindet (specials.js)

  // ⚔️ Team-Modus: Ist deine gerade gesteuerte Figur raus, übernimmst du sofort die nächste lebende Team-Figur!
  if (teamMode) {
    if (name === playerActor) {
      const nextMate = chosenTeam.find(isAlive);
      if (nextMate && typeof switchActiveTeamActor === 'function') {
        switchActiveTeamActor(nextMate);
      }
    }
    const result = teamResult();
    if (result !== null) endGame(result ? chosenTeam.find(isAlive) : null);
    return;
  }

  const alive = Object.keys(actors).filter(isAlive);

  // 😵 Deine eigene Figur ist raus? Dann ist das Spiel für dich vorbei –
  // aber die Bots kämpfen im Hintergrund weiter, bis nur noch einer steht! 👀
  if (name === playerActor) {
    endGame(null);
    if (alive.length > 1) spectating = true;
    return;
  }

  // 🏆 Nur noch eine Figur übrig? Dann hat sie gewonnen!
  if (alive.length <= 1) {
    if (spectating) {
      // Du warst schon raus: nur noch verkünden, welcher Bot am Ende gewonnen hat
      spectating = false;
      if (alive[0]) winnerMsgEl.textContent = `😵 Du bist raus! · 🏆 ${actors[alive[0]].name} gewinnt am Ende!`;
      return;
    }
    endGame(alive[0]);
  }
}

// Spiel vorbei: Gewinner anzeigen.
function endGame(winner) {
  if (!isPlaying) return; // Eine Runde kann nur einmal enden und belohnt werden.
  isPlaying = false;
  if (typeof updateControlHud === 'function') updateControlHud();
  finalScoreEl.textContent = score;
  if (teamMode) {
    finishLevel(teamResult() === true); // 🏅 levels.js
  } else if (playerActor !== null) {
    finishLevel(isAlive(playerActor) && winner === playerActor); // 🏅 levels.js
  } else {
    winnerMsgEl.textContent = winner ? `🏆 ${actors[winner].name} gewinnt! 🏆` : 'Alle sind raus! 🤯';
    restartBtn.textContent = 'NOCHMAL SPIELEN 🔄';
    nextLevel = 0;
  }
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('lieberose_highscore', String(highScore));
    highScoreEl.textContent = highScore;
    newRecordMsgEl.style.display = 'block';
  }
  // 🏆 Treffer-Rekord & Pokale im öffentlichen Highscore speichern
  if (typeof recordPublicHighScore === 'function') {
    recordPublicHighScore(currentPlayerName, score, trophiesData ? trophiesData.total : 0, playerActor, teamMode);
  }
  setTimeout(() => gameOverScreen.classList.add('active'), 1200); // Erst die Explosion sehen
}

// Alle Figuren wieder ins Spiel holen (bei Start / Neustart).
function reviveActors() {
  for (const name in actors) {
    const actor = actors[name];
    actor.alive = true;
    actor.sixSevenUntil = 0;
    if (typeof actor.maxHp === 'number') {
      actor.hp = actor.maxHp;
      actor.hitsTaken = 0;
    }
    if (!Composite.get(engine.world, actor.body.id, 'body')) {
      Composite.add(engine.world, actor.body);
    }
    const btn = actorBtn(name);
    if (btn) btn.style.display = '';
  }
}

// ❤️ Lebensleiste unter einer Figur malen (mit genauen Lebenspunkten z. B. 84 ❤️)
function drawLifeBar(actor) {
  const maxHp = actor.maxHp || 100;
  const hp = Math.max(0, typeof actor.hp === 'number' ? actor.hp : (maxHp - actor.hitsTaken));
  const life = Math.max(0, Math.min(1, hp / maxHp));
  const w = 48;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(-w / 2 - 1, 63, w + 2, 7);
  // Grün → Gelb → Rot, je weniger Leben übrig ist
  ctx.fillStyle = life > 0.5 ? '#4ade80' : life > 0.2 ? '#facc15' : '#ef4444';
  ctx.fillRect(-w / 2, 64, w * life, 5);
  // 💖 Zahl anzeigen: z. B. 84 ❤️
  drawLabel(`${Math.ceil(hp)} ❤️`, 0, 77, { size: 9, weight: '900', fill: '#f8fafc', stroke: '#0f172a', lineWidth: 2 });
}
