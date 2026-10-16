/**
 * 🧌🌽🐱 actors.js – Alle sechs Figuren und ihre Steuerung
 *
 * Hier steht, wie die Figuren gebaut, bewegt, angetippt und gemalt werden.
 */

// Alle Figuren in einer Liste. Jede wirft ihre Bombe auf `target`:
// Kobold → Mais → Katze → Maus → Goblin → Musiala → Drache → Kobold (immer im Kreis!).
// Neue Figur? Eintrag hier + Knopf in index.html + Werte in config.js.
const actors = {
  kobold: {
    name: 'KOBOLD', color: '#6ee7b7', category: 4, target: 'corn',
    sway: 420, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: Math.max(42, width * 0.12), y: height * 0.52 })
  },
  corn: {
    name: 'MAIS', color: '#fef08a', category: 8, target: 'katze',
    sway: 480, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width - Math.max(42, width * 0.12), y: height * 0.52 })
  },
  katze: {
    name: 'KATZE', color: '#f9a8d4', category: 16, target: 'maus',
    sway: 360, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.5, y: height * 0.22 })
  },
  maus: {
    name: 'MAUS', color: '#d1d5db', category: 32, target: 'goblin',
    sway: 260, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.66, y: height * 0.76 })
  },
  goblin: {
    name: 'GOBLIN', color: '#fca5a5', category: 64, target: 'musiala',
    sway: 300, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.24, y: height * 0.24 })
  },
  musiala: {
    name: 'GOAT', color: '#facc15', category: 128, target: 'yamal',
    sway: 220, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.76, y: height * 0.24 })
  },
  yamal: {
    name: 'YAMAL', color: '#38bdf8', category: 1024, target: 'drache',
    sway: 210, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.82, y: height * 0.74 })
  },
  drache: {
    name: 'DRACHE', color: '#86efac', category: 256, target: 'zeus',
    sway: 340, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.24, y: height * 0.76 })
  },
  zeus: {
    name: 'ZEUS', color: '#38bdf8', category: 512, target: 'kobold',
    sway: 300, body: null, wiggle: 0, hitsGiven: 0, hitsTaken: 0,
    start: () => ({ x: width * 0.5, y: height * 0.78 })
  }
};

// Welche Figur steckt dahinter? Bei Gegner-Kopien (teams.js) z. B. 'katze_3' → 'katze'
function kindOf(name) { return (actors[name] && actors[name].kind) || name; }
// Einstellung aus config.js für diese Figur, z. B. actorCfg('katze', 'Emoji') → katzeEmoji
function actorCfg(name, key) { return GAME_CONFIG[`${kindOf(name)}${key}`]; }
// Der Knopf zum Antippen (Gegner-Kopien haben keinen → null)
function actorBtn(name) { return document.getElementById(`${name}Btn`); }

// Emoji und Größe kommen aus config.js (z. B. koboldEmoji, katzeSize) + mapScale für größere Map-Übersicht.
function mapScale() { return GAME_CONFIG.mapScale || 0.72; }
function actorEmoji(name) { return actorCfg(name, 'Emoji'); }
function actorSize(name) { return actorCfg(name, 'Size') * teamScale() * mapScale(); }

// Baut die Physik-Körper der Figuren und setzt sie in die Welt.
function createActors() {
  const r = Math.round(34 * mapScale());
  for (const name in actors) {
    const actor = actors[name];
    const { x, y } = actor.start();
    actor.body = Bodies.circle(x, y, r, {
      isStatic: true,
      label: name,
      collisionFilter: { category: actor.category },
      restitution: 1.05 // Bounct Items extra stark weg!
    });
    Composite.add(engine.world, actor.body);
  }
}

// Physikkörper, sichtbare Figur und Trefferfläche bleiben an derselben Position.
function moveActor(name, x, y) {
  const actor = actors[name];
  if (!actor || !actor.body) return;
  const marginX = Math.min(36, width / 2);
  const marginY = Math.min(48, height / 2);
  const position = {
    x: Math.max(marginX, Math.min(width - marginX, x)),
    y: Math.max(marginY, Math.min(height - marginY, y))
  };
  Body.setPosition(actor.body, position);
  const button = actorBtn(name);
  if (!button) return;
  button.style.left = `${position.x}px`;
  button.style.top = `${position.y}px`;
}

// Alle Figuren zurück an ihren Startplatz.
function resetActors() {
  for (const name in actors) {
    const { x, y } = actors[name].start();
    moveActor(name, x, y);
    actors[name].wiggle = 0;
    actors[name].hitsGiven = 0;
    actors[name].hitsTaken = 0;
  }
  reviveActors(); // Alle wieder im Spiel (knockout.js)
}

// Jede Figur hat ihren eigenen Pointer: auch mehrere Finger gleichzeitig gehen.
for (const name in actors) {
  const button = document.getElementById(`${name}Btn`);
  let drag = null;
  let suppressClick = false;
  button.addEventListener('pointerdown', (event) => {
    if (!isPlaying || isPaused || drag || event.button !== 0) return;
    // 👆 Im Team-Modus: Klick auf einen anderen Charakter deines Teams wechselt sofort zu ihm!
    if (teamMode && chosenTeam.includes(name) && name !== playerActor) {
      if (typeof switchActiveTeamActor === 'function') switchActiveTeamActor(name);
    }
    if (isStunned(name) || actors[name].jump) return; // 🌪️ Im Wirbel / im Sprung: nicht ziehen (specials.js)
    initAudio();
    const body = actors[name].body;
    actors[name].dragging = true;
    drag = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: body.position.x, y: body.position.y, moved: false
    };
    suppressClick = false;
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) >= GAME_CONFIG.dragThreshold) drag.moved = true;
    if (drag.moved) {
      suppressClick = true;
      moveActor(name, drag.x + dx, drag.y + dy);
      actors[name].homeRx = actors[name].body.position.x / width;
      actors[name].homeRy = actors[name].body.position.y / height;
    }
  });
  function finishDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved || event.type !== 'pointerup';
    actors[name].dragging = false;
    drag = null;
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
  }
  button.addEventListener('pointerup', finishDrag);
  button.addEventListener('pointercancel', finishDrag);
  button.addEventListener('lostpointercapture', finishDrag);
  button.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    initAudio();
    if (teamMode && chosenTeam.includes(name) && name !== playerActor) {
      if (typeof switchActiveTeamActor === 'function') switchActiveTeamActor(name);
      return;
    }
    shootBomb(name);
  });
}

// Malt alle Figuren. Nach einem Wurf oder Treffer wackeln sie kurz (Wiggle).
function drawActors(now) {
  for (const name in actors) {
    const actor = actors[name];
    if (!isAlive(name)) continue; // Raus ist raus
    ctx.save();
    ctx.translate(actor.body.position.x, actor.body.position.y);
    ctx.rotate(Math.sin(now / actor.sway) * 0.07 + (actor.wiggle * 0.25));
    drawTeamAura(name); // 🔵🔴 Teamfarbe (teams.js)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let shirt = actorCfg(name, 'Shirt');
    if (shirt && teamMode && teamOf(name) === 'enemy') {
      shirt = { ...shirt, color: TEAM_COLORS.enemy, numberColor: '#ffffff' }; // Gegner: rotes Trikot
    }
    if (shirt) {
      drawFootballer(shirt, actorSize(name), now, actor.runDir || 1, actor.wiggle, shirt.sixSeven && isSixSeven(actor)); // ⚽ GOAT im #10 Trikot (footballer.js)
    } else if (isHidden(name)) {
      // 🐀🕳️ Versteckt: Mauseloch, die Figur guckt nur ganz blass heraus
      drawEmoji('🕳️', 0, 18, actorSize(name) * 0.9);
      ctx.globalAlpha = 0.3;
      drawEmoji(actorEmoji(name), 0, 4, actorSize(name) * 0.7);
      ctx.globalAlpha = 1;
      drawLabel(`🙈 ${Math.ceil((actor.hiddenUntil - now) / 1000)}`, 0, -28, { size: 14, fill: '#ffffff', stroke: '#111827', lineWidth: 3 });
    } else if (GAME_CONFIG.proSkins && typeof drawProSkin === 'function') {
      drawProSkin(kindOf(name), actorSize(name), now); // ✨ Edler Pro-Skin (skins.js)
    } else {
      drawEmoji(actorEmoji(name), 0, 0, actorSize(name)); // 🖼️ aus dem Bilder-Speicher (sprites.js)
    }
    // Name mit dunklem Rand: lesbar bei Tag und Nacht
    drawLabel(actor.name, 0, 42, {
      size: 11, fill: teamMode ? TEAM_COLORS[teamOf(name)] : actor.color,
      stroke: 'rgba(0, 0, 0, 0.75)', lineWidth: 3
    });

    // Treffer-Zähler: gegeben (🎯) / eingesteckt (💥)
    drawLabel(`🎯${actor.hitsGiven} 💥${actor.hitsTaken}`, 0, 56, {
      size: 10, fill: '#ffffff', stroke: 'rgba(0, 0, 0, 0.8)', lineWidth: 2.5
    });
    drawLifeBar(actor); // ❤️ (knockout.js)
    drawPlayerMarker(name, now); // ⭐ DU (cpu.js)
    drawSpecialBadge(name, now); // ⚡ Spezialkraft bereit? (specials.js)
    ctx.restore();

    // Wiggle-Dämpfung
    actor.wiggle *= 0.88;
  }
}
