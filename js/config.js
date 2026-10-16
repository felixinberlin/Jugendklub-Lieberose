/**
 * ⚙️ config.js – Die Stellschrauben des Spiels
 *
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 * Wer nur etwas ausprobieren will, muss nur diese eine Datei ändern.
 */
const GAME_CONFIG = {
  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldSize: 70,
  cornEmoji: '🌽',
  cornSize: 74,
  cornBomb: '🟡',        // 🌽 Der Mais schießt kleine Maiskörner
  cornBombSize: 18,
  koboldBomb: '💰',      // 🧌 Der Kobold wirft einen Goldsack …
  koboldTrail: '🪙',     // … aus dem Goldmünzen purzeln
  katzeEmoji: '🐱',
  katzeSize: 70,
  katzeBomb: '🐟',       // 🐱 Die Katze wirft Fische
  mausEmoji: '🐭',
  mausSize: 58,
  mausBomb: '🧀', // Die Maus wirft Käse!
  goblinEmoji: '👺',
  goblinSize: 66,
  goblinBomb: '🔥', // Der Goblin wirft Feuer!
  musialaEmoji: '🏃', // Wird nur benutzt, wenn musialaShirt fehlt
  // 👕 Trikot! Farbe, Nummer, Schwarz-Rot-Gold-Streifen. Löschen = wieder Emoji.
  musialaShirt: { color: '#ffffff', number: '67', stripe: true, sixSeven: false }, // 🤲 true = 6-7-Jubel nach Treffern
  musialaRuns: true,     // 🏃 Musiala dribbelt von allein hin und her
  musialaRunSpeed: 1.5,  // 0.5 = gemütlich, 4 = Turbo-Sprint!
  musialaSize: 64,
  musialaBomb: '⚽', // Musiala schießt Fußbälle!
  dracheEmoji: '🐉',
  dracheSize: 72,
  dracheBomb: '🐾',      // 🐉 Tobis Drache macht eine scharfe Kratzspur!
  dracheBombSize: 38,
  dracheScratch: true,   // Malt glühende Krallen-Kratzer in die Luft

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Die angeklickte Figur wirft, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  // Eigene Wurfsachen pro Figur: <name>Bomb (Emoji), <name>BombSize (Größe),
  // <name>Trail (Emoji, das beim Fliegen herausfällt, z. B. koboldTrail: '🪙')
  // 🏅 Fünf Level, jedes schwerer (nur wenn man eine eigene Figur spielt)
  // throwMs = so oft wirft eine Computer-Figur (kleiner = frecher)
  // huntPlayer = wie oft sie auf DICH zielt statt auf ihr normales Ziel (0 = nie, 1 = immer)
  levels: [
    { title: 'Aufwärmen 🌱',       throwMs: 2600, huntPlayer: 0.05 },
    { title: 'Locker 🙂',          throwMs: 2200, huntPlayer: 0.15 },
    { title: 'Es wird wild 🔥',    throwMs: 1900, huntPlayer: 0.25 },
    { title: 'Richtig schwer 😤',  throwMs: 1800, huntPlayer: 0.3 },
    { title: 'Alle gegen dich 💀', throwMs: 1700, huntPlayer: 0.34 }
  ],
  // ⚔️ Team-Modus: Level 1 startet mit 1 Figur, jedes Level kommt 1 dazu (ab Level 6 alle!)
  // enemies = Anzahl Gegner, throwMs = so oft wirft JEDER Gegner.
  teamLevels: [
    { title: 'Erste Schlacht 🌱',  enemies: 2,  throwMs: 2200 },
    { title: 'Zu zweit 🙂',        enemies: 3,  throwMs: 2000 },
    { title: 'Zu dritt 🔥',        enemies: 4,  throwMs: 2300 },
    { title: 'Vierer-Bande 😤',    enemies: 5,  throwMs: 2800 },
    { title: 'Fünf Freunde 😱',    enemies: 6,  throwMs: 3200 },
    { title: 'Alle zusammen! 🪖',  enemies: 7,  throwMs: 3600 },
    { title: 'Chaos pur 🌪️',        enemies: 8,  throwMs: 4000 },
    { title: 'Endboss-Horde 💀',    enemies: 10, throwMs: 5000 }
  ],
  cpuThrowMs: 1800,      // 🤖 Wurf-Tempo der Computer, falls es keine Level gibt
  throwCooldownMs: 250,  // Mindestpause zwischen zwei Würfen derselben Figur
  playerMoveSpeed: 4.2,  // 🕹️ Bewegungs-Tempo mit Joystick / WASD
  // ⚡ Spezialkräfte (Knopf unten links) – specials.js
  specialChargeHits: 20,     // So oft musst du Gegner treffen, bis die Kraft bereit ist
  cpuSpecialChance: 0.5,     // Wenn aufgeladen: wie oft Computer statt zu werfen ihre Kraft nutzen
  bigBall: { size: 80, damage: 6, speed: 7, seconds: 5 }, // ⚽ Musialas Riesenball
  miniKobolds: { count: 3, seconds: 5 },                    // 🧌 Mini-Kobolde
  catStunSeconds: 4,                                        // 🐱🌪️ So lange ist der Gegner gefangen
  catDamage: 4,                                              // 🐱 Schaden beim Draufspringen
  hideSeconds: 6,                                           // 🐭🕳️ So lange ist die Maus versteckt
  popcorn: { count: 10, damage: 1, size: 26 },              // 🌽🍿 Popcorn-Regen
  fireSpear: { damage: 4, speed: 12, burnSeconds: 3, burnDamage: 1, burnEveryMs: 500 }, // 👺🔥 Feuerspeer
  dragonBite: { damage: 6, stunSeconds: 1.5 },              // 🐉🦷 Tobis Drachenbiss
  maxHits: 20, // 💀 So viele Treffer hält eine Figur im normalen Modus aus
  trophyLives: 100, // 🏆 Im Pokal-Modus hat jede Figur immer 100 Leben!
  hitChoices: [5, 10, 20, 50], // Zum Auswählen im normalen Modus
  maxPixelRatio: 2, // 🚀 Tempo: höchstens 2-fache Pixeldichte (3 = schärfer, aber langsamer)
  maxParticles: 300, // 🚀 Tempo: höchstens so viele Funken gleichzeitig
  dragThreshold: 8, // Kleine Fingerbewegungen zählen weiterhin als Antippen.

  // 🌲 Wald & Bäume Hintergrund (Lieberoser Zauberwald)
  forestTheme: true,
  dayMode: true,        // true = ☀️ Tag, false = 🌙 Nacht
  moonEmoji: '🌙',
  sunEmoji: '☀️',

  // 🌧️ Regen & wachsende Bäume (nur bei Tag)
  // Wolke antippen = sie regnet. Sonne antippen = Nacht, Mond antippen = Tag.
  rain: false,              // true = alle Wolken regnen immer
  rainSeconds: 8,           // So lange regnet eine angetippte Wolke
  rainAmount: 0.16,         // Sanfter, flüssiger Regen ohne Lag
  treeChance: 0.02,         // Wie oft ein Tropfen einen Samen pflanzt (0.2 = Turbo-Wald)
  treeGrowSeconds: 12,      // So lange braucht ein Samen bis zum großen Baum
  treeMaxSize: 64,
  maxGrowingTrees: 14,
  treeEmojis: ['🌳', '🌲', '🌴', '🍄']
};
