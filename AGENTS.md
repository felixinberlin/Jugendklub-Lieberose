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
├── game.js           # Live game loop, Matter.js physics, Web Audio synthesizer
└── [toy-name]/       # Optional future mini-games (e.g. gurken-angriff/index.html)
```

### File Rules:
- **Root game:** The main live-coded game lives at root (`index.html`, `style.css`, `game.js`).
- **Additional toys:** Each additional toy lives in its own self-contained subfolder (`/gurken-angriff/index.html`).
- **No deep nesting:** Never nest directories deeper than two levels.

---

## 4. 🎮 The Live "Vibecoding" Architecture

### A. The `GAME_CONFIG` Object (Live Hacking Zone)
Located at the top of `game.js`. Designed for instant modifications when kids shout ideas on stage:
```javascript
const GAME_CONFIG = {
  playerEmoji: '🚀',       // Change player avatar (🐉, 🛹, 🐱, 🛸)
  playerSize: 52,

  // 🧪 Physics parameters (Super fun for kids!)
  gravityY: 0.9,          // 0.2 = Moon, 1.0 = Earth, 2.5 = Heavy Jupiter
  restitution: 0.85,      // Bounciness (0.0 = lead, 0.95 = super bouncy rubber ball)
  frictionAir: 0.015,     // Air resistance

  goodItems: [            // Catchable point items
    { emoji: '⭐', points: 1, size: 38, density: 0.001 },
    { emoji: '🍕', points: 2, size: 42, density: 0.0015 },
  ],
  badItems: [             // Hazards & obstacles
    { emoji: '💣', damage: 1, size: 42, density: 0.002 },
  ],
  spawnRateMs: 850,
  rainbowBackground: true
};
```

### B. Procedural Audio Engine (`Web Audio API`)
- Synthesize all beeps, chimes, bounces, and explosions on the fly.
- **NEVER load external MP3/WAV files.**
- Create / resume `AudioContext` only on the first user touch/click (mandatory for mobile iOS/Android autoplay policy).
- Keep sound effects short (< 300 ms) and comfortable volume (`gain ≤ 0.3`).

### C. Live Deployment Protocol
Whenever an edit is made:
1. Verify syntax: `node -c game.js`.
2. Run `./deploy.sh "<descriptive commit message>"`.
3. Pushes to `origin main` $\rightarrow$ Vercel automatically deploys within ~15 seconds.
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

11. **Doppeltippen:** `dblclick` ist auf iOS unzuverlässig. `registerTap()` vergleicht Zeitstempel (`doubleTapMs`). Handys feuern nach `touchstart` noch ein emuliertes `mousedown` – das zählt sonst als 2. Tap (= jeder Einzeltipp würde werfen). Lösung: `lastTouchTime` merken und `mousedown` innerhalb von 800 ms ignorieren. Maus-Doppelklick und Leertaste laufen über denselben Weg (`throwBomb()`).
12. **Eigene Projektile im `collisionStart`-Handler:** Der Handler behandelt jeden Body mit `customData` + Spieler-Kontakt als „Item einsammeln“. Neue Projektile (`isPlayerBomb`) deshalb ganz oben im Pair-Loop abfangen und mit `continue` verlassen, sonst werden sie wie gute Items eingesammelt.
13. **Array nicht während der Zeichen-Schleife umbauen:** `explodeBomb()` ersetzt `fallingBodies` per `filter`. Das ist im `collisionStart` (vor dem Zeichnen) okay, aber NICHT innerhalb der rückwärtigen Schleife im `gameLoop` – dort nur `splice(i, 1)` + `continue`.
14. **Testen ohne Handy:** `./serve.sh` + Playwright (Viewport 390×760). `game.js` nutzt globale `let`/`function`, daher lassen sich `fallingBodies`, `throwBomb()`, `isPlaying` direkt per `browser_evaluate` prüfen. Nach „Game Over“ (`isPlaying=false`) laufen keine Kollisionen mehr – Tests sofort nach `startGame` machen. Das `favicon.ico`-404 in der Konsole ist bekannt und harmlos.
15. **`.playwright-mcp/` nie committen:** `deploy.sh` macht `git add .` – Testordner stehen deshalb in `.gitignore`.

---

## 8b. 🗺️ Code-Map `game.js` (Zeilen ungefähr – per `grep -n "function name" game.js` prüfen)

| Was | Wo |
|---|---|
| `GAME_CONFIG` (Emojis, Physik, Items, Bombe, Spawnrate) | Z. 7 |
| Matter-Alias, DOM-Referenzen (`canvas`, `ctx`, `container`, `scoreEl`, …) | Z. 42–58 |
| Audio: `initAudio()`, `playTone(freq,type,dur,gain)`, `playSound(type)` – Typen: `point`, `gem`, `hit`, `bounce`, `throw`, `boom` | Z. 68–118 |
| State: `isPlaying`, `score`, `highScore`, `koboldBody`, `cornBody`, `cornWiggle`, `fallingBodies`, `particles`, `player` | Z. 124–155 |
| `initPhysics()` inkl. **`collisionStart`-Handler** (Labels: `player`, `kobold`, `corn`, `goodItem`, `badItem`, `playerBomb`) | Z. 157–246 |
| `resizeCanvas()` (Bumper per `Body.setPosition` neu setzen!) | Z. 248 |
| `spawnPhysicsItem()` – Vorlage für jeden neuen fallenden/fliegenden Body | Z. 291 |
| `spawnParticles(x, y, color, count)` | Z. 322 |
| **Mais-Bombe:** `throwBomb()`, `explodeBomb()`, `registerTap()` (Doppeltipp-Erkennung) – Muster für „Figur wirft etwas“ | Z. 340–406 |
| **Eingabe**: `handleTouchMove`, `touchstart/touchmove`, Maus, Tastatur (Leertaste = Bombe) | Z. 409–458 |
| `startGame()`, `gameOver()`, `clearAllBodies()` | Z. 460–510 |
| `gameLoop(now)` – Zeichnen (Kobold, Mais, Items, Partikel, Spieler) + Spawn-Timer | Z. 514–655 |

## 8c. 🍳 Rezepte für typische Kinder-Wünsche

Immer danach: `node -c game.js` → lokal testen mit `./serve.sh` (http://localhost:8000, kein Cache) bzw. Playwright im Handy-Viewport (390×760) → `./deploy.sh "…"`.

**Vorbild für alles Neue:** die Mais-Bombe (`throwBomb` / `explodeBomb` / `registerTap`). Die Rezepte unten verweisen darauf.

- **Neues Item / neue Gefahr:** nur Eintrag in `goodItems` / `badItems` in `GAME_CONFIG` (emoji, points/damage, size, density). Kein weiterer Code nötig.
- **Neuer Sound:** neuen `else if (type === 'xyz')` in `playSound()` mit 1–2 `playTone()`-Aufrufen (≤ 300 ms, gain ≤ 0.3). Aufruf dort, wo es passiert.
- **Neue Geste (Doppeltippen, Wischen, Schütteln):** in den Eingabe-Block (Z. ~324). Doppeltippen NICHT mit `dblclick` (iOS unzuverlässig), sondern Zeitstempel vergleichen (2 Taps < 300 ms). Nur reagieren wenn `isPlaying`. Cooldown in `GAME_CONFIG` ablegen.
- **Figur wirft/schießt etwas:** existiert schon als `throwBomb()` – kopieren und anpassen. Prinzip: Funktion nach Vorbild `spawnPhysicsItem()` – `Bodies.circle` an der Position von `cornBody`/`koboldBody`, `Body.setVelocity`, eigenes `label` (z. B. `'playerBomb'`), in `fallingBodies` pushen (damit es off-screen entfernt wird). Treffer im `collisionStart`-Handler per Label prüfen; `Composite.remove` + `spawnParticles` + `playSound`. Die Figur danach `…Wiggle = 1` setzen.
- **Neue Figur am Rand:** Body wie `cornBody` (static, hohe `restitution`), Position in `resizeCanvas()` mitführen, Zeichnen im `gameLoop`, Wiggle-Variable wie `cornWiggle`.
- **Mehr/weniger Chaos:** `gravityY`, `restitution`, `frictionAir`, `spawnRateMs` in `GAME_CONFIG`.
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
