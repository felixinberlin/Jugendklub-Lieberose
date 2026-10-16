/**
 * 🏆 trophies.js – Pokal-Modus (50 Leben), Spielernamen & Rangliste
 *
 * Beim Klick auf Solo oder Team-Modus wählst du:
 *   🏆 MIT POKALEN → Immer 50 Leben! Gib deinen Spielernamen ein.
 *                    Pokal gibt es im Solo-Modus bei Sieg und im Team-Modus,
 *                    wenn du alle 8 Level geschafft hast!
 *   🎮 NORMAL      → Du stellst selbst ein, wie viele Leben man hat (5, 10, 20, 50).
 *
 * Datenschutz-Hinweis (AGENTS.md): Spielernamen bleiben rein im Arbeitsspeicher
 * der aktuellen Sitzung und werden niemals übertragen oder dauerhaft gespeichert.
 */

let trophyMode = false; // true = Pokal-Modus (immer 50 Leben), false = Normal
let normalLives = GAME_CONFIG.maxHits; // Eingestellte Leben für den normalen Modus
let pendingMode = null; // Merkt sich, ob gerade Solo oder Team-Modus angeklickt wurde
let currentPlayerName = ''; // Aktueller Spielername (nur im Arbeitsspeicher der Sitzung)

// 🏆 Spieler-Rangliste im Arbeitsspeicher – alle Pokale wurden auf 0 zurückgesetzt, jeder fängt bei 0 an!
const sessionPlayers = [
  { name: 'Drachen-Champion 🐉', trophies: 0, isBot: true },
  { name: 'Kobold-König 🧌', trophies: 0, isBot: true },
  { name: 'Mais-Meister 🌽', trophies: 0, isBot: true }
];

const modeScreen = document.getElementById('modeScreen');
const modeScreenTitle = document.getElementById('modeScreenTitle');
const modeScreenSub = document.getElementById('modeScreenSub');
const playTrophyBtn = document.getElementById('playTrophyBtn');
const playNormalBtn = document.getElementById('playNormalBtn');
const modeBackBtn = document.getElementById('modeBackBtn');
const modeHitsChoice = document.getElementById('modeHitsChoice');
const playerNameInput = document.getElementById('playerNameInput');
const nameErrorMsg = document.getElementById('nameErrorMsg');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardList = document.getElementById('leaderboardList');
const charLeaderboardSection = document.getElementById('charLeaderboardSection');
const myTrophyBanner = document.getElementById('myTrophyBanner');
const leaderboardStartBtn = document.getElementById('leaderboardStartBtn');
const leaderboardOverBtn = document.getElementById('leaderboardOverBtn');
const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
const trophiesEl = document.getElementById('trophies');
const trophyHudEl = document.getElementById('trophyHud');
const trophyRewardMsgEl = document.getElementById('trophyRewardMsg');

// 🔄 Alle alten Pokale auf der Website zurücksetzen, damit alle wieder bei 0 anfangen!
const TROPHY_STORAGE_KEY = 'lieberose_trophies_v2_reset';
try {
  localStorage.removeItem('lieberose_trophies');
} catch (e) {}

// 🏆 Anonyme Pokal-Zahlen aus dem Browser-Speicher laden (keine Namen in localStorage!)
function loadTrophies() {
  try {
    const raw = JSON.parse(localStorage.getItem(TROPHY_STORAGE_KEY) || '{}');
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
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(trophiesData));
  } catch (e) {}
  updateTrophyHud();
}

// Holt oder erstellt den Spieler-Eintrag in der Sitzungs-Rangliste
function getOrCreatePlayerEntry(name) {
  const clean = name.trim();
  let entry = sessionPlayers.find(p => !p.isBot && p.name.toLowerCase() === clean.toLowerCase());
  if (!entry) {
    entry = { name: clean, trophies: 0, isBot: false };
    sessionPlayers.push(entry);
  }
  return entry;
}

function activePlayerTrophies() {
  if (!currentPlayerName) return trophiesData.total;
  return getOrCreatePlayerEntry(currentPlayerName).trophies;
}

// 🔒 Prüft, ob eine Figur schon freigeschaltet ist (ZEUS braucht 40 Pokale!)
function requiredTrophiesFor(name) {
  return kindOf(name) === 'zeus' ? (GAME_CONFIG.zeusUnlockTrophies || 40) : 0;
}

function isActorUnlocked(name) {
  const req = requiredTrophiesFor(name);
  if (req <= 0) return true;
  const best = Math.max(trophiesData.total || 0, activePlayerTrophies());
  return best >= req;
}

function refreshUnlockTiles() {
  for (const btn of document.querySelectorAll('.pick-btn[data-name]')) {
    const n = btn.dataset.name;
    const req = requiredTrophiesFor(n);
    const unlocked = isActorUnlocked(n);
    btn.classList.toggle('locked', !unlocked);
    let badge = btn.querySelector('.pick-lock-badge');
    if (!unlocked && req > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'pick-lock-badge';
        btn.appendChild(badge);
      }
      badge.textContent = `🔒 ${req} 🏆`;
    } else if (badge) {
      badge.remove();
    }
  }
}

function updateTrophyHud() {
  const count = activePlayerTrophies();
  trophiesEl.textContent = count;
  trophyHudEl.classList.toggle('active-trophy', trophyMode);
  playTrophyBtn.textContent = `🏆 MIT POKALEN (${GAME_CONFIG.trophyLives} ❤️)`;
  leaderboardStartBtn.textContent = `🏆 RANGLISTE (${count} 🏆)`;
  refreshUnlockTiles();
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

// Stellt sicher, dass im Pokal-Modus IMMER 50 Leben gelten und im Normal-Modus deine Auswahl
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
for (const btn of document.querySelectorAll('#hitsChoice .hits-btn')) {
  btn.addEventListener('click', () => setNormalLives(Number(btn.textContent)));
}
setNormalLives(normalLives);

playerNameInput.addEventListener('input', () => {
  if (playerNameInput.value.trim()) nameErrorMsg.hidden = true;
});
playerNameInput.addEventListener('keydown', (e) => {
  e.stopPropagation(); // Damit W, A, S, D, F beim Namen-Tippen ganz normal funktionieren!
  if (e.key === 'Enter') launchPendingMode(true);
});

// 🎮 Öffnet die Auswahl „Mit Pokalen (50 Leben)“ oder „Normal (Leben einstellbar)“
function openModeChoice(choice) {
  initAudio();
  pendingMode = choice;
  setNormalLives(normalLives);
  nameErrorMsg.hidden = true;
  if (currentPlayerName && !playerNameInput.value) playerNameInput.value = currentPlayerName;
  if (choice.type === 'solo') {
    const name = choice.actor;
    modeScreenTitle.textContent = `${actorEmoji(name)} ${actors[name].name} · SOLO`;
    modeScreenSub.textContent = `🏆 Pokal bei Sieg (${GAME_CONFIG.trophyLives} ❤️) · oder 🎮 Normal mit deinen Leben!`;
  } else {
    modeScreenTitle.textContent = '⚔️ TEAM-MODUS';
    modeScreenSub.textContent = `🏆 Pokal wenn alle 8 Level geschafft sind (${GAME_CONFIG.trophyLives} ❤️) · oder 🎮 Normal!`;
  }
  startScreen.classList.remove('active');
  modeScreen.classList.add('active');
}

function launchPendingMode(withTrophies) {
  initAudio();
  if (withTrophies) {
    const entered = (playerNameInput.value || '').trim();
    if (!entered) {
      nameErrorMsg.hidden = false;
      playerNameInput.focus();
      return;
    }
    currentPlayerName = entered;
    getOrCreatePlayerEntry(currentPlayerName);
    nameErrorMsg.hidden = true;
  }
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

// 🏅 Am Ende eines Levels prüfen, ob es einen Pokal gibt!
// Regel:
//   - Solo-Modus: Pokal, wenn man im Solo-Modus gewonnen hat!
//   - Team-Modus: Pokal NUR, wenn man alle 8 Level geschafft hat!
function awardLevelTrophies(won) {
  if (!trophyMode) {
    trophyRewardMsgEl.hidden = true;
    return;
  }
  trophyRewardMsgEl.hidden = false;
  const totalLevels = levelList().length;
  const nr = currentLevel + 1;
  const isFinalLevel = currentLevel === totalLevels - 1;

  if (!won) {
    trophyRewardMsgEl.textContent = `🏆 Kein Pokal – du musst gewinnen, um den Pokal zu holen!`;
    return;
  }

  // Im Team-Modus gibt es den Pokal erst, wenn alle 8 Level geschafft sind!
  if (teamMode && !isFinalLevel) {
    trophyRewardMsgEl.textContent = `🏅 Level ${nr}/${totalLevels} geschafft! Schaff alle ${totalLevels} Level für den Pokal 🏆!`;
    return;
  }

  // Gewonnen! (Solo gewonnen oder im Team-Modus alle 8 Level geschafft)
  const gained = 1;
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

  const pEntry = getOrCreatePlayerEntry(currentPlayerName || 'Spieler 1');
  pEntry.trophies += gained;

  saveTrophies();
  playSound('gem');
  trophyRewardMsgEl.textContent = `🏆 +${gained} POKAL FÜR ${pEntry.name.toUpperCase()}! (Jetzt: ${pEntry.trophies} 🏆)`;
}

// 🎭 Alte Charakter-Rangliste: Logik bleibt komplett erhalten, ist aber versteckt (kann später wiederkommen!)
function buildCharacterLeaderboardHtml() {
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
  return rows.map((r, idx) => {
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
}

// 🏆 Spieler-Rangliste bauen und anzeigen: Wer hat die meisten Pokale?
function showLeaderboard() {
  initAudio();
  const activeName = currentPlayerName || 'Noch kein Name';
  const activeCount = currentPlayerName ? getOrCreatePlayerEntry(currentPlayerName).trophies : trophiesData.total;
  myTrophyBanner.innerHTML =
    `<div class="my-trophy-total">👤 ${activeName}: <b>${activeCount} 🏆</b></div>` +
    `<div class="my-trophy-sub">💀 Pokal-Modus = ${GAME_CONFIG.trophyLives} Leben · Solo-Sieg oder alle 8 Team-Level = +1 🏆</div>`;

  // Spieler-Rangliste nach Pokalen sortieren
  const sortedPlayers = [...sessionPlayers].sort((a, b) => b.trophies - a.trophies);
  const maxT = Math.max(1, sortedPlayers[0]?.trophies || 1);
  const medals = ['🥇', '🥈', '🥉'];
  leaderboardList.innerHTML = sortedPlayers.map((p, idx) => {
    const rank = medals[idx] || `#${idx + 1}`;
    const pct = Math.round((p.trophies / maxT) * 100);
    const isMe = currentPlayerName && p.name.toLowerCase() === currentPlayerName.toLowerCase();
    return `<div class="lb-row ${idx === 0 && p.trophies > 0 ? 'lb-first' : ''}">` +
      `<span class="lb-rank">${rank}</span>` +
      `<span class="lb-emoji">${isMe ? '⭐' : '🎮'}</span>` +
      `<div class="lb-info">` +
        `<div class="lb-name">${p.name}${isMe ? ' (DU)' : ''}</div>` +
        `<div class="lb-bar"><i style="width:${pct}%;background:${isMe ? '#ffde59' : '#38bdf8'}"></i></div>` +
      `</div>` +
      `<span class="lb-count">${p.trophies} 🏆</span>` +
    `</div>`;
  }).join('');

  // Charakter-Rangliste im Hintergrund aktualisieren (versteckt per hidden-Attribut, nicht gelöscht!)
  if (charLeaderboardSection) {
    charLeaderboardSection.innerHTML = buildCharacterLeaderboardHtml();
  }

  leaderboardScreen.classList.add('active');
}

function hideLeaderboard() {
  leaderboardScreen.classList.remove('active');
}

leaderboardStartBtn.addEventListener('click', showLeaderboard);
leaderboardOverBtn.addEventListener('click', showLeaderboard);
leaderboardBackBtn.addEventListener('click', hideLeaderboard);
updateTrophyHud();
