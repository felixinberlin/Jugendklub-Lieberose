/**
 * ⚔️ teams.js – Team-Modus: Dein Team gegen das Gegner-Team
 *
 * Du wählst MEHRERE Figuren – die steuerst du alle (antippen = werfen).
 * Dein Team leuchtet BLAU, die Gegner sind ROT (Musiala-Gegner tragen rote Trikots).
 * Jedes Level hat mehr Gegner (config.js → teamLevels). Die Gegner sind
 * Kopien der Figuren, z. B. „KATZE 2“. Kein Eigentor: Würfe treffen nur das andere Team.
 */

let teamMode = false;  // Läuft gerade der Team-Modus?
let chosenTeam = [];   // Deine bisherigen Figuren im Team (Namen aus actors)
let pendingTeamPick = null; // Welche neue Figur hast du für dieses Level angetippt?
let pendingTeamKeepCharge = false;

const TEAM_COLORS = { mine: '#3b82f6', enemy: '#ef4444' };
const TEAM_BITS = { mine: 1 << 20, enemy: 1 << 21 }; // Eigene Bits weit oben, damit neue Figuren (256, 512, …) frei bleiben

// Alle echten Figuren (ohne rote Gegner-Kopien)
function baseActorNames() {
  return Object.keys(actors).filter(n => !actors[n].kind);
}

// Zu welchem Team gehört die Figur? 'mine' oder 'enemy'
function teamOf(name) {
  return chosenTeam.includes(name) ? 'mine' : 'enemy';
}

// Alle lebenden Figuren des anderen Teams
function enemiesOf(name) {
  const myTeam = teamOf(name);
  return Object.keys(actors).filter(n => isAlive(n) && teamOf(n) !== myTeam);
}

// Die nächste lebende Figur aus dem anderen Team (versteckte im Mauseloch nur, wenn sonst niemand da ist)
function nearestEnemy(name) {
  const me = actors[name].body.position;
  const all = enemiesOf(name);
  const visible = all.filter(n => !isHidden(n));
  const pool = visible.length ? visible : all;
  let best = null;
  let bestDist = Infinity;
  for (const n of pool) {
    const p = actors[n].body.position;
    const d = Math.hypot(p.x - me.x, p.y - me.y);
    if (d < bestDist) { best = n; bestDist = d; }
  }
  return best;
}

// Kopierte Gegner wieder wegräumen (vor jedem Start)
function removeClones() {
  for (const name in actors) {
    if (!actors[name].kind) continue;
    Composite.remove(engine.world, actors[name].body);
    delete actors[name];
  }
}

// Verteilt Figuren in Reihen: `rows` = Liste von Höhen (Anteil von height)
function placeInRows(names, rows, perRow) {
  names.forEach((name, i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, names.length - row * perRow);
    const col = i % perRow;
    moveActor(name, width * (col + 1) / (inRow + 1), height * rows[Math.min(row, rows.length - 1)]);
  });
}

// Wird bei jedem Start aufgerufen: Teams aufstellen, Gegner-Kopien bauen.
function setupTeams() {
  for (const name in actors) {
    // Außerhalb des Team-Modus: jede Figur hat wieder ihre eigene Physik-Kategorie
    actors[name].body.collisionFilter.category = teamMode
      ? (chosenTeam.includes(name) ? TEAM_BITS.mine : TEAM_BITS.enemy)
      : actors[name].category;
  }
  if (!teamMode) return;

  // Nicht gewählte Figuren setzen aus – die Gegner sind rote Kopien
  for (const name in actors) {
    if (chosenTeam.includes(name)) continue;
    actors[name].alive = false;
    Composite.remove(engine.world, actors[name].body);
    actorBtn(name).style.display = 'none';
  }

  // Gegner-Kopien: erst Figuren, die nicht in deinem Team sind, dann alle der Reihe nach
  const kinds = Object.keys(actors).filter(n => !chosenTeam.includes(n)).concat(Object.keys(actors));
  const count = level().enemies;
  const enemyNames = [];
  const perKind = {};
  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length];
    perKind[kind] = (perKind[kind] || 1) + 1;
    const name = `${kind}_${i}`;
    const base = actors[kind];
    const cloneMaxHp = (typeof trophyMode !== 'undefined' && trophyMode)
      ? (getCharStat(kind, 'hp') || 100)
      : GAME_CONFIG.maxHits;
    actors[name] = {
      kind, name: `${base.name} ${perKind[kind]}`, color: TEAM_COLORS.enemy,
      category: TEAM_BITS.enemy, target: null, sway: base.sway, body: null,
      wiggle: 0, hitsGiven: 0, hitsTaken: 0, maxHp: cloneMaxHp, hp: cloneMaxHp, alive: true, start: base.start
    };
    actors[name].body = Bodies.circle(width / 2, height / 3, Math.round(34 * mapScale()), {
      isStatic: true, label: name, restitution: 1.05,
      collisionFilter: { category: TEAM_BITS.enemy }
    });
    Composite.add(engine.world, actors[name].body);
    enemyNames.push(name);
  }

  // Aufstellung: Gegner oben, dein Team unten.
  // Breiter Bildschirm: mehr nebeneinander, weniger Reihen (sonst überlappen sie quer)
  const perRow = Math.max(4, Math.floor(width / 90));
  if (height < 500) {
    placeInRows(enemyNames, [0.18, 0.38], perRow);
    placeInRows(chosenTeam, [0.72], 7);
  } else {
    placeInRows(enemyNames, [0.18, 0.32, 0.45], perRow);
    placeInRows(chosenTeam, [0.64, 0.78], Math.max(4, Math.floor(width / 100)));
  }
}

// Im Team-Modus etwas kleiner, damit alle draufpassen (auf flachen Bildschirmen noch kleiner)
function teamScale() {
  if (!teamMode) return 1;
  return height < 500 ? 0.72 : 0.85;
}

// 🔵🔴 Leuchtkreis in Teamfarbe hinter der Figur (wird in drawActors aufgerufen)
function drawTeamAura(name) {
  if (!teamMode) return;
  const color = TEAM_COLORS[teamOf(name)];
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 36 * teamScale() * mapScale() + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

// Hat ein Team gewonnen? (aus checkKnockout) – gibt true/false zurück, null = läuft noch
function teamResult() {
  const mineAlive = chosenTeam.some(isAlive);
  const enemyAlive = Object.keys(actors).some(n => isAlive(n) && teamOf(n) === 'enemy');
  if (!mineAlive) return false;
  if (!enemyAlive) return true;
  return null;
}

// 👇 Team-Auswahl: Level 1 = 1. Figur, Level 2 = 2. Figur, … bis Level 6 (ab dann kämpfen ALLE!)
const teamGrid = document.getElementById('teamGrid');
const teamScreenHeading = document.getElementById('teamScreenHeading');
const teamPickTitle = document.getElementById('teamPickTitle');
const teamHintText = document.getElementById('teamHintText');

for (const name in actors) {
  const btn = document.createElement('button');
  btn.className = 'pick-btn';
  btn.type = 'button';
  btn.dataset.name = name;
  btn.innerHTML = `<span class="pick-emoji">${actorEmoji(name)}</span>${actors[name].name}`;
  btn.addEventListener('click', () => {
    if (chosenTeam.includes(name)) return; // Schon fest im Team!
    // ⚡ Level 7 (currentLevel === 6): Hier kann man NUR Zeus auswählen!
    if (currentLevel === 6 && name !== 'zeus') {
      initAudio();
      playSound('hit');
      teamHintText.textContent = '⚡ In Level 7 kannst du nur ZEUS auswählen (oder direkt ohne Auswahl starten)!';
      return;
    }
    // In Level 1–6 wird Zeus für Level 7 aufgehoben
    if (currentLevel < 6 && name === 'zeus') {
      initAudio();
      playSound('hit');
      teamHintText.textContent = '⚡ ZEUS wartet als Bonus-Wahl in Level 7 auf dich!';
      return;
    }
    if (!isActorUnlocked(name)) {
      initAudio();
      playSound('hit');
      const need = requiredTrophiesFor(name);
      const have = Math.max(trophiesData.total || 0, activePlayerTrophies());
      teamHintText.textContent = `🔒 Für ${actors[name].name} brauchst du ${need} Pokale! (Du hast ${have} 🏆)`;
      return;
    }
    pendingTeamPick = name;
    refreshTeamGrid();
  });
  teamGrid.appendChild(btn);
}
refreshUnlockTiles();

function refreshTeamGrid() {
  refreshUnlockTiles();
  const lvNr = currentLevel + 1;
  const isLevel7 = currentLevel === 6;
  const zeusUnlocked = isActorUnlocked('zeus');

  for (const btn of teamGrid.children) {
    const n = btn.dataset.name;
    const inTeam = chosenTeam.includes(n);
    const isPicked = pendingTeamPick === n;
    btn.classList.toggle('in-team', inTeam);
    btn.classList.toggle('selected', inTeam || isPicked);
    // In Level 7 sind alle außer Zeus ausgegraut; in Level 1–6 ist Zeus für Level 7 reserviert
    const disabledForLevel = (isLevel7 && n !== 'zeus') || (!isLevel7 && n === 'zeus');
    btn.style.opacity = disabledForLevel && !inTeam ? '0.35' : '';
  }

  // Bei Level 7 ohne freigeschalteten Zeus muss man niemanden auswählen!
  if (isLevel7 && !zeusUnlocked) {
    teamGoBtn.disabled = false;
    teamGoBtn.textContent = `OHNE AUSWAHL IN LEVEL 7 STARTEN! 🔥`;
    return;
  }

  teamGoBtn.disabled = !pendingTeamPick;
  if (!pendingTeamPick) {
    teamGoBtn.textContent = isLevel7
      ? 'Wähle ZEUS für Level 7 👆'
      : `Wähle deine ${chosenTeam.length + 1}. Figur 👆`;
  } else {
    teamGoBtn.textContent = `MIT ${actors[pendingTeamPick].name} IN LEVEL ${lvNr}! ⚔️`;
  }
}

// Öffnet die Figuren-Auswahl vor einem Team-Level
function openTeamPickForLevel(keepCharge = false) {
  removeClones();
  pendingTeamKeepCharge = keepCharge;
  pendingTeamPick = null;
  const lvNr = currentLevel + 1;
  const comboNote = areCombosEnabled()
    ? '🤝 Kombos & Fähigkeiten ab 15 Treffern!'
    : 'ℹ️ Im normalen Modus sind Kombos nur bei 20 & 50 Leben aktiv!';
  const modeBadge = trophyMode ? `🏆 POKALE (${GAME_CONFIG.trophyLives} ❤️)` : `🎮 NORMAL (${normalLives} ❤️)`;
  teamScreenHeading.textContent = `⚔️ TEAM · LEVEL ${lvNr} · ${modeBadge}`;
  if (currentLevel === 0) {
    teamPickTitle.textContent = 'Level 1: Wähle deine 1. Figur! 👇';
    teamHintText.textContent = `Level 1–6: Jedes Level 1 Figur dazu · Level 7: ZEUS (wenn freigeschaltet) · ${comboNote}`;
  } else if (currentLevel < 5) {
    teamPickTitle.textContent = `Level ${lvNr}: Wähle deine ${chosenTeam.length + 1}. Figur dazu! 👇`;
    teamHintText.textContent = `Im Team (${chosenTeam.length}): ${chosenTeam.map(n => actorEmoji(n)).join(' ')} · ${comboNote}`;
  } else if (currentLevel === 5) {
    teamPickTitle.textContent = `Level 6: Wähle deine 6. Figur! 👇`;
    teamHintText.textContent = `Im Team (${chosenTeam.length}): ${chosenTeam.map(n => actorEmoji(n)).join(' ')} · Nächstes Level wartet ZEUS!`;
  } else if (currentLevel === 6) {
    if (isActorUnlocked('zeus')) {
      pendingTeamPick = 'zeus';
      teamPickTitle.textContent = 'Level 7: ZEUS ist freigeschaltet – wähle ZEUS! 🧔🏼‍♂️⚡';
      teamHintText.textContent = 'In Level 7 kannst du exklusiv Donnergott ZEUS in dein Team holen!';
    } else {
      teamPickTitle.textContent = 'Level 7: Bereit für das nächste Match! 🔥';
      teamHintText.textContent = `🔒 ZEUS ist noch nicht freigeschaltet (${GAME_CONFIG.zeusUnlockTrophies} 🏆) – du musst niemanden auswählen!`;
    }
  }
  refreshTeamGrid();
  teamScreen.classList.add('active');
}

// Startet einen ganz neuen Team-Durchlauf bei Level 1
function startNewTeamRun() {
  teamMode = true;
  chosenTeam = [];
  playerTeam = [];
  playerActor = null;
  currentLevel = 0;
  nextLevel = 0;
  openTeamPickForLevel(false);
}

teamModeBtn.addEventListener('click', () => {
  openModeChoice({ type: 'team' });
});
teamBackBtn.addEventListener('click', () => {
  teamScreen.classList.remove('active');
  if (currentLevel > 0 && chosenTeam.length > 0) {
    gameOverScreen.classList.add('active');
  } else {
    startScreen.classList.add('active');
  }
});
teamGoBtn.addEventListener('click', () => {
  if (pendingTeamPick && !chosenTeam.includes(pendingTeamPick)) {
    chosenTeam.push(pendingTeamPick);
  }
  if (!chosenTeam.length) return;
  playerTeam = chosenTeam.slice();
  // Du steuerst aktiv die neu gewählte Figur (oder deine bisherige Hauptfigur)
  playerActor = pendingTeamPick || playerActor || chosenTeam[0];
  teamScreen.classList.remove('active');
  startGame(pendingTeamKeepCharge);
});
