/**
 * ⚙️ config.js – Die Stellschrauben des Spiels
 *
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 * Wer nur etwas ausprobieren will, muss nur diese eine Datei ändern.
 */
const GAME_CONFIG = {
  // 🙂 Normale Figuren-Ansicht überall in jedem Modus (wie am Anfang!)
  proSkins: false,
  scarySkins: false,
  soloEnemies: 5, // 🎯 Im Solo-Modus (Rangliste & Normal) gibt es immer genau 5 Gegner!

  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldSize: 70,
  cornEmoji: '🌽',
  cornSize: 74,
  cornBomb: '🟡',        // 🌽 Der Mais schießt einzelne Maiskörner
  cornBombSize: 18,
  koboldBomb: '💰',      // 🧌 Der Kobold wirft einen Goldsack …
  koboldTrail: '🪙',     // … aus dem Goldmünzen purzeln
  katzeEmoji: '🐱',
  katzeSize: 70,
  katzeBomb: '🐟',       // 🐱 Die Katze wirft Fische
  mausEmoji: '🐭',
  mausSize: 60,
  mausBomb: '🧀',        // 🐭 Die Maus wirft Käse!
  goblinEmoji: '👺',
  goblinSize: 68,
  goblinBomb: '🔥',      // 👺 Der Goblin wirft Feuer!
  musialaEmoji: '⚽',
  // 👕 Musiala / GOAT trägt das Trikot mit der Nummer 10!
  musialaShirt: { color: '#111827', number: '10', numberColor: '#facc15', shorts: '#1e293b', head: '⚽', stripe: true, sixSeven: false },
  musialaRuns: true,     // 🏃 Dribbelt über das Feld
  musialaRunSpeed: 2.2,
  musialaSize: 66,
  musialaBomb: '⚽',
  // ⚽🌟 Lamine Yamal (#19)
  yamalEmoji: '🌟',
  yamalShirt: { color: '#dc2626', number: '19', numberColor: '#facc15', shorts: '#1d4ed8', head: '🌟', stripe: false, sixSeven: false },
  yamalRuns: true,
  yamalRunSpeed: 2.35,
  yamalSize: 65,
  yamalBomb: '⚽',
  dracheEmoji: '🐉',
  dracheSize: 74,
  dracheBomb: '🐾',      // 🐉 Tobis Drache macht eine scharfe Kratzspur!
  dracheBombSize: 38,
  dracheScratch: true,   // Malt glühende Krallen-Kratzer in die Luft
  zeusEmoji: '🧔🏼‍♂️',     // 🧔🏼‍♂️ Zeus hat jetzt ein echtes Zeus-Logo (kein Blitz als Figur)!
  zeusSize: 74,
  zeusBomb: '⚡',        // ⚡ Zeus schleudert gezackte Blitze!
  zeusBombSize: 38,
  zeusBolt: true,        // Malt echte leuchtende Zickzack-Blitze
  zeusUnlockTrophies: 40, // 🔒 Für Zeus braucht man 40 Pokale!

  // 🤝KOMBO: 15 Treffer im Team!
  comboChargeHits: 15,
  yamalMusialaCombo: { balls: 14, damage: 3, size: 42 },
  yamalShot: { damage: 6, speed: 9.5, size: 54 },

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Die angeklickte Figur wirft, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  // 🏅 Solo-Modus hat jetzt 1 direktes Match (keine Level-Anzeige im Solo-Modus)
  levels: [
    { title: 'Arena-Match ⚡', throwMs: 1200, huntPlayer: 0.38 }
  ],
  // ⚔️ Team-Modus: 8 Level mit immer mehr Gegnern!
  teamLevels: [
    { title: 'Erste Schlacht 🌱',  enemies: 2,  throwMs: 1550 },
    { title: 'Zu zweit 🙂',        enemies: 3,  throwMs: 1450 },
    { title: 'Zu dritt 🔥',        enemies: 4,  throwMs: 1650 },
    { title: 'Vierer-Bande 😤',    enemies: 5,  throwMs: 1950 },
    { title: 'Fünf Freunde 😱',    enemies: 6,  throwMs: 2200 },
    { title: 'Alle zusammen! 🪖',  enemies: 7,  throwMs: 2500 },
    { title: 'Chaos pur 🌪️',        enemies: 8,  throwMs: 2800 },
    { title: 'Endboss-Horde 💀',    enemies: 10, throwMs: 3300 }
  ],
  cpuThrowMs: 1200,      // 🤖 Schnelleres Wurf-Tempo der Bots
  throwCooldownMs: 240,  // Mindestpause zwischen zwei Würfen derselben Figur
  playerMoveSpeed: 4.4,  // 🕹️ Bewegungs-Tempo mit Joystick / WASD
  // ⚡ Spezialkräfte – specials.js (15 Treffer statt 20!)
  specialChargeHits: 15,     // So oft musst du Gegner treffen, bis die Kraft bereit ist
  cpuSpecialChance: 0.68,    // Bots nutzen ihre Spezialkraft öfter!
  bigBall: { size: 80, damage: 10, speed: 7.5, seconds: 5 }, // ⚽ Fußballer/GOAT: Großerball 10 Schaden
  miniKobolds: { count: 3, seconds: 5 },                    // 🧌 3 kleine Kobolde bleiben 5 Sekunden um ihn
  catStunSeconds: 4,                                        // 🐱🌪️ Katze: Wirbelsturm betäubt Gegner 4 Sekunden
  catDamage: 5,                                             // 🐱 Wirbelsturm macht 5 Schaden
  hideSeconds: 6,                                           // 🐭🕳️ Maus: Versteckt sich im Loch für 6 Sekunden
  popcorn: { count: 5, damage: 4, size: 28 },               // 🌽🍿 Mais: Schmeißt 5 Popcorn, pro Popcorn 4 Schaden
  fireSpear: { damage: 10, speed: 12, burnSeconds: 3, burnDamage: 1, burnEveryMs: 500 }, // 👺🔱 Goblin: Dreizack macht 10 Schaden
  dragonBite: { damage: 14, stunSeconds: 1.5 },              // 🐉🦷 Tobis Drachenbiss
  zeusStorm: { radius: 82, seconds: 4, strikeEveryMs: 360, damage: 5 }, // ⚡🌩️ Zeus: Blitzregen pro Treffer 5 Schaden!
  yamalStar: { damage: 12, speed: 8.5, size: 48 },          // 🌟💥 Yamal: Stern explodiert in der Mitte & fügt zufälligem Spieler 12 Schaden zu
  maxHits: 20, // 💀 Treffer im normalen Modus (wenn benutzerdefiniert angepasst)
  trophyLives: 50, // 🏆 Pokal-Modus nutzt die exakten Charakter-Leben!
  nameChangeCooldownDays: 7, // 🔒 Name erst nach 7 Tagen wieder änderbar!
  hitChoices: [5, 10, 20, 50], // Zum Auswählen im normalen Modus
  mapScale: 0.72, // 🗺️ Größere Map & bessere Übersicht in der Runde
  maxPixelRatio: 2, // 🚀 Tempo: höchstens 2-fache Pixeldichte
  maxParticles: 300, // 🚀 Tempo: höchstens so viele Funken gleichzeitig
  dragThreshold: 8, // Kleine Fingerbewegungen zählen weiterhin als Antippen.

  // 🌲 Wald & Bäume Hintergrund (Lieberoser Zauberwald)
  forestTheme: true,
  dayMode: true,        // true = ☀️ Tag, false = 🌙 Nacht
  moonEmoji: '🌙',
  sunEmoji: '☀️',

  // 🌧️ Regen & wachsende Bäume (nur bei Tag)
  rain: false,              // true = alle Wolken regnen immer
  rainSeconds: 8,           // So lange regnet eine angetippte Wolke
  rainAmount: 0.16,         // Sanfter, flüssiger Regen ohne Lag
  treeChance: 0.02,         // Wie oft ein Tropfen einen Samen pflanzt (0.2 = Turbo-Wald)
  treeGrowSeconds: 12,      // So lange braucht ein Samen bis zum großen Baum
  treeMaxSize: 64,
  maxGrowingTrees: 14,
  treeEmojis: ['🌳', '🌲', '🌴', '🍄']
};

/**
 * 📊 CHAR_STATS – Individuelle Werte für jeden Charakter!
 * - hp: Basis-Leben im Ranglisten-/Pokal-Modus
 * - attackDamage: Schaden pro normalem Treffer
 * - attackCooldown: Angriffs-Pause in Sekunden (auf Schieß-Knopf angezeigt!)
 * - abilityDamage: Schaden der Spezialfähigkeit
 * - speed: Bewegungs-Tempo
 */
const CHAR_STATS = {
  musiala: { // Fußballer / GOAT
    name: 'Fußballer',
    hp: 100,
    attackDamage: 4,
    attackCooldown: 1.2, // 4/1.2s
    abilityDamage: 10,   // Großerball: 10 Schaden
    speed: 1.0           // 1.0 speed (normal schnell)
  },
  kobold: {
    name: 'Kobold',
    hp: 120,
    attackDamage: 3,
    attackCooldown: 1.0, // 3/1.0s
    abilityDamage: 8,    // 3 Mini-Kobolde
    speed: 1.0           // 1.0 speed (normal schnell)
  },
  corn: {
    name: 'Mais',
    hp: 100,
    attackDamage: 2,
    attackCooldown: 0.5, // 2/0.5s
    abilityDamage: 20,   // 5 Popcorn je 4 Schaden
    speed: 1.2           // 1.2 speed
  },
  maus: {
    name: 'Maus',
    hp: 105,
    attackDamage: 3,
    attackCooldown: 0.9, // 3/0.9s
    abilityDamage: 0,    // 6s im Loch
    speed: 1.5           // 1.5 speed
  },
  katze: {
    name: 'Katze',
    hp: 110,
    attackDamage: 5,
    attackCooldown: 1.5, // 5/1.5s
    abilityDamage: 5,    // Wirbelsturm: 5 Schaden + 4s Stun
    speed: 1.2           // 1.2 speed
  },
  goblin: {
    name: 'Goblin',
    hp: 100,
    attackDamage: 4,
    attackCooldown: 1.4, // 4/1.4s
    abilityDamage: 10,   // Dreizack: 10 Schaden
    speed: 1.4           // 1.4 speed
  },
  zeus: {
    name: 'Zeus',
    hp: 130,
    attackDamage: 7,
    attackCooldown: 2.3, // 7/2.3s
    abilityDamage: 25,   // Blitzregen: pro Blitz 5 Schaden
    speed: 1.5           // 1.5 speed
  },
  yamal: {
    name: 'Lamine Yamal',
    hp: 105,
    attackDamage: 4,
    attackCooldown: 1.4, // 4/1.4s
    abilityDamage: 12,   // Sternen-Explosion in der Mitte: 12 Schaden
    speed: 1.3           // 1.3 speed
  },
  drache: {
    name: 'Drache',
    hp: 130,
    attackDamage: 6,
    attackCooldown: 1.6,
    abilityDamage: 14,
    speed: 0.85
  }
};

function getCharStat(name, stat) {
  const k = (typeof kindOf === 'function' ? kindOf(name) : name) || name;
  const cfg = CHAR_STATS[k] || CHAR_STATS.musiala;
  return cfg ? cfg[stat] : undefined;
}
