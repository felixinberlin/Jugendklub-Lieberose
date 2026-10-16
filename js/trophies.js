/**
 * 🏆 trophies.js – Pokal-Modus (immer 100 Leben) & Rangliste
 *
 * Beim Klick auf Solo oder Team-Modus wählst du:
 *   🏆 MIT POKALEN → Immer 100 Leben, du sammelst Pokale für die Rangliste!
 *   🎮 NORMAL      → Du stellst selbst ein, wie viele Leben man hat (5, 10, 20, 50).
 */

let trophyMode = false; // true = Pokal-Modus (immer 100 Leben), false = Normal
let normalLives = GAME_CONFIG.maxHits; // Eingestellte Leben für den normalen Modus
let pendingMode = null; // Merkt sich, ob gerade Solo oder Team-Modus angeklickt wurde

const modeScreen = document.getElementById('modeScreen');
const modeScreenTitle = document.getElementById('modeScreenTitle');
const modeScreenSub = document.getElementById('modeScreenSub');
const playTrophyBtn = document.getElementById('playTrophyBtn');
const playNormalBtn = document.getElementById('playNormalBtn');
const modeBackBtn = document.getElementById('modeBackBtn');
const modeHitsChoice = document.getElementById('modeHitsChoice');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardList = document.getElementById('leaderboardList');
const myTrophyBanner = document.getElementById('myTrophyBanner');
const leaderboardStartBtn = document.getElementById('leaderboardStartBtn');
const leaderboardOverBtn = document.getElementById('leaderboardOverBtn');
const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
const trophiesEl = document.getElementById('trophies');
const trophyHudEl = document.getElementById('trophyHud');
const trophyRewardMsgEl = document.getElementById('trophyRewardMsg');

// 🏆 Pokale aus dem Browser-Speicher laden (keine persönlichen Daten, nur Zahlen!)
function loadTrophies() {
  try {
    const raw = JSON.parse(localStorage.getItem('lieberose_trophies') || '{}');
    return {
      total: Number(raw.total) || 0,
      solo: Number(raw.solo) || 0,
      team: Number(raw.team) || 0,
      actors: (raw.actors && typeof raw.actors === 'object') ? raw.actors : {}
    };
  } catch (e) {
    return { total: 0, solo: 0, team: 0, actors: {} };
  }
}

let trophiesData = loadTrophies();

function saveTrophies() {
  try {
    localStorage.setItem('lieberose_trophies', JSON.stringify(trophiesData));
  } catch (e) {}
  updateTrophyHud();
}

function updateTrophyHud() {
  trophiesEl.textContent = trophiesData.total;
  trophyHudEl.classList.toggle('active-trophy', trophyMode);
  leaderboardStartBtn.textContent = `🏆 RANGLISTE (${trophiesData.total} 🏆)`;
}

// 💀 Leben für den normalen Modus einstellen und auf beiden Bildschirmen synchron halten
function setNormalLives(hits) {
  normalLives = hits;
  if (!trophyMode) GAME_CONFIG.maxHits = hits;
  document.getElementById('hitsText').textContent = hits;
  for (const b of document.querySelectorAll('#hitsChoice .hits-btn, #modeHitsChoice .hits-btn')) {
    b.classList.toggle('selected', Number(b.dataset.hits || b.textContent) === hits);
  }
  playNormalBtn.textContent = `🎮 NORMAL (${normalLives} ❤️)`;
}

// Stellt sicher, dass im Pokal-Modus IMMER 100 Leben gelten und im Normal-Modus deine Auswahl
function applyModeLives() {
  GAME_CONFIG.maxHits = trophyMode ? GAME_CONFIG.trophyLives : normalLives;
}

// Baut die Lebens-Knöpfe im Normal-Bereich des Modus-Menüs
for (const hits of GAME_CONFIG.hitChoices) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hits-btn';
  btn.dataset.hits = hits;
  btn.textContent = hits;
  btn.addEventListener('click', () => setNormalLives(hits));
  modeHitsChoice.appendChild(btn);
}
// Auch Klicks auf dem Startbildschirm merken
for (const btn of document.querySelectorAll('#hitsChoice .hits-btn')) {
  btn.addEventListener('click', () => setNormalLives(Number(btn.textContent)));
}
setNormalLives(normalLives);

// 🎮 Öffnet die Auswahl „Mit Pokalen (100 Leben)“ oder „Normal (Leben einstellbar)“
function openModeChoice(choice) {
  initAudio();
  pendingMode = choice;
  setNormalLives(normalLives);
  if (choice.type === 'solo') {
    const name = choice.actor;
    modeScreenTitle.textContent = `${actorEmoji(name)} ${actors[name].name} · SOLO`;
    modeScreenSub.textContent = '5 Level · Willst du um Pokale spielen oder normal?';
  } else {
    modeScreenTitle.textContent = '⚔️ TEAM-MODUS';
    modeScreenSub.textContent = 'Jedes Level 1 Figur mehr bis Level 6 · Mit Pokalen oder normal?';
  }
  startScreen.classList.remove('active');
  modeScreen.classList.add('active');
}

function launchPendingMode(withTrophies) {
  initAudio();
  trophyMode = withTrophies;
  applyModeLives();
  updateTrophyHud();
  modeScreen.classList.remove('active');
  if (!pendingMode) return;
  if (pendingMode.type === 'solo') {
    startSoloGame(pendingMode.actor);
  } else {
    startNewTeamRun();
  }
}

playTrophyBtn.addEventListener('click', () => launchPendingMode(true));
playNormalBtn.addEventListener('click', () => launchPendingMode(false));
modeBackBtn.addEventListener('click', () => {
  modeScreen.classList.remove('active');
  startScreen.classList.add('active');
});

// 🏅 Am Ende eines Levels: Pokale vergeben, wenn im Pokal-Modus gespielt wurde!
function awardLevelTrophies(won) {
  if (!trophyMode) {
    trophyRewardMsgEl.hidden = true;
    return;
  }
  trophyRewardMsgEl.hidden = false;
  if (won) {
    const gained = currentLevel + 1; // Level 1 = +1 🏆, Level 2 = +2 🏆, …
    trophiesData.total += gained;
    if (teamMode) {
      trophiesData.team += gained;
      for (const name of chosenTeam) {
        const k = kindOf(name);
        trophiesData.actors[k] = (trophiesData.actors[k] || 0) + 1;
      }
    } else if (playerActor) {
      trophiesData.solo += gained;
      trophiesData.actors[playerActor] = (trophiesData.actors[playerActor] || 0) + gained;
    }
    saveTrophies();
    playSound('gem');
    trophyRewardMsgEl.textContent = `🏆 +${gained} ${gained === 1 ? 'POKAL' : 'POKALE'}! (Gesamt: ${trophiesData.total} 🏆)`;
  } else {
    // Wenn eine Computer-Figur noch lebt, schnappt sie sich 1 Pokal in der Rangliste!
    const cpuSurvivors = Object.keys(actors).filter(n => isAlive(n) && isCpu(n));
    if (cpuSurvivors.length) {
      const lucky = kindOf(cpuSurvivors[Math.floor(Math.random() * cpuSurvivors.length)]);
      trophiesData.actors[lucky] = (trophiesData.actors[lucky] || 0) + 1;
      saveTrophies();
    }
    trophyRewardMsgEl.textContent = `🏆 Noch kein Pokal in Level ${currentLevel + 1} – versuch's nochmal!`;
  }
}

// 🏆 Rangliste bauen und anzeigen: Wer hat die meisten Pokale?
function showLeaderboard() {
  initAudio();
  myTrophyBanner.innerHTML =
    `<div class="my-trophy-total">⭐ DEINE POKALE: <b>${trophiesData.total} 🏆</b></div>` +
    `<div class="my-trophy-sub">👤 Solo: <b>${trophiesData.solo} 🏆</b> · ⚔️ Team: <b>${trophiesData.team} 🏆</b> · 💀 Pokal-Modus = immer ${GAME_CONFIG.trophyLives} Leben</div>`;

  const baseNames = Object.keys(actors).filter(n => !actors[n].kind);
  const rows = baseNames.map(name => ({
    name,
    label: actors[name].name,
    emoji: actorEmoji(name),
    color: actors[name].color,
    trophies: Number(trophiesData.actors[name]) || 0
  })).sort((a, b) => b.trophies - a.trophies);

  const maxT = Math.max(1, rows[0]?.trophies || 1);
  const medals = ['🥇', '🥈', '🥉'];
  leaderboardList.innerHTML = rows.map((r, idx) => {
    const rank = medals[idx] || `#${idx + 1}`;
    const pct = Math.round((r.trophies / maxT) * 100);
    return `<div class="lb-row ${idx === 0 && r.trophies > 0 ? 'lb-first' : ''}">` +
      `<span class="lb-rank">${rank}</span>` +
      `<span class="lb-emoji">${r.emoji}</span>` +
      `<div class="lb-info">` +
        `<div class="lb-name">${r.label}</div>` +
        `<div class="lb-bar"><i style="width:${pct}%;background:${r.color}"></i></div>` +
      `</div>` +
      `<span class="lb-count">${r.trophies} 🏆</span>` +
    `</div>`;
  }).join('');

  leaderboardScreen.classList.add('active');
}

function hideLeaderboard() {
  leaderboardScreen.classList.remove('active');
}

leaderboardStartBtn.addEventListener('click', showLeaderboard);
leaderboardOverBtn.addEventListener('click', showLeaderboard);
leaderboardBackBtn.addEventListener('click', hideLeaderboard);
updateTrophyHud();
