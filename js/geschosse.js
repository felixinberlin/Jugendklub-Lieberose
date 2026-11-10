/**
 * ⚔️ geschosse.js – Welche Waffe fliegt wie?
 *
 * 1. naechsteWaffe schaut nach, ohne die Waffenfolge weiterzuschalten.
 * 2. normalerWurf liest das Profil aus config.js.
 * 3. berechneFlugplan berechnet den Start, das Tempo und den Bogen.
 * 4. punktAufFlugbahn wird von Vorschau UND echtem Geschoss benutzt.
 *
 * Hier wird kein Schaden verteilt. Dafür ist trefferfolgen.js zuständig.
 * Die englischen Felder in den Wurf-Optionen gehören zur bestehenden launchArc-
 * Schnittstelle: So können die bisherigen Spezialkräfte unverändert weiterwerfen.
 */

// Eine Flugart liefert nur den zusätzlichen Versatz. Sie verändert keine Bodies.
// Neue Flugart? Hier ergänzen und im Waffenprofil unter `bewegung` auswählen.
const FLUGARTEN = {
  bogen: () => ({ x: 0, y: 0 }),
  welle: (flugplan, bild) => {
    // Die Welle endet genau am gewählten Landungsort, auch beim freien Zielen.
    const huelle = Math.sin(Math.PI * Math.min(1, bild / flugplan.flugBilder));
    const ausschlag = flugplan.waffenProfil.wellenHoehe * flugplan.massstab * huelle
      * Math.sin(bild * Math.PI * 2 / flugplan.waffenProfil.wellenBilder);
    return { x: -flugplan.richtungY * ausschlag, y: flugplan.richtungX * ausschlag };
  }
};

function naechsteWaffe(figur) {
  const waffen = actorCfg(figur, 'Weapons');
  if (!waffen || !waffen.length) return null;
  const naechsteNummer = ((actors[figur].weaponIdx ?? -1) + 1) % waffen.length;
  return waffen[naechsteNummer];
}

function normalerWurf(figur, ladung = 0) {
  const waffe = naechsteWaffe(figur);
  const profilName = waffe || actorCfg(figur, 'Projectile') || 'default';
  const profil = { ...GAME_CONFIG.waffenProfile.default, ...GAME_CONFIG.waffenProfile[profilName] };
  // Kopien verhindern, dass spätere Änderungen bereits fliegende Schüsse verändern.
  profil.trefferfolgen = profil.trefferfolgen.map(folge => ({ ...folge }));
  return {
    waffenProfil: profil, weapon: waffe,
    emoji: actorCfg(figur, 'Bomb') || GAME_CONFIG.bombEmoji,
    size: Math.round((actorCfg(figur, 'BombSize') || GAME_CONFIG.bombSize) * mapScale()),
    trail: actorCfg(figur, 'Trail'),
    scratch: Boolean(actorCfg(figur, 'Scratch')), bolt: Boolean(actorCfg(figur, 'Bolt')),
    damage: getCharStat(figur, 'attackDamage', typeof isCpu !== 'function' || !isCpu(figur)) ?? profil.schaden ?? 4,
    lead: Math.max(0, Math.min(1, ladung)), lifeMs: profil.lebensdauerMs,
    explosionsRadius: profil.explosionsRadius * mapScale(), trefferfolgen: profil.trefferfolgen
  };
}

function berechneFlugplan(figur, zielFigur, wurf) {
  const start = actors[figur].body.position;
  const profil = wurf.waffenProfil;
  const massstab = mapScale();
  const frei = Boolean(wurf.aimPoint);
  const ladeFaktor = 1 + (wurf.lead || 0) * (42 / GAME_CONFIG.aim.fastFrames - 1);
  const tempo = Math.max(0.1, profil.tempo * massstab) * ladeFaktor;
  const radius = wurf.size * 0.42;
  const abstandZurFigur = 34 * massstab + radius + 4;

  // Frei gewählt wird ein LANDUNGSORT, keine schwer abschätzbare Abschussrichtung.
  // Zielbindung berücksichtigt auch die Bewegung und die Mini-Kobolde des Gegners.
  const zielNach = bilder => frei ? wurf.aimPoint
    : (decoyFor(zielFigur, start, bilder)?.position || leadPosition(zielFigur, bilder, wurf.vorhalten ?? wurf.lead ?? 0));
  let ziel = zielNach(0);
  const flugdauer = () => Math.max(6, (Math.hypot(ziel.x - start.x, ziel.y - start.y) - abstandZurFigur) / tempo);
  let flugBilder = flugdauer();
  for (let versuch = 0; versuch < 2 && !frei; versuch++) {
    ziel = zielNach(flugBilder);
    flugBilder = flugdauer();
  }
  const wegX = ziel.x - start.x, wegY = ziel.y - start.y;
  const entfernung = Math.hypot(wegX, wegY);
  const richtungX = entfernung > 0.001 ? wegX / entfernung : 1;
  const richtungY = entfernung > 0.001 ? wegY / entfernung : 0;
  // Sehr nahe Ziele dürfen nicht hinter dem Startpunkt des Geschosses liegen.
  const startAbstand = Math.min(abstandZurFigur, entfernung * 0.5);
  const x = start.x + richtungX * startAbstand, y = start.y + richtungY * startAbstand;
  const schwerkraftProBild = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2 * profil.schwerkraft;
  return {
    waffenProfil: { ...profil }, massstab, frei, x, y, richtungX, richtungY, radius,
    richtung: richtungX < 0 ? -1 : 1, flugBilder, schwerkraftProBild,
    vx: (ziel.x - x) / flugBilder,
    // Den Fall gleichen wir beim Abwurf aus. Aufladen ändert Tempo und Bogen,
    // aber der gewählte Landungsort bleibt stabil. Frei wird kein Gegner verfolgt.
    vy: (ziel.y - y) / flugBilder - schwerkraftProBild * (flugBilder + 1) / 2,
    vorschauBilder: Math.min(flugBilder, profil.lebensdauerMs * 60 / 1000)
  };
}

function punktAufFlugbahn(flugplan, bild) {
  const flugart = FLUGARTEN[flugplan.waffenProfil.bewegung] || FLUGARTEN.bogen;
  const versatz = flugart(flugplan, bild);
  return {
    x: flugplan.x + flugplan.vx * bild + versatz.x,
    y: flugplan.y + flugplan.vy * bild + flugplan.schwerkraftProBild * bild * (bild + 1) / 2 + versatz.y
  };
}

function bewegeGeschosse(schritt) {
  if (!battleRunning() || isPaused) return;
  const bilder = schritt.delta / (1000 / 60);
  if (bilder <= 0) return;
  for (const geschoss of fallingBodies) {
    const daten = geschoss.customData;
    const flugplan = daten.flugplan;
    if (geschoss.exploded || (!flugplan && !daten.zuendBild)) continue;
    daten.flugAlter += bilder;
    if (!flugplan) continue; // Popcorn hat weiterhin seinen bisherigen Matter-Bogen.
    const ziel = punktAufFlugbahn(flugplan, Math.min(daten.flugAlter, daten.zuendBild || Infinity));
    // Matter bewegt das Geschoss und erkennt echte Kollisionen. Die Geschwindigkeit
    // kommt aus demselben Flugplan wie die Punkte, auch bei wechselnder Bildrate.
    Body.setVelocity(geschoss, { x: (ziel.x - geschoss.position.x) / bilder, y: (ziel.y - geschoss.position.y) / bilder });
    // Der Fall ist schon im Flugplan enthalten: Weltschwerkraft nicht doppelt zählen.
    geschoss.force.x -= geschoss.mass * engine.gravity.x * engine.gravity.scale;
    geschoss.force.y -= geschoss.mass * engine.gravity.y * engine.gravity.scale;
  }
}
