/**
 * ⚙️ config.js – Die Stellschrauben des Spiels
 *
 * 🎮 VIBECODING KONFIGURATION:
 * Hier können wir live während des Workshops Physik und Spielwerte anpassen!
 * Wer nur etwas ausprobieren will, muss nur diese eine Datei ändern.
 */
const GAME_CONFIG = {
  shopChests: [
    { id: 'normal', name: 'Normale Kiste', price: 1500, currency: 'coins', luck: '1', items: 4 },
    { id: 'rare', name: 'Seltene Kiste', price: 3000, currency: 'coins', luck: '1,3', items: 8 },
    { id: 'gold', name: 'Goldkiste', price: 7500, currency: 'coins', luck: '1,8', items: 16 },
    { id: 'god', name: 'God-Kiste', price: 199, currency: 'jewels', luck: '3', items: 50 }
  ],
  shopExchange: { jewels: 20, coins: 5000 },
  starterActors: ['corn', 'katze', 'maus'],
  actorRarities: {
    corn: 'rare', katze: 'rare', maus: 'rare',
    kobold: 'epic', fledermaus: 'epic', musiala: 'epic',
    goblin: 'mythic', yamal: 'mythic', drache: 'secret', zeus: 'divine'
  },
  // 🙂 Normale Figuren-Ansicht überall in jedem Modus (wie am Anfang!)
  proSkins: false,
  scarySkins: false,
  soloEnemies: 5, // 🎯 Im Solo-Modus (Rangliste & Normal) gibt es immer genau 5 Gegner!

  // Charaktere auf beiden Seiten
  koboldEmoji: '🧌',
  koboldImage: 'kobold.png', // 😠🗡️ Neues Design: Wütender Kobold mit gezackter Klinge (ausgeschnitten, ohne Kreis) (Emoji nur, falls das Bild nicht lädt)
  koboldSize: 70,
  cornEmoji: '🌽',
  cornImage: 'mais.png', // 🌽😡 Neues Design: wütender Mais mit gezackter Lanze (Emoji nur, falls das Bild nicht lädt)
  cornSize: 74,
  cornBomb: '🍿',
  cornWeapons: ['popcorn'], // Kleine Explosionen; die Spezialkraft wirft weiter eine ganze Salve.
  cornBombSize: 32,
  koboldBomb: '💣',
  koboldWeapons: ['bomb'], // Langsam, dafür mit kleinem Explosionsbereich.
  koboldBombSize: 32,
  katzeEmoji: '🐱',
  katzeImage: 'katze.png', // 🐱🔥 Neues Design: wilde Katze mit Stachelkeule (Emoji nur, falls das Bild nicht lädt)
  katzeSize: 70,
  katzeBomb: '🏏',       // 🐱 Symbol auf dem Schieß-Knopf
  katzeWeapons: ['club'], // 🐱 Wirft ihre Stachelkeule, die sich dreht (waffen.js)
  katzeBombSize: 34,
  mausEmoji: '🐭',
  mausImage: 'maus.png', // 🐭⚔️ Neues Design: Kriegermaus mit Stachelhelm und Lanze
  mausSize: 60,
  mausBomb: '🪓',        // 🐭 Symbol auf dem Schieß-Knopf
  mausWeapons: ['glaive'], // 🐭 Wirft ihre Lanze mit Hackmesser-Klinge (waffen.js)
  mausBombSize: 32,
  goblinEmoji: '👺',
  goblinImage: 'goblin.png', // 👺🔥 Neues Design: Lava-Dämon mit brennendem Haar und Dreizack
  goblinSize: 68,
  goblinBomb: '🔱',      // 👺 Symbol auf dem Schieß-Knopf
  goblinWeapons: ['trident'], // 👺 Wirft seinen glühenden Lava-Dreizack (waffen.js)
  goblinBombSize: 34,
  musialaEmoji: '⚽',
  // 👕 Musiala / GOAT trägt das Trikot mit der Nummer 10!
  musialaImage: 'goat.png', // ⚽⚡ Neues Design: GOAT im Sturmlicht (ohne Bild: gemalte Trikot-Figur)
  musialaShirt: { color: '#111827', number: '10', numberColor: '#facc15', shorts: '#1e293b', head: '⚽', stripe: true, sixSeven: false },
  musialaRuns: true,     // 🏃 Dribbelt über das Feld
  musialaRunSpeed: 2.2,
  musialaSize: 66,
  musialaBomb: '⚽',
  musialaProjectile: 'ball',
  // ⚽🌟 Lamine Yamal (#19)
  yamalEmoji: '🌟',
  yamalImage: 'yamal.png', // ⚽🌟 Neues Design: goldener Fußballheld im Sturm (ohne Bild: gemalte Trikot-Figur)
  yamalShirt: { color: '#dc2626', number: '19', numberColor: '#facc15', shorts: '#1d4ed8', head: '🌟', stripe: false, sixSeven: false },
  yamalRuns: true,
  yamalRunSpeed: 2.35,
  yamalSize: 65,
  yamalBomb: '⚽',
  yamalProjectile: 'ball',
  dracheEmoji: '🐉',
  dracheWings: true,       // 🪽 Ganze Flügel, die hoch und runter schlagen (drachenfluegel.js)
  dracheImage: 'drache.png', // 🐉🔥 Neues Design: Dramatischer Drache im Feuersturm (Emoji nur, falls das Bild nicht lädt)
  dracheSize: 74,
  dracheBomb: '🔥',      // 🐉 Symbol auf dem Schieß-Knopf
  dracheWeapons: ['fireball'], // 🐉 Spuckt Feuerbälle (waffen.js)
  dracheBombSize: 38,
  dracheScratch: false,  // true = alte Krallen-Kratzspur statt Feuerball
  zeusImage: 'zeus.png', // ⚡ Neues Design: Zeus im Sturm der Götter mit Blitz-Speer
  zeusEmoji: '🧔🏼‍♂️',     // 🧔🏼‍♂️ Zeus hat jetzt ein echtes Zeus-Logo (kein Blitz als Figur)!
  zeusSize: 74,
  zeusBomb: '⚡',        // ⚡ Zeus schleudert gezackte Blitze!
  zeusBombSize: 38,
  zeusBolt: true,        // Malt echte leuchtende Zickzack-Blitze
  zeusProjectile: 'bolt',
  zeusUnlockTrophies: 0,  // ⚡ Zeus ist für alle frei wählbar (früher 40 Pokale; Zahl > 0 = wieder sperren)
  fledermausEmoji: '🦇',  // 🦇 Tobias' Fledermaus!
  fledermausSize: 68,
  fledermausImage: 'fledermaus.png', // 🦇 Neues Design: Kampf-Fledermaus mit Speer und Morgenstern
  fledermausFlap: { center: 0.48, body: 0.22, amp: 0.3 }, // 🪽 Flügel im Bild wippen langsam hoch und runter (drachenfluegel.js)
  fledermausWeapons: ['spear', 'flail'], // 🗡️⛓️ Wirft immer abwechselnd Speer und Stachelkugel (fledermaus.js)
  fledermausBomb: '🗡️',   // Symbol auf dem Schieß-Knopf
  fledermausBombSize: 32,

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
  weaponScale: 1.9, // ⚔️ So viel größer werden die gemalten Waffen gezeichnet (waffen.js) – gut sichtbar auch auf dem Handy
  // 🏅 Solo-Modus hat jetzt 1 direktes Match (keine Level-Anzeige im Solo-Modus)
  levels: [
    { title: 'Arena-Match ⚡', throwMs: 1200 } // Bots greifen dich genauso oft an wie sich gegenseitig (cpu.js)
  ],
  // ⚔️ Team-Modus: 8 Level. Gegner-Zahl = so viele Figuren, wie du im Team hast (teams.js) – `enemies` wird nicht mehr benutzt.
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
  aim: {
    holdMs: 220, fullMs: 1000, fastFrames: 22,
    ziehFaktor: 1.4, // Weniger empfindlich: Der Zielpunkt springt beim Ziehen nicht weg.
    zielRadius: 120, // Bildschirm-Pixel: großzügige Auswahl, auch auf herausgezoomten Handys.
    vorhalteHilfe: 0.75 // Zielbindung hilft auch bei einem kurzen Tipp gegen laufende Gegner.
  },
  // ⚔️ Flugprofile: Tempo in Welt-Pixeln pro 60-Hz-Bild (× mapScale), schwerkraft = Anteil
  // der Weltschwerkraft. Schaden bleibt bei CHAR_STATS, sofern schaden nicht gesetzt ist.
  // bewegung: 'bogen' oder 'welle'; drehung: Drehung in Radiant pro Bild.
  // Neue Waffe: Profil hier + Zeichnung in waffen.js + <figur>Weapons ergänzen.
  waffenProfile: {
    default: { tempo: 12, schwerkraft: 0.3, bewegung: 'bogen', drehung: 0, lebensdauerMs: 3000, schaden: null, explosionsRadius: 0, trefferfolgen: [] },
    bomb:    { name: 'Bombe', symbol: '💣', tempo: 8, schwerkraft: 0.2, schaden: 4, drehung: 0.12, explosionsRadius: 46 },
    popcorn: { name: 'Popcorn', symbol: '🍿', tempo: 9, schwerkraft: 0.25, schaden: 1.5, drehung: 0.18, explosionsRadius: 32 },
    blade:   { name: 'Klinge', tempo: 12, schwerkraft: 0.18, schaden: 3 },
    lance:   { name: 'Mais-Lanze', tempo: 15, schwerkraft: 0.08, schaden: 1.5 },
    club:    { name: 'Stachelkeule', tempo: 8, schwerkraft: 0.35, schaden: 5, drehung: 0.24 },
    glaive:  { name: 'Mäuse-Lanze', tempo: 14, schwerkraft: 0.12, schaden: 2 },
    trident: { name: 'Dreizack', tempo: 11, schwerkraft: 0.18, schaden: 4 },
    fireball:{ name: 'Feuerball', tempo: 10, schwerkraft: 0.06, schaden: 3, bewegung: 'welle', wellenHoehe: 12, wellenBilder: 40,
      trefferfolgen: [{ art: 'zeitSchaden', kennung: 'feuer', symbol: '🔥', farbe: '#fb923c', schaden: 0.5, dauerMs: 2000, abstandMs: 500 }] },
    bolt:    { name: 'Blitz', tempo: 20, schwerkraft: 0, schaden: 2.5 },
    ball:    { name: 'Fußball', tempo: 12, schwerkraft: 0.25, schaden: 3, drehung: 0.2 },
    spear:   { name: 'Speer', symbol: '🗡️', tempo: 16, schwerkraft: 0.05, schaden: 1.2 },
    flail:   { name: 'Morgenstern', symbol: '⛓️', tempo: 8.5, schwerkraft: 0.4, schaden: 2.2, drehung: 0.28 },
    // Noch keiner Figur zugeteilt. Zum Ausprobieren z. B. mausWeapons: ['venom'] setzen.
    venom:   { name: 'Giftkugel', symbol: '🧪', tempo: 11, schwerkraft: 0.3, schaden: 1,
      trefferfolgen: [{ art: 'zeitSchaden', kennung: 'gift', symbol: '☠️', farbe: '#a3e635', schaden: 0.5, dauerMs: 3000, abstandMs: 500 }] }
  },
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
  popcorn: { count: 5, damage: 4, size: 28, explosionsRadius: 46 }, // 🍿 Kleiner Explosionsbereich pro Korn
  fireSpear: { damage: 10, speed: 12, burnSeconds: 3, burnDamage: 1, burnEveryMs: 500 }, // 👺🔱 Goblin: Dreizack macht 10 Schaden
  dragonBite: { damage: 14, stunSeconds: 1.5 },              // 🐉🦷 Tobis Drachenbiss
  zeusStorm: { radius: 82, seconds: 4, strikeEveryMs: 360, damage: 5 }, // ⚡🌩️ Zeus: Blitzregen pro Treffer 5 Schaden!
  batSuck: { sips: 5, sipMs: 220, damage: 3, heal: 3 },    // 🦇🩸 Fledermaus: saugt 5-mal je 3 Leben ab und heilt sich selbst!
  yamalStar: { damage: 12, speed: 8.5, size: 48 },          // 🌟💥 Yamal: Stern explodiert in der Mitte & fügt zufälligem Spieler 12 Schaden zu
  maxHits: 20, // 💀 Treffer im normalen Modus (wenn benutzerdefiniert angepasst)
  trophyLives: 50, // 🏆 Pokal-Modus nutzt die exakten Charakter-Leben!
  nameChangeCooldownDays: 0, // 🎲 Zufalls-Spitznamen jederzeit frei wählbar (keine Sperre)!
  hitChoices: [5, 10, 20, 50], // Zum Auswählen im normalen Modus
  mapScale: 0.72, // 🗺️ Größere Map & bessere Übersicht in der Runde
  phoneZoom: 0.6, // 🔭📱 Handy: ganze Kampf-Welt herausgezoomt (0.6 = alles 40 % kleiner, viel mehr Platz). 1 = kein Zoom
  maxPixelRatio: 2, // 🚀 Tempo: höchstens 2-fache Pixeldichte
  maxParticles: 300, // 🚀 Tempo: höchstens so viele Funken gleichzeitig
  dragThreshold: 8, // Kleine Fingerbewegungen zählen weiterhin als Antippen.

  // 🌲 Wald & Bäume Hintergrund (Lieberoser Zauberwald)
  forestTheme: true,
  arenaImage: 'arena.jpg', // 🌕⛩️ Map: Samurai-Arena unter dem roten Blutmond ('' = wieder der gemalte Wald)
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
 * - attackDamage: Reserve-Grundwert; die aktuelle Waffe nutzt waffenProfile.schaden
 * - attackCooldown: Angriffs-Pause in Sekunden (auf Schieß-Knopf angezeigt!)
 * - abilityDamage: Schaden der Spezialfähigkeit
 * - speed: Bewegungs-Tempo
 */
const CHAR_STATS = {
  musiala: { // Fußballer / GOAT
    name: 'Fußballer',
    hp: 100,
    attackDamage: 4,
    attackCooldown: 1.2,
    abilityDamage: 10,   // Großerball: 10 Schaden
    speed: 1.0           // 1.0 speed (normal schnell)
  },
  kobold: {
    name: 'Kobold',
    hp: 120,
    attackDamage: 3,
    attackCooldown: 1.0,
    abilityDamage: 8,    // 3 Mini-Kobolde
    speed: 1.0           // 1.0 speed (normal schnell)
  },
  corn: {
    name: 'Mais',
    hp: 100,
    attackDamage: 2,
    attackCooldown: 0.5,
    abilityDamage: 20,   // 5 Popcorn je 4 Schaden
    speed: 1.2           // 1.2 speed
  },
  maus: {
    name: 'Maus',
    hp: 105,
    attackDamage: 3,
    attackCooldown: 0.9,
    abilityDamage: 0,    // 6s im Loch
    speed: 1.5           // 1.5 speed
  },
  katze: {
    name: 'Katze',
    hp: 110,
    attackDamage: 5,
    attackCooldown: 1.5,
    abilityDamage: 5,    // Wirbelsturm: 5 Schaden + 4s Stun
    speed: 1.2           // 1.2 speed
  },
  goblin: {
    name: 'Goblin',
    hp: 100,
    attackDamage: 4,
    attackCooldown: 1.4,
    abilityDamage: 10,   // Dreizack: 10 Schaden
    speed: 1.4           // 1.4 speed
  },
  zeus: {
    name: 'Zeus',
    hp: 130,
    attackDamage: 7,
    attackCooldown: 2.3,
    abilityDamage: 25,   // Blitzregen: pro Blitz 5 Schaden
    speed: 1.5           // 1.5 speed
  },
  yamal: {
    name: 'Lamine Yamal',
    hp: 105,
    attackDamage: 4,
    attackCooldown: 1.4,
    abilityDamage: 12,   // Sternen-Explosion in der Mitte: 12 Schaden
    speed: 1.3           // 1.3 speed
  },
  fledermaus: {
    name: 'Fledermaus',
    hp: 100,             // Pokal-Modus; im normalen Modus gilt die eingestellte Lebenszahl
    attackDamage: 1.7,   // Reserve; die zwei Waffen haben eigene Werte
    attackCooldown: 1.2, // Waffenwechsel bei jedem erfolgreichen Wurf
    abilityDamage: 15,   // Blutsaugen: 5 × 3 Schaden, heilt sich um 15
    speed: 1.4
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
  if (stat === 'attackDamage') {
    const weapon = typeof naechsteWaffe === 'function' && actors[name]
      ? naechsteWaffe(name) : (GAME_CONFIG[`${k}Weapons`] || [])[0];
    const id = weapon || GAME_CONFIG[`${k}Projectile`] || 'default';
    const damage = GAME_CONFIG.waffenProfile[id]?.schaden;
    if (damage != null) return damage;
  }
  return cfg ? cfg[stat] : undefined;
}
