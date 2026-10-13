/**
 * 🌲 forest.js – Der Lieberoser Zauberwald (Hintergrund)
 *
 * Nachthimmel, Sterne, Mond, drei Reihen Bäume und Glühwürmchen.
 * initForest() denkt sich den Wald aus, drawForest() malt ihn in jedem Bild neu.
 */

let forestData = {
  stars: [],
  fireflies: [],
  backTrees: [],
  midTrees: [],
  frontTrees: []
};

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
  // Sterne am Nachthimmel
  forestData.stars = [];
  for (let i = 0; i < 35; i++) {
    forestData.stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.55),
      size: Math.random() * 2 + 1,
      twinkleSpeed: Math.random() * 0.003 + 0.0015,
      phase: Math.random() * Math.PI * 2,
      baseAlpha: Math.random() * 0.5 + 0.3
    });
  }

  // Schwebende Glühwürmchen
  forestData.fireflies = [];
  for (let i = 0; i < 16; i++) {
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
  const backCount = 8;
  for (let i = 0; i <= backCount; i++) {
    const x = (width / backCount) * i + (Math.random() - 0.5) * (width / backCount * 0.5);
    const h = 65 + Math.random() * 35;
    const w = 32 + Math.random() * 18;
    const type = (i % 3 === 0) ? 'deciduous' : 'pine';
    forestData.backTrees.push({
      x, baseY: height * 0.88, w, h, type,
      foliageColor: '#122e2e', trunkColor: '#0a1d1d'
    });
  }

  // Mittlere Baumreihe (dichter Mischwald)
  forestData.midTrees = [];
  const midCount = 7;
  for (let i = 0; i <= midCount; i++) {
    const x = (width / midCount) * (i + 0.25) + (Math.random() - 0.5) * 18;
    const h = 95 + Math.random() * 45;
    const w = 48 + Math.random() * 22;
    const type = (i % 2 === 0) ? 'pine' : 'deciduous';
    forestData.midTrees.push({
      x, baseY: height * 0.93, w, h, type,
      foliageColor: (i % 2 === 0) ? '#1a4933' : '#22583b',
      trunkColor: '#1d1912'
    });
  }

  // Vordergrund-Bäume (Rahmen an den Seiten und Waldboden)
  forestData.frontTrees = [];
  // Große Kiefer links am Rand
  forestData.frontTrees.push({
    x: 18, baseY: height + 8, w: 90, h: Math.min(240, height * 0.35), type: 'pine',
    foliageColor: '#133e26', trunkColor: '#28180f'
  });
  // Große Kiefer rechts am Rand
  forestData.frontTrees.push({
    x: width - 18, baseY: height + 8, w: 92, h: Math.min(245, height * 0.36), type: 'pine',
    foliageColor: '#16432b', trunkColor: '#28180f'
  });
  // Schöne Bäume dazwischen
  forestData.frontTrees.push({
    x: width * 0.28, baseY: height + 15, w: 72, h: Math.min(160, height * 0.24), type: 'deciduous',
    foliageColor: '#1a4a30', trunkColor: '#2c1b11'
  });
  forestData.frontTrees.push({
    x: width * 0.72, baseY: height + 15, w: 76, h: Math.min(170, height * 0.25), type: 'pine',
    foliageColor: '#16452c', trunkColor: '#28180f'
  });
}

// Malt den ganzen Hintergrund – von hinten (Himmel) nach vorne (Glühwürmchen).
function drawForest(now) {
  // Nachthimmel & Dämmerung
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0.0, '#07111e');  // Tiefe Waldnacht
  skyGrad.addColorStop(0.45, '#0e232a'); // Geheimnisvolles Dämmergrün
  skyGrad.addColorStop(0.8, '#143628');  // Weicher Horizont über den Wipfeln
  skyGrad.addColorStop(1.0, '#0a1d14');  // Dunkler Waldboden
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Funkelnde Sterne
  for (const s of forestData.stars) {
    const alpha = s.baseAlpha + Math.sin(now * s.twinkleSpeed + s.phase) * 0.25;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, alpha))})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // Leuchtender Mond über den Bäumen
  const moonX = width * 0.82;
  const moonY = height * 0.12;
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
  ctx.fillText(GAME_CONFIG.moonEmoji || '🌙', moonX, moonY);

  // 🌲 Schicht 1: Ferner Wald & sanfter Hügel im Hintergrund
  ctx.fillStyle = '#0a1f22';
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
  ctx.fillStyle = '#0d2820';
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
  ctx.fillStyle = '#081a14';
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

  // ✨ Glühwürmchen, die durch den Wald schweben
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
