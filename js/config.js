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
  katzeEmoji: '🐱',
  katzeSize: 70,
  mausEmoji: '🐭',
  mausSize: 58,
  mausBomb: '🧀', // Die Maus wirft Käse!
  goblinEmoji: '👺',
  goblinSize: 66,
  goblinBomb: '🔥', // Der Goblin wirft Feuer!
  musialaEmoji: '🏃', // Wird nur benutzt, wenn musialaShirt fehlt
  // 👕 Trikot! Farbe, Nummer, Schwarz-Rot-Gold-Streifen. Löschen = wieder Emoji.
  musialaShirt: { color: '#ffffff', number: '67', stripe: true, sixSeven: true }, // 🤲 6-7!
  musialaRuns: true,     // 🏃 Musiala dribbelt von allein hin und her
  musialaRunSpeed: 1.5,  // 0.5 = gemütlich, 4 = Turbo-Sprint!
  musialaSize: 64,
  musialaBomb: '⚽', // Musiala schießt Fußbälle!

  // 🧪 PHYSIK-WERTE (Kinder können das live rufen!)
  gravityY: 0.9,          // 0.2 = Mond, 1.0 = Erde, 2.5 = Riesen-Schwerkraft!
  restitution: 0.85,      // Flummi-Effekt! (0.0 = Blei, 0.95 = Mega-Flummi)
  frictionAir: 0.015,     // Luftwiderstand

  // Die angeklickte Figur wirft, ganz ohne Gegenstände vom Himmel.
  bombEmoji: '💣',
  bombSize: 36,
  // Eigene Wurfsachen pro Figur? z. B. katzeBomb: '🐟', cornBomb: '🍿', koboldBomb: '🪨'
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
  cpuThrowMs: 1800,      // 🤖 Wurf-Tempo der Computer, falls es keine Level gibt
  throwCooldownMs: 250,  // Mindestpause zwischen zwei Würfen derselben Figur
  maxHits: 20, // 💀 So viele Treffer hält eine Figur aus, dann ist sie raus
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
