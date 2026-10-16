/**
 * 🌲 forest.js – Der Lieberoser Zauberwald (Hintergrund)
 *
 * Nachts: Sternenhimmel, Mond und Glühwürmchen. Tags: blauer Himmel, Sonne,
 * Wolken und Schmetterlinge. Umschalten mit `dayMode` in config.js.
 * initForest() denkt sich den Wald aus, drawForest() malt ihn in jedem Bild neu.
 */

let forestData = {
  stars: [],
  fireflies: [],
  backTrees: [],
  midTrees: [],
  frontTrees: []
};

// 🎨 Farben für Nacht und Tag. Welche gilt, entscheidet GAME_CONFIG.dayMode.
const FOREST_COLORS = {
  night: {
    sky: ['#07111e', '#0e232a', '#143628', '#0a1d14'],
    hills: ['#0a1f22', '#0d2820', '#081a14'],
    back: '#122e2e', backTrunk: '#0a1d1d',
    mid: ['#1a4933', '#22583b'], midTrunk: '#1d1912',
    front: ['#133e26', '#16432b', '#1a4a30', '#16452c'], frontTrunk: '#28180f'
  },
  day: {
    sky: ['#3fa9f5', '#8fd3ff', '#d4f1ff', '#7cc66a'],
    hills: ['#5fae6b', '#4c9a55', '#3d8a45'],
    back: '#6fb87a', backTrunk: '#5a7d4f',
    mid: ['#3f9a4f', '#4fb05a'], midTrunk: '#6b4a2b',
    front: ['#2f8a3e', '#33923f', '#3ea34a', '#2f8f3c'], frontTrunk: '#5c3a1e'
  }
};
function forestColors() {
  return GAME_CONFIG.dayMode ? FOREST_COLORS.day : FOREST_COLORS.night;
}

// 🌲 Bäume zeichnen (Kiefern & Laubbäume für den Lieberoser Zauberwald)
function drawPineTree(ctx, x, baseY, w, h, foliageColor, trunkColor, sway = 0) {
  const trunkW = Math.max(4, Math.round(w * 0.16));
  const trunkH = Math.round(h * 0.26);

  // Baumstamm
  ctx.fillStyle = trunkColor;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  // Nadelkrone in 3 Etagen
  ctx.fillStyle = foliageColor;
  const tiers = 3;
  const tierH = (h - trunkH * 0.35) / tiers;
  const overlap = tierH * 0.35;

  for (let i = 0; i < tiers; i++) {
    const bY = baseY - trunkH * 0.5 - i * (tierH - overlap);
    const tY = bY - tierH;
    const tierW = w * (1 - i * 0.22);
    const tierSway = sway * ((i + 1) / tiers);

    ctx.beginPath();
    ctx.moveTo(x + tierSway, tY);
    ctx.lineTo(x + tierW / 2 + tierSway * 0.6, bY);
    ctx.quadraticCurveTo(x + tierSway * 0.3, bY - 3, x - tierW / 2 + tierSway * 0.6, bY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDeciduousTree(ctx, x, baseY, w, h, foliageColor, trunkColor, sway = 0) {
  const trunkW = Math.max(5, Math.round(w * 0.18));
  const trunkH = Math.round(h * 0.36);

  // Baumstamm
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.7, baseY);
  ctx.lineTo(x - trunkW * 0.4, baseY - trunkH);
  ctx.lineTo(x + trunkW * 0.4, baseY - trunkH);
  ctx.lineTo(x + trunkW * 0.7, baseY);
  ctx.closePath();
  ctx.fill();

  // Laubkrone (wolkenförmige Kreise)
  ctx.fillStyle = foliageColor;
  const crownY = baseY - trunkH - h * 0.25;
  const r = w * 0.42;

  ctx.beginPath();
  ctx.arc(x + sway, crownY, r, 0, Math.PI * 2);
  ctx.arc(x - r * 0.5 + sway * 0.8, crownY + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + r * 0.5 + sway * 0.8, crownY + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + sway * 1.1, crownY - r * 0.3, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function initForest() {
  const colors = forestColors();
  // Breiter Bildschirm (quer, Laptop, Beamer) = mehr Sterne, Wolken und Bäume
  const wide = Math.max(1, width / 390);

  // Sterne am Nachthimmel
  forestData.stars = [];
  for (let i = 0; i < 35 * wide; i++) {
    forestData.stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.55),
      size: Math.random() * 2 + 1,
      twinkleSpeed: Math.random() * 0.003 + 0.0015,
      phase: Math.random() * Math.PI * 2,
      baseAlpha: Math.random() * 0.5 + 0.3
    });
  }

  // Wolken am Taghimmel
  forestData.clouds = [];
  for (let i = 0; i < 5 * wide; i++) {
    forestData.clouds.push({
      x: Math.random() * width,
      y: height * (0.05 + Math.random() * 0.4),
      size: 0.7 + Math.random() * 0.7,
      speed: 0.1 + Math.random() * 0.2,
      rainUntil: 0 // Bis wann diese Wolke regnet (Wolke antippen!)
    });
  }

  // Schwebende Glühwürmchen (tagsüber: Schmetterlinge)
  forestData.fireflies = [];
  for (let i = 0; i < 16 * wide; i++) {
    forestData.fireflies.push({
      x: Math.random() * width,
      y: height * 0.35 + Math.random() * (height * 0.58),
      size: Math.random() * 2.2 + 1.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Hintergrund-Bäume (ferne Silhouetten am Horizont)
  forestData.backTrees = [];
  const backCount = Math.round(8 * wide);
  for (let i = 0; i <= backCount; i++) {
    const x = (width / backCount) * i + (Math.random() - 0.5) * (width / backCount * 0.5);
    const h = 65 + Math.random() * 35;
    const w = 32 + Math.random() * 18;
    const type = (i % 3 === 0) ? 'deciduous' : 'pine';
    forestData.backTrees.push({
      x, baseY: height * 0.88, w, h, type,
      foliageColor: colors.back, trunkColor: colors.backTrunk
    });
  }

  // Mittlere Baumreihe (dichter Mischwald)
  forestData.midTrees = [];
  const midCount = Math.round(7 * wide);
  for (let i = 0; i <= midCount; i++) {
    const x = (width / midCount) * (i + 0.25) + (Math.random() - 0.5) * 18;
    const h = 95 + Math.random() * 45;
    const w = 48 + Math.random() * 22;
    const type = (i % 2 === 0) ? 'pine' : 'deciduous';
    forestData.midTrees.push({
      x, baseY: height * 0.93, w, h, type,
      foliageColor: colors.mid[i % 2],
      trunkColor: colors.midTrunk
    });
  }

  // Vordergrund-Bäume (Rahmen an den Seiten und Waldboden)
  forestData.frontTrees = [];
  // Große Kiefer links am Rand
  forestData.frontTrees.push({
    x: 18, baseY: height + 8, w: 90, h: Math.min(240, height * 0.35), type: 'pine',
    foliageColor: colors.front[0], trunkColor: colors.frontTrunk
  });
  // Große Kiefer rechts am Rand
  forestData.frontTrees.push({
    x: width - 18, baseY: height + 8, w: 92, h: Math.min(245, height * 0.36), type: 'pine',
    foliageColor: colors.front[1], trunkColor: colors.frontTrunk
  });
  // Schöne Bäume dazwischen
  forestData.frontTrees.push({
    x: width * 0.28, baseY: height + 15, w: 72, h: Math.min(160, height * 0.24), type: 'deciduous',
    foliageColor: colors.front[2], trunkColor: colors.frontTrunk
  });
  forestData.frontTrees.push({
    x: width * 0.72, baseY: height + 15, w: 76, h: Math.min(170, height * 0.25), type: 'pine',
    foliageColor: colors.front[3], trunkColor: colors.frontTrunk
  });
}

let cachedSkyGrad = null;
let cachedSkyHeight = 0;
let cachedSkyDay = null;

function getSkyGradient(colors, day) {
  if (cachedSkyGrad && cachedSkyHeight === height && cachedSkyDay === day) {
    return cachedSkyGrad;
  }
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0.0, colors.sky[0]);  // Oben
  skyGrad.addColorStop(0.45, colors.sky[1]);
  skyGrad.addColorStop(0.8, colors.sky[2]);  // Horizont über den Wipfeln
  skyGrad.addColorStop(1.0, colors.sky[3]);  // Waldboden
  cachedSkyGrad = skyGrad;
  cachedSkyHeight = height;
  cachedSkyDay = day;
  return skyGrad;
}

// Malt den ganzen Hintergrund – von hinten (Himmel) nach vorne (Glühwürmchen).
function drawForest(now) {
  const colors = forestColors();
  const day = GAME_CONFIG.dayMode;

  // Himmel (nachts dunkel, tagsüber blau)
  ctx.fillStyle = getSkyGradient(colors, day);
  ctx.fillRect(0, 0, width, height);

  if (day) drawDaySky(now);
  else drawNightSky(now);

  drawTreeLayers(now, colors);

  if (day) drawButterflies(now);
  else drawFireflies(now);
}

// ☁️☀️ Sonne und Wolken
// Wo Sonne und Mond am Himmel stehen (gleiche Stelle – zum Antippen in weather.js)
function skyLightPos() {
  return { x: width * 0.82, y: height * 0.12 };
}

function drawDaySky(now) {
  const { x: sunX, y: sunY } = skyLightPos();
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
  sunGlow.addColorStop(0, 'rgba(255, 236, 120, 0.7)');
  sunGlow.addColorStop(1, 'rgba(255, 236, 120, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(now * 0.0003); // Sonne dreht sich langsam
  drawEmoji(GAME_CONFIG.sunEmoji || '☀️', 0, 0, 44); // 🖼️ sprites.js
  ctx.restore();

  for (const c of forestData.clouds) {
    // Regenwolken sind grau, sonst weiß
    ctx.fillStyle = isRaining(c, now) ? 'rgba(203, 213, 225, 0.95)' : 'rgba(255, 255, 255, 0.9)';
    c.x += c.speed;
    if (c.x > width + 80) c.x = -80;
    const r = 18 * c.size;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.arc(c.x + r, c.y + r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(c.x - r, c.y + r * 0.25, r * 0.7, 0, Math.PI * 2);
    ctx.arc(c.x + r * 0.3, c.y - r * 0.5, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 🌙✨ Sterne und Mond
function drawNightSky(now) {
  // Funkelnde Sterne
  for (const s of forestData.stars) {
    const alpha = s.baseAlpha + Math.sin(now * s.twinkleSpeed + s.phase) * 0.25;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, alpha))})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // Leuchtender Mond über den Bäumen
  const { x: moonX, y: moonY } = skyLightPos();
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 42);
  moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
  moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '34px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawEmoji(GAME_CONFIG.moonEmoji || '🌙', moonX, moonY, 34); // 🖼️ sprites.js
}

// 🌲 Drei Reihen Hügel und Bäume, von hinten nach vorne
function drawTreeLayers(now, colors) {
  // 🌲 Schicht 1: Ferner Wald & sanfter Hügel im Hintergrund
  ctx.fillStyle = colors.hills[0];
  ctx.beginPath();
  ctx.moveTo(0, height * 0.85);
  ctx.quadraticCurveTo(width * 0.5, height * 0.81, width, height * 0.86);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windBack = Math.sin(now * 0.0018) * 2;
  for (let i = 0; i < forestData.backTrees.length; i++) {
    const t = forestData.backTrees[i];
    const sway = windBack * Math.sin(i * 1.5 + 1);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

  // 🌲 Schicht 2: Mittlerer Waldboden & Mischwald
  ctx.fillStyle = colors.hills[1];
  ctx.beginPath();
  ctx.moveTo(0, height * 0.91);
  ctx.quadraticCurveTo(width * 0.45, height * 0.87, width, height * 0.92);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windMid = Math.sin(now * 0.0022 + 1) * 3.5;
  for (let i = 0; i < forestData.midTrees.length; i++) {
    const t = forestData.midTrees[i];
    const sway = windMid * Math.sin(i * 1.2 + 2);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

  // 🌲 Schicht 3: Vordergrund-Waldboden & große Randbäume
  ctx.fillStyle = colors.hills[2];
  ctx.beginPath();
  ctx.moveTo(0, height * 0.96);
  ctx.quadraticCurveTo(width * 0.6, height * 0.92, width, height * 0.97);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const windFront = Math.sin(now * 0.0025 + 2) * 5;
  for (let i = 0; i < forestData.frontTrees.length; i++) {
    const t = forestData.frontTrees[i];
    const sway = windFront * Math.sin(i * 1.7 + 3);
    if (t.type === 'pine') {
      drawPineTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    } else {
      drawDeciduousTree(ctx, t.x, t.baseY, t.w, t.h, t.foliageColor, t.trunkColor, sway);
    }
  }

}

// ✨ Glühwürmchen, die durch den Wald schweben
function drawFireflies(now) {
  for (const f of forestData.fireflies) {
    f.x += f.speedX + Math.sin(now * 0.002 + f.phase) * 0.35;
    f.y += f.speedY + Math.cos(now * 0.0025 + f.phase) * 0.25;
    if (f.x < -10) f.x = width + 10;
    if (f.x > width + 10) f.x = -10;
    if (f.y < height * 0.35) f.y = height * 0.9;
    if (f.y > height * 0.95) f.y = height * 0.38;

    const glow = (Math.sin(now * 0.004 + f.phase) + 1) * 0.5;
    ctx.fillStyle = `rgba(254, 240, 138, ${glow * 0.85})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(110, 231, 183, ${glow * 0.25})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 🦋 Schmetterlinge flattern tagsüber (sie benutzen die Wege der Glühwürmchen)
function drawButterflies(now) {
  ctx.save();
  ctx.font = '16px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < forestData.fireflies.length; i += 3) {
    const f = forestData.fireflies[i];
    f.x += f.speedX * 2 + Math.sin(now * 0.002 + f.phase) * 0.6;
    f.y += Math.cos(now * 0.003 + f.phase) * 0.5;
    if (f.x < -10) f.x = width + 10;
    if (f.x > width + 10) f.x = -10;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(0.6 + Math.abs(Math.sin(now * 0.012 + f.phase)) * 0.4, 1); // Flügelschlag
    drawEmoji('🦋', 0, 0, 16); // 🖼️ sprites.js
    ctx.restore();
  }
  ctx.restore();
}
