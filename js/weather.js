/**
 * 🌧️ weather.js – Regen aus den Wolken, und unten wachsen Bäume
 *
 * Jede Wolke lässt Regentropfen fallen. Trifft ein Tropfen den Boden,
 * spritzt es – und manchmal sprießt dort ein Samen 🌱, der langsam
 * zu einem Baum 🌳 heranwächst. Schalter: `rain` in config.js.
 */

let raindrops = [];
let growingTrees = [];

// Wo ist unten? Knapp über dem Bildschirmrand, auf dem vorderen Waldboden.
function groundY() {
  return height * 0.97;
}

// Neue Tropfen unter den Wolken erzeugen.
function spawnRain() {
  for (const c of forestData.clouds) {
    if (Math.random() < GAME_CONFIG.rainAmount) {
      const r = 18 * c.size;
      raindrops.push({
        x: c.x + (Math.random() - 0.5) * r * 2.5,
        y: c.y + r * 0.6,
        speed: 6 + Math.random() * 3
      });
    }
  }
}

// Ein Tropfen ist unten angekommen: spritzen und vielleicht einen Baum pflanzen.
function landRaindrop(drop) {
  spawnParticles(drop.x, groundY(), 'rgba(147, 197, 253, 0.9)', 2);
  if (Math.random() > GAME_CONFIG.treeChance) return;
  if (growingTrees.length >= GAME_CONFIG.maxGrowingTrees) return;
  // Nicht zu dicht neben einen anderen Baum
  for (const t of growingTrees) {
    if (Math.abs(t.x - drop.x) < 30) return;
  }
  growingTrees.push({
    x: drop.x,
    y: groundY() - Math.random() * height * 0.04,
    born: performance.now(),
    emoji: GAME_CONFIG.treeEmojis[Math.floor(Math.random() * GAME_CONFIG.treeEmojis.length)]
  });
}

// Wird in jedem Bild aufgerufen: Regen fallen lassen, Bäume wachsen lassen, alles malen.
function drawWeather(now) {
  if (!GAME_CONFIG.rain || !GAME_CONFIG.dayMode) {
    raindrops = [];
  } else {
    spawnRain();
  }

  // 🌧️ Regentropfen
  ctx.save();
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.85)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const d = raindrops[i];
    d.y += d.speed;
    if (d.y >= groundY()) {
      landRaindrop(d);
      raindrops.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 1, d.y - 10);
    ctx.stroke();
  }
  ctx.restore();

  // 🌱 → 🌿 → 🌳 Bäume wachsen von klein nach groß
  const growMs = GAME_CONFIG.treeGrowSeconds * 1000;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  for (const t of growingTrees) {
    const grown = Math.min(1, (now - t.born) / growMs); // 0 = Samen, 1 = fertig
    const emoji = grown < 0.25 ? '🌱' : grown < 0.55 ? '🌿' : t.emoji;
    const size = 14 + grown * (GAME_CONFIG.treeMaxSize - 14);
    const sway = Math.sin(now * 0.002 + t.x) * 0.05;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(sway);
    ctx.font = `${size}px -apple-system, sans-serif`;
    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
