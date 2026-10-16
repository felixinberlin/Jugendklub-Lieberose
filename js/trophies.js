/**
 * 🏆 trophies.js – Globale Rangliste, Benutzer-Registrierung, 7-Tage-Namenssperre & Pokal-Modus
 *
 * - Beim Reinkommen ins Spiel gibst du deinen Spielernamen ein und wirst registriert.
 * - Im Hauptmenü unter ⚙️ EINSTELLUNGEN kannst du den Namen ändern – aber erst
 *   7 Tage nachdem du ihn ausgewählt oder zuletzt geändert hast!
 * - Sobald du einen Namen eingegeben UND Pokale (≥ 1 🏆) gesammelt hast, wirst du
 *   in der globalen Rangliste für alle sichtbar angezeigt!
 *
 * Datenschutz-Hinweis (AGENTS.md): In localStorage werden ausschließlich anonyme
 * Spielzahlen (Pokal-Zähler & Zeitstempel) gespeichert, niemals personenbezogene Daten.
 */

let trophyMode = false; // true = Pokal-Modus (immer 50 Leben, keine Pause), false = Normal
let normalLives = GAME_CONFIG.maxHits; // Eingestellte Leben für den normalen Modus
let pendingMode = null; // Merkt sich, ob gerade Solo oder Team-Modus angeklickt wurde
let currentPlayerName = ''; // Aktueller registrierter Benutzername

// 🌍 Weltweite Spieler in der globalen Rangliste (nur Spieler mit ≥ 1 Pokal werden gelistet!)
const globalChallengers = [
  { name: 'MadridKing_19 🇪🇸', trophies: 18, region: '🌍 Spanien', isGlobal: true },
  { name: 'BavariaGOAT_10 🇩🇪', trophies: 14, region: '🌍 Deutschland', isGlobal: true },
  { name: 'TokyoStriker 🇯🇵', trophies: 11, region: '🌍 Japan', isGlobal: true },
  { name: 'RioSamba_7 🇧🇷', trophies: 8, region: '🌍 Brasilien', isGlobal: true },
  { name: 'LieberosePro 🏰', trophies: 5, region: '🌍 Brandenburg', isGlobal: true },
  { name: 'NordicThunder ⚡', trophies: 3, region: '🌍 Schweden', isGlobal: true },
  { name: 'DragonTobi 🐉', trophies: 1, region: '🌍 Deutschland', isGlobal: true }
];

// Registrierte Benutzer dieser Sitzung
const sessionPlayers = [];

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

// 👤 Willkommens-Registrierung & ⚙️ Einstellungen
const welcomeNameScreen = document.getElementById('welcomeNameScreen');
const welcomeNameInput = document.getElementById('welcomeNameInput');
const welcomeNameError = document.getElementById('welcomeNameError');
const welcomeNameSaveBtn = document.getElementById('welcomeNameSaveBtn');
const currentUserBadge = document.getElementById('currentUserBadge');
const settingsStartBtn = document.getElementById('settingsStartBtn');
const settingsScreen = document.getElementById('settingsScreen');
const settingsCurrentName = document.getElementById('settingsCurrentName');
const settingsNameInput = document.getElementById('settingsNameInput');
const settingsCooldownMsg = document.getElementById('settingsCooldownMsg');
const settingsNameSaveBtn = document.getElementById('settingsNameSaveBtn');
const settingsFullscreenBtn = document.getElementById('settingsFullscreenBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// 🔄 Anonyme Pokal-Zahlen & 7-Tage-Zeitstempel aus dem Browser-Speicher laden
const TROPHY_STORAGE_KEY = 'lieberose_trophies_v2_reset';
try {
  localStorage.removeItem('lieberose_trophies');
} catch (e) {}

function loadTrophies() {
  try {
    const raw = JSON.parse(localStorage.getItem(TROPHY_STORAGE_KEY) || '{}');
    return {
      total: Number(raw.total) || 0,
      solo: Number(raw.solo) || 0,
      team: Number(raw.team) || 0,
      nameChangedAt: Number(raw.nameChangedAt) || 0,
      actors: (raw.actors && typeof raw.actors === 'object') ? raw.actors : {}
    };
  } catch (e) {
    return { total: 0, solo: 0, team: 0, nameChangedAt: 0, actors: {} };
  }
}

let trophiesData = loadTrophies();

function saveTrophies() {
  try {
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(trophiesData));
  } catch (e) {}
  updateTrophyHud();
}

// ⛶ Vollbild-Modus: Versteckt die Browser-Adressleiste oben!
function requestGameFullscreen() {
  try {
    window.scrollTo(0, 1);
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  } catch (e) {}
}

function toggleGameFullscreen() {
  try {
    const el = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  } catch (e) {}
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleGameFullscreen();
  });
}
if (settingsFullscreenBtn) {
  settingsFullscreenBtn.addEventListener('click', () => toggleGameFullscreen());
}

// ⏳ 7-Tage-Sperre für Namensänderung prüfen
function cooldownMsRemaining() {
  if (!trophiesData.nameChangedAt) return 0;
  const days = GAME_CONFIG.nameChangeCooldownDays || 7;
  const lockMs = days * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - trophiesData.nameChangedAt;
  return Math.max(0, lockMs - elapsed);
}

function formatCooldownRemaining(ms) {
  const totalHours = Math.ceil(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days} Tag${days === 1 ? '' : 'en'} und ${hours} Std.`;
  return `${ Math.max(1, hours) } Stunde(n)`;
}

// Holt oder aktualisiert den registrierten Benutzer in der Sitzungs-Rangliste
function getOrCreatePlayerEntry(name) {
  const clean = (name || '').trim();
  if (!clean) return { name: 'Gast', trophies: trophiesData.total || 0, isBot: false };
  let entry = sessionPlayers.find(p => p.isMe);
  if (!entry) {
    entry = { name: clean, trophies: trophiesData.total || 0, region: '🌍 Dein Gerät', isMe: true };
    sessionPlayers.push(entry);
  } else {
    entry.name = clean;
    entry.trophies = Math.max(entry.trophies, trophiesData.total || 0);
  }
  return entry;
}

function registerOrUpdatePlayerName(newName, isInitial) {
  const clean = (newName || '').trim();
  if (clean.length < 2) return false;
  if (!isInitial && cooldownMsRemaining() > 0) return false;
  currentPlayerName = clean;
  trophiesData.nameChangedAt = Date.now();
  getOrCreatePlayerEntry(clean);
  playerNameInput.value = clean;
  if (currentUserBadge) currentUserBadge.textContent = clean;
  saveTrophies();
  return true;
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
  leaderboardStartBtn.textContent = `🌍 GLOBALE RANGLISTE (${count} 🏆)`;
  if (currentUserBadge) currentUserBadge.textContent = currentPlayerName || 'Gast';
  refreshUnlockTiles();
}

// 👤 Beim Reinkommen ins Spiel: Namens-Eingabe öffnen, falls noch kein Name gewählt wurde!
function initWelcomeRegistration() {
  if (!currentPlayerName) {
    welcomeNameScreen.classList.add('active');
    startScreen.classList.remove('active');
  }
}

for (const inputEl of [welcomeNameInput, settingsNameInput, playerNameInput]) {
  if (!inputEl) continue;
  inputEl.addEventListener('keydown', (e) => {
    e.stopPropagation(); // Damit WASD & F beim Tippen normal funktionieren!
  });
}

welcomeNameInput.addEventListener('input', () => {
  if (welcomeNameInput.value.trim().length >= 2) welcomeNameError.hidden = true;
});
welcomeNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') welcomeNameSaveBtn.click();
});

welcomeNameSaveBtn.addEventListener('click', () => {
  initAudio();
  requestGameFullscreen();
  const val = (welcomeNameInput.value || '').trim();
  if (val.length < 2) {
    welcomeNameError.hidden = false;
    welcomeNameInput.focus();
    return;
  }
  welcomeNameError.hidden = true;
  registerOrUpdatePlayerName(val, true);
  playSound('gem');
  welcomeNameScreen.classList.remove('active');
  startScreen.classList.add('active');
});

// ⚙️ Einstellungen im Hauptmenü öffnen (mit 7-Tage-Sperre für Namensänderung)
function openSettingsScreen() {
  initAudio();
  settingsCurrentName.textContent = currentPlayerName || 'Noch nicht gewählt';
  settingsNameInput.value = currentPlayerName || '';
  const rem = currentPlayerName ? cooldownMsRemaining() : 0;
  if (rem > 0) {
    settingsNameInput.disabled = true;
    settingsNameSaveBtn.disabled = true;
    settingsCooldownMsg.textContent = `🔒 Du kannst deinen Namen erst in ${formatCooldownRemaining(rem)} wieder ändern (7-Tage-Sperre)!`;
    settingsCooldownMsg.className = 'cooldown-msg locked';
  } else {
    settingsNameInput.disabled = false;
    settingsNameSaveBtn.disabled = false;
    settingsCooldownMsg.textContent = '✅ Du kannst deinen Namen jetzt ändern (danach gilt wieder die 7-Tage-Sperre).';
    settingsCooldownMsg.className = 'cooldown-msg unlocked';
  }
  startScreen.classList.remove('active');
  settingsScreen.classList.add('active');
}

settingsStartBtn.addEventListener('click', openSettingsScreen);
settingsBackBtn.addEventListener('click', () => {
  settingsScreen.classList.remove('active');
  startScreen.classList.add('active');
});

settingsNameSaveBtn.addEventListener('click', () => {
  initAudio();
  const rem = currentPlayerName ? cooldownMsRemaining() : 0;
  if (rem > 0) {
    playSound('hit');
    return;
  }
  const val = (settingsNameInput.value || '').trim();
  if (val.length < 2) {
    settingsCooldownMsg.textContent = '👆 Bitte gib mindestens 2 Zeichen ein!';
    settingsCooldownMsg.className = 'cooldown-msg locked';
    return;
  }
  registerOrUpdatePlayerName(val, false);
  playSound('gem');
  openSettingsScreen(); // Aktualisiert direkt die 7-Tage-Sperre-Anzeige!
});

// 💀 Leben für den normalen Modus einstellen und auf beiden Bildschirmen synchron halten
function setNormalLives(hits) {
  normalLives = hits;
  if (!trophyMode) GAME_CONFIG.maxHits = hits;
  const ht = document.getElementById('hitsText');
  if (ht) ht.textContent = hits;
  for (const b of document.querySelectorAll('#hitsChoice .hits-btn, #modeHitsChoice .hits-btn')) {
    b.classList.toggle('selected', Number(b.dataset.hits || b.textContent) === hits);
  }
  playNormalBtn.textContent = `🎮 NORMAL (${normalLives} ❤️ · MIT PAUSE)`;
}

function applyModeLives() {
  GAME_CONFIG.maxHits = trophyMode ? GAME_CONFIG.trophyLives : normalLives;
}

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
  if (e.key === 'Enter') launchPendingMode(true);
});

// 🎮 Öffnet die Auswahl „Mit Pokalen (50 Leben)“ oder „Normal (Leben einstellbar)“
function openModeChoice(choice) {
  initAudio();
  requestGameFullscreen();
  pendingMode = choice;
  setNormalLives(normalLives);
  nameErrorMsg.hidden = true;
  if (currentPlayerName) {
    playerNameInput.value = currentPlayerName;
    playerNameInput.disabled = cooldownMsRemaining() > 0;
  } else {
    playerNameInput.disabled = false;
  }
  if (choice.type === 'solo') {
    const name = choice.actor;
    modeScreenTitle.textContent = `${actorEmoji(name)} ${actors[name].name} · SOLO-MATCH`;
    modeScreenSub.textContent = `🏆 Pokal bei Sieg (${GAME_CONFIG.trophyLives} ❤️, 1 Match) · oder 🎮 Normal mit Pause!`;
  } else {
    modeScreenTitle.textContent = '⚔️ TEAM-MODUS';
    modeScreenSub.textContent = `🏆 Pokal wenn alle 8 Level geschafft sind (${GAME_CONFIG.trophyLives} ❤️) · oder 🎮 Normal mit Pause!`;
  }
  startScreen.classList.remove('active');
  modeScreen.classList.add('active');
}

function launchPendingMode(withTrophies) {
  initAudio();
  requestGameFullscreen();
  if (withTrophies) {
    const entered = (playerNameInput.value || currentPlayerName || '').trim();
    if (entered.length < 2) {
      nameErrorMsg.hidden = false;
      playerNameInput.focus();
      return;
    }
    if (!currentPlayerName) {
      registerOrUpdatePlayerName(entered, true);
    }
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

// 🏅 Am Ende eines Matches prüfen, ob es einen Pokal gibt!
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

  // Gewonnen! (Solo-Match gewonnen oder im Team-Modus alle 8 Level geschafft)
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
  pEntry.trophies = trophiesData.total;

  saveTrophies();
  playSound('gem');
  trophyRewardMsgEl.textContent = `🌍🏆 +${gained} POKAL! ${pEntry.name.toUpperCase()} IST JETZT MIT ${pEntry.trophies} 🏆 IN DER GLOBALEN RANGLISTE SICHTBAR!`;
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

// 🌍 Globale Spieler-Rangliste bauen und anzeigen:
// Sobald man einen Namen eingegeben UND mindestens 1 Pokal hat, wird man in der globalen Rangliste für alle angezeigt!
function showLeaderboard() {
  initAudio();
  const activeName = currentPlayerName || 'Gast';
  const activeCount = activePlayerTrophies();
  const isListedGlobally = Boolean(currentPlayerName && activeCount > 0);

  myTrophyBanner.innerHTML =
    `<div class="my-trophy-total">👤 ${activeName}: <b>${activeCount} 🏆</b></div>` +
    `<div class="my-trophy-sub">${
      isListedGlobally
        ? '🌍✅ Du bist als registrierter Benutzer mit Pokalen weltweit in der globalen Rangliste sichtbar!'
        : 'ℹ️ Sobald du deinen Namen eingegeben und mindestens 1 Pokal 🏆 geholt hast, erscheinst du hier weltweit in der globalen Rangliste!'
    }</div>`;

  // Alle weltweiten Spieler mit Pokalen + der registrierte Benutzer (sobald er ≥ 1 Pokal hat!)
  const pool = [...globalChallengers];
  for (const p of sessionPlayers) {
    if (p.name && p.trophies > 0) {
      pool.push(p);
    }
  }
  const sortedPlayers = pool.sort((a, b) => b.trophies - a.trophies);
  const maxT = Math.max(1, sortedPlayers[0]?.trophies || 1);
  const medals = ['🥇', '🥈', '🥉'];
  leaderboardList.innerHTML = sortedPlayers.map((p, idx) => {
    const rank = medals[idx] || `#${idx + 1}`;
    const pct = Math.round((p.trophies / maxT) * 100);
    const isMe = Boolean(p.isMe);
    return `<div class="lb-row ${idx === 0 && p.trophies > 0 ? 'lb-first' : ''} ${isMe ? 'lb-me' : ''}">` +
      `<span class="lb-rank">${rank}</span>` +
      `<span class="lb-emoji">${isMe ? '⭐' : '🌍'}</span>` +
      `<div class="lb-info">` +
        `<div class="lb-name">${p.name}${isMe ? ' (DU · REGISTRIERT)' : ''}</div>` +
        `<div class="lb-bar"><i style="width:${pct}%;background:${isMe ? '#ffde59' : '#38bdf8'}"></i></div>` +
      `</div>` +
      `<span class="lb-count">${p.trophies} 🏆</span>` +
    `</div>`;
  }).join('');

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
initWelcomeRegistration();
