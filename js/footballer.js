/**
 * ⚽ footballer.js – Eine Figur im Fußballtrikot
 *
 * Statt eines Emojis wird die Figur selbst gemalt: Kopf, Trikot mit Nummer,
 * Hose, rennende Beine und ein Ball am Fuß. So sieht sie auf jedem Handy gleich aus.
 *
 * Jede Figur kann ein Trikot bekommen: in config.js `<name>Shirt` eintragen,
 * z. B. musialaShirt: { color: '#ffffff', number: '10', stripe: true }
 */

// Malt den Fußballer um den Punkt (0, 0). `size` ist die ungefähre Gesamthöhe.
function drawFootballer(shirt, size, now) {
  const s = size / 64; // Alles ist für Größe 64 gebaut und wird mitskaliert
  const run = Math.sin(now / 90); // Beine laufen hin und her

  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 🦵 Beine (rennend)
  ctx.strokeStyle = '#f5c99b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-5, 18); ctx.lineTo(-5 - run * 6, 30);
  ctx.moveTo(5, 18); ctx.lineTo(5 + run * 6, 30);
  ctx.stroke();

  // 👟 Schuhe
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(-5 - run * 6, 31, 3.5, 0, Math.PI * 2);
  ctx.arc(5 + run * 6, 31, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // ⚽ Ball am Fuß
  ctx.font = '14px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽', 15 + run * 3, 28);

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

  // 🔢 Rückennummer
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.fillStyle = shirt.numberColor || '#111827';
  ctx.fillText(shirt.number || '10', 0, 6);

  // 🙂 Kopf
  ctx.font = '24px -apple-system, sans-serif';
  ctx.fillText(shirt.head || '😃', 0, -22);

  ctx.restore();
}
