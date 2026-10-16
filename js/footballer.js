/**
 * ⚽ footballer.js – Eine Figur im Fußballtrikot, die über das Feld dribbelt
 *
 * Statt eines Emojis wird die Figur selbst gemalt: Kopf, Trikot mit Nummer,
 * Hose, rennende Beine, schwingende Arme und ein Ball, der hochgehalten wird.
 * So sieht sie auf jedem Handy gleich aus.
 *
 * Jede Figur kann ein Trikot bekommen: in config.js `<name>Shirt` eintragen,
 * z. B. musialaShirt: { color: '#ffffff', number: '10', stripe: true }
 * Mit `<name>Runs: true` rennt sie von allein hin und her.
 * Mit `sixSeven: true` im Shirt macht sie nach jedem Treffer die 6-7-Geste 🤲.
 */

// 🏃 Lässt alle Trikot-Figuren mit `<name>Runs` hin und her dribbeln.
// Wird in jedem Bild aus gameLoop() aufgerufen, solange gespielt wird.
function updateFootballers() {
  for (const name in actors) {
    const actor = actors[name];
    if (!actorCfg(name, 'Shirt') || !actorCfg(name, 'Runs')) continue;
    if (!isCpu(name)) continue; // 🕹️ Eigene Figur steuerst du selbst mit WASD / Joystick!
    if (!isAlive(name) || actor.dragging || isStunned(name) || actor.jump) continue; // 🌪️ Im Wirbel / Sprung stillstehen
    if (isSixSeven(actor)) continue; // Beim Jubeln bleibt er stehen
    if (!actor.runDir) actor.runDir = 1;

    const speed = (actorCfg(name, 'RunSpeed') || 1.5) * (teamMode ? 0.65 : 1) * (getCharStat(name, 'speed') || 1.0);
    const homeX = (actor.homeRx ?? 0.5) * width;
    const left = teamMode ? Math.max(46, homeX - 28) : width * 0.15;
    const right = teamMode ? Math.min(width - 46, homeX + 28) : width * 0.85;
    let x = actor.body.position.x + actor.runDir * speed;
    if (x > right) { x = right; actor.runDir = -1; } // Wende!
    if (x < left) { x = left; actor.runDir = 1; }
    moveActor(name, x, actor.body.position.y);
  }
}

// 🤲 Jubelt die Figur gerade mit der 6-7-Geste? (startet in physics.js nach einem Treffer)
function isSixSeven(actor) {
  return actor.sixSevenUntil > performance.now();
}

// Malt den Fußballer um den Punkt (0, 0). `size` ist die ungefähre Gesamthöhe.
// `dir` = Blickrichtung (1 = rechts, -1 = links), `kick` = 0..1 beim Schießen.
function drawFootballer(shirt, size, now, dir = 1, kick = 0, sixSeven = false) {
  const s = size / 64; // Alles ist für Größe 64 gebaut und wird mitskaliert
  const run = Math.sin(now / 90); // Beine und Arme laufen hin und her
  const bob = Math.abs(Math.sin(now / 90)) * -2; // Beim Rennen hüpft der Körper

  ctx.save();
  ctx.scale(s, s);
  ctx.translate(0, bob);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Beine, Arme und Ball schauen in Laufrichtung (gespiegelt bei dir = -1)
  ctx.save();
  ctx.scale(dir, 1);

  // 🦵 Beine – beim Schuss schnellt das vordere Bein nach vorn
  const backLeg = -run * 6;
  const frontLeg = kick > 0.3 ? 14 : run * 6;
  const frontFootY = kick > 0.3 ? 24 : 30;
  ctx.strokeStyle = '#f5c99b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-5, 18); ctx.lineTo(-5 + backLeg, 30);
  ctx.moveTo(5, 18); ctx.lineTo(5 + frontLeg, frontFootY);
  ctx.stroke();

  // 👟 Schuhe
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(-5 + backLeg, 31, 3.5, 0, Math.PI * 2);
  ctx.arc(5 + frontLeg, frontFootY + 1, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // ⚽ Ball: hüpft vor dem Fuß auf und ab (Ball hochhalten). Beim Schuss ist er weg.
  if (kick < 0.3) {
    const juggle = Math.abs(Math.sin(now / 160)) * 12;
    drawEmoji('⚽', 15, 28 - juggle, 14); // 🖼️ sprites.js
  }

  // 💪 Arme schwingen gegenläufig zu den Beinen
  if (!sixSeven) {
    ctx.strokeStyle = '#f5c99b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, 0); ctx.lineTo(-20 + run * 5, 10);
    ctx.moveTo(18, 0); ctx.lineTo(20 - run * 5, 10);
    ctx.stroke();
  }
  ctx.restore();

  // 🤲 6-7-Geste: Hände nach vorn, Handflächen hoch, abwechselnd rauf und runter
  if (sixSeven) {
    const wave = Math.sin(now / 70) * 7;
    ctx.strokeStyle = '#f5c99b';
    ctx.fillStyle = '#f5c99b';
    ctx.lineWidth = 4;
    for (const side of [-1, 1]) {
      const handY = 2 + wave * side;
      ctx.beginPath();
      ctx.moveTo(side * 18, 0);
      ctx.lineTo(side * 27, handY);
      ctx.stroke();
      ctx.beginPath(); // Offene Handfläche
      ctx.ellipse(side * 29, handY - 1, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 🩳 Hose
  ctx.fillStyle = shirt.shorts || '#111827';
  ctx.fillRect(-12, 9, 24, 11);

  // 👕 Trikot mit Ärmeln
  ctx.fillStyle = shirt.color || '#ffffff';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -12);   // linke Schulter
  ctx.lineTo(-21, -5);    // linker Ärmel außen
  ctx.lineTo(-17, 3);     // linker Ärmel unten
  ctx.lineTo(-12, 0);     // linke Achsel
  ctx.lineTo(-12, 12);    // linke Seite unten
  ctx.lineTo(12, 12);     // rechte Seite unten
  ctx.lineTo(12, 0);      // rechte Achsel
  ctx.lineTo(17, 3);      // rechter Ärmel unten
  ctx.lineTo(21, -5);     // rechter Ärmel außen
  ctx.lineTo(10, -12);    // rechte Schulter
  ctx.quadraticCurveTo(0, -6, -10, -12); // Kragen
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 🇩🇪 Streifen in Schwarz-Rot-Gold
  if (shirt.stripe) {
    const colors = ['#111827', '#dc2626', '#facc15'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(-12, -3 + i * 2, 24, 2);
    }
  }

  // 🔢 Nummer (nicht gespiegelt, damit man sie lesen kann)
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.fillStyle = shirt.numberColor || '#111827';
  ctx.fillText(shirt.number || '10', 0, 6);

  // ⚽ Kopf – im Pro-Modus als echter Fußballstar mit Frisur & Stirnband gemalt!
  ctx.save();
  ctx.translate(0, -22);
  ctx.rotate(run * 0.08);
  if (GAME_CONFIG.proSkins) {
    // Hautfarbe
    ctx.fillStyle = shirt.skin || '#d99b66';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Coole Locken-Frisur oben
    ctx.fillStyle = shirt.hair || '#111827';
    for (const hx of [-7, -2.5, 2.5, 7]) {
      ctx.beginPath();
      ctx.arc(hx, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Sport-Stirnband
    if (shirt.headband) {
      ctx.fillStyle = shirt.headband;
      ctx.fillRect(-10.5, -7, 21, 3.2);
    }
    // Freundlich-fokussierte Pro-Augen mit Glanzpunkt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -1.5, 2.4, 0, Math.PI * 2);
    ctx.arc(4, -1.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-4, -1.5, 1.3, 0, Math.PI * 2);
    ctx.arc(4, -1.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Lächeln
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    drawEmoji(shirt.head || '😃', 0, 0, 24); // 🖼️ sprites.js
  }
  ctx.restore();

  // 💬 „6 7!“ über dem Kopf – die Zahlen hüpfen abwechselnd
  if (sixSeven) {
    const wave = Math.sin(now / 70);
    ctx.font = '900 18px -apple-system, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#111827';
    ctx.fillStyle = '#facc15';
    ctx.strokeText('6', -11, -46 - wave * 5);
    ctx.fillText('6', -11, -46 - wave * 5);
    ctx.strokeText('7', 11, -46 + wave * 5);
    ctx.fillText('7', 11, -46 + wave * 5);
  }

  ctx.restore();
}
