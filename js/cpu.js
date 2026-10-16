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
// Computer-Würfe neu planen (erster Wurf nach einer kleinen Pause).
function setupPlayers() {
  const now = performance.now();
  cpuNextThrow = {};
  for (const name in actors) {
    const btn = actorBtn(name);
    if (btn) btn.classList.toggle('cpu', isCpu(name));
    cpuNextThrow[name] = now + 2000 + Math.random() * cpuThrowMs(); // Erst das LEVEL-Schild zeigen
  }
}

// 🤖 In jedem Bild: Ist eine Computer-Figur dran? Dann wirft sie.
function updateCpu(now) {
  if (playerTeam === null) return;
  for (const name in actors) {
    if (!isCpu(name) || !isAlive(name)) continue;
    if (cpuNextThrow[name] === undefined) cpuNextThrow[name] = now + 2000 + Math.random() * cpuThrowMs(); // Neue Gegner-Kopie
    if (now >= cpuNextThrow[name]) {
      // ⚡ Manchmal benutzen auch Computer ihre Spezialkraft (specials.js)
      if (Math.random() < GAME_CONFIG.cpuSpecialChance && trySpecial(name)) {
        cpuNextThrow[name] = now + cpuThrowMs() * (0.6 + Math.random() * 0.8);
        continue;
      }
      if (teamMode) {
        // ⚔️ Gegner werfen auf eine zufällige Figur aus deinem Team
        const targets = playerTeam.filter(isAlive);
        shootBomb(name, targets[Math.floor(Math.random() * targets.length)]);
      } else {
        // Je höher das Level, desto öfter zielen die Computer auf DICH
        const hunt = Math.random() < level().huntPlayer;
        shootBomb(name, hunt ? playerActor : undefined);
      }
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
  btn.innerHTML = `<span class="pick-emoji">${GAME_CONFIG[`${name}Emoji`]}</span>${actors[name].name}`;
  btn.addEventListener('click', () => chooseAndStart(name));
  pickGrid.appendChild(btn);
}

startBtn.addEventListener('click', () => chooseAndStart(null));
changeBtn.addEventListener('click', () => {
  gameOverScreen.classList.remove('active');
  startScreen.classList.add('active');
});
