/**
 * 🏆 api/highscores.js – Vercel Serverless Function für Upstash Redis KV
 *
 * - 100 Adjektive × 100 Nomen × 30 Emojis = 300.000 einzigartige Zufalls-Kombinationen.
 * - Atomare Reservierung mit Redis `SET nickname:<normName> <playerId> NX`.
 * - Interne Identifikation über geheime Spieler-Credentials (playerId + playerSecret).
 * - Generiert 5 verifizierte, freie Namens-Vorschläge auf Knopfdruck.
 * - Unterstützt Offline-Queue, Namens-Löschung und Download-Version (CORS).
 */

const fs = require('fs');

// --- 4 kuratierte Wortlisten für den Zufalls-Namensgenerator ---
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

// 50 passende, bunte Emojis
const NICKNAME_EMOJIS = [
  '⚡', '🚀', '🔥', '❄️', '🥷', '👑', '⭐', '🎮', '💎', '🏆',
  '🦁', '🐺', '🐉', '⚽', '🌽', '🐱', '🐭', '👺', '🧌', '🦅',
  '🛡️', '🌪️', '🦊', '🎯', '✨', '🐾', '💥', '🛸', '🦖', '⚔️',
  '🍕', '🍪', '🍿', '🍩', '🍌', '🥔', '🥒', '🧦', '🦆', '🐧',
  '🦥', '🦙', '🦦', '🦄', '🤖', '👾', '🌈', '🧨', '🎉', '💨'
];

function generateCandidateNickname() {
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

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    if (fs.existsSync('vercel.env')) {
      const content = fs.readFileSync('vercel.env', 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const idx = line.indexOf('=');
        if (idx > 0 && line.slice(0, idx).trim() === key) {
          let v = line.slice(idx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          return v;
        }
      }
    }
  } catch (e) {}
  return null;
}

const REDIS_URL = getEnv('KV_REST_API_URL') || getEnv('UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = getEnv('KV_REST_API_TOKEN') || getEnv('UPSTASH_REDIS_REST_TOKEN');

async function redisExec(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('KV_REST_API_URL oder KV_REST_API_TOKEN nicht konfiguriert');
  }
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command, ...args])
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// Authentifiziert den Spieler über sein privates Secret
async function verifyPlayerAuth(playerId, playerSecret) {
  if (!REDIS_URL || !REDIS_TOKEN) return true; // Lokaler Modus ohne DB
  if (!playerId || !playerSecret) return false;

  const key = `player_secret:${playerId}`;
  const stored = await redisExec('GET', key);
  if (!stored) {
    // Neuer Spieler: Secret atomar hinterlegen
    await redisExec('SET', key, playerSecret, 'NX');
    return true;
  }
  return stored === playerSecret;
}

// Holt 5 freie, verfügbare Zufalls-Namen
async function getUniqueSuggestions(count = 5) {
  const suggestions = [];
  const tried = new Set();
  let attempts = 0;

  while (suggestions.length < count && attempts < 40) {
    attempts++;
    const candidate = generateCandidateNickname();
    if (tried.has(candidate)) continue;
    tried.add(candidate);

    if (REDIS_URL && REDIS_TOKEN) {
      const norm = candidate.toLowerCase();
      const exists = await redisExec('EXISTS', `nickname:${norm}`);
      if (Number(exists) === 1) continue; // Bereits von jemandem reserviert
    }
    suggestions.push(candidate);
  }

  // Fallback, falls DB nicht antwortet oder Set voll ist
  while (suggestions.length < count) {
    suggestions.push(generateCandidateNickname());
  }

  return suggestions;
}

// Holt die Top 20 Highscores aus Redis
async function getTopScores(limit = 20) {
  if (!REDIS_URL || !REDIS_TOKEN) return [];

  const rawPairs = await redisExec('ZREVRANGE', 'fightzone_scores', 0, limit - 1, 'WITHSCORES');
  if (!Array.isArray(rawPairs) || rawPairs.length === 0) return [];

  const players = [];
  const names = [];
  for (let i = 0; i < rawPairs.length; i += 2) {
    const name = rawPairs[i];
    const score = Number(rawPairs[i + 1]) || 0;
    players.push({ name, score, trophies: 0, actor: 'katze', date: Date.now() });
    names.push(name);
  }

  try {
    if (names.length > 0) {
      const metaList = await redisExec('HMGET', 'fightzone_meta', ...names);
      if (Array.isArray(metaList)) {
        for (let i = 0; i < players.length; i++) {
          if (metaList[i]) {
            try {
              const meta = JSON.parse(metaList[i]);
              if (meta.trophies) players[i].trophies = Number(meta.trophies) || 0;
              if (meta.actor) players[i].actor = meta.actor;
              if (meta.date) players[i].date = meta.date;
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {
    console.warn('Metadaten konnten nicht geladen werden:', e.message);
  }

  return players;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.query?.action || (req.body && req.body.action) || 'get';

    // --- GET /api/highscores (mit Option ?action=suggestions) ---
    if (req.method === 'GET') {
      if (action === 'suggestions') {
        const suggestions = await getUniqueSuggestions(5);
        return res.status(200).json({ ok: true, suggestions });
      }
      const scores = await getTopScores(20);
      return res.status(200).json({ ok: true, scores });
    }

    // --- POST Aktionen ---
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const postAction = body.action || 'submit';

      // 1. Namens-Vorschläge anfordern
      if (postAction === 'suggestions') {
        const suggestions = await getUniqueSuggestions(5);
        return res.status(200).json({ ok: true, suggestions });
      }

      const playerId = String(body.playerId || '').trim();
      const playerSecret = String(body.playerSecret || '').trim();

      if (!playerId || playerId.length < 6 || !playerSecret || playerSecret.length < 8) {
        return res.status(400).json({ ok: false, error: 'Ungültige Spieler-Zugangsdaten (playerId & playerSecret erforderlich).' });
      }

      // Private Zugangsdaten prüfen
      const isAuthValid = await verifyPlayerAuth(playerId, playerSecret);
      if (!isAuthValid) {
        return res.status(401).json({ ok: false, error: 'UNAUTHORIZED', message: 'Zugriff verweigert (falsches playerSecret für diese playerId).' });
      }

      const rawName = String(body.name || '').trim();
      if (rawName.length < 2 || rawName.length > 36) {
        return res.status(400).json({ ok: false, error: 'Name muss 2 bis 36 Zeichen lang sein.' });
      }

      const cleanName = rawName.replace(/[<>"']/g, ''); // XSS-Schutz
      const normName = cleanName.toLowerCase();

      // --- AKTION: Namen löschen / freigeben ---
      if (postAction === 'delete_name') {
        if (REDIS_URL && REDIS_TOKEN) {
          const owner = await redisExec('GET', `nickname:${normName}`);
          if (owner === playerId) {
            await redisExec('DEL', `nickname:${normName}`);
            await redisExec('DEL', `player_current_name:${playerId}`);
            await redisExec('HDEL', 'fightzone_meta', cleanName);
            await redisExec('ZREM', 'fightzone_scores', cleanName);
            await redisExec('ZREM', 'fightzone_trophies', cleanName);
          }
        }
        const suggestions = await getUniqueSuggestions(5);
        const scores = await getTopScores(20);
        return res.status(200).json({ ok: true, deleted: true, suggestions, scores });
      }

      // --- AKTION: Namen reservieren oder Score eintragen ---
      // Atomare Reservierung mit Redis SET ... NX
      if (REDIS_URL && REDIS_TOKEN) {
        const setNxResult = await redisExec('SET', `nickname:${normName}`, playerId, 'NX');
        let hasOwnership = (setNxResult === 'OK');

        if (!hasOwnership) {
          const currentOwner = await redisExec('GET', `nickname:${normName}`);
          if (currentOwner === playerId) {
            hasOwnership = true; // Gehört bereits diesem Spieler
          }
        }

        if (!hasOwnership) {
          return res.status(409).json({
            ok: false,
            error: 'NAME_TAKEN',
            message: `Der Spitzname „${cleanName}“ ist bereits belegt! Wähle bitte einen anderen aus 🎲.`
          });
        }

        // Alten Namen dieses Spielers freigeben, falls er sich umbenannt hat
        const prevName = await redisExec('GET', `player_current_name:${playerId}`);
        if (prevName && prevName.toLowerCase() !== normName) {
          await redisExec('DEL', `nickname:${prevName.toLowerCase()}`);
          await redisExec('HDEL', 'fightzone_meta', prevName);
          await redisExec('ZREM', 'fightzone_scores', prevName);
          await redisExec('ZREM', 'fightzone_trophies', prevName);
        }
        await redisExec('SET', `player_current_name:${playerId}`, cleanName);

        // Score eintragen (nur bei 'submit')
        if (postAction === 'submit') {
          const rawScore = Number(body.score) || 0;
          const rawTrophies = Number(body.trophies) || 0;
          const rawActor = String(body.actor || 'katze').slice(0, 20);

          if (rawScore < 0 || rawScore > 500) {
            return res.status(400).json({ ok: false, error: 'Ungültiger Score.' });
          }

          const score = Math.round(rawScore * 10) / 10;
          const trophies = Math.max(0, Math.min(200, Math.floor(rawTrophies)));

          // ZADD mit GT: Aktualisiert nur, wenn höherer Rekord
          await redisExec('ZADD', 'fightzone_scores', 'GT', score, cleanName);
          if (trophies > 0) {
            await redisExec('ZADD', 'fightzone_trophies', 'GT', trophies, cleanName);
          }

          const metaJson = JSON.stringify({
            trophies,
            actor: rawActor,
            date: Date.now()
          });
          await redisExec('HSET', 'fightzone_meta', cleanName, metaJson);
        }
      }

      const scores = await getTopScores(20);
      return res.status(200).json({ ok: true, reserved: true, saved: postAction === 'submit', name: cleanName, scores });
    }

    return res.status(405).json({ ok: false, error: 'Methode nicht erlaubt' });
  } catch (err) {
    console.error('API-Fehler:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
