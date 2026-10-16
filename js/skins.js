/**
 * ✨ skins.js – Edle Pro-Skins für alle Figuren (keine Grusel-Monster, keine Kinder-Emojis!)
 *
 * Jede Figur bleibt genau sie selbst mit derselben Funktion und denselben Attacken,
 * sieht aber dank 3D-Schattierung, Glanzlichtern, Stirnbändern und Rüstungs-Details
 * wie in einem echten Pro-Action-Spiel aus!
 * Wird einmal pro Figur in den Bilder-Speicher (getSprite) gemalt → volle 60 FPS!
 */

function drawProEyes(g, y, spread, irisColor) {
  g.save();
  for (const dir of [-1, 1]) {
    const cx = dir * spread;
    // Weißer Augapfel mit entschlossenem Pro-Blick
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#0f172a';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(cx, y, 6.2, 5.2, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Farbige Iris
    g.fillStyle = irisColor || '#0284c7';
    g.beginPath();
    g.arc(cx + dir * -0.5, y + 0.5, 3.3, 0, Math.PI * 2);
    g.fill();

    // Dunkle Pupille
    g.fillStyle = '#090d16';
    g.beginPath();
    g.arc(cx + dir * -0.5, y + 0.5, 1.8, 0, Math.PI * 2);
    g.fill();

    // Helles Glanzlicht
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(cx - 1.8, y - 1.5, 1.4, 0, Math.PI * 2);
    g.fill();
  }
  // Sportlich-entschlossene Augenbrauen (nicht böse/gruselig, sondern fokussiert!)
  g.strokeStyle = '#0f172a';
  g.lineWidth = 2.8;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-spread - 6, y - 6);
  g.lineTo(-spread + 5, y - 4);
  g.moveTo(spread + 6, y - 6);
  g.lineTo(spread - 5, y - 4);
  g.stroke();
  g.restore();
}

function drawProSmile(g, y, width) {
  g.save();
  g.strokeStyle = '#0f172a';
  g.lineWidth = 2.6;
  g.lineCap = 'round';
  // Selbstbewusstes Pro-Grinsen
  g.beginPath();
  g.arc(0, y - 2, width, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  g.restore();
}

function paintProSkin(g, kind) {
  // Dezenter farbiger Energie-Ring im Hintergrund
  const ringColors = {
    kobold: '#10b981',
    corn: '#facc15',
    katze: '#f472b6',
    maus: '#94a3b8',
    goblin: '#fb923c',
    drache: '#22c55e',
    zeus: '#38bdf8'
  };
  const glow = g.createRadialGradient(0, 0, 14, 0, 0, 42);
  glow.addColorStop(0, (ringColors[kind] || '#38bdf8') + '44');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow;
  g.beginPath();
  g.arc(0, 0, 42, 0, Math.PI * 2);
  g.fill();

  g.lineJoin = 'round';
  g.lineCap = 'round';

  if (kind === 'kobold') {
    // 🧌 Pro-Kobold: Smaragd-Waldläufer mit Gold-Stirnreif & spitzen Ohren
    g.fillStyle = '#10b981';
    g.strokeStyle = '#064e3b';
    g.lineWidth = 2.5;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 20, -4);
      g.lineTo(dir * 35, -12);
      g.lineTo(dir * 22, 7);
      g.closePath();
      g.fill();
      g.stroke();
    }
    const headGrad = g.createRadialGradient(-6, -8, 4, 0, 0, 25);
    headGrad.addColorStop(0, '#6ee7b7');
    headGrad.addColorStop(1, '#059669');
    g.fillStyle = headGrad;
    g.beginPath();
    g.arc(0, 0, 23, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Goldener Champion-Stirnreif mit Edelstein
    g.fillStyle = '#facc15';
    g.strokeStyle = '#92400e';
    g.lineWidth = 2;
    g.fillRect(-21, -15, 42, 6);
    g.strokeRect(-21, -15, 42, 6);
    g.fillStyle = '#38bdf8';
    g.beginPath();
    g.arc(0, -12, 4, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    drawProEyes(g, -2, 8.5, '#065f46');
    drawProSmile(g, 9, 9);
  } else if (kind === 'corn') {
    // 🌽 Pro-Mais: Goldener Champion-Maiskolben mit glänzenden Blättern & Stirnband
    g.fillStyle = '#16a34a';
    g.strokeStyle = '#14532d';
    g.lineWidth = 2.5;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 8, 25);
      g.quadraticCurveTo(dir * 32, 4, dir * 23, -18);
      g.quadraticCurveTo(dir * 13, 6, dir * 4, 24);
      g.closePath();
      g.fill();
      g.stroke();
    }
    const cornGrad = g.createLinearGradient(-12, -24, 12, 24);
    cornGrad.addColorStop(0, '#fef08a');
    cornGrad.addColorStop(0.5, '#facc15');
    cornGrad.addColorStop(1, '#ca8a04');
    g.fillStyle = cornGrad;
    g.strokeStyle = '#713f12';
    g.beginPath();
    g.ellipse(0, -1, 17, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Rotes Pro-Stirnband
    g.fillStyle = '#ef4444';
    g.fillRect(-16, -15, 32, 5);

    drawProEyes(g, -4, 7, '#ca8a04');
    drawProSmile(g, 8, 7.5);
  } else if (kind === 'katze') {
    // 🐱 Pro-Katze: Edle Ninja-Samtkatze mit glänzenden Ohren & blauem Halstuch
    const catGrad = g.createRadialGradient(-5, -6, 4, 0, 0, 24);
    catGrad.addColorStop(0, '#fb923c');
    catGrad.addColorStop(1, '#ea580c');
    g.fillStyle = catGrad;
    g.strokeStyle = '#7c2d12';
    g.lineWidth = 2.5;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 18, -11);
      g.lineTo(dir * 23, -30);
      g.lineTo(dir * 5, -19);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = '#fda4af';
      g.beginPath();
      g.moveTo(dir * 15, -14);
      g.lineTo(dir * 19, -25);
      g.lineTo(dir * 8, -19);
      g.closePath();
      g.fill();
      g.fillStyle = catGrad;
    }
    g.beginPath();
    g.arc(0, 0, 22, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Schnurrhaare
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1.8;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 13, 2); g.lineTo(dir * 29, 0);
      g.moveTo(dir * 13, 6); g.lineTo(dir * 29, 7);
      g.stroke();
    }
    drawProEyes(g, -3, 8, '#10b981');
    // Rosa Katzen-Näschen
    g.fillStyle = '#f43f5e';
    g.beginPath();
    g.arc(0, 3, 2.8, 0, Math.PI * 2);
    g.fill();
    drawProSmile(g, 9, 7);
  } else if (kind === 'maus') {
    // 🐭 Pro-Maus: Flinke Speed-Maus mit großen runden Ohren & gelber Sportbrille/Stirnband
    g.fillStyle = '#94a3b8';
    g.strokeStyle = '#334155';
    g.lineWidth = 2.5;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.arc(dir * 18, -17, 10, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = '#f9a8d4';
      g.beginPath();
      g.arc(dir * 18, -17, 5.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#94a3b8';
    }
    const mGrad = g.createRadialGradient(-5, -5, 3, 0, 0, 22);
    mGrad.addColorStop(0, '#e2e8f0');
    mGrad.addColorStop(1, '#64748b');
    g.fillStyle = mGrad;
    g.beginPath();
    g.arc(0, 1, 20, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Cooles blaues Speed-Stirnband
    g.fillStyle = '#38bdf8';
    g.fillRect(-19, -12, 38, 5);

    drawProEyes(g, -2, 7.5, '#2563eb');
    g.fillStyle = '#ec4899';
    g.beginPath();
    g.arc(0, 4, 2.6, 0, Math.PI * 2);
    g.fill();
    drawProSmile(g, 9, 6.5);
  } else if (kind === 'goblin') {
    // 👺 Pro-Goblin: Feuriger Samurai-Krieger mit goldenen Hörnern & Flammen-Wappen
    g.fillStyle = '#facc15';
    g.strokeStyle = '#854d0e';
    g.lineWidth = 2;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 13, -16);
      g.quadraticCurveTo(dir * 26, -32, dir * 18, -34);
      g.quadraticCurveTo(dir * 10, -24, dir * 6, -18);
      g.closePath();
      g.fill();
      g.stroke();
    }
    const gobGrad = g.createRadialGradient(-6, -6, 4, 0, 0, 24);
    gobGrad.addColorStop(0, '#f87171');
    gobGrad.addColorStop(1, '#dc2626');
    g.fillStyle = gobGrad;
    g.strokeStyle = '#7f1d1d';
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, 0, 23, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    drawProEyes(g, -3, 8.5, '#f59e0b');
    drawProSmile(g, 9, 9);
  } else if (kind === 'drache') {
    // 🐉 Pro-Drache: Edler Smaragd-Drache mit goldenen Hörnern & Flügeln
    g.fillStyle = '#16a34a';
    g.strokeStyle = '#14532d';
    g.lineWidth = 2.2;
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 16, -4);
      g.lineTo(dir * 38, -18);
      g.lineTo(dir * 32, 3);
      g.lineTo(dir * 39, 12);
      g.lineTo(dir * 17, 10);
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.fillStyle = '#facc15';
    for (const dir of [-1, 1]) {
      g.beginPath();
      g.moveTo(dir * 11, -16);
      g.lineTo(dir * 20, -33);
      g.lineTo(dir * 4, -20);
      g.closePath();
      g.fill();
      g.stroke();
    }
    const dGrad = g.createRadialGradient(-5, -6, 4, 0, 0, 24);
    dGrad.addColorStop(0, '#4ade80');
    dGrad.addColorStop(1, '#15803d');
    g.fillStyle = dGrad;
    g.beginPath();
    g.arc(0, 0, 22, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    drawProEyes(g, -3, 8.5, '#eab308');
    drawProSmile(g, 9, 8.5);
  } else if (kind === 'zeus') {
    // ⚡ Pro-Zeus: Strahlender Donnergott mit goldener Blitz-Krone & weißem Vollbart
    g.fillStyle = '#facc15';
    g.strokeStyle = '#a16207';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-18, -13);
    g.lineTo(-22, -31);
    g.lineTo(-9, -19);
    g.lineTo(0, -35);
    g.lineTo(9, -19);
    g.lineTo(22, -31);
    g.lineTo(18, -13);
    g.closePath();
    g.fill();
    g.stroke();

    const zGrad = g.createRadialGradient(-5, -6, 4, 0, 0, 24);
    zGrad.addColorStop(0, '#bae6fd');
    zGrad.addColorStop(1, '#0284c7');
    g.fillStyle = zGrad;
    g.strokeStyle = '#0369a1';
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, 0, 23, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Edler weißer Wolken-Bart
    g.fillStyle = '#f8fafc';
    g.strokeStyle = '#38bdf8';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-19, 4);
    g.quadraticCurveTo(-16, 25, 0, 27);
    g.quadraticCurveTo(16, 25, 19, 4);
    g.closePath();
    g.fill();
    g.stroke();

    drawProEyes(g, -4, 8.5, '#38bdf8');
  }
}

function drawProSkin(kind, size) {
  const box = 92;
  const sprite = getSprite(`pro:${kind}`, box, box, (g) => {
    g.translate(box / 2, box / 2);
    paintProSkin(g, kind);
  });
  const drawSize = size * 1.28;
  ctx.drawImage(sprite.canvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
}
