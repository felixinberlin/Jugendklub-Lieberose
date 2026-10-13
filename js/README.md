# 🎮 So funktioniert unser Spiel

Hallo! 👋 Schön, dass du in den Code schaust.
Du musst nicht alles auf einmal verstehen. Das Spiel besteht aus **9 kleinen Dateien**, und jede kümmert sich nur um **eine Sache**. Such dir die aus, die dich interessiert.

---

## 🗺️ Die Landkarte

| Datei | Worum geht es? | Schwierigkeit |
|---|---|---|
| ⚙️ [`config.js`](config.js) | Die **Stellschrauben**: Emojis, Größen, Schwerkraft | ⭐ Fang hier an! |
| 🔊 [`audio.js`](audio.js) | Alle **Töne** – ohne eine einzige Sounddatei | ⭐⭐ |
| ✨ [`particles.js`](particles.js) | Die **Funken** bei einer Explosion | ⭐⭐ |
| 🌧️ [`weather.js`](weather.js) | **Regen** aus den Wolken, unten **wachsen Bäume** – und was passiert, wenn du den Himmel antippst | ⭐⭐ |
| 🎮 [`game.js`](game.js) | Das **Herz**: Start und Spielschleife | ⭐⭐ |
| 💣 [`bombs.js`](bombs.js) | Bomben **werfen** und **explodieren** lassen | ⭐⭐⭐ |
| 🧌🌽🐱🐭👺 [`actors.js`](actors.js) | Die Figuren **Kobold**, **Mais**, **Katze**, **Maus** und **Goblin** | ⭐⭐⭐ |
| 🌲 [`forest.js`](forest.js) | Der **Zauberwald** im Hintergrund | ⭐⭐⭐ |
| 🧪 [`physics.js`](physics.js) | Die **Physik-Welt**: Wände und Zusammenstöße | ⭐⭐⭐ |
| 🧠 [`state.js`](state.js) | Das **Gedächtnis**: Punkte, Spielfeldgröße, … | ⭐ (kurz, aber wichtig) |

---

## 🕸️ Wer redet mit wem?

Ein Pfeil bedeutet: *„Diese Datei ruft eine Funktion aus der anderen Datei auf."*

```mermaid
flowchart TD
    game["🎮 game.js<br/>Start + Spielschleife"]
    physics["🧪 physics.js<br/>Physik-Welt + Zusammenstöße"]
    actors["🧌🌽🐱🐭👺 actors.js<br/>Kobold, Mais, Katze, Maus, Goblin"]
    bombs["💣 bombs.js<br/>Bomben"]
    forest["🌲 forest.js<br/>Zauberwald"]
    particles["✨ particles.js<br/>Funken"]
    weather["🌧️ weather.js<br/>Regen + Bäume"]
    audio["🔊 audio.js<br/>Töne"]

    game -->|"baut die Welt"| physics
    game -->|"malt den Wald"| forest
    game -->|"lässt es regnen"| weather
    game -->|"malt die Figuren"| actors
    game -->|"malt die Bomben"| bombs
    game -->|"malt die Funken"| particles

    physics -->|"stellt die Figuren auf"| actors
    physics -->|"Treffer! Explodiere!"| bombs
    physics -->|"neue Bildschirmgröße"| forest

    actors -->|"angetippt: wirf!"| bombs
    bombs -->|"Funken streuen"| particles
    bombs -->|"Wurf-Ton + BUMM"| audio
    weather -->|"Spritzer"| particles
    weather -->|"Wolken holen"| forest

    subgraph alle ["📦 Das benutzen alle"]
        config["⚙️ config.js<br/>Stellschrauben"]
        state["🧠 state.js<br/>Gedächtnis"]
    end
```

Lies das Bild von oben nach unten: `game.js` ist der **Chef** und gibt die Aufträge. `audio.js` und `particles.js` stehen ganz unten – sie rufen niemanden auf, sie machen einfach nur ihre Arbeit, wenn jemand sie braucht.

`config.js` und `state.js` haben keine Pfeile, weil **jede** Datei bei ihnen nachschaut. Das wären sonst so viele Pfeile, dass man nichts mehr erkennt.

---

## 🔁 Die wichtigste Idee: die Spielschleife

Ein Spiel ist wie ein **Daumenkino**. Der Computer malt ungefähr **60 Bilder pro Sekunde**, und jedes Bild ist ein kleines bisschen anders als das davor. So entsteht Bewegung.

Das passiert in `gameLoop()` in [`game.js`](game.js) – immer wieder, in dieser Reihenfolge:

```
1. 🌲 Hintergrund malen        → drawForest()     (forest.js)
   🌧️ Regen & Bäume malen      → drawWeather()    (weather.js)
2. 🧌 Figuren malen           → drawActors()     (actors.js)
3. 🧪 Physik weiterrechnen     → Engine.update()  (Matter.js)
4. 💣 Bomben malen             → updateBombs()    (bombs.js)
5. ✨ Funken malen             → drawParticles()  (particles.js)
        ⤴ … und wieder von vorne!
```

Die Reihenfolge ist wie beim Malen mit Deckfarben: Was **zuletzt** gemalt wird, liegt **oben**. Deshalb kommt der Wald zuerst und die Funken zum Schluss.

---

## 💥 Was passiert, wenn du den Kobold antippst?

1. [`actors.js`](actors.js) merkt: *„Der Kobold wurde angetippt!"* und ruft `shootBomb('kobold')`.
2. [`bombs.js`](bombs.js) baut eine Bombe 💣, rechnet aus, wie fest sie geworfen werden muss, damit sie beim Mais landet, und wirft sie los.
3. [`audio.js`](audio.js) spielt den Wurf-Ton.
4. **Matter.js** (die Physik-Maschine) lässt die Bombe im Bogen fliegen – Schwerkraft inklusive.
5. [`physics.js`](physics.js) bemerkt den Zusammenstoß: *„Bombe trifft Mais!"* → **+1 Treffer**.
6. [`bombs.js`](bombs.js) lässt die Bombe explodieren, [`particles.js`](particles.js) streut die Funken, [`audio.js`](audio.js) macht **BUMM**.

Geworfen wird immer im Kreis: **Kobold → Mais → Katze → Maus → Goblin → Kobold**. Wer auf wen wirft, steht bei `target` in der Liste `actors` in [`actors.js`](actors.js).

Sechs Dateien arbeiten zusammen – wie eine Mannschaft, in der jeder seine Position hat.

Und wenn du in den **Himmel** tippst? Dann schaut `handleSkyTap()` in [`weather.js`](weather.js) nach, was da ist: ☁️ eine Wolke → sie regnet. ☀️ die Sonne → es wird Nacht. 🌙 der Mond → es wird wieder Tag.

Und wenn du eine Figur **ziehst** statt tippst? Dann bewegt `moveActor()` in [`actors.js`](actors.js) sie an die neue Stelle. So kannst du Bomben ausweichen.

---

## 🧪 Probier's aus!

Ändere eine Zahl, speichere die Datei und lade die Seite neu. Kaputtmachen kannst du nichts – im Notfall änderst du die Zahl einfach zurück.

### ⚙️ In `config.js` (am einfachsten)

| Ändere … | … und es passiert |
|---|---|
| `koboldEmoji: '🧌'` → `'🐉'` | Der Kobold wird ein Drache |
| `cornEmoji: '🌽'` → `'🥒'` | Aus Mais wird eine Spreewald-Gurke |
| `katzeEmoji: '🐱'` → `'🦁'` | Aus der Katze wird ein Löwe |
| `mausBomb: '🧀'` → `'🍕'` | Die Maus wirft Pizza statt Käse |
| `goblinBomb: '🔥'` → `'❄️'` | Der Goblin wirft Schneebälle statt Feuer |
| `dayMode: true` → `false` | Tag ☀️ wird Nacht 🌙 (Sterne, Mond, Glühwürmchen) |
| `rain: false` → `true` | Alle Wolken regnen immer 🌧️ |
| `rainSeconds: 8` → `30` | Eine angetippte Wolke regnet lange |
| `rainAmount: 0.3` → `1` | Wolkenbruch! 🌧️ |
| `treeChance: 0.02` → `0.2` | Turbo-Wald – überall sprießen Bäume 🌱 |
| `treeEmojis` → `['🌻', '🌷']` | Statt Bäumen wachsen Blumen |
| `bombEmoji: '💣'` → `'🍕'` | Pizza-Schlacht! |
| `gravityY: 0.9` → `0.2` | Schwerkraft wie auf dem Mond – Bomben fliegen in hohem Bogen |
| `gravityY: 0.9` → `2.5` | Riesen-Schwerkraft – Bomben sausen flach und schnell |
| `koboldSize: 70` → `140` | Riesen-Kobold |
| `moonEmoji: '🌙'` → `'🛸'` | Ein Ufo über dem Wald |

### 🔊 In `audio.js`

Ein Ton wird so gemacht: `playTone(600, 'square', 0.08, 0.15)`

- **600** = Tonhöhe. Kleine Zahl = tief, große Zahl = hoch.
- **'square'** = Klangfarbe. Probier `'sine'` (weich), `'triangle'` (rund), `'sawtooth'` (kratzig).
- **0.08** = wie lange der Ton dauert (in Sekunden).
- **0.15** = Lautstärke. Bitte nicht über `0.3` – sonst tut es in den Ohren weh.

### ✨ In `particles.js` und `bombs.js`

- In `explodeBomb()` steht `spawnParticles(x, y, '#ff9f1c', 30)`. Die **30** ist die Anzahl der Funken. Mach daraus **200**!
- `'#ff9f1c'` ist eine Farbe (Orange). Probier `'#ff00ff'` (Pink) oder `'#00ffff'` (Türkis).

### 🌲 In `forest.js`

- In `initForest()` steht `i < 35` bei den Sternen. Mach **300** daraus für einen Sternenhimmel (nur bei Nacht: `dayMode: false`).
- Bei den Glühwürmchen steht `i < 16`. Wie sieht der Wald mit **100** aus?

---

## 📖 Kleines Wörterbuch

| Wort | Bedeutung |
|---|---|
| **Variable** | Eine beschriftete Schachtel, in der sich der Computer etwas merkt. `let score = 0` heißt: *Schachtel „score", Inhalt 0.* |
| **Funktion** | Ein Rezept mit Namen. `function shootBomb()` beschreibt, *wie* man eine Bombe wirft. Mit `shootBomb()` wird das Rezept gekocht. |
| **Canvas** | Die Leinwand, auf die das Spiel malt. |
| **`ctx`** | Der Pinsel für die Leinwand. `ctx.fillText('🌽', …)` malt einen Mais. |
| **Body** | Ein Körper in der Physik-Welt. Er hat einen Ort, eine Geschwindigkeit und kann anstoßen. |
| **Engine** | Die Physik-Maschine (Matter.js). Sie rechnet aus, wohin alles fliegt und fällt. |
| **Kollision** | Zwei Körper stoßen zusammen. |
| **Partikel** | Ein winziger bunter Punkt. Viele zusammen sehen aus wie eine Explosion. |
| **Wiggle** | Englisch für „wackeln". Die Figuren wackeln kurz, wenn sie werfen oder getroffen werden. |
| **`width` / `height`** | Breite und Höhe des Spielfelds in Pixeln. |
| **`now`** | Die aktuelle Zeit in Millisekunden. Damit weiß das Spiel, wie weit eine Bewegung schon ist. |
| **`//`** | Ein Kommentar. Den liest nur der Mensch, der Computer überspringt ihn. |

---

## 🧩 Wie finden die Dateien einander?

In der [`index.html`](../index.html) stehen ganz unten alle Dateien untereinander. Der Browser liest sie **von oben nach unten**. Alles, was eine Datei anlegt, können die Dateien danach benutzen – wie ein gemeinsamer Werkzeugkasten.

Deshalb gibt es zwei Regeln:

1. **Jeder Name nur einmal.** Wenn zwei Dateien beide `let score` schreiben, streikt der Browser.
2. **`game.js` steht ganz unten.** Sie startet das Spiel – und das geht erst, wenn alle anderen ihr Werkzeug in den Kasten gelegt haben.

---

## 🚀 Eigene Idee?

Du willst etwas Neues einbauen, zum Beispiel einen Schutzschild oder einen zweiten Kobold?

1. Lege eine neue Datei an, z. B. `shield.js`.
2. Trage sie in der `index.html` ein – **vor** `game.js`.
3. Schreib eine Funktion wie `drawShield()` und rufe sie in `gameLoop()` auf.

Viel Spaß beim Ausprobieren! 🌲🧌🌽
