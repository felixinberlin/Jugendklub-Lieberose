/**
 * ⚙️ config.js – Die Stellschrauben des Spiels
 *
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 * Wer nur etwas ausprobieren will, muss nur diese eine Datei ändern.
 */
const GAME_CONFIG = {
  // 😈 Düstere Horror-/Battle-Skins für alle Figuren (true = gruseliger Pro-Skin statt Kinder-Emoji)
  scarySkins: true,
  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldSize: 70,
  cornEmoji: '🌽',
  cornSize: 74,
  cornBomb: '🟡',        // 🌽 Der Mais schießt scharfe Glut-Körner
  cornBombSize: 18,
  koboldBomb: '💰',      // 🧌 Der Kobold wirft einen verfluchten Goldsack …
  koboldTrail: '🪙',     // … aus dem Goldmünzen purzeln
  katzeEmoji: '🐈‍⬛',
  katzeSize: 70,
  katzeBomb: '🐟',       // 🐈‍⬛ Die Schatten-Katze wirft Knochen-Fische
  mausEmoji: '🐀',
  mausSize: 60,
  mausBomb: '🧀',        // 🐀 Die Seuchen-Ratte wirft Gift-Käse!
  goblinEmoji: '👹',
  goblinSize: 68,
  goblinBomb: '🔥',      // 👹 Der Höllen-Goblin wirft Höllenfeuer!
  musialaEmoji: '🐐',    // Wird nur benutzt, wenn musialaShirt fehlt
  // 👕 GOAT trägt jetzt das schwarze Elite-Trikot mit der Nummer 10!
  musialaShirt: { color: '#111827', number: '10', numberColor: '#facc15', shorts: '#7f1d1d', head: '🐐', stripe: true, sixSeven: false },
  musialaRuns: true,     // 🏃 GOAT sprintet über das Feld
  musialaRunSpeed: 2.2,  // Schneller Pro-Sprint!
  musialaSize: 66,
  musialaBomb: '⚽',     // GOAT schießt Power-Fußbälle!
  dracheEmoji: '🐉',
  dracheSize: 74,
  dracheBomb: '🐾',      // 🐉 Tobis Nacht-Drache macht eine scharfe Kratzspur!
  dracheBombSize: 38,
  dracheScratch: true,   // Malt glühende Krallen-Kratzer in die Luft
  zeusEmoji: '⚡',
  zeusSize: 74,
  zeusBomb: '⚡',        // ⚡ Zeus schleudert gezackte Blitze!
  zeusBombSize: 38,
  zeusBolt: true,        // Malt echte leuchtende Zickzack-Blitze
  zeusUnlockTrophies: 40, // 🔒 Für Zeus braucht man 40 Pokale!

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Die angeklickte Figur wirft, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  // 🏅 Fünf Level – Bots schießen jetzt viel schneller und zielen schlauer!
  levels: [
    { title: 'Aufwärmen ⚡',       throwMs: 1650, huntPlayer: 0.22 },
    { title: 'Schlaue Bots 😈',    throwMs: 1350, huntPlayer: 0.32 },
    { title: 'Pro-Arena 🔥',       throwMs: 1150, huntPlayer: 0.42 },
    { title: 'Alptraum 😤',        throwMs: 980,  huntPlayer: 0.50 },
    { title: 'Endstufe 💀',        throwMs: 850,  huntPlayer: 0.58 }
  ],
  // ⚔️ Team-Modus: schnellere, stärkere Gegner-Bots!
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
  // ⚡ Spezialkräfte – specials.js
  specialChargeHits: 20,     // So oft musst du Gegner treffen, bis die Kraft bereit ist
  cpuSpecialChance: 0.68,    // Bots nutzen ihre Spezialkraft jetzt öfter!
  bigBall: { size: 80, damage: 6, speed: 7.5, seconds: 5 }, // ⚽ GOATs Riesenball
  miniKobolds: { count: 3, seconds: 5 },                    // 🧌 Mini-Kobolde
  catStunSeconds: 4,                                        // 🐈‍⬛🌪️ So lange ist der Gegner gefangen
  catDamage: 4,                                              // 🐈‍⬛ Schaden beim Draufspringen
  hideSeconds: 6,                                           // 🐀🕳️ So lange ist die Maus versteckt
  popcorn: { count: 10, damage: 1, size: 26 },              // 🌽🍿 Popcorn-Regen
  fireSpear: { damage: 4, speed: 12, burnSeconds: 3, burnDamage: 1, burnEveryMs: 500 }, // 👹🔥 Feuerspeer
  dragonBite: { damage: 6, stunSeconds: 1.5 },              // 🐉🦷 Tobis Drachenbiss
  zeusStorm: { radius: 82, seconds: 4, strikeEveryMs: 360, damage: 2 }, // ⚡🌩️ Zeus: 4 Sek. Blitz-Regen im roten Kreis!
  maxHits: 20, // 💀 So viele Treffer hält eine Figur im normalen Modus aus
  trophyLives: 50, // 🏆 Im Pokal-Modus hat jede Figur 50 Leben!
  hitChoices: [5, 10, 20, 50], // Zum Auswählen im normalen Modus
  mapScale: 0.72, // 🗺️ Größere Map & bessere Übersicht in der Runde (kleiner = weiter rausgezoomt)
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
