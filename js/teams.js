/**
 * ⚔️ teams.js – Team-Modus: Dein Team gegen das Gegner-Team
 *
 * Du wählst MEHRERE Figuren – die steuerst du alle (antippen = werfen).
 * Dein Team leuchtet BLAU, die Gegner sind ROT (Musiala-Gegner tragen rote Trikots).
 * Jedes Level hat mehr Gegner (config.js → teamLevels). Die Gegner sind
 * Kopien der Figuren, z. B. „KATZE 2“. Kein Eigentor: Würfe treffen nur das andere Team.
 */

let teamMode = false;  // Läuft gerade der Team-Modus?
let chosenTeam = [];   // Deine Figuren (Namen aus actors)

const TEAM_COLORS = { mine: '#3b82f6', enemy: '#ef4444' };
const TEAM_BITS = { mine: 1 << 20, enemy: 1 << 21 }; // Eigene Bits weit oben, damit neue Figuren (256, 512, …) frei bleiben

// Zu welchem Team gehört die Figur? 'mine' oder 'enemy'
function teamOf(name) {
  return chosenTeam.includes(name) ? 'mine' : 'enemy';
}

// Alle lebenden Figuren des anderen Teams
function enemiesOf(name) {
  const myTeam = teamOf(name);
  return Object.keys(actors).filter(n => isAlive(n) && teamOf(n) !== myTeam);
}

// Die nächste lebende Figur aus dem anderen Team (auf die wird geworfen)
function nearestEnemy(name) {
  const me = actors[name].body.position;
  let best = null;
  let bestDist = Infinity;
  for (const n of enemiesOf(name)) {
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
    actors[name] = {
      kind, name: `${base.name} ${perKind[kind]}`, color: TEAM_COLORS.enemy,
      category: TEAM_BITS.enemy, target: null, sway: base.sway, body: null,
      wiggle: 0, hitsGiven: 0, hitsTaken: 0, alive: true, start: base.start
    };
    actors[name].body = Bodies.circle(width / 2, height / 3, 34, {
      isStatic: true, label: name, restitution: 1.05,
      collisionFilter: { category: TEAM_BITS.enemy }
    });
    Composite.add(engine.world, actors[name].body);
    enemyNames.push(name);
  }

  // Aufstellung: Gegner oben, dein Team unten.
  // Breiter Bildschirm: mehr nebeneinander, weniger Reihen (sonst überlappen sie quer)
  const perRow = Math.max(4, Math.floor(width / 100));
  if (height < 500) {
    placeInRows(enemyNames, [0.18, 0.42], perRow);
    placeInRows(chosenTeam, [0.68], 6); // Platz lassen für die ⚡-Knöpfe unten
  } else {
    placeInRows(enemyNames, [0.2, 0.34, 0.48], perRow);
    placeInRows(chosenTeam, [0.62, 0.76], Math.max(3, Math.floor(width / 120))); // Platz für ⚡-Knöpfe
  }
}

// Im Team-Modus etwas kleiner, damit alle draufpassen (auf flachen Bildschirmen noch kleiner)
function teamScale() {
  if (!teamMode) return 1;
  return height < 500 ? 0.6 : 0.8;
}

// 🔵🔴 Leuchtkreis in Teamfarbe hinter der Figur (wird in drawActors aufgerufen)
function drawTeamAura(name) {
  if (!teamMode) return;
  const color = TEAM_COLORS[teamOf(name)];
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 36 * teamScale() + 4, 0, Math.PI * 2);
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

// 👇 Team-Auswahl: Kacheln an- und abwählen, dann „LOS!“
const teamGrid = document.getElementById('teamGrid');
for (const name in actors) {
  const btn = document.createElement('button');
  btn.className = 'pick-btn';
  btn.type = 'button';
  btn.innerHTML = `<span class="pick-emoji">${actorEmoji(name)}</span>${actors[name].name}`;
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    chosenTeam = [...teamGrid.querySelectorAll('.selected')].map(b => b.dataset.name);
    teamGoBtn.disabled = chosenTeam.length === 0;
    teamGoBtn.textContent = chosenTeam.length ? `LOS MIT ${chosenTeam.length}! ⚔️` : 'Wähle dein Team 👆';
  });
  btn.dataset.name = name;
  teamGrid.appendChild(btn);
}

teamModeBtn.addEventListener('click', () => {
  startScreen.classList.remove('active');
  teamScreen.classList.add('active');
});
teamBackBtn.addEventListener('click', () => {
  teamScreen.classList.remove('active');
  startScreen.classList.add('active');
});
teamGoBtn.addEventListener('click', () => {
  if (!chosenTeam.length) return;
  teamMode = true;
  playerTeam = chosenTeam.slice();
  playerActor = null;
  currentLevel = 0;
  nextLevel = 0;
  teamScreen.classList.remove('active');
  startGame();
});
