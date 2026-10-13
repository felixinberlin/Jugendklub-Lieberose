# 🤖 AGENTS.md — Jugendklub Lieberose

> **Audience:** AI coding agents (Antigravity, Cursor, Claude Code, etc.) at the start of every session.
> **Project Context:** A collection of small browser toys and games developed live via "Vibecoding" with kids at the **Jugendklub Lieberose** (Brandenburg, Germany).
> **Production URL:** [https://jugendklub.vercel.app/](https://jugendklub.vercel.app/)
> **GitHub Repository:** `felixinberlin/Jugendklub-Lieberose` (branch: `main`)

---

## 1. 🎯 What This Project Is

Interactive, zero-friction web toys and games for kids aged roughly 8–16.
Kids open a URL on their phone or laptop (via a projected QR code), and something fun happens immediately.
**No login, no app install, no account, no tutorial.**
Polish matters less than: **"It works on the first try on a kid's phone."**

---

## 2. ⛔ Hard Constraints — NEVER Violate These

If a user request would violate any of these, stop and clarify first:

1. **NEVER introduce a build step.** No npm bundlers (Webpack, Vite, Rollup), no `package.json` scripts, no TypeScript compilation. The site must run by opening static HTML directly in any browser.
2. **NEVER add a heavy framework.** No React, Vue, Svelte, Tailwind CLI, Phaser, or Unity WebGL. Pure Vanilla HTML5 + CSS + Modern JS only.
3. **NEVER add a backend.** No API routes, no serverless functions, no external database. Everything runs client-side in the browser.
4. **NEVER transmit or store personal data.** No analytics, no cookies, no tracking, no names, no photos, no telemetry. If sensors/mic/camera are used, data remains purely in memory on the device and vanishes upon tab close.
5. **NEVER rely on flaky external CDNs.** Vendor libraries locally (like `matter.min.js`), or pin reliable CDNs (`cdn.jsdelivr.net` / `cdnjs.cloudflare.com`). Youth club Wi-Fi can drop at any moment.
6. **NEVER write English UI text.** All user-facing strings, buttons, instructions, and error messages MUST be in **German**. Code comments may be German or English.
7. **NEVER require authentication.** Everything is open and anonymous.

---

## 3. 📁 Repository & Architecture Structure

```
/home/felix/Jugend/
├── AGENTS.md         # Master instructions for all AI agents (this file)
├── README.md         # Human-facing overview with live link and QR code
├── vercel.json       # Cache-Control: max-age=0 (ensures fresh code on refresh)
├── deploy.sh         # 1-command git add/commit/push script (updates Vercel in 15s)
├── serve.sh          # Lokale Vorschau ohne Cache: ./serve.sh → http://localhost:8000
├── qr-code.png       # Scannable QR code for the projector screen
├── index.html        # Main landing page / active live game
├── style.css         # Arcade styling, safe-area insets, mobile touch lock
├── matter.min.js     # Vendored Matter.js 2D physics engine (zero CDN deps)
├── js/               # Das Spiel, aufgeteilt nach Bedeutung (klassische <script>-Tags, KEINE ES-Module)
│   ├── config.js     #   ⚙️ GAME_CONFIG – Live-Hacking-Zone
│   ├── state.js      #   🧠 Matter-Alias, Canvas/DOM, width/height, isPlaying, score, engine
│   ├── sprites.js    #   🖼️ Bilder-Speicher: drawEmoji / drawLabel (Tempo!)
│   ├── audio.js      #   🔊 Web Audio Synthesizer
│   ├── forest.js     #   🌲 Hintergrund (Zauberwald)
│   ├── particles.js  #   ✨ Partikel
│   ├── weather.js    #   🌧️ Regen & wachsende Bäume
│   ├── knockout.js   #   💀 Lebensleiste, K.o. bei `maxHits`, Gewinner
│   ├── footballer.js #   ⚽ Selbstgemalte Figur im Trikot (`<name>Shirt`)
│   ├── actors.js     #   🧌🌽🐱🐭👺⚽ Figuren-Liste `actors`: Bodies, Bewegen, Eingabe, Zeichnen
│   ├── bombs.js      #   💣 Werfen, Explodieren, Aufräumen
│   ├── physics.js    #   🧪 Engine, Wände, collisionStart, resizeCanvas
│   ├── cpu.js        #   🎮 Figuren-Auswahl, Computer-Gegner, „⭐ DU“
│   ├── teams.js      #   ⚔️ Team-Modus: mehrere Figuren, rote Gegner-Kopien, 8 Level
│   ├── specials.js   #   ⚡ Spezialkräfte (Knopf unten links, lädt mit 20 Treffern): Riesenball, Mini-Kobolde, Wirbelsprung, Popcorn, Feuerspeer
│   ├── credits.js    #   🎬 Abspann + GAME_VERSION – JEDER Kinder-Wunsch bekommt hier eine Zeile!
│   ├── levels.js     #   🏅 5 Level, Level-Schild, Weiter/Nochmal
│   ├── README.md     #   📖 Kinder-Doku auf Deutsch – bei neuen Dateien/Funktionen mitpflegen!
│   └── game.js       #   🎮 startGame, gameLoop, Initialisierung (wird ZULETZT geladen)
└── [toy-name]/       # Optional future mini-games (e.g. gurken-angriff/index.html)
```

### File Rules:
- **Root game:** The main live-coded game lives at root (`index.html`, `style.css`) with its code split by meaning in `js/`. Keep every file small enough for a curious kid to read in one sitting; a new game concept (e.g. enemies, power-ups) gets its own file plus a `<script>` tag in `index.html` before `js/game.js`.
- **Additional toys:** Each additional toy lives in its own self-contained subfolder (`/gurken-angriff/index.html`).
- **No deep nesting:** Never nest directories deeper than two levels.

---

## 4. 🎮 The Live "Vibecoding" Architecture

### A. The `GAME_CONFIG` Object (Live Hacking Zone)
Lives alone in `js/config.js`. Designed for instant modifications when kids shout ideas on stage:
Lies die echte Datei (`cat js/config.js`), sie ist kurz. Wichtigste Schalter:
- `koboldEmoji` / `cornEmoji` / `katzeEmoji` / `mausEmoji` / `goblinEmoji` / `musialaEmoji` + `…Size` – Aussehen der Figuren (`<name>Emoji`, `<name>Size`)
- `bombEmoji`, `bombSize` – was geworfen wird; `<name>Bomb` / `<name>BombSize` / `<name>Trail` geben einer Figur ein eigenes Wurfgeschoss (Kobold 💰 mit 🪙-Spur, Mais 🟡 Maiskörner, Katze 🐟, Maus 🧀, Goblin 🔥, Musiala ⚽)
- `gravityY`, `restitution`, `frictionAir` – Physik (0.2 = Mond, 2.5 = Riesen-Schwerkraft)
- `rain` (true = alle Wolken regnen immer; sonst nur angetippte), `rainSeconds`, `rainAmount`, `treeChance`, `treeGrowSeconds`, `treeMaxSize`, `maxGrowingTrees`, `treeEmojis` – Regen & wachsende Bäume
- `<name>Shirt` (z. B. `musialaShirt: { color, number, stripe, shorts, head, sixSeven }`) – Figur wird als Fußballer im Trikot gemalt statt als Emoji; `<name>Runs` / `<name>RunSpeed` – sie dribbelt von allein hin und her
- `maxHits` / `hitChoices` – Startwert und Auswahl (💀 5·10·20·50 auf dem Startbildschirm, gebaut in `knockout.js`, setzt `GAME_CONFIG.maxHits` zur Laufzeit) – so viele Treffer hält eine Figur aus, dann ist sie raus (letzte Figur gewinnt)
- `teamLevels` – 8 Team-Level `{ title, enemies, throwMs }`. Schaden wächst ~ enemies² / throwMs, darum throwMs mit der Gegnerzahl erhöhen. Bot-Simulation (3er-Team, Bot tippt alle 300 ms reihum): L1–5 locker, L6–7 knapp gewonnen, L8 knapp verloren
- `levels` – 5 Level `{ title, throwMs, huntPlayer }` (Wurf-Tempo der Computer; Anteil der Würfe, die auf DICH zielen). Anzahl beliebig, alles liest `levels.length`. Balance per Bot-Simulation (Bot wirft alle 300 ms, weicht NIE aus): L1–2 gewinnt, L3–4 ~50 %, L5 verliert knapp. Kinder fanden `throwMs 1250 / huntPlayer 0.5` zu schwer – nicht härter als L5 machen
- `specialChargeHits` (Treffer bis zur Spezialkraft), `cpuSpecialChance`, `bigBall { size, damage, speed, seconds }`, `miniKobolds { count, seconds }`, `catStunSeconds`, `catDamage`, `hideSeconds`, `popcorn { count, damage, size }`, `fireSpear { damage, speed, burnSeconds, burnDamage, burnEveryMs }` – ⚡ Spezialkräfte
- `cpuThrowMs` (Fallback ohne Level), `throwCooldownMs` (Mindestpause zwischen Würfen, gegen Dauertippen)
- `maxPixelRatio` (2 – Tempo!), `maxParticles` (300)
- `dragThreshold` – ab wie vielen Pixeln Antippen zu Ziehen wird
- `dayMode` (true = ☀️ Tag mit Sonne/Wolken/🦋, false = 🌙 Nacht mit Sternen/Glühwürmchen), `sunEmoji`, `moonEmoji` – Hintergrund. Farben beider Varianten in `FOREST_COLORS` (`js/forest.js`)

### B. Procedural Audio Engine (`Web Audio API`)
- Synthesize all beeps, chimes, bounces, and explosions on the fly.
- **NEVER load external MP3/WAV files.**
- Create / resume `AudioContext` only on the first user touch/click (mandatory for mobile iOS/Android autoplay policy).
- Keep sound effects short (< 300 ms) and comfortable volume (`gain ≤ 0.3`).

### C. Live Deployment Protocol
Whenever an edit is made:
0. **🎬 Abspann pflegen:** Jeder Kinder-Wunsch bekommt eine Zeile in `WISHES` (`js/credits.js`) und `GAME_VERSION` wird hochgezählt (2.22 → 2.23; neuer Workshop-Tag → neue Hauptnummer + `{ workshop: '🎪 Workshop 3 · Datum' }`). Kurz, kindgerecht, mit Emoji.
1. Verify syntax: `for f in js/*.js; do node -c "$f"; done`.
2. Run `./deploy.sh "<descriptive commit message>"` (works from any branch).
3. Pushes the current commit to `origin main` $\rightarrow$ Vercel automatically deploys within ~15 seconds.
4. Inform the user to tell the kids: *"3... 2... 1... Handy aktualisieren!"*

---

## 5. ⚙️ Matter.js 2D Physics Guidelines

- Destructure at top: `const { Engine, Bodies, Body, Composite, Events } = Matter;`
- **Coordinate system:** `(0,0)` is top-left. Positive Y is **down**. Bodies are positioned at their **center**.
- **Impulse vs Force:**
  - Instant kicks / bounces / launches $\rightarrow$ `Body.setVelocity` or `Body.setAngularVelocity`
  - Continuous movement $\rightarrow$ `Body.applyForce`
- **Static vs Dynamic:** `isStatic: true` for ground/walls and kinematic player; dynamic for falling/bouncing items.
- **Collision Detection:** Listen to `Events.on(engine, 'collisionStart', ...)` and check body labels/customData.
- **Canvas Rendering with Retina DPI:**
  - Always handle `window.devicePixelRatio`.
  - Always wrap custom drawings in `ctx.save()` and `ctx.restore()`.
- **Memory & FPS Safety:** Always remove off-screen bodies with `Composite.remove(engine.world, body)` so phone performance stays at 60 FPS.

---

## 6. 📱 Mobile Browser & Hardware APIs

All vanilla JS, no external libraries:

### Viewport & CSS Lock
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
```css
* {
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
```

### Orientation
- **Root game (Kobold, Mais, Katze, Maus, Goblin & Musiala):** volle Breite in jeder Lage (hochkant, quer, Laptop, Beamer). Figuren-Startplätze und Waldmenge skalieren mit `width`; Startbildschirm hat eine kompakte `@media (max-height: 520px)`-Variante für quer gehaltene Handys.
- **Vertical dodger/catcher games:** Portrait layout (constrained to `max-width: 500px` on desktop).
- **Horizontal slingshot/runner games:** Landscape layout with a polite *"Bitte das Handy quer halten"* overlay in portrait.

### Microphone (Vanilla Web Audio)
```js
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const ctx = new AudioContext();
const src = ctx.createMediaStreamSource(stream);
// Safari: Call ctx.resume() after permission dialog resolves.
```

### Gyroscope & Accelerometer (Tilt Controls)
iOS requires user gesture permission before motion events fire:
```js
btn.addEventListener('click', async () => {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    const perm = await DeviceOrientationEvent.requestPermission();
    if (perm !== 'granted') return;
  }
  window.addEventListener('deviceorientation', (e) => {
    // e.gamma = left/right tilt (-90 to 90)
  });
});
```

---

## 7. 👶 UI / UX Guidelines for Kids

- **Tap targets ≥ 44×44 px:** Kids' fingers are imprecise.
- **Readable typography:** Minimum 16px, prefer 18–24px.
- **Bright, high-contrast arcade colors:** Fun gradients, neon highlights, particles.
- **Hilarious fail states:** Losing should be funny, never punishing.
- **Instant Restart:** Single, prominent *"NOCHMAL SPIELEN 🔄"* button.
- **Score Memory:** Only non-identifying game numbers (e.g. `lieberose_highscore`) in `localStorage`.

---

## 8. 🧠 Lessons Learned (Compound Memory)

*Append new non-obvious bugs and fixes here:*
1. **Matter.js bodies at `(0,0)` are off-screen:** Always spawn at world center or screen width/2.
2. **iOS AudioContext is suspended by default:** Must be resumed/created inside a `touchstart` or `click` event.
3. **Safari cache after deploys:** `vercel.json` must send `Cache-Control: public, max-age=0, must-revalidate`.
4. **iOS sensor permission:** Must be triggered by direct user click, never on window load.
5. **Touch gestures triggering browser refresh:** Use `touch-action: manipulation; overflow: hidden;`.
6. **Retina Canvas blur:** Scale canvas buffer by `window.devicePixelRatio` and scale 2D context.
7. **Static bumper alignment on screen resize:** When placing side characters/bumpers (Kobold, Corn, etc.) at relative screen heights (`height * 0.55`), `resizeCanvas()` MUST reposition them via `Body.setPosition(body, { x, y })` so phone rotation or varied aspect ratios keep physics hitboxes aligned with rendered sprites.
8. **Vendored Matter.js over CDN:** `matter.min.js` (79KB) vendored directly in repo prevents youth club Wi-Fi latency or dropouts from breaking the game on cold device loads.
9. **Deploy build delay cushion:** Vercel takes ~10–15 seconds to rebuild and push to edge network. Presenter should lead a theatrical 5-second countdown ("3... 2... 1... Jetzt Handy aktualisieren!") so kids don't refresh prematurely.
10. **Side bumper ricochet physics:** Giving side characters high restitution (`restitution: 1.05`) creates lively pinball bounces, while simple decaying wiggle multipliers (`wiggle *= 0.88`) give punchy hit reactions with zero external animation libraries.

11. **Doppeltippen:** `dblclick` ist auf iOS unzuverlässig. `registerTap()` vergleicht Zeitstempel (`doubleTapMs`). Handys feuern nach `touchstart` noch ein emuliertes `mousedown` – das zählt sonst als 2. Tap (= jeder Einzeltipp würde werfen). Lösung: `lastTouchTime` merken und `mousedown` innerhalb von 800 ms ignorieren. (Historisch – die aktuelle Eingabe nutzt Pointer-Events pro Figur: Antippen = werfen, Ziehen = bewegen.)
12. **Eigene Projektile im `collisionStart`-Handler:** Der Handler behandelt jeden Body mit `customData` + Spieler-Kontakt als „Item einsammeln“. Neue Projektile (`isPlayerBomb`) deshalb ganz oben im Pair-Loop abfangen und mit `continue` verlassen, sonst werden sie wie gute Items eingesammelt.
13. **Array nicht während der Zeichen-Schleife umbauen:** `explodeBomb()` ersetzt `fallingBodies` per `filter`. Das ist im `collisionStart` (vor dem Zeichnen) okay, aber NICHT innerhalb der rückwärtigen Schleife im `gameLoop` – dort nur `splice(i, 1)` + `continue`.
14. **Testen ohne Handy:** `./serve.sh` + Playwright (Viewport 390×760). Die Dateien in `js/` nutzen globale `let`/`function`, daher lassen sich `fallingBodies`, `actors`, `shootBomb('katze')`, `isPlaying`, `score` direkt per `browser_evaluate` prüfen. Nach „Game Over“ (`isPlaying=false`) laufen keine Kollisionen mehr – Tests sofort nach `startGame` machen. Das `favicon.ico`-404 in der Konsole ist bekannt und harmlos.
15. **`.playwright-mcp/` nie committen:** `deploy.sh` macht `git add .` – Testordner stehen deshalb in `.gitignore`.
16. **Live-Vibecoding Tempo & Niemals Nachfragen:** Bei Wünschen der Kinder auf der Bühne (z. B. „Den Hintergrund ändern“) NIEMALS interaktive Fragebögen oder Rückfragen (`ask_question`) stellen! Das unterbricht den Flow und dauert viel zu lange. Sofort eine kreative Entscheidung treffen („Bias for Action“), innerhalb von Sekunden umsetzen und deployen. Die Kinder rufen sowieso sofort die nächste Änderung rein.
17. **Hintergrund-Presets in `GAME_CONFIG`:** Optische Themes und Hintergründe am besten über einfache Schalter oder Presets ansteuerbar halten, damit Änderungen blitzschnell sind.
18. **Mehrere Dateien ohne Build-Schritt:** Das Spiel ist in `js/*.js` aufgeteilt und wird über normale `<script src>`-Tags geladen – KEINE ES-Module (`type="module"`, `import`/`export`), denn die scheitern beim direkten Öffnen per `file://` an CORS. Klassische Skripte teilen sich einen globalen Bereich: Funktionen und `let`/`const` einer Datei sind in allen später geladenen sichtbar. Deshalb: jeden globalen Namen nur EINMAL deklarieren (zweites `let x` in einer anderen Datei = SyntaxError, die Datei lädt gar nicht) und Code, der sofort beim Laden läuft, darf nur Dinge aus früher geladenen Dateien benutzen. `js/game.js` bleibt die letzte Datei.
19. **`deploy.sh` von einem Branch:** Früher `git push origin main` = pushte den *lokalen* `main`, nicht den aktuellen Stand. Cloud-Agents arbeiten oft auf einem eigenen Branch → jetzt `git push origin HEAD:main`.
20. **Breitbild:** Alles, was im Hintergrund in fester Anzahl verteilt wird (Sterne, Wolken, Bäume), mit `wide = width / 390` multiplizieren – sonst wirkt es am Beamer leer. Immer in 3 Größen testen: 390×760, 844×390, 1440×900.
21. **CSS-Reihenfolge bei `@media`:** Eine Media-Query, die VOR der normalen Regel im CSS steht, wird von ihr überschrieben (gleiche Spezifität, spätere gewinnt). Querformat-Regeln für neue Elemente deshalb ans Dateiende von `style.css`.
22. **Playwright & rennende Figuren:** `page.click()` wartet, bis ein Element stillsteht – bei Musiala nie. In Tests `{ force: true }` oder `shootBomb(name)` per `evaluate` nutzen. Computer-Figuren werfen von allein – vor Eingabe-Tests `cpuNextThrow[n] = Infinity` setzen.
23. **Gegner-Kopien (Team-Modus):** Figuren können zur Laufzeit dazukommen (`actors['katze_3']` mit `kind: 'katze'`). Deshalb NIE `GAME_CONFIG[`${name}…`]` oder `getElementById(`${name}Btn`)` direkt – immer `actorCfg(name, 'Emoji')` und `actorBtn(name)` (kann `null` sein). `for (const name in actors)` erwischt Kopien automatisch.
24. **Bewegte Ziele & Flugzeit:** Bomben fliegen 42 Bilder lang. Kreist/rennt das Ziel weiter, landet die Bombe dort, wo es VORHER war. Lösung: Zielposition vorausberechnen (`decoyFor(..., 42)`). Ohne das fingen die Mini-Kobolde nur 7/12 Bomben, mit 12/12.
25. **Tempo bei vielen Figuren:** Gemessen (Playwright, Pixeldichte 3, Team-Level 8 mit 13 Figuren): 26 fps mit Rucklern bis 267 ms. Ursache: farbige Emojis per `fillText` jedes Bild neu rastern + 2,6 Mio. Pixel Leinwand. Lösung: Bilder-Speicher (`sprites.js`) + `maxPixelRatio: 2` → 58 fps. Messen mit `requestAnimationFrame`-Zähler; headless-Chromium malt ohne GPU, also nur Vorher/Nachher vergleichen.

---

## 8b. 🗺️ Code-Map `js/` (per `grep -n "function name" js/*.js` prüfen)

Ladereihenfolge in `index.html` = Reihenfolge der Tabelle.

| Datei | Was |
|---|---|
| `js/config.js` | `GAME_CONFIG` (Emojis, Größen, Physik, Bombe, `dragThreshold`, Wald) |
| `js/state.js` | Matter-Alias, DOM-Referenzen (`canvas`, `ctx`, `container`, `scoreEl`, …), `width`, `height`, `isPlaying`, `score`, `highScore`, `engine` |
| `js/sprites.js` | `renderDpr`, `spriteCache`, `getSprite(key, w, h, paint)`, `drawEmoji(emoji, x, y, size, bottom?)`, `drawLabel(text, x, y, { size, weight, fill, stroke, lineWidth })` – malt Emojis/Texte EINMAL in ein Mini-Canvas und kopiert es danach nur noch. **Im Spiel nie `ctx.fillText` mit Emojis direkt** (teuer!) |
| `js/audio.js` | `initAudio()`, `playTone(freq,type,dur,gain)`, `playSound(type)` – Typen: `point`, `gem`, `hit`, `bounce`, `throw`, `rain`, `night`, `day`, `sixseven`, `bigball`, `minis`, `jump`, `whirl`, `ready`, `popcorn`, `spear`, `hide`, `boom`; Ton-Schalter |
| `js/forest.js` | `FOREST_COLORS` (night/day), `skyLightPos()`, `forestData`, `initForest()`, `drawForest(now)` → `drawDaySky`/`drawNightSky`, `drawTreeLayers`, `drawButterflies`/`drawFireflies` |
| `js/particles.js` | `particles`, `spawnParticles(x, y, color, count)`, `spawnEmojiParticle(x, y, emoji, size)` (fällt mit Schwerkraft, z. B. 🪙), `drawParticles()` |
| `js/weather.js` | `raindrops`, `growingTrees`, `groundY()`, `isRaining(cloud, now)`, `spawnRain(now)`, `landRaindrop()`, `drawWeather(now)`, **Himmel-Antippen** `handleSkyTap(x, y)` (Canvas-`pointerdown`: Wolke → `rainUntil`, Sonne/Mond via `skyLightPos()` → `dayMode` umschalten + `initForest()`) |
| `js/footballer.js` | `updateFootballers()` (Figuren mit `<name>Runs` dribbeln hin und her, außer `actor.dragging`), `drawFootballer(shirt, size, now, dir, kick)` – malt Kopf, Trikot (Farbe, Nummer, Schwarz-Rot-Gold-Streifen), Hose, rennende Beine, schwingende Arme, hochgehaltenen Ball, Schuss-Bein (`kick` = `wiggle`), `isSixSeven(actor)` – nach Treffer (`sixSevenUntil`, gesetzt in `physics.js`, nur wenn Shirt `sixSeven: true`) 6-7-Handgeste + „6 7!“ über dem Kopf, steht dabei still. `drawActors` nimmt es statt des Emojis, wenn `GAME_CONFIG.<name>Shirt` existiert |
| `js/knockout.js` | `isAlive(name)`, `targetOf(name)` (Ziel – oder nächstes lebendes im Kreis), `checkKnockout(name)` (aus `physics.js` nach jedem Treffer; bei `hitsTaken >= maxHits` Explosion, Body raus, Knopf weg), `endGame(winner)` (Game-Over-Bildschirm mit `winnerMsg`: „DU GEWINNST“ / „Du bist raus“ / „X gewinnt“, Highscore; eigene Figur raus = sofort Ende), `reviveActors()` (aus `resetActors`), `drawLifeBar(actor)` |
| `js/actors.js` | `kindOf(name)`, `actorCfg(name, key)`, `actorBtn(name)` (Kopien-sicher!), `actors` (Liste: `kobold`, `corn`, `katze`, `maus`, `goblin`, `musiala` je mit `body`, `wiggle`, `target`, `start()`), `createActors()`, `moveActor(name, x, y)`, `resetActors()`, **Eingabe** (Pointer-Events: Ziehen = bewegen, Antippen = werfen), `drawActors(now)` |
| `js/bombs.js` | `fallingBodies`, `everyoneExcept(actor)` (Kollisionsmaske: alle Figuren außer Werfer), `shootBomb(actor, forcedTarget?)` (Abklingzeit, Ziel) → `launchArc(actor, target, { emoji, size, damage, special, flightFrames })` (Bogenwurf, auch für Popcorn), `explodeBomb()`, `clearAllBodies()`, `updateBombs(now)` – Muster für „Figur wirft etwas“ |
| `js/physics.js` | `applyHit(victim, shooter, damage, special)` – EINZIGE Stelle, die Schaden macht (Bomben, Katzensprung, Brennen): `hitsTaken`, `hitsGiven`, Aufladen (nur wenn nicht `special`), Score, `checkKnockout`. `initPhysics()` inkl. **`collisionStart`-Handler** (`customData.pierce` = fliegt durch, jede Figur einmal via `bomb.hitSet`) (Labels: `kobold`, `corn`, `katze`, `maus`, `goblin`, `musiala`, `characterBomb`; Treffer = JEDE lebende Figur außer dem Werfer (`customData.shooter`), nicht nur das Ziel → `wiggle`, `hitsTaken += customData.damage || 1`, `checkKnockout`; `miniKobold` → `blockByMini`), `resizeCanvas()` (Figuren per `moveActor` neu setzen!) |
| `js/cpu.js` | `playerActor` (eigene Figur, `null` = „Alle zusammen“), `isCpu(name)`, `chooseAndStart(name)`, `setupPlayers()` (aus `startGame`: Knöpfe der Computer-Figuren bekommen Klasse `cpu` = nicht antippbar), `updateCpu(now)` (Computer wirft alle `level().throwMs` ±40 %, mit Wahrscheinlichkeit `huntPlayer` per `shootBomb(name, playerActor)` auf dich), `drawPlayerMarker()`. Baut beim Laden die Auswahl-Kacheln `#pickGrid` aus `actors` (neue Figuren erscheinen automatisch). Muss NACH `actors.js` laden |
| `js/levels.js` | `currentLevel`, `nextLevel`, `level()` (Einstellungen aus `GAME_CONFIG.levels`), `startLevel()` (aus `startGame`), `finishLevel(won)` (aus `endGame`: Text + Knopf „WEITER ZU LEVEL n“ / „NOCHMAL LEVEL n“ / „ALLE n GESCHAFFT“), `drawLevelBanner(now)` |
| `js/teams.js` | `teamMode`, `chosenTeam`, `TEAM_COLORS` (🔵 mine / 🔴 enemy), `TEAM_BITS` (Physik-Kategorien 256/512 – kein Eigentor), `teamOf(name)`, `enemiesOf`, `nearestEnemy` (Ziel im Team-Modus), `removeClones()`, `setupTeams()` (nicht gewählte Figuren setzen aus, Gegner = Kopien `kind_i` mit `kind`-Feld, Aufstellung in Reihen), `teamScale()`, `drawTeamAura(name)`, `teamResult()`. Baut `#teamGrid`. Lädt nach `levels.js` |
| `js/specials.js` | `SPECIALS` (`musiala` → `bigBall` (6 Schaden), `kobold` → `spawnMinis`, `katze` → `catJump` (4 Schaden + Wirbel), `corn` → `popcorn` (10× 🍿 per `launchArc`), `goblin` → `fireSpear` (Sensor-Speer `pierce` durch alle, `startBurn` → `updateBurns` Schaden über Zeit, `drawSpear`), `maus` → `hideMouse` (`hiddenUntil`, `body.collisionFilter.mask = 0` = nichts trifft, `isHidden()` blockt `applyHit`, `updateHiding` macht sie wieder treffbar); per `kindOf`, gilt also auch für Gegner-Kopien), `trySpecial(name)`, `specialReady` (`specialCharge >= specialChargeHits`), `chargeSpecial(name)` (aus `physics.js` bei jedem Treffer mit NORMALEM Wurf, nicht mit Riesenball), `setupSpecialBar()` / `updateSpecialBar()` (Knöpfe `#specialBar` unten links für jede eigene Figur mit Kraft – Ladebalken, „12/20“, „BEREIT!“), `isStunned(name)` (blockiert Werfen, Ziehen, Dribbeln), `steerBalls()` (Riesenball: eigener folgt dem Finger `steer`, Computer-Ball zielsucht; keine Schwerkraft), Minis = Sensor-Bodies `miniKobold` (Kategorie `MINI_BIT` 1024, alle Bomben-Masken enthalten sie) + `decoyFor(target, from, frames)` (Bomben auf den Kobold zielen auf die vorausberechnete Mini-Position), `blockByMini()` (aus `physics.js`), `updateSpecials`, `drawSpecials`, `drawSpecialBadge` (⚡), `resetSpecials(keepCharge)` (aus `startGame(keepCharge)`; `true` nur beim „WEITER“ ins nächste Level → eigene Figuren behalten `specialCharge`, Computer starten bei 0). Computer laden genauso auf und nutzen Kräfte dann mit `cpuSpecialChance`. Kein Doppeltippen mehr (Figur antippen = immer werfen) |
| `js/credits.js` | `GAME_VERSION`, `WISHES` (Liste aller Kinder-Wünsche mit Version), `buildCredits()`, `showCredits()` (🎬-Knopf auf dem Game-Over-Bildschirm; automatisch nach dem letzten Level), `hideCredits()`. Version steht im Abzeichen auf dem Startbildschirm; 🎬-Knopf auch auf dem Startbildschirm (`#creditsStartBtn`) |
| `js/game.js` | `startGame()`, `gameLoop(now)` (ruft nur noch `drawForest` → `drawWeather` → `drawActors` → `drawSpecials` → `Engine.update` → `updateFootballers` → `updateCpu` → `updateSpecials` → `updateBombs` → `drawParticles` → `drawLevelBanner`), Initialisierung; `restartBtn` startet `nextLevel` |

## 8c. 🍳 Rezepte für typische Kinder-Wünsche

Immer danach: `for f in js/*.js; do node -c "$f"; done` → lokal testen mit `./serve.sh` (http://localhost:8000, kein Cache) bzw. Playwright im Handy-Viewport (390×760) → `./deploy.sh "…"`.

**Vorbild für alles Neue:** die Bombe (`shootBomb` / `explodeBomb` in `js/bombs.js`) und die Figuren-Liste `actors` (`js/actors.js`). Neues Spielkonzept = neue Datei in `js/` + `<script>` vor `js/game.js`. Es gibt (noch) keine fallenden Items. Game Over gibt es: wer `maxHits` Treffer hat, ist raus; die letzte Figur gewinnt (`js/knockout.js`). Neue Wurf-Funktionen IMMER `targetOf(name)` statt `actors[name].target` benutzen und `isAlive()` prüfen.

- **Andere Wurfsachen:** `bombEmoji` (alle) oder `<name>Bomb` (eine Figur, z. B. `katzeBomb: '🐟'`), dazu `<name>BombSize` und `<name>Trail` (fällt beim Fliegen heraus) in `GAME_CONFIG`. Kein weiterer Code nötig.
- **Anderes Ziel:** `target` der Figur in `actors` (`js/actors.js`) ändern.
- **Fallende Items / Gefahren vom Himmel:** gibt es nicht mehr. Neue Datei `js/items.js` nach Vorbild `shootBomb()` (Body in `fallingBodies` pushen, eigenes `customData`, Treffer im `collisionStart`-Handler VOR dem `continue` für Nicht-Bomben prüfen).
- **Neuer Sound:** neuen `else if (type === 'xyz')` in `playSound()` mit 1–2 `playTone()`-Aufrufen (≤ 300 ms, gain ≤ 0.3). Aufruf dort, wo es passiert.
- **Neue Geste (Doppeltippen, Wischen, Schütteln):** in den Eingabe-Block (`for (const name in actors)` in `js/actors.js`). Doppeltippen NICHT mit `dblclick` (iOS unzuverlässig), sondern Zeitstempel vergleichen (2 Taps < 300 ms). Nur reagieren wenn `isPlaying`. Cooldown in `GAME_CONFIG` ablegen.
- **Neue Wurf-Art (z. B. Bumerang, Laser):** `shootBomb(actor)` kopieren. Prinzip: `Bodies.circle` an `actors[name].body.position`, `Body.setVelocity`, `customData` mit eigenem Flag, `collisionFilter.mask` = `1 | everyoneExcept(name)`, in `fallingBodies` pushen (wird off-screen entfernt). Treffer im `collisionStart`-Handler prüfen; `Composite.remove` + `spawnParticles` + `playSound`; `actors[name].wiggle = 1`.
- **Neue Spezialkraft:** Eintrag in `SPECIALS` (`js/specials.js`) mit `icon` und `use(name)`-Funktion (gibt `false` zurück, wenn es nicht geht). Knopf unten links, Aufladen, ⚡-Anzeige und Computer-Nutzung laufen automatisch. Wer Bewegung/Werfen verhindern will: `stunnedUntil` setzen.
- **Neue Figur:** Eintrag in `actors` (`js/actors.js`, neue `category` = nächste Zweierpotenz, `target`, `start()`), `<name>Emoji`/`<name>Size` in `GAME_CONFIG`, `<button id="<name>Btn" class="actor-btn">` in `index.html` + Startposition in `style.css`. Rest (Physik, Ziehen, Werfen, Zeichnen, Resize) läuft automatisch.
- **Mehr/weniger Chaos:** `gravityY`, `restitution`, `frictionAir` in `GAME_CONFIG`.
- **Etwas im Hintergrund antippbar machen:** in `handleSkyTap()` (`js/weather.js`) einen Treffertest ergänzen (Abstand Finger ↔ Objekt). Der Canvas bekommt alle Taps, die nicht auf einer Figur landen.
- **Neuer Text / Button:** nur Deutsch, in `index.html`; Tap-Fläche ≥ 44×44 px.

## 9. 🗣️ Shared Vocabulary

- **Toy:** A single playable page or mini-game.
- **Bird / Projectile:** The player's launcher in slingshot toys.
- **Gurke:** The iconic local Spreewald cucumber target (the Lieberose "pig").
- **Vibecoding:** Live conversational coding on stage where kids shout ideas and AI updates the code.

---

## 10. ✅ Verification Checklist Before Declaring "Done"

- [ ] Works by opening file directly in browser (no build errors).
- [ ] Tested with mobile viewport emulation or real phone.
- [ ] Touch/tap controls work smoothly with one finger.
- [ ] All user-facing UI text is in **German**.
- [ ] No console errors.
- [ ] Audio unlocks properly after first tap.
- [ ] No external asset/CDN dependencies that could break offline.
- [ ] Deployed to Vercel via `./deploy.sh`.
