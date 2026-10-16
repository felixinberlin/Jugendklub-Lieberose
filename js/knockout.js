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
  for (let i = 0; i < Object.keys(actors).length; i++) {
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
  if (!isAlive(name) || actor.hitsTaken < GAME_CONFIG.maxHits) return;

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

  // ⚔️ Team-Modus: Ist ein ganzes Team raus?
  if (teamMode) {
    const result = teamResult();
    if (result !== null) endGame(result ? chosenTeam.find(isAlive) : null);
    return;
  }

  // 😵 Deine eigene Figur ist raus? Dann ist das Spiel für dich vorbei.
  if (name === playerActor) { endGame(null); return; }

  // 🏆 Nur noch eine Figur übrig? Dann hat sie gewonnen!
  const alive = Object.keys(actors).filter(isAlive);
  if (alive.length <= 1) endGame(alive[0]);
}

// Spiel vorbei: Gewinner anzeigen.
function endGame(winner) {
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
    const btn = actorBtn(name);
    if (btn) btn.style.display = '';
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

// 💀 Auf dem Startbildschirm auswählen, wie viele Treffer eine Figur aushält
const hitsChoice = document.getElementById('hitsChoice');
for (const hits of GAME_CONFIG.hitChoices) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hits-btn';
  btn.textContent = hits;
  btn.classList.toggle('selected', hits === GAME_CONFIG.maxHits);
  btn.addEventListener('click', () => {
    GAME_CONFIG.maxHits = hits;
    for (const b of hitsChoice.children) b.classList.toggle('selected', b === btn);
    document.getElementById('hitsText').textContent = hits;
  });
  hitsChoice.appendChild(btn);
}
