/**
 * 💥 trefferfolgen.js – Was passiert nach dem Treffer?
 *
 * Explosion: trifft jeden Gegner im Kreis genau einmal.
 * Zeit-Schaden: Feuer und Gift wirken mehrere Ticks lang.
 * Dieselbe Folge erneuert ihre Dauer, stapelt aber nicht unbegrenzt.
 * Schaden läuft immer durch applyHit: Leben, Punkte und K.o. bleiben zentral.
 */
let aktiveTrefferfolgen = new Map();
let explosionsWellen = [];

function istWurfGegner(werfer, ziel) {
  return ziel !== werfer && isAlive(ziel)
    && (!teamMode || teamOf(ziel) !== teamOf(werfer));
}

// Neue Trefferfolge? Handler hier ergänzen; im Waffenprofil dessen `art` eintragen.
const TREFFERFOLGEN = {
  zeitSchaden(ziel, werfer, folge) {
    if (!(folge.abstandMs > 0 && folge.dauerMs > 0 && folge.schaden > 0)) return;
    const schluessel = `${ziel}:${folge.kennung}`;
    const bisher = aktiveTrefferfolgen.get(schluessel);
    aktiveTrefferfolgen.set(schluessel, {
      ...folge, ziel, werfer, restMs: folge.dauerMs,
      // Häufige Treffer dürfen den nächsten Tick nicht immer weiter verschieben.
      naechsterTickMs: bisher ? bisher.naechsterTickMs : folge.abstandMs
    });
  }
};

function treffeMitGeschoss(ziel, daten) {
  if (!istWurfGegner(daten.shooter, ziel) || isHidden(ziel)) return;
  applyHit(ziel, daten.shooter, daten.damage ?? 1, daten.special);
  if (!isAlive(ziel)) return;
  for (const folge of daten.trefferfolgen || []) {
    TREFFERFOLGEN[folge.art]?.(ziel, daten.shooter, folge);
  }
}

function explosionsTreffer(geschoss) {
  const daten = geschoss.customData;
  const radius = daten.explosionsRadius;
  explosionsWellen.push({ x: geschoss.position.x, y: geschoss.position.y, radius, startZeit: performance.now() });
  for (const ziel of Object.keys(actors)) {
    if (!istWurfGegner(daten.shooter, ziel)) continue;
    const koerper = actors[ziel].body;
    const abstand = Math.hypot(koerper.position.x - geschoss.position.x, koerper.position.y - geschoss.position.y);
    // Auch der Rand einer Figur zählt. So belohnt eine Explosion echte Beinahe-Treffer.
    if (abstand <= radius + (koerper.circleRadius || 0)) treffeMitGeschoss(ziel, daten);
  }
}

function zuendeGeschosse() {
  if (!battleRunning() || isPaused) return;
  // Kopie: explodeBomb entfernt das Geschoss aus fallingBodies.
  for (const geschoss of [...fallingBodies]) {
    const daten = geschoss.customData;
    if (daten.zuendBild && daten.flugAlter >= daten.zuendBild) explodeBomb(geschoss);
  }
}

function aktualisiereTrefferfolgen(zeitMs) {
  if (!battleRunning() || isPaused) return;
  for (const [schluessel, folge] of aktiveTrefferfolgen) {
    if (!isAlive(folge.ziel)) { aktiveTrefferfolgen.delete(schluessel); continue; }
    // Restzeiten statt echter Uhrzeit: In der Spielpause bleibt alles stehen.
    const vergangen = Math.min(zeitMs, folge.restMs);
    folge.restMs -= vergangen;
    folge.naechsterTickMs -= vergangen;
    while (folge.naechsterTickMs <= 0) {
      applyHit(folge.ziel, folge.werfer, folge.schaden, true); // Kein neues Aufladen durch Zeit-Schaden.
      folge.naechsterTickMs += folge.abstandMs;
      if (!isAlive(folge.ziel)) break;
    }
    if (folge.restMs <= 0 || !isAlive(folge.ziel)) aktiveTrefferfolgen.delete(schluessel);
  }
}

function zeichneTrefferfolgen(jetzt) {
  for (let nummer = explosionsWellen.length - 1; nummer >= 0; nummer--) {
    const welle = explosionsWellen[nummer];
    const fortschritt = (jetzt - welle.startZeit) / 350;
    if (fortschritt >= 1) { explosionsWellen.splice(nummer, 1); continue; }
    ctx.save();
    ctx.globalAlpha = 1 - fortschritt;
    ctx.strokeStyle = '#fbbf24'; ctx.fillStyle = 'rgba(251, 146, 60, 0.16)';
    ctx.lineWidth = 3 / viewZoom();
    ctx.beginPath(); ctx.arc(welle.x, welle.y, welle.radius * (0.5 + fortschritt * 0.5), 0, Math.PI * 2);
    ctx.fill(); ctx.stroke(); ctx.restore();
  }
  const symboleProFigur = new Map();
  for (const folge of aktiveTrefferfolgen.values()) {
    if (!isAlive(folge.ziel) || isHidden(folge.ziel)) continue;
    const nummer = symboleProFigur.get(folge.ziel) || 0;
    symboleProFigur.set(folge.ziel, nummer + 1);
    const ort = actors[folge.ziel].body.position;
    if (folge.kennung === 'feuer') {
      // Der bisherige Feuerspeer behält seine flackernden Flammen.
      const flamme = (18 + Math.sin(jetzt / 60) * 3) / viewZoom();
      drawEmoji('🔥', ort.x - 15 / viewZoom(), ort.y - 25 / viewZoom(), flamme);
      drawEmoji('🔥', ort.x + 15 / viewZoom(), ort.y - 25 / viewZoom(), flamme);
    } else {
      drawEmoji(folge.symbol || '✨', ort.x + nummer * 20 / viewZoom(), ort.y - 28 / viewZoom(), 18 / viewZoom());
    }
  }
}

function loescheTrefferfolgen() {
  aktiveTrefferfolgen.clear();
  explosionsWellen = [];
}
