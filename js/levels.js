/**
 * 🏅 levels.js – Fünf Level, jedes schwerer
 *
 * Nur wenn du eine eigene Figur spielst (nicht bei „Alle zusammen“).
 * Gewinnst du ein Level, geht's ins nächste. Verlierst du, nochmal dasselbe.
 * Wie schwer jedes Level ist, steht in config.js unter `levels`.
 */

let currentLevel = 0; // 0 = Level 1, 1 = Level 2, … (Anzahl = GAME_CONFIG.levels)
let nextLevel = 0;    // Welches Level startet „WEITER“ / „NOCHMAL“?
let levelStartTime = 0;

// Die Einstellungen des aktuellen Levels
function levelList() {
  return teamMode ? GAME_CONFIG.teamLevels : GAME_CONFIG.levels; // ⚔️ Team-Modus hat eigene Level
}
function level() {
  return levelList()[currentLevel];
}

// Wird bei jedem Spielstart aufgerufen.
function startLevel() {
  levelStartTime = performance.now();
  levelEl.textContent = `${currentLevel + 1}/${levelList().length}`;
  levelHudEl.hidden = playerTeam === null;
}

// Level vorbei: Text und Knopf auf dem Game-Over-Bildschirm einstellen.
function finishLevel(won) {
  const nr = currentLevel + 1;
  const last = currentLevel === levelList().length - 1;
  if (!won) {
    winnerMsgEl.textContent = teamMode ? `😵 Dein Team ist raus! (Level ${nr})` : `😵 Du bist raus! (Level ${nr})`;
    restartBtn.textContent = `NOCHMAL LEVEL ${nr} 🔄`;
    nextLevel = currentLevel;
  } else if (!last) {
    winnerMsgEl.textContent = `🎉 LEVEL ${nr} GESCHAFFT! 🎉`;
    restartBtn.textContent = `WEITER ZU LEVEL ${nr + 1} ➡️`;
    nextLevel = currentLevel + 1;
  } else {
    winnerMsgEl.textContent = `🏆 ALLE ${nr} LEVEL GESCHAFFT! 🏆`;
    restartBtn.textContent = 'NOCHMAL SPIELEN 🔄';
    nextLevel = 0;
  }
}

// 📣 Großes „LEVEL 2“-Schild am Anfang jedes Levels (2 Sekunden)
function drawLevelBanner(now) {
  if (playerTeam === null || !isPlaying) return;
  const t = (now - levelStartTime) / 2000; // 0 → 1
  if (t > 1) return;
  const lv = level();
  ctx.save();
  ctx.globalAlpha = t < 0.8 ? 1 : (1 - t) / 0.2; // Am Ende ausblenden
  ctx.translate(width / 2, height * 0.45);
  ctx.scale(1 + (1 - Math.min(1, t * 4)) * 0.6, 1 + (1 - Math.min(1, t * 4)) * 0.6); // Reinzoomen
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '900 52px -apple-system, sans-serif';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#111827';
  ctx.fillStyle = '#ffde59';
  ctx.strokeText(`LEVEL ${currentLevel + 1}`, 0, 0);
  ctx.fillText(`LEVEL ${currentLevel + 1}`, 0, 0);
  ctx.font = '800 22px -apple-system, sans-serif';
  ctx.lineWidth = 6;
  ctx.fillStyle = '#ffffff';
  ctx.strokeText(lv.title, 0, 44);
  ctx.fillText(lv.title, 0, 44);
  if (teamMode) { // ⚔️ Wie viele Gegner?
    ctx.font = '800 18px -apple-system, sans-serif';
    ctx.fillStyle = TEAM_COLORS.enemy;
    ctx.strokeText(`${lv.enemies} Gegner!`, 0, 76);
    ctx.fillText(`${lv.enemies} Gegner!`, 0, 76);
  }
  ctx.restore();
}
