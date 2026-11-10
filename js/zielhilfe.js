/**
 * 🎯 zielhilfe.js – Zielmodus wechseln und Flugpunkte zeichnen.
 *
 * Zielauswahl und Aufladen stehen in zielen.js. Diese Datei kümmert sich nur
 * um freies Zielen und die sichtbare Vorschau aus dem gemeinsamen Flugplan.
 */

let zielModus = 'gebunden'; // Zielbindung oder frei; bleibt beim Neustart gewählt.
let freiesZiel = null; // Relative Weltposition: bleibt beim Drehen des Handys sinnvoll.
const zielmodusKnopf = document.getElementById('aimModeBtn');

function setzeFreiesZiel(x, y) {
  freiesZiel = { rx: Math.max(0, Math.min(1, x / width)), ry: Math.max(0, Math.min(1, y / height)) };
}

function freierZielpunkt() {
  if (!freiesZiel) {
    const ziel = currentAimTarget();
    const ort = ziel ? actors[ziel].body.position : { x: width * 0.75, y: height * 0.5 };
    setzeFreiesZiel(ort.x, ort.y);
  }
  return { x: freiesZiel.rx * width, y: freiesZiel.ry * height };
}

function wechsleZielmodus() {
  if (!isPlaying || isPaused) return;
  cancelAim();
  zielModus = zielModus === 'gebunden' ? 'frei' : 'gebunden';
  if (zielModus === 'frei') freierZielpunkt();
  zielmodusKnopf.textContent = zielModus === 'gebunden' ? '🎯 Zielbindung · Q' : '✛ Frei zielen · Q';
  zielmodusKnopf.setAttribute('aria-pressed', String(zielModus === 'frei'));
  zielmodusKnopf.title = zielModus === 'gebunden' ? 'Zielbindung: Tab wechselt den Gegner'
    : 'Frei zielen: Maus bewegen oder Schießknopf ziehen';
  document.getElementById('aimHelp').textContent = zielModus === 'gebunden'
    ? '🎯/Tab: Ziel · Halten: aufladen'
    : 'Zielpunkt wählen · Loslassen: werfen';
  targetBtn.hidden = zielModus === 'frei';
}

// Punkte zeigen die freie Flugbahn; Figuren im Weg können den Wurf vorher abfangen.
function zeichneFlugvorschau(figur, ziel, ladung, farbe) {
  if (!isAlive(figur) || isStunned(figur) || actors[figur].jump) return;
  const wurf = normalerWurf(figur, ladung);
  wurf.vorhalten = Math.max(GAME_CONFIG.aim.vorhalteHilfe, ladung);
  if (zielModus === 'frei') wurf.aimPoint = freierZielpunkt();
  const flugplan = berechneFlugplan(figur, ziel, wurf);
  const vergroesserung = viewZoom();
  const punktRadius = 3.2 / vergroesserung;
  let vorherigerPunkt = { x: flugplan.x, y: flugplan.y };
  let endpunkt = vorherigerPunkt;
  let punktAbstand = 0;
  // Kleine Zeitschritte, aber gleichmäßige Abstände auf dem Bildschirm.
  for (let bild = 0.25; bild <= flugplan.vorschauBilder; bild += 0.25) {
    const { x, y } = punktAufFlugbahn(flugplan, bild);
    if (x < flugplan.radius || x > width - flugplan.radius || y > height + flugplan.radius) break;
    endpunkt = { x, y };
    punktAbstand += Math.hypot(x - vorherigerPunkt.x, y - vorherigerPunkt.y);
    vorherigerPunkt = { x, y };
    if (punktAbstand < 11 / vergroesserung) continue;
    punktAbstand %= 11 / vergroesserung;
    ctx.globalAlpha = 0.85 - 0.4 * bild / flugplan.vorschauBilder;
    ctx.beginPath();
    ctx.arc(x, y, punktRadius, 0, Math.PI * 2);
    ctx.fillStyle = farbe;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1 / vergroesserung;
    ctx.stroke();
  }
  if (wurf.explosionsRadius > 0) {
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = farbe; ctx.lineWidth = 2 / vergroesserung;
    ctx.setLineDash([4 / vergroesserung, 5 / vergroesserung]);
    ctx.beginPath(); ctx.arc(endpunkt.x, endpunkt.y, wurf.explosionsRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

zielmodusKnopf.addEventListener('click', wechsleZielmodus);
window.addEventListener('pointermove', ereignis => {
  if (!isPlaying || isPaused || zielModus !== 'frei') return;
  const leinwandRand = canvas.getBoundingClientRect();
  if (aim && aim.pointerId === ereignis.pointerId) {
    if (aim.eingabe.quelle === 'knopf') {
      setzeFreiesZiel(aim.freierStart.x + (ereignis.clientX - aim.eingabe.clientX) * GAME_CONFIG.aim.ziehFaktor / viewZoom(),
        aim.freierStart.y + (ereignis.clientY - aim.eingabe.clientY) * GAME_CONFIG.aim.ziehFaktor / viewZoom());
    } else {
      setzeFreiesZiel((ereignis.clientX - leinwandRand.left) / viewZoom(), (ereignis.clientY - leinwandRand.top) / viewZoom());
    }
  } else if (!aim && ereignis.pointerType === 'mouse' && ereignis.target === canvas) {
    setzeFreiesZiel((ereignis.clientX - leinwandRand.left) / viewZoom(), (ereignis.clientY - leinwandRand.top) / viewZoom());
  }
});
window.addEventListener('keydown', ereignis => {
  if ((ereignis.code === 'KeyQ' || (ereignis.key || '').toLowerCase() === 'q') && !ereignis.repeat) wechsleZielmodus();
});
