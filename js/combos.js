/**
 * 🤝💥 combos.js – Alle 19 Team-Combos (20 Treffer gemeinsam!)
 *
 * Wenn zwei Figuren im selben Team kämpfen und ein Combo-Paar bilden,
 * zählen ihre Treffer GEMEINSAM bis 20. Sobald 20 erreicht sind, können
 * sowohl du als auch die schlauen Bots die gemeinsame Mega-Combo zünden!
 *
 * Enthält:
 *  1. Musiala + Yamal:    Doppelpass-Torhagel ⚽🌟
 *  2. Kobold + Mais:      Kobold wirft den Mais als Riesen-Geschoss gegen die Gegner 🧌🌽
 *  3. Drache + Goblin:    Beide fangen an zu brennen & verbrennen alle Nachbar-Gegner 🐉🔥
 *  + 16 weitere Combos, sodass JEDER Charakter in mehreren Combos steckt!
 */

// Aktive Spezialeffekte der Combos:
// - thrownCorns: Kobold wirft die Mais-Figur durch die Gegner
// - burningAuras: Drache & Goblin brennen und verbrennen Nachbar-Gegner
// - comboBanners: Leuchtender Verbindungsstrahl + Combo-Name über dem Feld
let thrownCorns = [];
let burningAuras = [];
let comboBanners = [];

// 📋 Liste aller 19 Combo-Paare
const COMBO_PAIRS = [
  {
    a: 'musiala', b: 'yamal',
    name: 'DOPPELPASS-GEWITTER', icon: '⚽🌟',
    desc: 'GOAT & Yamal passen sich den Goldball zu und feuern 14 Traumtor-Schüsse auf alle Gegner!',
    trigger: (a, b) => triggerVolleyCombo(a, b, '⚽', '🌟', 14, 3, '🤝 YAMAL × GOAT KOMBO! ⚽🌟')
  },
  {
    a: 'kobold', b: 'corn',
    name: 'MAIS-KANONENWURF', icon: '🧌🌽',
    desc: 'Der Kobold packt den Mais und wirft ihn mit voller Wucht gegen alle Gegner!',
    trigger: (a, b) => triggerKoboldThrowsCorn(a, b)
  },
  {
    a: 'drache', b: 'goblin',
    name: 'INFERNO-NACHBARBRAND', icon: '🐉🔥',
    desc: 'Drache & Goblin fangen 5 Sek. lang lichterloh an zu brennen und verbrennen alle Nachbar-Gegner!',
    trigger: (a, b) => triggerBurningAuraCombo(a, b, 5.5, 115, '🐉🔥 DRACHE × GOBLIN FEUER-AURA!')
  },
  {
    a: 'katze', b: 'maus',
    name: 'KÄSE-KRALLEN-WIRBEL', icon: '🐱🐭',
    desc: 'Katze & Maus jagen gemeinsam über das Feld: 10 Fisch-Käse-Wirbel betäuben die Gegner!',
    trigger: (a, b) => triggerStunVolleyCombo(a, b, '🐟', '🧀', 10, 3, 2.5, '🐱🐭 KATZE × MAUS WIRBEL!')
  },
  {
    a: 'zeus', b: 'drache',
    name: 'DONNER-DRACHENKRALLE', icon: '⚡🐉',
    desc: 'Zeus lädt den Drachen mit Blitzen auf – 10 elektrische Blitz-Krallen schlagen in alle Gegner ein!',
    trigger: (a, b) => triggerBoltScratchCombo(a, b, '⚡🐉 DONNER-DRACHE KOMBO!')
  },
  {
    a: 'kobold', b: 'goblin',
    name: 'BRENNENDES GOLD', icon: '💰🔥',
    desc: 'Kobold & Goblin schleudern 12 brennende Goldsäcke, die Gegner in Brand setzen!',
    trigger: (a, b) => triggerBurnVolleyCombo(a, b, '💰', '🔥', 12, 3, '💰🔥 GOLD-FEUER KOMBO!')
  },
  {
    a: 'corn', b: 'goblin',
    name: 'LAVA-POPCORN', icon: '🍿🔥',
    desc: 'Der Goblin röstet den Mais – 14 brennende Feuer-Popcorn-Körner entzünden alle Gegner!',
    trigger: (a, b) => triggerBurnVolleyCombo(a, b, '🍿', '🔥', 14, 2, '🍿🔥 LAVA-POPCORN KOMBO!')
  },
  {
    a: 'katze', b: 'drache',
    name: 'DOPPEL-KRALLENSTURM', icon: '🐱🐉',
    desc: 'Katze & Drache schlitzen 12 glühende Riesen-Krallenspuren quer über alle Gegner!',
    trigger: (a, b) => triggerBoltScratchCombo(a, b, '🐱🐉 DOPPEL-KRALLEN KOMBO!', false)
  },
  {
    a: 'maus', b: 'kobold',
    name: 'GOLD-MAUSELOCH', icon: '🐭🪙',
    desc: 'Beide sind 4 Sek. unverwundbar, rufen Mini-Kobolde und werfen 10 Gold-Käse-Bomben!',
    trigger: (a, b) => {
      const now = performance.now();
      actors[a].hiddenUntil = now + 4000;
      actors[b].hiddenUntil = now + 4000;
      spawnMinis(kindOf(a) === 'kobold' ? a : b);
      return triggerVolleyCombo(a, b, '🪙', '🧀', 10, 3, '🐭🪙 SCHATZ-TUNNEL KOMBO!');
    }
  },
  {
    a: 'zeus', b: 'musiala',
    name: 'DONNER-SCHUSS #10', icon: '⚡⚽',
    desc: 'Zeus lädt GOATs Riesenball mit Blitzen auf + Gewittersturm auf die Gegner!',
    trigger: (a, b) => {
      const z = kindOf(a) === 'zeus' ? a : b;
      const m = kindOf(a) === 'musiala' ? a : b;
      zeusStorm(z);
      bigBall(m);
      return triggerVolleyCombo(a, b, '⚡', '⚽', 8, 3, '⚡⚽ DONNER-GOAT #10 KOMBO!');
    }
  },
  {
    a: 'zeus', b: 'yamal',
    name: 'BLITZ-DRIBBLING #19', icon: '⚡🌟',
    desc: 'Yamal & Zeus entfesseln einen Blitz-Regen und 12 elektrische Gold-Fußbälle!',
    trigger: (a, b) => {
      const z = kindOf(a) === 'zeus' ? a : b;
      zeusStorm(z);
      return triggerVolleyCombo(a, b, '⚡', '⚽', 12, 3, '⚡🌟 BLITZ-YAMAL #19 KOMBO!');
    }
  },
  {
    a: 'corn', b: 'maus',
    name: 'KÄSE-POPCORN-PARTY', icon: '🌽🧀',
    desc: 'Mais & Maus lassen 16 Käse-Popcorn-Bomben gleichzeitig auf alle Gegner regnen!',
    trigger: (a, b) => triggerVolleyCombo(a, b, '🍿', '🧀', 16, 2, '🌽🧀 KÄSE-POPCORN KOMBO!')
  },
  {
    a: 'katze', b: 'goblin',
    name: 'FEUER-TORNADO-SPRUNG', icon: '🐱🔥',
    desc: 'Brennende Feuer-Wirbelstürme betäuben Gegner und stecken sie in Brand!',
    trigger: (a, b) => {
      triggerBurningAuraCombo(a, b, 4.0, 105, '🐱🔥 FEUER-PFOTEN KOMBO!');
      return triggerStunVolleyCombo(a, b, '🌪️', '🔥', 8, 3, 2.0, '🐱🔥 FEUER-TORNADO KOMBO!');
    }
  },
  {
    a: 'musiala', b: 'drache',
    name: 'DRACHEN-FEUERSCHUSS', icon: '⚽🐉',
    desc: 'GOAT schießt brennende Drachen-Fußbälle, während der Drache zubeißt!',
    trigger: (a, b) => {
      const d = kindOf(a) === 'drache' ? a : b;
      const m = kindOf(a) === 'musiala' ? a : b;
      dragonBite(d);
      bigBall(m);
      return triggerBurnVolleyCombo(a, b, '⚽', '🐉', 8, 3, '⚽🐉 DRACHEN-GOAT KOMBO!');
    }
  },
  {
    a: 'yamal', b: 'katze',
    name: 'TURBO-KRALLEN-KICK', icon: '🌟🐱',
    desc: 'Yamal & die Katze feuern 10 Wirbel-Fußbälle, die Gegner im Sturm festhalten!',
    trigger: (a, b) => triggerStunVolleyCombo(a, b, '⚽', '🐾', 10, 3, 2.2, '🌟🐱 YAMAL × KATZE KOMBO!')
  },
  {
    a: 'zeus', b: 'kobold',
    name: 'DONNER-GOLDSCHATZ', icon: '⚡💰',
    desc: 'Zeus & der Kobold lassen elektrische Goldmünzen und Blitz-Kreise regnen!',
    trigger: (a, b) => {
      const z = kindOf(a) === 'zeus' ? a : b;
      const k = kindOf(a) === 'kobold' ? a : b;
      zeusStorm(z);
      spawnMinis(k);
      return triggerVolleyCombo(a, b, '⚡', '🪙', 10, 3, '⚡💰 DONNER-GOLD KOMBO!');
    }
  },
  {
    a: 'zeus', b: 'corn',
    name: 'GEWITTER-POPCORN', icon: '⚡🍿',
    desc: 'Der Blitz schlägt in den Mais ein: Roter Blitz-Sturm + 14 Elektro-Popcorn!',
    trigger: (a, b) => {
      const z = kindOf(a) === 'zeus' ? a : b;
      zeusStorm(z);
      return triggerVolleyCombo(a, b, '⚡', '🍿', 14, 2, '⚡🍿 GEWITTER-POPCORN KOMBO!');
    }
  },
  {
    a: 'maus', b: 'drache',
    name: 'SCHATTEN-DRACHENBISS', icon: '🐭🦷',
    desc: 'Maus tarnend im Loch + der Drache schnappt mit doppelter Biss-Kraft zu!',
    trigger: (a, b) => {
      const d = kindOf(a) === 'drache' ? a : b;
      dragonBite(d);
      actors[a].hiddenUntil = performance.now() + 3500;
      actors[b].hiddenUntil = performance.now() + 3500;
      return triggerVolleyCombo(a, b, '🦷', '🧀', 10, 3, '🐭🦷 SCHATTEN-BISS KOMBO!');
    }
  },
  {
    a: 'zeus', b: 'katze',
    name: 'BLITZ-WIRBELSPRUNG', icon: '⚡🐱',
    desc: 'Die Katze springt mit Zeus-Blitzen auf die Gegner und schockt alle für 3 Sek.!',
    trigger: (a, b) => {
      const z = kindOf(a) === 'zeus' ? a : b;
      zeusStorm(z);
      return triggerStunVolleyCombo(a, b, '⚡', '🌪️', 10, 3, 2.8, '⚡🐱 DONNER-PFOTEN KOMBO!');
    }
  }
];

// 🔍 Prüft, ob Kombos in diesem Modus aktiviert sind:
// - Nur im Team-Modus (oder „Alle zusammen“)
// - Im normalen Team-Modus (!trophyMode) sind Kombos NUR bei 20 und 50 Leben aktiviert!
function areCombosEnabled() {
  if (!teamMode && playerTeam !== null) return false;
  if (teamMode && !trophyMode) {
    return GAME_CONFIG.maxHits === 20 || GAME_CONFIG.maxHits === 50;
  }
  return true;
}

// 🔍 Findet das passende Combo-Paar für zwei Figuren-Arten
function getComboSpec(kind1, kind2) {
  for (const c of COMBO_PAIRS) {
    if ((c.a === kind1 && c.b === kind2) || (c.a === kind2 && c.b === kind1)) return c;
  }
  return null;
}

// 🤝 Sucht einen lebenden Team-Partner, mit dem `name` eine Combo machen kann!
// Bevorzugt Partner, die schon viele Treffer gesammelt haben.
function findComboPartnerInfo(name) {
  if (!areCombosEnabled() || !isAlive(name)) return null;
  const myKind = kindOf(name);
  let best = null;
  let bestCharge = -1;

  for (const other in actors) {
    if (other === name || !isAlive(other)) continue;
    // Müssen im selben Team sein (im Team-Modus gleiches Team, oder bei „Alle zusammen“)
    if (teamMode) {
      if (teamOf(other) !== teamOf(name)) continue;
    } else if (playerTeam !== null) {
      continue; // Im Solo-Modus kämpft jeder allein gegen alle
    }
    const spec = getComboSpec(myKind, kindOf(other));
    if (!spec) continue;
    const ch = actors[other].specialCharge || 0;
    if (ch > bestCharge) {
      bestCharge = ch;
      best = { partner: other, spec };
    }
  }
  return best;
}

// Rückwärtskompatibler Helfer (gibt den Partner-Namen zurück oder null)
function findComboPartner(name) {
  const info = findComboPartnerInfo(name);
  return info ? info.partner : null;
}

// 📋 Gibt alle aktiven Combo-Paare in deinem aktuellen Team zurück (für den Extra-Kombo-Button über den Fähigkeits-Buttons!)
function getPlayerTeamComboPairs() {
  if (!areCombosEnabled()) return [];
  const teamList = (teamMode ? chosenTeam : Object.keys(actors).filter(n => !actors[n].kind)).filter(isAlive);
  if (teamList.length < 2) return [];
  const need = GAME_CONFIG.specialChargeHits;
  const pairs = [];
  for (let i = 0; i < teamList.length; i++) {
    for (let j = i + 1; j < teamList.length; j++) {
      const a = teamList[i];
      const b = teamList[j];
      const spec = getComboSpec(kindOf(a), kindOf(b));
      if (!spec) continue;
      const charge = Math.max(actors[a].specialCharge || 0, actors[b].specialCharge || 0);
      pairs.push({
        a,
        b,
        spec,
        charge,
        ready: charge >= need,
        involvesActive: a === playerActor || b === playerActor
      });
    }
  }
  // Kombos mit deiner aktuell gesteuerten Figur oder voller Ladung zuerst
  pairs.sort((x, y) => (Number(y.ready) - Number(x.ready)) || (Number(y.involvesActive) - Number(x.involvesActive)) || (y.charge - x.charge));
  return pairs;
}

// 💥 Löst gezielt die Team-Combo zwischen `a` und `b` aus (über den Extra-Kombo-Button!)
function triggerTeamComboPair(a, b) {
  if (!isPlaying || isPaused || !areCombosEnabled()) return false;
  if (!isAlive(a) || !isAlive(b)) return false;
  const spec = getComboSpec(kindOf(a), kindOf(b));
  if (!spec) return false;
  const need = GAME_CONFIG.specialChargeHits;
  const charge = Math.max(actors[a].specialCharge || 0, actors[b].specialCharge || 0);
  if (charge < need) return false;
  const ok = spec.trigger(a, b);
  if (!ok) return false;
  actors[a].specialCharge = 0;
  actors[b].specialCharge = 0;
  actors[a].wiggle = 1;
  actors[b].wiggle = 1;
  updateSpecialBar();
  return true;
}

// 📣 Fügt den goldenen Verbindungsstrahl + Combo-Titel zwischen den beiden Partnern hinzu
function addComboBanner(a, b, label) {
  const now = performance.now();
  comboBanners.push({ a, b, label, born: now, until: now + 2000 });
  if (actors[a]?.body) spawnParticles(actors[a].body.position.x, actors[a].body.position.y, '#facc15', 25);
  if (actors[b]?.body) spawnParticles(actors[b].body.position.x, actors[b].body.position.y, '#38bdf8', 25);
  playSound('combo');
}

// 🎯 Salven-Combo (z. B. Yamal + GOAT, Käse-Popcorn usw.)
function triggerVolleyCombo(a, b, emojiA, emojiB, count, damage, title) {
  const targets = popcornTargets(a);
  if (!targets.length) return false;
  addComboBanner(a, b, title);
  for (let i = 0; i < count; i++) {
    const shooter = (i % 2 === 0 || !isAlive(b)) ? a : b;
    const target = targets[i % targets.length];
    launchArc(shooter, target, {
      emoji: i % 2 === 0 ? emojiA : emojiB,
      size: Math.round(38 * (GAME_CONFIG.mapScale || 0.72)),
      damage,
      special: true,
      trail: '✨',
      flightFrames: 26 + (i % 5) * 4
    });
  }
  return true;
}

// 🔥 Brennende Salven-Combo (steckt getroffene Gegner zusätzlich in Brand!)
function triggerBurnVolleyCombo(a, b, emojiA, emojiB, count, damage, title) {
  const targets = popcornTargets(a);
  if (!targets.length) return false;
  addComboBanner(a, b, title);
  for (const t of targets) startBurn(t, a);
  return triggerVolleyCombo(a, b, emojiA, emojiB, count, damage, title);
}

// 🌪️ Betäubende Salven-Combo
function triggerStunVolleyCombo(a, b, emojiA, emojiB, count, damage, stunSec, title) {
  const targets = popcornTargets(a);
  if (!targets.length) return false;
  const now = performance.now();
  for (let i = 0; i < Math.min(3, targets.length); i++) {
    const v = targets[i];
    if (!isHidden(v)) actors[v].stunnedUntil = Math.max(actors[v].stunnedUntil || 0, now + stunSec * 1000);
  }
  return triggerVolleyCombo(a, b, emojiA, emojiB, count, damage, title);
}

// ⚡🐾 Blitz-Krallen-Combo (Zeus + Drache oder Katze + Drache)
function triggerBoltScratchCombo(a, b, title, withBolt = true) {
  const targets = popcornTargets(a);
  if (!targets.length) return false;
  addComboBanner(a, b, title);
  for (let i = 0; i < 10; i++) {
    const shooter = (i % 2 === 0 || !isAlive(b)) ? a : b;
    const target = targets[i % targets.length];
    launchArc(shooter, target, {
      emoji: withBolt && i % 2 === 0 ? '⚡' : '🐾',
      size: 40,
      damage: 3,
      special: true,
      scratch: !withBolt || i % 2 === 1,
      bolt: withBolt && i % 2 === 0,
      flightFrames: 24 + (i % 4) * 4
    });
  }
  return true;
}

// 🧌🌽 SPEZIAL-WUNSCH 1: Mais + Kobold → Der Kobold wirft den Mais gegen die anderen Gegner!
function triggerKoboldThrowsCorn(a, b) {
  const koboldName = kindOf(a) === 'kobold' ? a : b;
  const cornName = kindOf(a) === 'corn' ? a : b;
  const targets = popcornTargets(koboldName);
  if (!targets.length) return false;

  addComboBanner(koboldName, cornName, '🧌🌽 KOBOLD WIRFT DEN MAIS!');
  const startPos = actors[koboldName].body.position;
  const now = performance.now();

  // Der Mais fliegt von Gegner zu Gegner und prallt mit Mega-Wucht an allen ab!
  const waypoints = targets.slice(0, 5).map(t => ({
    targetName: t,
    x: actors[t].body.position.x,
    y: actors[t].body.position.y
  }));

  thrownCorns.push({
    koboldName,
    cornName,
    homeX: actors[cornName].body.position.x,
    homeY: actors[cornName].body.position.y,
    x: startPos.x,
    y: startPos.y,
    waypoints,
    wpIndex: 0,
    born: now,
    until: now + 2200,
    hitSet: new Set()
  });
  playSound('popcorn');
  return true;
}

// 🐉🔥 SPEZIAL-WUNSCH 2: Drache + Goblin → Beide fangen an zu brennen und verbrennen die Nachbar-Gegner!
function triggerBurningAuraCombo(a, b, seconds, radius, title) {
  addComboBanner(a, b, title);
  const now = performance.now();
  burningAuras.push({
    actors: [a, b],
    radius: radius || 115,
    born: now,
    until: now + (seconds || 5) * 1000,
    nextTick: now + 150
  });
  playSound('spear');
  return true;
}

// 🚀 Löst die gemeinsame Combo für `name` und seinen Partner aus!
function tryTriggerCombo(name) {
  const info = findComboPartnerInfo(name);
  if (!info) return false;
  return info.spec.trigger(name, info.partner);
}

function clearCombos() {
  thrownCorns = [];
  burningAuras = [];
  comboBanners = [];
}

// 🔄 Jedes Bild: Fliegenden Mais-Wurf & brennende Nachbar-Auren aktualisieren
function updateCombos(now) {
  // 1. 🧌🌽 Kobold wirft den Mais quer durch die Gegner!
  for (let i = thrownCorns.length - 1; i >= 0; i--) {
    const tc = thrownCorns[i];
    if (!isAlive(tc.cornName) || now > tc.until || tc.wpIndex >= tc.waypoints.length) {
      if (isAlive(tc.cornName)) moveActor(tc.cornName, tc.homeX, tc.homeY);
      thrownCorns.splice(i, 1);
      continue;
    }
    const wp = tc.waypoints[tc.wpIndex];
    const tx = isAlive(wp.targetName) ? actors[wp.targetName].body.position.x : wp.x;
    const ty = isAlive(wp.targetName) ? actors[wp.targetName].body.position.y : wp.y;
    const dx = tx - tc.x;
    const dy = ty - tc.y;
    const dist = Math.hypot(dx, dy);
    const speed = 13.5;

    if (dist <= speed + 14) {
      // 💥 RUMMS! Der geworfene Mais kracht in den Gegner!
      tc.x = tx;
      tc.y = ty;
      if (isAlive(wp.targetName) && !tc.hitSet.has(wp.targetName)) {
        tc.hitSet.add(wp.targetName);
        applyHit(wp.targetName, tc.koboldName, 5, true);
        spawnParticles(tx, ty, '#facc15', 22);
        spawnEmojiParticle(tx, ty, '🍿');
        spawnEmojiParticle(tx, ty, '🪙');
        playSound('boom');
      }
      tc.wpIndex++;
    } else {
      tc.x += (dx / dist) * speed;
      tc.y += (dy / dist) * speed;
    }
    moveActor(tc.cornName, tc.x, tc.y);
    if (Math.random() < 0.5) spawnEmojiParticle(tc.x, tc.y, '🍿');
  }

  // 2. 🐉🔥 Drache & Goblin brennen und verbrennen alle Nachbar-Gegner im Umkreis!
  for (let i = burningAuras.length - 1; i >= 0; i--) {
    const aura = burningAuras[i];
    if (now > aura.until) {
      burningAuras.splice(i, 1);
      continue;
    }
    if (now >= aura.nextTick) {
      aura.nextTick = now + 380;
      for (const carrier of aura.actors) {
        if (!isAlive(carrier)) continue;
        const cp = actors[carrier].body.position;
        spawnParticles(cp.x, cp.y, '#f97316', 6);
        // Alle Nachbar-Gegner in Reichweite fangen sofort Feuer und nehmen Schaden!
        for (const victim in actors) {
          if (victim === carrier || !isAlive(victim) || isHidden(victim)) continue;
          if (teamMode && teamOf(victim) === teamOf(carrier)) continue;
          const vp = actors[victim].body.position;
          if (Math.hypot(vp.x - cp.x, vp.y - cp.y) <= aura.radius) {
            startBurn(victim, carrier);
            applyHit(victim, carrier, 2, true);
            spawnParticles(vp.x, vp.y, '#ef4444', 10);
          }
        }
      }
    }
  }
}

// 🎨 Malt die brennenden Feuer-Ringe, den fliegenden Turbo-Mais und die Combo-Banner
function drawCombos(now) {
  // 🔥 Brennende Nachbar-Aura um Drache & Goblin
  for (const aura of burningAuras) {
    const pulse = 0.85 + Math.sin(now * 0.02) * 0.15;
    for (const carrier of aura.actors) {
      if (!isAlive(carrier)) continue;
      const p = actors[carrier].body.position;
      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y, 12, p.x, p.y, aura.radius * pulse);
      grad.addColorStop(0, 'rgba(251, 146, 60, 0.55)');
      grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.32)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, aura.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#f97316';
      ctx.stroke();

      // Kreisende Flammen um die brennenden Figuren
      for (let k = 0; k < 5; k++) {
        const ang = now * 0.008 + (k * Math.PI * 2) / 5;
        const fx = p.x + Math.cos(ang) * (aura.radius * 0.65);
        const fy = p.y + Math.sin(ang) * (aura.radius * 0.65);
        drawEmoji('🔥', fx, fy, 24);
      }
      ctx.restore();
    }
  }

  // 🧌🌽 Fliegender Mais-Wirbel beim Kobold-Wurf
  for (const tc of thrownCorns) {
    ctx.save();
    ctx.translate(tc.x, tc.y);
    ctx.rotate(now * 0.03);
    drawEmoji('🌽', 0, 0, 64);
    ctx.restore();
  }

  // 🤝 Goldener Verbindungsstrahl & Combo-Name
  for (let i = comboBanners.length - 1; i >= 0; i--) {
    const c = comboBanners[i];
    if (now > c.until) {
      comboBanners.splice(i, 1);
      continue;
    }
    const pa = actors[c.a]?.body?.position;
    const pb = actors[c.b]?.body?.position;
    if (!pa || !pb) continue;
    const alpha = Math.min(1, (c.until - now) / 400);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
    ctx.setLineDash([]);
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2 - 28;
    drawLabel(c.label, mx, my, {
      size: 15, weight: '900', fill: '#facc15', stroke: '#0f172a', lineWidth: 4
    });
    ctx.restore();
  }
}
