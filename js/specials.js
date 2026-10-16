/**
 * ⚡ specials.js – Spezialkräfte! (eigener Knopf unten links)
 *
 *  ⚽ Musiala: RIESENBALL – Schaden aus config.js. Du steuerst ihn mit dem Finger
 *             (auf den Bildschirm drücken und ziehen, der Ball fliegt hin).
 *  🧌 Kobold:  MINI-KOBOLDE – 3 kleine Kobolde kreisen 5 Sekunden um ihn
 *             und fangen gegnerische Bomben ab (Bomben auf den Kobold fliegen
 *             zu ihnen – Lockvögel!). Sie werfen selbst nicht.
 *  🐱 Katze:   WIRBELSPRUNG – springt auf einen Gegner (Schaden!), 🌪️ Wirbelwolke:
 *             Der Gegner kann sich 4 Sekunden nicht bewegen und nicht werfen.
 *  🌽 Mais:    POPCORN – poppt 10 Popcorn 🍿 im Bogen auf verschiedene Gegner.
 *  🐭 Maus:    VERSTECKEN – verschwindet 6 Sekunden im Mauseloch 🕳️:
 *             Alles fliegt durch sie durch, sie bekommt KEINEN Schaden.
 *  👺 Goblin:  FEUERSPEER – fliegt gerade DURCH alle Gegner durch und
 *             lässt sie brennen 🔥 (3 Sekunden lang Schaden).
 *
 * AUFLADEN: Triff Gegner 20-mal mit normalen Würfen (egal welche) –
 * dann leuchtet der Knopf „BEREIT!“ (`specialChargeHits` in config.js).
 * Nach dem Benutzen geht es wieder bei 0 los. Beim „WEITER“ ins nächste
 * Level behalten deine Figuren ihre gesammelten Treffer.
 * Auch Computer-Figuren laden auf und benutzen ihre Kräfte.
 */

// Die eigentlichen Kräfte stehen in special-weapons.js und special-moves.js.
// Knöpfe und Erklärungen stehen in special-ui.js.

// Welche Figuren haben eine Spezialkraft?
// `desc` = Erklärung für den Startbildschirm (mit den echten Zahlen aus config.js)
const SPECIALS = {
  musiala: { name: 'RIESENBALL', icon: '⚽', use: bigBall,
    desc: () => `Riesiger Fußball (${GAME_CONFIG.bigBall.damage} Treffer). Du lenkst ihn mit dem Finger!` },
  yamal: { name: 'GOLD-SCHUSS', icon: '🌟', use: yamalSpecial,
    desc: () => `3 goldene Winkel-Schüsse aufs Ziel!` },
  kobold: { name: 'MINI-KOBOLDE', icon: '🧌', use: spawnMinis,
    desc: () => `${GAME_CONFIG.miniKobolds.count} Mini-Kobolde fangen ${GAME_CONFIG.miniKobolds.seconds} Sek. lang Bomben ab.` },
  katze: { name: 'WIRBELSPRUNG', icon: '🌪️', use: catJump,
    desc: () => `Springt auf einen Gegner (${GAME_CONFIG.catDamage} Schaden). Der ist ${GAME_CONFIG.catStunSeconds} Sek. im Wirbel gefangen.` },
  corn: { name: 'POPCORN', icon: '🍿', use: popcorn,
    desc: () => `${GAME_CONFIG.popcorn.count} Popcorn fliegen auf alle Gegner.` },
  goblin: { name: 'FEUERSPEER', icon: '🔥', use: fireSpear,
    desc: () => `Durchbohrt alle in einer Reihe und lässt sie ${GAME_CONFIG.fireSpear.burnSeconds} Sek. brennen.` },
  maus: { name: 'VERSTECKEN', icon: '🕳️', use: hideMouse,
    desc: () => `Versteckt sich ${GAME_CONFIG.hideSeconds} Sek. im Mauseloch – kein Schaden!` },
  drache: { name: 'DRACHENBISS', icon: '🦷', use: dragonBite,
    desc: () => `Fliegt zum Gegner und beißt kräftig zu (${GAME_CONFIG.dragonBite.damage} Schaden)!` },
  zeus: { name: 'BLITZ-REGEN', icon: '🌩️', use: zeusStorm,
    desc: () => `Markiert einen roten Kreis und lässt ${GAME_CONFIG.zeusStorm.seconds} Sek. lang Blitze regnen (ab ${GAME_CONFIG.zeusUnlockTrophies} 🏆)!` }
};

function hasSpecial(name) {
  return Boolean(SPECIALS[kindOf(name)]);
}

// Aufgeladen? (20 Treffer mit normalen Würfen – oder 20 Treffer GEMEINSAM mit einem Combo-Partner im selben Team!)
function specialReady(name) {
  return hasSpecial(name) && (actors[name].specialCharge || 0) >= GAME_CONFIG.specialChargeHits;
}

// Aus physics.js: Ein normaler Wurf hat getroffen → Spezialkraft / Team-Combo lädt auf.
// 🤝 Wenn zwei Figuren im selben Team ein Combo-Paar bilden, zählen ihre 20 Treffer GEMEINSAM!
function chargeSpecial(name) {
  if (!hasSpecial(name)) return;
  const need = GAME_CONFIG.specialChargeHits;
  const comboInfo = typeof findComboPartnerInfo === 'function' ? findComboPartnerInfo(name) : null;
  if (comboInfo && actors[comboInfo.partner]) {
    const partner = comboInfo.partner;
    const shared = Math.min(need, Math.max(actors[name].specialCharge || 0, actors[partner].specialCharge || 0) + 1);
    actors[name].specialCharge = shared;
    actors[partner].specialCharge = shared;
    if (shared === need && (!isCpu(name) || !isCpu(partner))) playSound('ready');
  } else {
    actors[name].specialCharge = Math.min(need, (actors[name].specialCharge || 0) + 1);
    if (actors[name].specialCharge === need && !isCpu(name)) playSound('ready'); // 🔔 Bereit!
  }
  updateSpecialBar();
}

// Ist die Figur gerade im Wirbel gefangen? 🌪️
function isStunned(name) {
  return actors[name] && actors[name].stunnedUntil > performance.now();
}

// Kraft oder Team-Combo auslösen (wird sowohl vom Spieler als auch von den Bots genutzt!).
function trySpecial(name) {
  if (!isPlaying || isPaused || !isAlive(name) || isStunned(name) || actors[name].jump) return false;
  if (!specialReady(name)) return false;
  const comboInfo = typeof findComboPartnerInfo === 'function' ? findComboPartnerInfo(name) : null;
  let used = false;
  if (comboInfo && actors[comboInfo.partner]) {
    used = tryTriggerCombo(name);
    if (used) {
      actors[comboInfo.partner].specialCharge = 0;
      actors[comboInfo.partner].wiggle = 1;
    }
  }
  if (!used) {
    used = SPECIALS[kindOf(name)].use(name);
  }
  if (used === false) return false;
  actors[name].specialCharge = 0; // Wieder von vorn aufladen
  actors[name].wiggle = 1;
  updateSpecialBar();
  return true;
}

// ---------- Jedes Bild ----------
function updateSpecials(now) {
  steerBalls();
  updateSpears();
  updateMinis(now);
  updateJumps(now);
  updateBurns(now);
  updateHiding(now);
  updateStorms(now);
  if (typeof updateCombos === 'function') updateCombos(now);
}

// Malt Mini-Kobolde, Wirbelwolken & alle 19 Team-Combos
function drawSpecials(now) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawStorms(now); // 🔴⚡ Roter Blitz-Regen-Kreis von Zeus
  if (typeof drawCombos === 'function') drawCombos(now); // 🤝💥 Alle 19 Team-Combos!
  for (const m of minis) {
    ctx.save();
    ctx.translate(m.body.position.x, m.body.position.y);
    ctx.rotate(Math.sin(now / 150 + m.angle) * 0.2 + m.wiggle * 0.5);
    drawEmoji(actorEmoji('kobold'), 0, 0, 30); // 🖼️ sprites.js
    ctx.restore();
  }
  for (const name in actors) {
    if (!isAlive(name) || !actors[name].burn) continue;
    const p = actors[name].body.position;
    const flame = 22 + Math.sin(now / 60) * 4; // 🔥 flackert
    drawEmoji('🔥', p.x - 18, p.y - 30 + Math.sin(now / 90) * 3, flame);
    drawEmoji('🔥', p.x + 18, p.y - 26 + Math.cos(now / 80) * 3, flame);
  }
  for (const name in actors) {
    if (!isAlive(name) || !isStunned(name)) continue;
    const p = actors[name].body.position;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 0.85;
    ctx.rotate(now / 120); // 🌪️ dreht sich
    drawEmoji('🌪️', 0, 0, 64);
    ctx.restore();
    drawEmoji('💫', p.x + Math.cos(now / 200) * 30, p.y - 40 + Math.sin(now / 200) * 6, 18);
  }
  drawDragonBites(now); // 🐉🦷 Schnappendes Drachengebiss
  ctx.restore();
}

// Alles zurücksetzen (bei jedem Start).
// keepCharge = true: DEINE Figuren behalten ihre Ladung fürs nächste Level.
function resetSpecials(keepCharge = false) {
  clearMinis();
  clearStorms();
  if (typeof clearCombos === 'function') clearCombos();
  for (const name in actors) {
    const mine = playerTeam === null || playerTeam.includes(name);
    if (!keepCharge || !mine) actors[name].specialCharge = 0;
    actors[name].stunnedUntil = 0;
    actors[name].jump = null;
    actors[name].burn = null;
    actors[name].hiddenUntil = 0;
    actors[name].body.collisionFilter.mask = 0xFFFFFFFF;
  }
}
