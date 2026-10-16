/**
 * 🌧️ weather.js – Regen aus den Wolken, und unten wachsen Bäume
 *
 * Jede Wolke lässt Regentropfen fallen. Trifft ein Tropfen den Boden,
 * spritzt es – und manchmal sprießt dort ein Samen 🌱, der langsam
 * zu einem Baum 🌳 heranwächst.
 *
 * Antippen am Himmel: Wolke → sie regnet. Sonne → Nacht. Mond → Tag.
 */

let raindrops = [];
let growingTrees = [];

// Wo ist unten? Knapp über dem Bildschirmrand, auf dem vorderen Waldboden.
function groundY() {
  return height * 0.97;
}

// Regnet diese Wolke gerade?
function isRaining(cloud, now) {
  return GAME_CONFIG.rain || cloud.rainUntil > now;
}

// Neue Tropfen unter den regnenden Wolken erzeugen.
function spawnRain(now) {
  for (const c of forestData.clouds) {
    if (isRaining(c, now) && Math.random() < GAME_CONFIG.rainAmount) {
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
  if (Math.random() < 0.15) {
    spawnParticles(drop.x, groundY(), 'rgba(147, 197, 253, 0.9)', 1);
  }
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
  if (GAME_CONFIG.dayMode) spawnRain(now);
  else raindrops = [];

  // 🌧️ Regentropfen
  if (raindrops.length > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.85)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = raindrops.length - 1; i >= 0; i--) {
      const d = raindrops[i];
      d.y += d.speed;
      if (d.y >= groundY()) {
        landRaindrop(d);
        raindrops.splice(i, 1);
        continue;
      }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y - 10);
    }
    ctx.stroke();
    ctx.restore();
  }

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
    drawEmoji(emoji, 0, 0, size, true); // 🖼️ sprites.js (unten = Boden)
    ctx.restore();
  }
  ctx.restore();
}

// 👆 Antippen am Himmel: Sonne/Mond wechselt Tag und Nacht, Wolke lässt es regnen.
function handleSkyTap(x, y) {
  const now = performance.now();
  const light = skyLightPos();
  if (Math.hypot(x - light.x, y - light.y) < 45) {
    GAME_CONFIG.dayMode = !GAME_CONFIG.dayMode;
    initForest(); // Bäume und Himmel in den neuen Farben
    spawnParticles(light.x, light.y, GAME_CONFIG.dayMode ? '#ffde59' : '#c7d2fe', 20);
    playSound(GAME_CONFIG.dayMode ? 'day' : 'night');
    return;
  }
  if (!GAME_CONFIG.dayMode) return; // Nachts gibt es keine Wolken
  for (const c of forestData.clouds) {
    const r = 18 * c.size;
    if (Math.abs(x - c.x) < r * 2.2 && Math.abs(y - c.y) < r * 1.6) {
      c.rainUntil = now + GAME_CONFIG.rainSeconds * 1000;
      playSound('rain');
      return;
    }
  }
}

canvas.addEventListener('pointerdown', (event) => {
  initAudio();
  const rect = canvas.getBoundingClientRect();
  handleSkyTap(event.clientX - rect.left, event.clientY - rect.top);
});
