/**
 * 🎮 cpu.js – Wen spielst DU? Die anderen spielt der Computer.
 *
 * Am Anfang tippst du auf eine Figur. Nur die steuerst du.
 * Alle anderen werfen von allein (Computer-Gegner).
 * „👥 ALLE ZUSAMMEN“ = alte Variante: jeder darf jede Figur antippen, kein Computer.
 */

let playerActor = null; // Name der eigenen Figur (Solo), sonst null
let playerTeam = null;  // Alle Figuren, die DU steuerst. null = „Alle zusammen“
let cpuNextThrow = {};  // Wann wirft welche Computer-Figur das nächste Mal?

// Wurf-Tempo der Computer im aktuellen Level (levels.js)
function cpuThrowMs() {
  return level() ? level().throwMs : GAME_CONFIG.cpuThrowMs;
}

// Spielt der Computer diese Figur?
function isCpu(name) {
  return playerTeam !== null && !playerTeam.includes(name);
}

// Solo-Spiel nach der Modus-Auswahl (Pokale oder Normal) starten
function startSoloGame(name) {
  playerActor = name;
  playerTeam = [name];
  teamMode = false;
  currentLevel = 0; // Immer bei Level 1 anfangen (levels.js)
  nextLevel = 0;
  startGame();
}

// Figur auswählen → erst prüfen ob freigeschaltet, dann fragen: Mit Pokalen (50 Leben) oder Normal?
function chooseAndStart(name) {
  if (name === null) {
    trophyMode = false;
    applyModeLives();
    updateTrophyHud();
    playerActor = null;
    playerTeam = null;
    teamMode = false;
    currentLevel = 0;
    nextLevel = 0;
    startGame();
    return;
  }
  if (!isActorUnlocked(name)) {
    initAudio();
    playSound('hit');
    const need = requiredTrophiesFor(name);
    const have = Math.max(trophiesData.total || 0, activePlayerTrophies());
    const pickTitle = document.querySelector('#startScreen .pick-title');
    if (pickTitle) {
      pickTitle.textContent = `🔒 Für ${actors[name].name} brauchst du ${need} Pokale! (Du hast ${have} 🏆)`;
    }
    return;
  }
  openModeChoice({ type: 'solo', actor: name });
}

// Wird bei jedem Start aufgerufen: Knöpfe der Computer-Figuren sperren,
// Startplatz merken und Computer-Würfe neu planen.
function setupPlayers() {
  const now = performance.now();
  cpuNextThrow = {};
  for (const name in actors) {
    const actor = actors[name];
    const btn = actorBtn(name);
    if (btn) btn.classList.toggle('cpu', isCpu(name));
    actor.homeRx = actor.body.position.x / width;
    actor.homeRy = actor.body.position.y / height;
    actor.goalDx = 0;
    actor.goalDy = 0;
    actor.nextMove = now + 450 + Math.random() * 600;
    actor.cpuAim = null;
    cpuNextThrow[name] = now + 1100 + Math.random() * cpuThrowMs() * 0.7;
  }
}

// 🎯 Wen greift die Computer-Figur an? Überspringt versteckte Mäuse im Mauseloch,
// zielt in höheren Leveln öfter auf dich und wechselt im Team-Modus die Ziele durch.
function pickCpuTarget(name) {
  if (teamMode) {
    const alive = playerTeam.filter(isAlive);
    const visible = alive.filter(n => !isHidden(n));
    const pool = visible.length ? visible : alive;
    if (!pool.length) return null;
    if (Math.random() < 0.65) return nearestEnemy(name);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const lv = level();
  const huntChance = lv ? lv.huntPlayer : 0.45;
  if (playerActor && isAlive(playerActor) && !isHidden(playerActor) && Math.random() < huntChance) {
    return playerActor;
  }
  // Quer über das Feld auf einen anderen sichtbaren Gegner werfen
  if (Math.random() < 0.4) {
    const others = Object.keys(actors).filter(n => n !== name && isAlive(n) && !isHidden(n));
    if (others.length) return others[Math.floor(Math.random() * others.length)];
  }
  return targetOf(name);
}

// 🛡️ Fliegt gerade eine feindliche Bombe direkt auf diese Figur zu?
function hasIncomingBomb(name) {
  const pos = actors[name].body.position;
  for (const b of fallingBodies) {
    const d = b.customData;
    if (!d || !d.isPlayerBomb || d.shooter === name) continue;
    if (teamMode && actors[d.shooter] && teamOf(d.shooter) === teamOf(name)) continue;
    if (d.target === name || Math.hypot(b.position.x - pos.x, b.position.y - pos.y) < 130) return true;
  }
  return false;
}

// 🏃 Pro-Bots: Bewegen sich wie echte Spieler frei über die Map, strafen seitlich
// und weichen anfliegenden Geschossen und Zeus-Gewitterkreisen aktiv aus!
function moveCpuActor(name, now) {
  const actor = actors[name];
  if (actorCfg(name, 'Shirt') && actorCfg(name, 'Runs')) return; // GOAT dribbelt in footballer.js
  if (actor.dragging || isStunned(name) || actor.jump || isHidden(name)) return;

  const pos = actor.body.position;
  const homeX = (actor.homeRx ?? pos.x / width) * width;
  const homeY = (actor.homeRy ?? pos.y / height) * height;
  const lv = Math.min(1, currentLevel / 4); // 0 in Level 1 → 1 ab Level 5
  const maxR = teamMode ? (42 + lv * 48) * teamScale() : (75 + lv * 95);
  const speed = (1.65 + lv * 1.35) * (teamMode ? 0.85 : 1);

  // ⚡🔴 Steht der Bot in einem roten Blitz-Kreis von Zeus? Sofort rausrennen!
  if (typeof zeusStorms !== 'undefined') {
    for (const s of zeusStorms) {
      if (s.shooter === name || (teamMode && actors[s.shooter] && teamOf(s.shooter) === teamOf(name))) continue;
      const dx = pos.x - s.x;
      const dy = pos.y - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist < s.radius + 35) {
        const ux = dist > 1 ? dx / dist : 1;
        const uy = dist > 1 ? dy / dist : 0;
        moveActor(name, pos.x + ux * (speed * 1.4), pos.y + uy * (speed * 1.4));
        return;
      }
    }
  }

  // 😱 Fliegt eine Bombe oder ein Riesenball auf den Bot zu? Seitwärts ausweichen wie ein echter Spieler!
  for (const b of fallingBodies) {
    const d = b.customData;
    if (!d || !d.isPlayerBomb || d.shooter === name) continue;
    if (teamMode && actors[d.shooter] && teamOf(d.shooter) === teamOf(name)) continue;
    const dx = pos.x - b.position.x;
    const dy = pos.y - b.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < 175) {
      // Quer zur Flugrichtung der Bombe ausweichen (Sidestep)
      const vx = b.velocity.x || 1;
      const vy = b.velocity.y || 0;
      const vLen = Math.hypot(vx, vy) || 1;
      // Normalenvektor quer zur Schusslinie
      let sx = -vy / vLen;
      let sy = vx / vLen;
      if (sx * dx + sy * dy < 0) { sx = -sx; sy = -sy; }
      const dodgeSpeed = speed * (d.steer ? 1.35 : 1.15);
      const nx = Math.max(46, Math.min(width - 46, pos.x + (sx * 0.75 + (dx / dist) * 0.45) * dodgeSpeed));
      const ny = Math.max(58, Math.min(height - 58, pos.y + (sy * 0.75 + (dy / dist) * 0.45) * dodgeSpeed));
      moveActor(name, nx, ny);
      return;
    }
  }

  // Wie ein echter Spieler über das Feld laufen und ständig in Bewegung bleiben
  if (now >= (actor.nextMove || 0)) {
    const angle = Math.random() * Math.PI * 2;
    const r = (0.45 + Math.random() * 0.55) * maxR;
    actor.goalDx = Math.cos(angle) * r;
    actor.goalDy = Math.sin(angle) * r * 0.8;
    actor.nextMove = now + (680 - lv * 220) + Math.random() * 480;
  }

  const gx = Math.max(50, Math.min(width - 50, homeX + (actor.goalDx || 0)));
  const gy = Math.max(60, Math.min(height - 60, homeY + (actor.goalDy || 0)));
  const dx = gx - pos.x;
  const dy = gy - pos.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 2) {
    const step = Math.min(dist, speed);
    moveActor(name, pos.x + (dx / dist) * step, pos.y + (dy / dist) * step);
  } else {
    actor.nextMove = now; // Sofort nächstes Ziel wählen, nie lange stillstehen!
  }
}

// 🤖 In jedem Bild: Computer-Figuren bewegen sich, wehren ab und werfen schnell.
function updateCpu(now) {
  if (playerTeam === null) return;
  for (const name in actors) {
    if (!isCpu(name) || !isAlive(name)) continue;
    moveCpuActor(name, now);

    // 🛡️ Schutz-Reflex: Maus (Mauseloch) & Kobold (Mini-Kobolde) nutzen ihre Kraft, wenn eine Bombe anfliegt!
    const kind = kindOf(name);
    if ((kind === 'maus' || kind === 'kobold') && specialReady(name) && hasIncomingBomb(name)) {
      if (trySpecial(name)) {
        cpuNextThrow[name] = Math.max(cpuNextThrow[name] || 0, now + 420);
        continue;
      }
    }

    if (cpuNextThrow[name] === undefined) cpuNextThrow[name] = now + 1100 + Math.random() * cpuThrowMs();
    if (now >= cpuNextThrow[name]) {
      const target = pickCpuTarget(name);
      // ⚡ Spezialkraft nutzen – aber nicht verschwenden, wenn das Ziel im Mauseloch versteckt ist
      if (target && !isHidden(target) && Math.random() < GAME_CONFIG.cpuSpecialChance) {
        actors[name].cpuAim = target;
        const used = trySpecial(name);
        actors[name].cpuAim = null;
        if (used) {
          cpuNextThrow[name] = now + cpuThrowMs() * (0.45 + Math.random() * 0.55);
          continue;
        }
      }
      shootBomb(name, target);
      // Nach jedem Schuss direkt weiterbewegen (Strafe wie echte Spieler)
      actors[name].nextMove = Math.min(actors[name].nextMove || Infinity, now + 140);
      cpuNextThrow[name] = now + cpuThrowMs() * (0.45 + Math.random() * 0.55);
    }
  }
}

// ⭐ „DU“-Markierung über der eigenen Figur (wird in drawActors aufgerufen).
function drawPlayerMarker(name, now) {
  if (name !== playerActor) return;
  const y = -52 + Math.sin(now / 200) * 3;
  drawLabel('⭐ DU ⭐', 0, y, { size: 14, weight: '900', fill: '#ffde59', stroke: '#111827', lineWidth: 4 });
}

// 👇 Auswahl-Knöpfe auf dem Startbildschirm bauen – eine Kachel pro Figur.
// Neue Figuren in actors.js tauchen hier automatisch auf.
const pickGrid = document.getElementById('pickGrid');
for (const name in actors) {
  const btn = document.createElement('button');
  btn.className = 'pick-btn';
  btn.type = 'button';
  btn.dataset.name = name;
  btn.innerHTML = `<span class="pick-emoji">${actorEmoji(name)}</span>${actors[name].name}`;
  btn.addEventListener('click', () => chooseAndStart(name));
  pickGrid.appendChild(btn);
}
refreshUnlockTiles();

startBtn.addEventListener('click', () => chooseAndStart(null));
changeBtn.addEventListener('click', () => {
  gameOverScreen.classList.remove('active');
  startScreen.classList.add('active');
  refreshUnlockTiles();
});
