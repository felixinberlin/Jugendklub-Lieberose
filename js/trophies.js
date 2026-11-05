/**
 * 🏆 trophies.js – Öffentliche Highscore-Rangliste, Datenschutz durch Zufalls-Spitznamen & Pokal-Modus
 *
 * - 100% DATENSCHUTZ: Niemand muss echte Namen eingeben! Coole Zufalls-Spitznamen zum Auswählen.
 * - ÖFFENTLICHE HIGHSCORES: Treffer-Rekorde (🎯) und Meister-Pokale (🏆) für alle sichtbar.
 * - SPITZNAME WÄHLEN: Beim Start, vor jedem Match, in den Einstellungen oder direkt in der Rangliste mit 🎲 würfeln.
 * - NUR ZUFALLS-NAMEN: Freier Text ist gesperrt – erlaubt sind nur Namen aus den Wortlisten (prüft auch der Server).
 * - ONLINE-RANGLISTE: Spitzname + Punkte + Pokale gehen an /api/highscores (Upstash). Sonst bleibt alles im Browser.
 */

// 🎭 4 kuratierte Wortlisten für den Zufalls-Namensgenerator (Datenschutz)
// 1. Coole Vorsilben (123 Wörter)
const NICKNAME_COOL_PREFIXES = [
  'Feuer', 'Blitz', 'Eis', 'Donner', 'Schatten', 'Sturm', 'Nebel', 'Mond', 'Stern', 'Nacht',
  'Flammen', 'Kristall', 'Drachen', 'Geister', 'Sonnen', 'Wolken', 'Frost', 'Funken', 'Rauch', 'Lava',
  'Meteor', 'Komet', 'Titan', 'Phantom', 'Cyber', 'Pixel', 'Laser', 'Turbo', 'Neon', 'Plasma',
  'Atom', 'Stahl', 'Eisen', 'Silber', 'Gold', 'Rubin', 'Smaragd', 'Magma', 'Vulkan', 'Orkan',
  'Runen', 'Zauber', 'Wüsten', 'Dschungel', 'Tiefsee', 'Nordlicht', 'Polar', 'Wirbel', 'Raben', 'Himmels',
  'Mega', 'Ninja', 'Cosmic', 'Ultra', 'Super', 'Raketen', 'Sternen', 'Galaxy', 'Samurai', 'Hyper',
  'Sonic', 'Kometen', 'Mystik', 'Astral', 'Radioaktiv', 'Solar', 'Alpha', 'Omega', 'Vortex', 'Chrono',
  'Dynamo', 'Atomic', 'Cybernetik', 'Quanten', 'Blizzard', 'Tornado', 'Taifun', 'Diamant', 'Obsidian', 'Bronze',
  'Platin', 'Panzer', 'Kaiser', 'Königs', 'Helden', 'Mutanten', 'Wilder', 'Schneller', 'Furchtloser', 'Unbesiegbarer',
  'Schlauer', 'Starker', 'Flotter', 'Lockerer', 'Kühner', 'Geheimer', 'Dunkler', 'Heller', 'Leuchtender', 'Flammender',
  'Glühender', 'Eisiger', 'Frostiger', 'Stürmischer', 'Magischer', 'Epischer', 'Legendärer', 'Mythischer', 'Kosmischer', 'Galaktischer',
  'Unendlicher', 'Taktischer', 'Lautloser', 'Geschickter', 'Spritziger', 'Mächtiger', 'Todesmutiger', 'Elektrischer', 'Magnetischer', 'Gravitations',
  'Techno', 'Viper', 'Phoenix'
];

// 2. Coole Endungen (124 Wörter)
const NICKNAME_COOL_ENDINGS = [
  'Drache', 'Wolf', 'Fuchs', 'Falke', 'Tiger', 'Panther', 'Löwe', 'Adler', 'Rabe', 'Phönix',
  'Kobold', 'Goblin', 'Ninja', 'Samurai', 'Ronin', 'Ritter', 'Krieger', 'Jäger', 'Wächter', 'Held',
  'Magier', 'Zauberer', 'Hexer', 'Schurke', 'Geist', 'Dämon', 'Titan', 'Gnom', 'Troll', 'Golem',
  'Roboter', 'Cyborg', 'Pilot', 'Kapitän', 'Pirat', 'Gladiator', 'Bogenschütze', 'Schwertmeister', 'Drachenreiter', 'Blitzläufer',
  'Skorpion', 'Hydra', 'Krake', 'Greif', 'Chimäre', 'Vampir', 'Werwolf', 'Schattenjäger', 'Feuervogel', 'Eisriese',
  'Katze', 'Mais', 'Maus', 'Musiala', 'Yamal', 'GOAT', 'Panda', 'Champion', 'Legende', 'Kicker',
  'Gamer', 'Bär', 'Viper', 'Meteor', 'Gepard', 'Jaguar', 'Kobra', 'Python', 'Krokodil', 'Hai',
  'Wal', 'Delfin', 'Spinne', 'Wespe', 'Hornisse', 'Bison', 'Nashorn', 'Mammut', 'Dino', 'T-Rex',
  'Raptor', 'Drachenlord', 'Scharfschütze', 'Pionier', 'Kommandant', 'Meister', 'Hexenmeister', 'Druide', 'Schamane', 'Paladin',
  'Berserker', 'Waldläufer', 'Spion', 'Agent', 'Hüter', 'Beschützer', 'Verteidiger', 'Stürmer', 'Torwart', 'Dribbler',
  'Stratege', 'Phantom', 'Schattenkrieger', 'Lichtbringer', 'Sternenjäger', 'Weltenbummler', 'Abenteurer', 'Entdecker', 'Rebell', 'Rächer',
  'Komet', 'Asteroid', 'Kometenreiter', 'Blizzard', 'Taifun', 'Vulkanier', 'Zyklop', 'Gargoyle', 'Pegasus', 'Zentaur',
  'Kraken', 'Leviathan', 'Koloss', 'Behemoth'
];

// 3. Lustige Vorsilben (50 Wörter)
const NICKNAME_FUNNY_PREFIXES = [
  'Keks', 'Wackel', 'Pups', 'Quatsch', 'Matsch', 'Krümel', 'Schnarch', 'Knuddel', 'Glitzer', 'Zappel',
  'Gummi', 'Waffel', 'Gurken', 'Kartoffel', 'Käse', 'Pudding', 'Nudel', 'Popcorn', 'Zucker', 'Marmeladen',
  'Kicher', 'Schlabber', 'Schlürf', 'Knabber', 'Wusel', 'Flummi', 'Wobbel', 'Knall', 'Peng', 'Plüsch',
  'Tofu', 'Brezel', 'Brokkoli', 'Banane', 'Pizza', 'Spaghetti', 'Senf', 'Ketchup', 'Mayo', 'Schoko',
  'Lolli', 'Socken', 'Pantoffel', 'Seifenblasen', 'Kuschel', 'Hoppel', 'Hampel', 'Zimt', 'Zuckerwatte', 'Kaugummi'
];

// 4. Lustige Endungen (50 Wörter)
const NICKNAME_FUNNY_ENDINGS = [
  'Gurke', 'Kartoffel', 'Tomate', 'Melone', 'Erdbeere', 'Bohne', 'Zwiebel', 'Karotte', 'Ananas',
  'Keks', 'Muffin', 'Donut', 'Waffel', 'Brezel', 'Nudel', 'Pizza', 'Pudding', 'Marshmallow', 'Gummibär',
  'Hamster', 'Pinguin', 'Ente', 'Lama', 'Alpaka', 'Faultier', 'Maulwurf', 'Schnabeltier', 'Quokka', 'Otter',
  'Socke', 'Pantoffel', 'Mütze', 'Unterhose', 'Zahnbürste', 'Klobürste', 'Löffel', 'Toaster', 'Staubsauger', 'Badewanne',
  'Wichtel', 'Kobold', 'Krake', 'Monster', 'Pupskanone', 'Quatschkopf', 'Schläfer', 'Tanzbär', 'Flitzpiepe', 'Schnarchnase', 'Banane'
];

// 🎭 50 passende, bunte Emojis
const NICKNAME_EMOJIS = [
  '⚡', '🚀', '🔥', '❄️', '🥷', '👑', '⭐', '🎮', '💎', '🏆',
  '🦁', '🐺', '🐉', '⚽', '🌽', '🐱', '🐭', '👺', '🧌', '🦅',
  '🛡️', '🌪️', '🦊', '🎯', '✨', '🐾', '💥', '🛸', '🦖', '⚔️',
  '🍕', '🍪', '🍿', '🍩', '🍌', '🥔', '🥒', '🧦', '🦆', '🐧',
  '🦥', '🦙', '🦦', '🦄', '🤖', '👾', '🌈', '🧨', '🎉', '💨'
];

// Name ist die Kombination aus Vorsilbe + Endung (mit Emoji)
function generateRandomNickname() {
  const roll = Math.random();
  let prefix, ending;
  if (roll < 0.35) {
    prefix = NICKNAME_COOL_PREFIXES[Math.floor(Math.random() * NICKNAME_COOL_PREFIXES.length)];
    ending = NICKNAME_COOL_ENDINGS[Math.floor(Math.random() * NICKNAME_COOL_ENDINGS.length)];
  } else if (roll < 0.65) {
    prefix = NICKNAME_FUNNY_PREFIXES[Math.floor(Math.random() * NICKNAME_FUNNY_PREFIXES.length)];
    ending = NICKNAME_FUNNY_ENDINGS[Math.floor(Math.random() * NICKNAME_FUNNY_ENDINGS.length)];
  } else if (roll < 0.85) {
    prefix = NICKNAME_FUNNY_PREFIXES[Math.floor(Math.random() * NICKNAME_FUNNY_PREFIXES.length)];
    ending = NICKNAME_COOL_ENDINGS[Math.floor(Math.random() * NICKNAME_COOL_ENDINGS.length)];
  } else {
    prefix = NICKNAME_COOL_PREFIXES[Math.floor(Math.random() * NICKNAME_COOL_PREFIXES.length)];
    ending = NICKNAME_FUNNY_ENDINGS[Math.floor(Math.random() * NICKNAME_FUNNY_ENDINGS.length)];
  }

  if (prefix.toLowerCase() === ending.toLowerCase()) {
    ending = NICKNAME_COOL_ENDINGS[(Math.floor(Math.random() * NICKNAME_COOL_ENDINGS.length) + 1) % NICKNAME_COOL_ENDINGS.length];
  }

  const emoji = NICKNAME_EMOJIS[Math.floor(Math.random() * NICKNAME_EMOJIS.length)];
  return `${emoji} ${prefix}-${ending}`;
}

// ✅ Ist das ein Name aus unseren Wortlisten? (Gleiche Prüfung wie in api/highscores.js)
const NICK_PREFIX_SET = new Set([...NICKNAME_COOL_PREFIXES, ...NICKNAME_FUNNY_PREFIXES]);
const NICK_ENDING_SET = new Set([...NICKNAME_COOL_ENDINGS, ...NICKNAME_FUNNY_ENDINGS]);
const NICK_EMOJI_SET = new Set(NICKNAME_EMOJIS);
function isValidNickname(name) {
  if (typeof name !== 'string') return false;
  const space = name.indexOf(' ');
  const dash = name.indexOf('-', space + 1);
  if (space < 1 || dash < 0) return false;
  return NICK_EMOJI_SET.has(name.slice(0, space)) &&
    NICK_PREFIX_SET.has(name.slice(space + 1, dash)) &&
    NICK_ENDING_SET.has(name.slice(dash + 1));
}

function getNicknameSuggestions(count = 5, exclude = '') {
  const set = new Set();
  if (exclude) set.add(exclude);
  const result = [];
  let attempts = 0;
  while (result.length < count && attempts < 60) {
    attempts++;
    const nick = generateRandomNickname();
    if (!set.has(nick)) {
      set.add(nick);
      result.push(nick);
    }
  }
  while (result.length < count) {
    result.push(generateRandomNickname());
  }
  return result;
}

// Holt 5 freie Vorschläge aus der Cloud oder generiert sie lokal (Offline)
async function fetchOrGenerate5Suggestions(exclude = '') {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/highscores?action=suggestions`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.suggestions) && data.suggestions.length >= 5) {
        return data.suggestions.slice(0, 5);
      }
    }
  } catch (e) {}
  return getNicknameSuggestions(5, exclude);
}

// Rendert 5 Vorschläge als klickbare Knöpfe
async function renderNicknameChips(container, inputEl, onSelect) {
  if (!container) return;
  const current = (inputEl ? inputEl.value : currentPlayerName || '').trim();
  const suggestions = await fetchOrGenerate5Suggestions(current);
  container.innerHTML = '';
  for (const nick of suggestions) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-btn' + (nick === current ? ' selected' : '');
    chip.textContent = nick;
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      playSound('bounce');
      if (inputEl) inputEl.value = nick;
      for (const c of container.querySelectorAll('.chip-btn')) {
        c.classList.toggle('selected', c.textContent === nick);
      }
      if (typeof onSelect === 'function') onSelect(nick);
    });
    container.appendChild(chip);
  }
}

// 🎯 Öffentliche Highscores im Browser-Speicher (localStorage)
const PUBLIC_HIGHSCORES_KEY = 'lieberose_public_highscores_v1';
let lbActiveTab = 'highscores'; // 'highscores' oder 'trophies'

function loadPublicHighScores() {
  try {
    const list = JSON.parse(localStorage.getItem(PUBLIC_HIGHSCORES_KEY) || '[]');
    if (Array.isArray(list)) return list;
  } catch (e) {}
  return [];
}

function savePublicHighScoresList(list) {
  try {
    localStorage.setItem(PUBLIC_HIGHSCORES_KEY, JSON.stringify(list));
  } catch (e) {}
}

// 🌐 API-Basis-URL: Wenn die Datei heruntergeladen/lokal geöffnet wird (file:// oder localhost),
// verbindet sie sich automatisch mit der Cloud auf Vercel!
function getApiBaseUrl() {
  if (typeof location === 'undefined') return '';
  if (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'https://jugendklub.vercel.app';
  }
  return '';
}

// 🆔 Eindeutige interne Spieler-ID (nie der öffentliche Name!)
function getOrCreatePlayerId() {
  let id = localStorage.getItem('lieberose_player_id_v2');
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem('lieberose_player_id_v2', id);
  }
  return id;
}

// 🔑 Geheimes Token des Spielers (schützt vor ID-Spoofing durch andere Geräte)
function getOrCreatePlayerSecret() {
  let secret = localStorage.getItem('lieberose_player_secret_v2');
  if (!secret) {
    try {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      secret = 's_' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      secret = 's_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }
    localStorage.setItem('lieberose_player_secret_v2', secret);
  }
  return secret;
}

// 📦 Offline-Queue: Merkt sich Highscores, falls der Spieler offline war beim Rekord-Bruch
const PENDING_SYNC_KEY = 'lieberose_pending_sync_v2';

function savePendingSync(entry) {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(entry));
  } catch (e) {}
}

function getPendingSync() {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function clearPendingSync() {
  try {
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch (e) {}
}

// Sobald der Browser wieder online geht: Vormerkte Offline-Highscores sofort in die Cloud schicken!
async function tryFlushPendingSync() {
  const pending = getPendingSync();
  if (!pending || !isValidNickname(pending.name)) { clearPendingSync(); return; }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  try {
    const pid = getOrCreatePlayerId();
    const secret = getOrCreatePlayerSecret();
    const res = await fetch(`${getApiBaseUrl()}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        name: pending.name,
        score: pending.score,
        trophies: pending.trophies,
        actor: pending.actor,
        playerId: pid,
        playerSecret: secret
      })
    });

    if (res.ok) {
      clearPendingSync();
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.scores)) {
        savePublicHighScoresList(data.scores);
        if (leaderboardScreen && leaderboardScreen.classList.contains('active')) {
          renderLeaderboardRows(data.scores);
        }
      }
    } else if (res.status === 409) {
      clearPendingSync();
      const errData = await res.json().catch(() => ({}));
      alert(errData.message || 'Dieser Name ist bereits auf einem anderen Gerät belegt!');
      const fresh = generateRandomNickname();
      registerOrUpdatePlayerName(fresh, true);
    }
  } catch (e) {
    // Weiterhin offline -> pendingSync bleibt gespeichert für das nächste Mal
  }
}

// ☁️ Online-Synchronisation mit Upstash Redis über /api/highscores (Vercel Serverless Function)
let isOnlineDbConnected = false;

async function syncOnlineHighScores() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/highscores`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.ok && Array.isArray(data.scores)) {
      isOnlineDbConnected = true;
      // ☁️ Online ist die Server-Liste die Wahrheit – alte Einträge im Browser fliegen raus.
      // Nur der eigene Eintrag bleibt, falls er noch nicht hochgeladen ist (Offline-Rekord).
      const map = new Map();
      for (const item of data.scores) {
        if (item && item.name) map.set(item.name.toLowerCase(), item);
      }
      const me = (currentPlayerName || '').toLowerCase();
      const mine = loadPublicHighScores().find(p => (p.name || '').toLowerCase() === me);
      if (mine && me) {
        const srv = map.get(me);
        map.set(me, srv ? { ...srv, score: Math.max(srv.score || 0, mine.score || 0), trophies: Math.max(srv.trophies || 0, mine.trophies || 0) } : mine);
      }
      const merged = Array.from(map.values());
      savePublicHighScoresList(merged);
      if (leaderboardScreen && leaderboardScreen.classList.contains('active')) {
        renderLeaderboardRows(merged);
      }
    }
  } catch (e) {
    // Offline / lokaler Test ohne Vercel Server -> still ignorieren, LocalStorage übernimmt
  }
  tryFlushPendingSync();
}

async function sendScoreToOnlineDb(name, score, trophies, actor) {
  const pid = getOrCreatePlayerId();
  const secret = getOrCreatePlayerSecret();
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        name,
        score,
        trophies,
        actor,
        playerId: pid,
        playerSecret: secret
      })
    });

    if (res.ok) {
      isOnlineDbConnected = true;
      clearPendingSync();
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.scores)) {
        savePublicHighScoresList(data.scores);
        if (leaderboardScreen && leaderboardScreen.classList.contains('active')) {
          renderLeaderboardRows(data.scores);
        }
      }
    } else if (res.status === 409) {
      clearPendingSync();
      const errData = await res.json().catch(() => ({}));
      alert(errData.message || `Der Name „${name}“ wird bereits auf einem anderen Gerät genutzt!`);
      const fresh = generateRandomNickname();
      registerOrUpdatePlayerName(fresh, true);
    }
  } catch (e) {
    // Offline -> Score bleibt in der Offline-Queue (pendingSync) gesichert!
  }
}

// 🔒 Reserviert den Spitznamen atomar in der Online-Datenbank (Redis SET ... NX)
async function reserveNicknameOnline(name) {
  const clean = (name || '').trim();
  if (!isValidNickname(clean)) return { ok: false, error: 'Kein Zufalls-Name' };

  const pid = getOrCreatePlayerId();
  const secret = getOrCreatePlayerSecret();

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reserve_name',
        name: clean,
        playerId: pid,
        playerSecret: secret
      })
    });

    if (res.ok) {
      isOnlineDbConnected = true;
      return { ok: true, name: clean };
    }

    if (res.status === 409) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        conflict: true,
        message: data.message || `Der Spitzname „${clean}“ ist bereits auf einem anderen Gerät vergeben! Wähle bitte einen anderen aus 🎲.`
      };
    }
  } catch (e) {
    // Offline: lokal trotzdem erlauben
  }
  return { ok: true, offline: true, name: clean };
}

// 🗑️ Spitznamen löschen & freigeben
async function deleteNicknameOnline(name) {
  const clean = (name || currentPlayerName || '').trim();
  if (!clean) return;
  const confirmed = confirm(`Möchtest du deinen Spitznamen „${clean}“ wirklich löschen und für andere freigeben?`);
  if (!confirmed) return;

  initAudio();
  playSound('bounce');

  try {
    const pid = getOrCreatePlayerId();
    const secret = getOrCreatePlayerSecret();
    await fetch(`${getApiBaseUrl()}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_name', name: clean, playerId: pid, playerSecret: secret })
    });
  } catch (e) {}

  clearPendingSync();
  const list = loadPublicHighScores().filter(p => (p.name || '').toLowerCase() !== clean.toLowerCase());
  savePublicHighScoresList(list);

  const freshNick = generateRandomNickname();
  currentPlayerName = freshNick;
  trophiesData.playerName = freshNick;
  saveTrophies();

  if (playerNameInput) playerNameInput.value = freshNick;
  if (settingsNameInput) settingsNameInput.value = freshNick;
  if (currentUserBadge) currentUserBadge.textContent = freshNick;

  updateTrophyHud();
  if (leaderboardScreen && leaderboardScreen.classList.contains('active')) {
    showLeaderboard();
  }
  if (settingsScreen && settingsScreen.classList.contains('active')) {
    openSettingsScreen();
  }
}

function recordPublicHighScore(name, matchScore, totalTrophies, actorName, isTeam) {
  const cleanName = (name || currentPlayerName || 'Held 1').trim();
  const list = loadPublicHighScores();
  const s = Math.round((Number(matchScore) || 0) * 10) / 10;
  const t = Number(totalTrophies) || 0;
  if (s <= 0 && t <= 0) return list;

  const idx = list.findIndex(e => (e.name || '').trim().toLowerCase() === cleanName.toLowerCase());
  const now = Date.now();
  const resolvedActor = (actorName && typeof actors !== 'undefined' && actors[actorName]) ? actorName : 'katze';

  if (idx >= 0) {
    const prev = list[idx];
    list[idx] = {
      name: cleanName,
      score: Math.max(prev.score || 0, s),
      trophies: Math.max(prev.trophies || 0, t),
      actor: resolvedActor || prev.actor || 'katze',
      date: now
    };
  } else {
    list.push({
      name: cleanName,
      score: s,
      trophies: t,
      actor: resolvedActor,
      date: now
    });
  }

  savePublicHighScoresList(list);
  if (!isValidNickname(cleanName)) return list; // Alte/freie Namen nicht hochladen

  const pid = getOrCreatePlayerId();
  const secret = getOrCreatePlayerSecret();
  savePendingSync({ name: cleanName, score: s, trophies: t, actor: resolvedActor, date: now, playerId: pid, playerSecret: secret });
  sendScoreToOnlineDb(cleanName, s, t, resolvedActor);
  return list;
}

let trophyMode = false; // true = Pokal-Modus (immer 50 Leben, keine Pause), false = Normal
let normalLives = GAME_CONFIG.maxHits; // Eingestellte Leben für den normalen Modus
let pendingMode = null; // Merkt sich, ob gerade Solo oder Team-Modus angeklickt wurde
let currentPlayerName = ''; // Aktueller registrierter Benutzername

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
const modeRandomBtn = document.getElementById('modeRandomBtn');
const modeNicknameChips = document.getElementById('modeNicknameChips');

const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardList = document.getElementById('leaderboardList');
const charLeaderboardSection = document.getElementById('charLeaderboardSection');
const myTrophyBanner = document.getElementById('myTrophyBanner');
const leaderboardStartBtn = document.getElementById('leaderboardStartBtn');
const leaderboardOverBtn = document.getElementById('leaderboardOverBtn');
const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
const lbTabHighscore = document.getElementById('lbTabHighscore');
const lbTabTrophies = document.getElementById('lbTabTrophies');
const lbRollRandomBtn = document.getElementById('lbRollRandomBtn');
const lbDeleteNameBtn = document.getElementById('lbDeleteNameBtn');

const trophiesEl = document.getElementById('trophies');
const trophyHudEl = document.getElementById('trophyHud');
const trophyRewardMsgEl = document.getElementById('trophyRewardMsg');

// 👤 Willkommens-Registrierung & ⚙️ Einstellungen
const welcomeNameScreen = document.getElementById('welcomeNameScreen');
const welcomeNameInput = document.getElementById('welcomeNameInput');
const welcomeNameError = document.getElementById('welcomeNameError');
const welcomeNameSaveBtn = document.getElementById('welcomeNameSaveBtn');
const welcomeRandomBtn = document.getElementById('welcomeRandomBtn');
const welcomeNicknameChips = document.getElementById('welcomeNicknameChips');

const currentUserBadge = document.getElementById('currentUserBadge');
const settingsStartBtn = document.getElementById('settingsStartBtn');
const settingsScreen = document.getElementById('settingsScreen');
const settingsCurrentName = document.getElementById('settingsCurrentName');
const settingsNameInput = document.getElementById('settingsNameInput');
const settingsCooldownMsg = document.getElementById('settingsCooldownMsg');
const settingsNameSaveBtn = document.getElementById('settingsNameSaveBtn');
const settingsRandomBtn = document.getElementById('settingsRandomBtn');
const settingsNicknameChips = document.getElementById('settingsNicknameChips');
const settingsDeleteNameBtn = document.getElementById('settingsDeleteNameBtn');

const settingsFullscreenBtn = document.getElementById('settingsFullscreenBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const settingsStatsText = document.getElementById('settingsStatsText');
const savedStatsBadge = document.getElementById('savedStatsBadge');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// 🔄 Anonyme Pokal- & Punkt-Zahlen aus dem Browser-Speicher (localStorage) laden – bleiben beim Neuladen erhalten!
const TROPHY_STORAGE_KEY = 'lieberose_trophies_v2_reset';

function loadTrophies() {
  try {
    const raw = JSON.parse(localStorage.getItem(TROPHY_STORAGE_KEY) || '{}');
    const savedHigh = Math.max(
      Number(raw.highScore) || 0,
      parseInt(localStorage.getItem('lieberose_highscore') || '0', 10) || 0
    );
    return {
      total: Number(raw.total) || 0,
      solo: Number(raw.solo) || 0,
      team: Number(raw.team) || 0,
      totalScore: Number(raw.totalScore) || 0,
      highScore: savedHigh,
      nameChangedAt: Number(raw.nameChangedAt) || 0,
      playerName: typeof raw.playerName === 'string' ? raw.playerName.slice(0, 40) : '', // 👤 Gespeicherter Spielername
      actors: (raw.actors && typeof raw.actors === 'object') ? raw.actors : {}
    };
  } catch (e) {
    return { total: 0, solo: 0, team: 0, totalScore: 0, highScore: 0, nameChangedAt: 0, playerName: '', actors: {} };
  }
}

let trophiesData = loadTrophies();
if (trophiesData.highScore > highScore) {
  highScore = trophiesData.highScore;
  if (highScoreEl) highScoreEl.textContent = highScore;
}

let saveTrophiesTimer = null;

function flushSaveTrophies() {
  if (saveTrophiesTimer) {
    clearTimeout(saveTrophiesTimer);
    saveTrophiesTimer = null;
  }
  try {
    trophiesData.highScore = Math.max(Number(trophiesData.highScore) || 0, highScore || 0);
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(trophiesData));
    localStorage.setItem('lieberose_highscore', String(trophiesData.highScore));
  } catch (e) {}
  updateTrophyHud();
}

function saveTrophies(immediate = true) {
  if (immediate) {
    flushSaveTrophies();
    return;
  }
  if (!saveTrophiesTimer) {
    saveTrophiesTimer = setTimeout(() => {
      saveTrophiesTimer = null;
      flushSaveTrophies();
    }, 600);
  }
}

// Bei Tab-Schließen oder Seitenwechsel ausstehende Speicherungen sofort sichern
window.addEventListener('beforeunload', flushSaveTrophies);
window.addEventListener('pagehide', flushSaveTrophies);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSaveTrophies();
});

// 🎯 Speichert jeden erzielten Punkt & neuen Rekord im Browser (auch wenn man neu lädt!)
function addSavedScore(points) {
  const add = Number(points) || 0;
  if (add <= 0) return;
  trophiesData.totalScore = Math.round(((Number(trophiesData.totalScore) || 0) + add) * 10) / 10;
  if (score > highScore) {
    highScore = score;
    if (highScoreEl) highScoreEl.textContent = highScore;
  }
  trophiesData.highScore = Math.max(Number(trophiesData.highScore) || 0, highScore || 0);
  saveTrophies(false);
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

// ⏳ Namenssperre prüfen (0 Tage = jederzeit frei wählbar!)
function cooldownMsRemaining() {
  const days = GAME_CONFIG.nameChangeCooldownDays ?? 0;
  if (days <= 0 || !trophiesData.nameChangedAt) return 0;
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
  const clean = (name || '').trim() || 'Held (Gespeichert)';
  let entry = sessionPlayers.find(p => p.isMe);
  if (!entry) {
    entry = { name: clean, trophies: trophiesData.total || 0, region: '🌍 Dein Gerät', isMe: true };
    sessionPlayers.push(entry);
  } else {
    if (name && name.trim()) entry.name = name.trim();
    entry.trophies = trophiesData.total || 0;
  }
  return entry;
}

function registerOrUpdatePlayerName(newName, isInitial) {
  const clean = (newName || '').trim();
  if (!isValidNickname(clean)) return false; // 🛡️ Nur Zufalls-Namen, kein freier Text
  if (!isInitial && cooldownMsRemaining() > 0) return false;
  currentPlayerName = clean;
  trophiesData.playerName = clean; // 💾 bleibt im Browser, auch nach Tab-Schließen
  trophiesData.nameChangedAt = Date.now();
  getOrCreatePlayerEntry(clean);
  if (playerNameInput) playerNameInput.value = clean;
  if (currentUserBadge) currentUserBadge.textContent = clean;
  saveTrophies();
  // Auch in den öffentlichen Highscores registrieren
  recordPublicHighScore(clean, Math.max(trophiesData.highScore || 0, highScore || 0), trophiesData.total || 0, playerActor, teamMode);
  return true;
}

function activePlayerTrophies() {
  return Number(trophiesData.total) || 0;
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
  const totalPts = Number(trophiesData.totalScore) || 0;
  const bestRecord = Math.max(Number(trophiesData.highScore) || 0, highScore || 0);
  if (trophiesEl) trophiesEl.textContent = count;
  if (highScoreEl) highScoreEl.textContent = bestRecord;
  if (trophyHudEl) trophyHudEl.classList.toggle('active-trophy', trophyMode);
  if (playTrophyBtn) playTrophyBtn.textContent = `🏆 MIT POKALEN (${GAME_CONFIG.trophyLives} ❤️)`;
  if (leaderboardStartBtn) leaderboardStartBtn.textContent = `🏆 HIGHSCORES (${bestRecord} 🎯 · ${count} 🏆)`;
  if (currentUserBadge) currentUserBadge.textContent = currentPlayerName || 'Held 1';
  const summaryText = `🏆 ${count} Pokale · 🎯 ${totalPts} Gesamtpunkte · 🏅 Rekord: ${bestRecord}`;
  if (savedStatsBadge) savedStatsBadge.textContent = summaryText;
  if (settingsStatsText) settingsStatsText.textContent = summaryText;
  if (!isPlaying) refreshUnlockTiles();
}

// 👤 Beim Reinkommen ins Spiel: Namens-Eingabe öffnen mit Zufalls-Vorschlägen
function initWelcomeRegistration() {
  // 🛡️ Alte, selbst getippte Namen gibt es nicht mehr → neuen Zufalls-Namen wählen lassen
  if (trophiesData.playerName && !isValidNickname(trophiesData.playerName)) {
    trophiesData.playerName = '';
    currentPlayerName = '';
    trophiesData.nameChangedAt = 0;
  }
  // 💾 Gespeicherten Namen aus dem Browser zurückholen
  if (!currentPlayerName && trophiesData.playerName) {
    currentPlayerName = trophiesData.playerName;
    if (playerNameInput) playerNameInput.value = currentPlayerName;
    getOrCreatePlayerEntry(currentPlayerName);
    updateTrophyHud();
    // Spitznamen im Hintergrund online reservieren, falls noch nicht geschehen
    reserveNicknameOnline(currentPlayerName).then(res => {
      if (res && res.conflict) {
        const fresh = generateRandomNickname();
        registerOrUpdatePlayerName(fresh, true);
      }
    });
    return;
  }
  const hasSavedProgress = Boolean(
    trophiesData.nameChangedAt > 0 ||
    trophiesData.total > 0 ||
    trophiesData.totalScore > 0 ||
    highScore > 0
  );
  if (!currentPlayerName && !hasSavedProgress) {
    const randomNick = generateRandomNickname();
    if (welcomeNameInput) welcomeNameInput.value = randomNick;
    renderNicknameChips(welcomeNicknameChips, welcomeNameInput, (nick) => {
      if (welcomeNameInput) welcomeNameInput.value = nick;
    });
    if (welcomeNameScreen) welcomeNameScreen.classList.add('active');
    if (startScreen) startScreen.classList.remove('active');
  } else if (!currentPlayerName) {
    currentPlayerName = generateRandomNickname();
    trophiesData.playerName = currentPlayerName;
    getOrCreatePlayerEntry(currentPlayerName);
    updateTrophyHud();
  }
}

for (const inputEl of [welcomeNameInput, settingsNameInput, playerNameInput]) {
  if (!inputEl) continue;
  inputEl.addEventListener('keydown', (e) => {
    e.stopPropagation(); // Damit WASD & F beim Tippen normal funktionieren!
  });
}

if (welcomeNameInput) {
  welcomeNameInput.addEventListener('input', () => {
    if (welcomeNameInput.value.trim().length >= 2 && welcomeNameError) welcomeNameError.hidden = true;
  });
  welcomeNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && welcomeNameSaveBtn) welcomeNameSaveBtn.click();
  });
}

if (welcomeRandomBtn) {
  welcomeRandomBtn.addEventListener('click', () => {
    initAudio();
    playSound('bounce');
    renderNicknameChips(welcomeNicknameChips, welcomeNameInput, (nick) => {
      if (welcomeNameInput) welcomeNameInput.value = nick;
    });
  });
}

if (welcomeNameSaveBtn) {
  welcomeNameSaveBtn.addEventListener('click', async () => {
    initAudio();
    requestGameFullscreen();
    const val = (welcomeNameInput ? welcomeNameInput.value : '').trim() || generateRandomNickname();
    if (val.length < 2) {
      if (welcomeNameError) welcomeNameError.hidden = false;
      if (welcomeNameInput) welcomeNameInput.focus();
      return;
    }
    welcomeNameSaveBtn.disabled = true;
    const res = await reserveNicknameOnline(val);
    welcomeNameSaveBtn.disabled = false;

    if (!res.ok && res.conflict) {
      playSound('hit');
      alert(res.message);
      renderNicknameChips(welcomeNicknameChips, welcomeNameInput, (nick) => {
        if (welcomeNameInput) welcomeNameInput.value = nick;
      });
      return;
    }

    if (welcomeNameError) welcomeNameError.hidden = true;
    registerOrUpdatePlayerName(val, true);
    playSound('gem');
    if (welcomeNameScreen) welcomeNameScreen.classList.remove('active');
    if (startScreen) startScreen.classList.add('active');
  });
}

// ⚙️ Einstellungen im Hauptmenü öffnen
function openSettingsScreen() {
  initAudio();
  updateTrophyHud();
  if (settingsCurrentName) settingsCurrentName.textContent = currentPlayerName || 'Held 1';
  if (settingsNameInput) settingsNameInput.value = currentPlayerName || '';
  renderNicknameChips(settingsNicknameChips, settingsNameInput, (nick) => {
    if (settingsNameInput) settingsNameInput.value = nick;
  });
  const rem = currentPlayerName ? cooldownMsRemaining() : 0;
  if (rem > 0) {
    if (settingsNameInput) settingsNameInput.disabled = true;
    if (settingsNameSaveBtn) settingsNameSaveBtn.disabled = true;
    if (settingsRandomBtn) settingsRandomBtn.disabled = true;
    if (settingsCooldownMsg) {
      settingsCooldownMsg.textContent = `🔒 Du kannst deinen Namen erst in ${formatCooldownRemaining(rem)} wieder ändern!`;
      settingsCooldownMsg.className = 'cooldown-msg locked';
    }
  } else {
    if (settingsNameInput) settingsNameInput.disabled = false;
    if (settingsNameSaveBtn) settingsNameSaveBtn.disabled = false;
    if (settingsRandomBtn) settingsRandomBtn.disabled = false;
    if (settingsCooldownMsg) {
      settingsCooldownMsg.textContent = '✅ Du kannst deinen Spitznamen jederzeit frei ändern.';
      settingsCooldownMsg.className = 'cooldown-msg unlocked';
    }
  }
  if (startScreen) startScreen.classList.remove('active');
  if (settingsScreen) settingsScreen.classList.add('active');
}

if (settingsStartBtn) settingsStartBtn.addEventListener('click', openSettingsScreen);
if (settingsBackBtn) {
  settingsBackBtn.addEventListener('click', () => {
    if (settingsScreen) settingsScreen.classList.remove('active');
    if (startScreen) startScreen.classList.add('active');
  });
}

if (settingsRandomBtn) {
  settingsRandomBtn.addEventListener('click', () => {
    initAudio();
    playSound('bounce');
    renderNicknameChips(settingsNicknameChips, settingsNameInput, (nick) => {
      if (settingsNameInput) settingsNameInput.value = nick;
    });
  });
}

if (settingsNameSaveBtn) {
  settingsNameSaveBtn.addEventListener('click', async () => {
    initAudio();
    const rem = currentPlayerName ? cooldownMsRemaining() : 0;
    if (rem > 0) {
      playSound('hit');
      return;
    }
    const val = (settingsNameInput ? settingsNameInput.value : '').trim();
    if (val.length < 2) {
      if (settingsCooldownMsg) {
        settingsCooldownMsg.textContent = '👆 Bitte gib mindestens 2 Zeichen ein!';
        settingsCooldownMsg.className = 'cooldown-msg locked';
      }
      return;
    }

    settingsNameSaveBtn.disabled = true;
    const res = await reserveNicknameOnline(val);
    settingsNameSaveBtn.disabled = false;

    if (!res.ok && res.conflict) {
      playSound('hit');
      alert(res.message);
      renderNicknameChips(settingsNicknameChips, settingsNameInput, (nick) => {
        if (settingsNameInput) settingsNameInput.value = nick;
      });
      return;
    }

    registerOrUpdatePlayerName(val, false);
    playSound('gem');
    openSettingsScreen();
  });
}

// 💀 Leben für den normalen Modus einstellen
function setNormalLives(hits) {
  normalLives = hits;
  if (!trophyMode) GAME_CONFIG.maxHits = hits;
  const ht = document.getElementById('hitsText');
  if (ht) ht.textContent = hits;
  for (const b of document.querySelectorAll('#hitsChoice .hits-btn, #modeHitsChoice .hits-btn')) {
    b.classList.toggle('selected', Number(b.dataset.hits || b.textContent) === hits);
  }
  if (playNormalBtn) playNormalBtn.textContent = `🎮 NORMAL (${normalLives} ❤️ · MIT PAUSE)`;
}

function applyModeLives() {
  GAME_CONFIG.maxHits = trophyMode ? GAME_CONFIG.trophyLives : normalLives;
}

if (modeHitsChoice) {
  for (const hits of GAME_CONFIG.hitChoices) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hits-btn';
    btn.dataset.hits = hits;
    btn.textContent = hits;
    btn.addEventListener('click', () => setNormalLives(hits));
    modeHitsChoice.appendChild(btn);
  }
}
for (const btn of document.querySelectorAll('#hitsChoice .hits-btn')) {
  btn.addEventListener('click', () => setNormalLives(Number(btn.textContent)));
}
setNormalLives(normalLives);

if (playerNameInput) {
  playerNameInput.addEventListener('input', () => {
    if (playerNameInput.value.trim() && nameErrorMsg) nameErrorMsg.hidden = true;
  });
  playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') launchPendingMode(true);
  });
}

if (modeRandomBtn) {
  modeRandomBtn.addEventListener('click', () => {
    initAudio();
    playSound('bounce');
    renderNicknameChips(modeNicknameChips, playerNameInput, (nick) => {
      if (playerNameInput) playerNameInput.value = nick;
    });
  });
}

// 🎮 Öffnet die Auswahl „Mit Pokalen (50 Leben)“ oder „Normal (Leben einstellbar)“
function openModeChoice(choice) {
  initAudio();
  requestGameFullscreen();
  pendingMode = choice;
  setNormalLives(normalLives);
  if (nameErrorMsg) nameErrorMsg.hidden = true;
  if (currentPlayerName) {
    if (playerNameInput) playerNameInput.value = currentPlayerName;
    if (playerNameInput) playerNameInput.disabled = cooldownMsRemaining() > 0;
  } else {
    const fresh = generateRandomNickname();
    if (playerNameInput) playerNameInput.value = fresh;
    if (playerNameInput) playerNameInput.disabled = false;
  }
  renderNicknameChips(modeNicknameChips, playerNameInput, (nick) => {
    if (playerNameInput) playerNameInput.value = nick;
  });

  if (choice.type === 'solo') {
    const name = choice.actor;
    if (modeScreenTitle) modeScreenTitle.textContent = `${actorEmoji(name)} ${actors[name].name} · SOLO-MATCH`;
    if (modeScreenSub) modeScreenSub.textContent = `🏆 Pokal bei Sieg (${GAME_CONFIG.trophyLives} ❤️, 1 Match) · oder 🎮 Normal mit Pause!`;
  } else {
    if (modeScreenTitle) modeScreenTitle.textContent = '⚔️ TEAM-MODUS';
    if (modeScreenSub) modeScreenSub.textContent = `🏆 Pokal wenn alle 8 Level geschafft sind (${GAME_CONFIG.trophyLives} ❤️) · oder 🎮 Normal mit Pause!`;
  }
  if (startScreen) startScreen.classList.remove('active');
  if (modeScreen) modeScreen.classList.add('active');
}

function launchPendingMode(withTrophies) {
  initAudio();
  requestGameFullscreen();
  if (withTrophies) {
    const entered = (playerNameInput ? playerNameInput.value : currentPlayerName || '').trim();
    if (entered.length < 2) {
      if (nameErrorMsg) nameErrorMsg.hidden = false;
      if (playerNameInput) playerNameInput.focus();
      return;
    }
    if (!currentPlayerName || entered !== currentPlayerName) {
      registerOrUpdatePlayerName(entered, true);
    }
    if (nameErrorMsg) nameErrorMsg.hidden = true;
  }
  trophyMode = withTrophies;
  applyModeLives();
  updateTrophyHud();
  if (modeScreen) modeScreen.classList.remove('active');
  if (!pendingMode) return;
  if (pendingMode.type === 'solo') {
    startSoloGame(pendingMode.actor);
  } else {
    startNewTeamRun();
  }
}

if (playTrophyBtn) playTrophyBtn.addEventListener('click', () => launchPendingMode(true));
if (playNormalBtn) playNormalBtn.addEventListener('click', () => launchPendingMode(false));
if (modeBackBtn) {
  modeBackBtn.addEventListener('click', () => {
    if (modeScreen) modeScreen.classList.remove('active');
    if (startScreen) startScreen.classList.add('active');
  });
}

// 🏅 Am Ende eines Matches prüfen, ob es einen Pokal gibt!
function awardLevelTrophies(won) {
  if (!trophyMode) {
    if (trophyRewardMsgEl) trophyRewardMsgEl.hidden = true;
    return;
  }
  if (trophyRewardMsgEl) trophyRewardMsgEl.hidden = false;
  const totalLevels = levelList().length;
  const nr = currentLevel + 1;
  const isFinalLevel = currentLevel === totalLevels - 1;

  if (!won) {
    if (trophyRewardMsgEl) trophyRewardMsgEl.textContent = `🏆 Kein Pokal – du musst gewinnen, um den Pokal zu holen!`;
    return;
  }

  // Im Team-Modus gibt es den Pokal erst, wenn alle 8 Level geschafft sind!
  if (teamMode && !isFinalLevel) {
    if (trophyRewardMsgEl) trophyRewardMsgEl.textContent = `🏅 Level ${nr}/${totalLevels} geschafft! Schaff alle ${totalLevels} Level für den Pokal 🏆!`;
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

  const pEntry = getOrCreatePlayerEntry(currentPlayerName || 'Held 1');
  pEntry.trophies = trophiesData.total;

  saveTrophies();
  recordPublicHighScore(currentPlayerName, score, trophiesData.total, playerActor, teamMode);
  playSound('gem');
  if (trophyRewardMsgEl) {
    trophyRewardMsgEl.textContent = `🏆 +${gained} POKAL! ${pEntry.name.toUpperCase()} HAT JETZT ${pEntry.trophies} 🏆 IN DER RANGLISTE!`;
  }
}

// 🎭 Alte Charakter-Rangliste
function buildCharacterLeaderboardHtml() {
  if (typeof actors === 'undefined') return '';
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

// Namen sicher anzeigen (XSS-Schutz)
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Zeichnet die Ranglisten-Zeilen auf den Bildschirm
function renderLeaderboardRows(allScores) {
  const activeName = currentPlayerName || 'Held 1';
  const isHighscoreTab = lbActiveTab === 'highscores';

  if (lbTabHighscore) lbTabHighscore.classList.toggle('active', isHighscoreTab);
  if (lbTabTrophies) lbTabTrophies.classList.toggle('active', !isHighscoreTab);

  // 🧹 Nur echte Einträge: gültiger Zufalls-Name und mehr als 0 im gerade gewählten Tab
  const sorted = [...(allScores || [])]
    .filter(p => isValidNickname(p.name) && (Number(isHighscoreTab ? p.score : p.trophies) || 0) > 0)
    .sort((a, b) => isHighscoreTab
      ? (b.score - a.score) || (b.trophies - a.trophies)
      : (b.trophies - a.trophies) || (b.score - a.score));

  const maxVal = isHighscoreTab
    ? Math.max(1, sorted[0]?.score || 1)
    : Math.max(1, sorted[0]?.trophies || 1);

  const medals = ['🥇', '🥈', '🥉'];

  if (leaderboardList) {
    leaderboardList.innerHTML = sorted.length ? sorted.map((p, idx) => {
      const rank = medals[idx] || `#${idx + 1}`;
      const val = isHighscoreTab ? (p.score || 0) : (p.trophies || 0);
      const pct = Math.round((val / maxVal) * 100);
      const isMe = (p.name || '').trim().toLowerCase() === activeName.trim().toLowerCase();
      const actorKey = p.actor || 'katze';
      const emoji = (typeof actors !== 'undefined' && actors[actorKey]) ? actorEmoji(actorKey) : '🎮';
      const barColor = isMe ? '#ffde59' : (isHighscoreTab ? '#38bdf8' : '#a855f7');
      const primaryCount = isHighscoreTab
        ? `🎯 ${p.score || 0}`
        : `🏆 ${p.trophies || 0}`;
      const secondaryCount = isHighscoreTab
        ? `🏆 ${p.trophies || 0} Pokale`
        : `🎯 ${p.score || 0} Treffer`;

      return `<div class="lb-row ${idx === 0 && val > 0 ? 'lb-first' : ''} ${isMe ? 'lb-me' : ''}">` +
        `<span class="lb-rank">${rank}</span>` +
        `<span class="lb-emoji">${emoji}</span>` +
        `<div class="lb-info">` +
          `<div class="lb-name">${escapeHtml(p.name)}${isMe ? '<span class="lb-badge-me">DU ⭐</span>' : ''}</div>` +
          `<div class="lb-sub">${secondaryCount}</div>` +
          `<div class="lb-bar"><i style="width:${pct}%;background:${barColor}"></i></div>` +
        `</div>` +
        `<span class="lb-count">${primaryCount}</span>` +
      `</div>`;
    }).join('') : '<p class="my-trophy-sub">Noch keine Highscores eingetragen – spiel eine Runde und hol dir Platz 1! 🏆</p>';
  }
}

// 🌍 Öffentliche Rangliste bauen und anzeigen:
function showLeaderboard() {
  initAudio();
  const activeName = currentPlayerName || 'Held 1';
  const activeCount = activePlayerTrophies();
  const totalPts = Number(trophiesData.totalScore) || 0;
  const bestRecord = Math.max(Number(trophiesData.highScore) || 0, highScore || 0);

  // Eigene Daten im Highscore-Pool registrieren / aktualisieren
  if (bestRecord > 0 || activeCount > 0) {
    recordPublicHighScore(activeName, bestRecord, activeCount, playerActor, teamMode);
  }

  const liveBadge = isOnlineDbConnected ? ' · ☁️ Live-Cloud verbunden' : '';
  if (myTrophyBanner) {
    myTrophyBanner.innerHTML =
      `<div class="my-trophy-total">🎭 Spitzname: <b>${escapeHtml(activeName)}</b></div>` +
      `<div class="my-trophy-sub">🎯 Treffer-Rekord: <b>${bestRecord}</b> · 🏆 Pokale: <b>${activeCount}</b> · 🎯 Gesamtpunkte: <b>${totalPts}</b></div>` +
      `<div class="my-trophy-privacy">🔒 100% Datenschutz: Nur Zufalls-Spitznamen in der Rangliste!${liveBadge}</div>`;
  }

  renderLeaderboardRows(loadPublicHighScores());
  syncOnlineHighScores(); // Holt im Hintergrund die neuesten Cloud-Scores ab

  if (charLeaderboardSection) {
    charLeaderboardSection.innerHTML = buildCharacterLeaderboardHtml();
  }

  if (leaderboardScreen) leaderboardScreen.classList.add('active');
}

function hideLeaderboard() {
  if (leaderboardScreen) leaderboardScreen.classList.remove('active');
}

if (lbTabHighscore) {
  lbTabHighscore.addEventListener('click', () => {
    initAudio();
    lbActiveTab = 'highscores';
    showLeaderboard();
  });
}
if (lbTabTrophies) {
  lbTabTrophies.addEventListener('click', () => {
    initAudio();
    lbActiveTab = 'trophies';
    showLeaderboard();
  });
}
if (lbRollRandomBtn) {
  lbRollRandomBtn.addEventListener('click', async () => {
    initAudio();
    playSound('gem');
    lbRollRandomBtn.disabled = true;
    const suggestions = await fetchOrGenerate5Suggestions(currentPlayerName);
    let chosen = suggestions[0] || generateRandomNickname();
    const res = await reserveNicknameOnline(chosen);
    lbRollRandomBtn.disabled = false;
    if (res && res.conflict) {
      chosen = generateRandomNickname();
    }
    registerOrUpdatePlayerName(chosen, true);
    showLeaderboard();
  });
}
if (lbDeleteNameBtn) {
  lbDeleteNameBtn.addEventListener('click', () => deleteNicknameOnline(currentPlayerName));
}
if (settingsDeleteNameBtn) {
  settingsDeleteNameBtn.addEventListener('click', () => deleteNicknameOnline(currentPlayerName));
}

if (leaderboardStartBtn) leaderboardStartBtn.addEventListener('click', showLeaderboard);
if (leaderboardOverBtn) leaderboardOverBtn.addEventListener('click', showLeaderboard);
if (leaderboardBackBtn) leaderboardBackBtn.addEventListener('click', hideLeaderboard);

// 🌐 Wenn der Browser nach Offline-Phasen wieder online geht: Vormerkte Highscores sofort hochladen!
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOnlineHighScores();
    tryFlushPendingSync();
  });
  window.addEventListener('focus', tryFlushPendingSync);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryFlushPendingSync();
  });
}

updateTrophyHud();
initWelcomeRegistration();
syncOnlineHighScores();
