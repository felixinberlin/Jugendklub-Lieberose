/**
 * 🏅 levels.js – Team-Level (Solo-Modus hat nur 1 direktes Match ohne Level-Anzeige!)
 *
 * Im Solo-Modus (Rangliste & Normal) gibt es nur 1 Runde und gar keine Level-Anzeige.
 * Im Team-Modus kämpfst du dich durch die 8 Team-Level!
 */

let currentLevel = 0; // 0 = Level 1, 1 = Level 2, … (für Team-Modus)
let nextLevel = 0;    // Welches Level startet „WEITER“ / „NOCHMAL“?
let levelStartTime = 0;

// Die Einstellungen des aktuellen Levels
function levelList() {
  return teamMode ? GAME_CONFIG.teamLevels : GAME_CONFIG.levels;
}
function level() {
  return levelList()[currentLevel] || levelList()[0];
}

// Wird bei jedem Spielstart aufgerufen.
// Im Solo-Modus werden Level gar nicht erst angezeigt!
function startLevel() {
  levelStartTime = performance.now();
  if (teamMode) {
    levelEl.textContent = `${currentLevel + 1}/${levelList().length}`;
    levelHudEl.hidden = false;
  } else {
    levelHudEl.hidden = true; // 🚫 Im Solo-Modus keine Level-Anzeige!
  }
}

// Runde vorbei: Text und Knopf auf dem Game-Over-Bildschirm einstellen.
function finishLevel(won) {
  awardLevelTrophies(won); // 🏆 Pokale vergeben, falls im Pokal-Modus gespielt wurde (trophies.js)

  // 🎮 SOLO-MODUS: Nur 1 Match, gar keine Level!
  if (!teamMode) {
    if (won) {
      winnerMsgEl.textContent = '🏆 DU GEWINNST! 🏆';
    } else {
      winnerMsgEl.textContent = '😵 Du bist raus!';
    }
    restartBtn.textContent = 'NOCHMAL SPIELEN 🔄';
    nextLevel = 0;
    return;
  }

  // ⚔️ TEAM-MODUS: 8 Level
  const nr = currentLevel + 1;
  const last = currentLevel === levelList().length - 1;
  if (!won) {
    winnerMsgEl.textContent = `😵 Dein Team ist raus! (Level ${nr})`;
    restartBtn.textContent = `NOCHMAL LEVEL ${nr} 🔄`;
    nextLevel = currentLevel;
  } else if (!last) {
    winnerMsgEl.textContent = `🎉 LEVEL ${nr} GESCHAFFT! 🎉`;
    if (teamMode && chosenTeam.length < baseActorNames().length) {
      restartBtn.textContent = `FIGUR FÜR LEVEL ${nr + 1} WÄHLEN ➡️`;
    } else {
      restartBtn.textContent = `WEITER ZU LEVEL ${nr + 1} ➡️`;
    }
    nextLevel = currentLevel + 1;
  } else {
    winnerMsgEl.textContent = `🏆 ALLE ${nr} LEVEL GESCHAFFT! 🏆`;
    restartBtn.textContent = 'NOCHMAL SPIELEN 🔄';
    nextLevel = 0;
    // 🎬 Alles geschafft = Abspann wie im Kino (credits.js)
    setTimeout(() => { if (!isPlaying) showCredits(); }, 3500);
  }
}

// 📣 Großes „LEVEL“-Schild am Anfang jedes Team-Levels (im Solo-Modus gar nicht anzeigen!)
function drawLevelBanner(now) {
  if (!teamMode || playerTeam === null || !isPlaying) return;
  const t = (now - levelStartTime) / 2000; // 0 → 1
  if (t > 1) return;
  const lv = level();
  ctx.save();
  ctx.globalAlpha = t < 0.8 ? 1 : (1 - t) / 0.2;
  ctx.translate(width / 2, height * 0.45);
  ctx.scale(1 + (1 - Math.min(1, t * 4)) * 0.6, 1 + (1 - Math.min(1, t * 4)) * 0.6);
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
  if (teamMode) {
    ctx.font = '800 18px -apple-system, sans-serif';
    ctx.fillStyle = TEAM_COLORS.enemy;
    const sub = `${chosenTeam.length} gegen ${lv.enemies} Gegner!`;
    ctx.strokeText(sub, 0, 76);
    ctx.fillText(sub, 0, 76);
  }
  ctx.restore();
}
