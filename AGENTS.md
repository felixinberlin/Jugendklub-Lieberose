# 🤖 AI Agent Guidelines – Jugendklub Lieberose Game

> **Audience:** AI agents (Antigravity, Cursor, Claude Code, Codex, etc.) working on this repository.
> **Project Context:** This game is developed live via "Vibecoding" in front of kids at the Jugendklub Lieberose (Germany).
> **Production URL:** [https://jugendklub.vercel.app/](https://jugendklub.vercel.app/)
> **GitHub Repository:** `felixinberlin/Jugendklub-Lieberose` (branch: `main`)

---

## ⚡ Core Philosophy: Zero-Friction Live Coding

1. **NO BUILD STEPS**:
   - Keep the project pure static vanilla HTML5, CSS, and modern JavaScript (`index.html`, `style.css`, `game.js`).
   - Do **NOT** install heavy bundlers (Webpack, Vite, Rollup) or heavy game engines (Phaser, Godot Web, Unity).
   - *Why?* During a live workshop on stage, compilation failures or missing npm dependencies break the live flow. Plain files deploy to Vercel in 10 seconds.

2. **NO EXTERNAL ASSET DEPENDENCIES**:
   - Do **NOT** rely on external image URLs or CDN links (which can fail on youth club Wi-Fi).
   - Use **Canvas drawing, Emojis, and Procedural Particles** for sprites and animations.
   - Use **Web Audio API** (`playTone`, synthesizer) for all sound effects.

3. **MOBILE-FIRST TOUCH CONTROLS**:
   - 90% of players are using iPhones or Android phones.
   - Every feature MUST work seamlessly with single-finger touch or swipe.
   - Never introduce UI elements that require keyboard-only inputs without a touch alternative.

---

## 📁 Repository Structure

```
/home/felix/Jugend/
├── index.html        # Viewport, HUD overlay, start/game over screens, audio button
├── style.css         # Arcade styling, safe-area insets, mobile touch lock
├── game.js           # Core loop, touch inputs, Web Audio synthesizer, GAME_CONFIG
├── vercel.json       # Cache-Control: max-age=0 (ensures kids see fresh code on refresh)
├── deploy.sh         # 1-command git add/commit/push script
├── qr-code.png       # Scannable QR code for projector screen
└── AGENTS.md         # This agent instructions file
```

---

## 🎮 How `game.js` is Structured

### 1. The `GAME_CONFIG` Object (Live Hacking Zone)
Located at the top of `game.js`. Designed for instant modifications when kids shout ideas:
```javascript
const GAME_CONFIG = {
  playerEmoji: '🚀',       // Change player character
  playerSize: 46,
  goodItems: [            // Catchable point items
    { emoji: '⭐', points: 1, speed: 3 },
    { emoji: '🍕', points: 2, speed: 3.5 },
  ],
  badItems: [             // Hazards
    { emoji: '💣', damage: 1, speed: 3.5 },
  ],
  baseSpeed: 1.0,
  speedIncrement: 0.05,
  spawnRateMs: 800,
  backgroundStars: 40
};
```

### 2. Audio Engine (`initAudio` & `playTone`)
- Uses browser Web Audio API.
- Automatically resumed on first user touch to comply with mobile autoplay policies.
- Synthesizes beeps, chimes, and explosions on the fly.

### 3. Rendering & DPI Scaling (`resizeCanvas`)
- Handles `window.devicePixelRatio` for retina clarity.
- Container constrained to `max-width: 500px` on desktop for portrait smartphone simulation.

### 4. Input Handling
- `touchstart` / `touchmove` / `touchend` with `{ passive: true }`.
- Smooth lerp interpolation for player movement: `player.x += (player.targetX - player.x) * 0.22`.
- Desktop mouse and `ArrowLeft` / `ArrowRight` fallback for local testing.

---

## 🛠️ Common Vibecoding Recipes for Agents

When the user asks to add features suggested by the kids, use these patterns:

### Recipe A: Adding a Power-up or Special Item
1. Add item to `GAME_CONFIG.goodItems` with a special property (e.g. `isPowerup: true`, `powerType: 'shield'`).
2. In collision check (`dist < hitRadius`), check `item.powerType`:
   - Shield: `player.hasShield = true;`
   - Turbo: `GAME_CONFIG.baseSpeed *= 1.5; setTimeout(...)`
   - Magnet: pull nearby good items towards player.

### Recipe B: Adding a Boss or Giant Hazard
1. Spawn a special hazard with larger size (e.g., `size: 80`, `emoji: '🦖'`).
2. Add a wobble or sine-wave horizontal motion in `gameLoop`:
   `item.x += Math.sin(now / 200) * 3;`

### Recipe C: Changing Background / Themes
- Day/Night switch or seasonal themes (snow, underwater, space).
- Adjust the background clearing color or star drawing function.

---

## 🚀 Deployment Protocol

Whenever an edit to the game is completed:
1. Verify syntax (no unclosed tags, valid JS).
2. Execute `./deploy.sh "<descriptive commit message>"`
3. Confirm deployment pushes to `origin main`.
4. Inform user that Vercel is updating and kids can refresh their phones in ~15 seconds.
