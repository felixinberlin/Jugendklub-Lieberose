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

// Figur auswählen und los geht's!
function chooseAndStart(name) {
  playerActor = name;
  playerTeam = name === null ? null : [name];
  teamMode = false;
  currentLevel = 0; // Immer bei Level 1 anfangen (levels.js)
  nextLevel = 0;
  startGame();
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
    actor.nextMove = now + 1200 + Math.random() * 1200;
    actor.cpuAim = null;
    cpuNextThrow[name] = now + 2000 + Math.random() * cpuThrowMs(); // Erst das LEVEL-Schild zeigen
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
    if (currentLevel >= 2 && Math.random() < 0.45) return nearestEnemy(name);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const lv = level();
  const huntChance = lv ? lv.huntPlayer : 0.2;
  if (playerActor && isAlive(playerActor) && !isHidden(playerActor) && Math.random() < huntChance) {
    return playerActor;
  }
  // Ab Level 3: manchmal auch quer über das Feld auf einen anderen sichtbaren Gegner werfen
  if (currentLevel >= 2 && Math.random() < 0.25) {
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
    if (d.target === name || Math.hypot(b.position.x - pos.x, b.position.y - pos.y) < 115) return true;
  }
  return false;
}

// 🏃 Computer-Figuren bewegen sich um ihren Platz (in höheren Leveln flinker),
// flüchten vor dem Riesenball, bleiben aber fair stehen, wenn dein Wurf auf sie zufliegt.
function moveCpuActor(name, now) {
  const actor = actors[name];
  if (actorCfg(name, 'Shirt') && actorCfg(name, 'Runs')) return; // Musiala dribbelt in footballer.js
  if (actor.dragging || isStunned(name) || actor.jump || isHidden(name)) return;

  const pos = actor.body.position;
  const homeX = (actor.homeRx ?? pos.x / width) * width;
  const homeY = (actor.homeRy ?? pos.y / height) * height;
  const lv = Math.min(1, currentLevel / 4); // 0 in Level 1 → 1 ab Level 5
  const maxR = teamMode ? (12 + lv * 14) * teamScale() : (14 + lv * 34);

  // 😱 Kommt ein Riesenball angeflogen? Schnell weg davon!
  for (const b of fallingBodies) {
    const d = b.customData;
    if (!d || !d.steer || d.shooter === name) continue;
    if (teamMode && actors[d.shooter] && teamOf(d.shooter) === teamOf(name)) continue;
    const dx = pos.x - b.position.x;
    const dy = pos.y - b.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < 165) {
      const flee = 1.6;
      const nx = Math.max(homeX - maxR * 1.4, Math.min(homeX + maxR * 1.4, pos.x + (dx / dist) * flee));
      const ny = Math.max(homeY - maxR * 1.2, Math.min(homeY + maxR * 1.2, pos.y + (dy / dist) * flee));
      moveActor(name, nx, ny);
      return;
    }
  }

  // Fair bleiben: Solange ein normaler Wurf von dir auf diese Figur fliegt, weicht sie nicht unterm Wurf weg
  for (const b of fallingBodies) {
    const d = b.customData;
    if (d && d.isPlayerBomb && !d.steer && d.target === name &&
        (playerTeam === null || playerTeam.includes(d.shooter))) return;
  }

  if (now >= (actor.nextMove || 0)) {
    const angle = Math.random() * Math.PI * 2;
    const r = (0.35 + Math.random() * 0.65) * maxR;
    actor.goalDx = Math.cos(angle) * r;
    actor.goalDy = Math.sin(angle) * r * 0.7;
    actor.nextMove = now + (1500 - lv * 500) + Math.random() * 900;
  }

  const gx = homeX + (actor.goalDx || 0);
  const gy = homeY + (actor.goalDy || 0);
  const dx = gx - pos.x;
  const dy = gy - pos.y;
  const dist = Math.hypot(dx, dy);
  const speed = 0.45 + lv * 0.7;
  if (dist > 1.5) {
    const step = Math.min(dist, speed);
    moveActor(name, pos.x + (dx / dist) * step, pos.y + (dy / dist) * step);
  }
}

// 🤖 In jedem Bild: Computer-Figuren bewegen sich, wehren ab und werfen.
function updateCpu(now) {
  if (playerTeam === null) return;
  for (const name in actors) {
    if (!isCpu(name) || !isAlive(name)) continue;
    moveCpuActor(name, now);

    // 🛡️ Schutz-Reflex: Maus (Mauseloch) & Kobold (Mini-Kobolde) nutzen ihre Kraft, wenn eine Bombe anfliegt!
    const kind = kindOf(name);
    if ((kind === 'maus' || kind === 'kobold') && specialReady(name) && hasIncomingBomb(name)) {
      if (trySpecial(name)) {
        cpuNextThrow[name] = Math.max(cpuNextThrow[name] || 0, now + 600);
        continue;
      }
    }

    if (cpuNextThrow[name] === undefined) cpuNextThrow[name] = now + 2000 + Math.random() * cpuThrowMs();
    if (now >= cpuNextThrow[name]) {
      const target = pickCpuTarget(name);
      // ⚡ Spezialkraft nutzen – aber nicht verschwenden, wenn das Ziel im Mauseloch versteckt ist
      if (target && !isHidden(target) && Math.random() < GAME_CONFIG.cpuSpecialChance) {
        actors[name].cpuAim = target;
        const used = trySpecial(name);
        actors[name].cpuAim = null;
        if (used) {
          cpuNextThrow[name] = now + cpuThrowMs() * (0.6 + Math.random() * 0.8);
          continue;
        }
      }
      shootBomb(name, target);
      // Nach dem Wurf gern einen kleinen Schritt zur Seite planen
      actors[name].nextMove = Math.min(actors[name].nextMove || Infinity, now + 250);
      // Nicht alle im gleichen Takt: etwas Zufall dazu
      cpuNextThrow[name] = now + cpuThrowMs() * (0.6 + Math.random() * 0.8);
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

startBtn.addEventListener('click', () => chooseAndStart(null));
changeBtn.addEventListener('click', () => {
  gameOverScreen.classList.remove('active');
  startScreen.classList.add('active');
});
