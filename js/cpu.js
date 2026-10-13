/**
 * 🎮 cpu.js – Wen spielst DU? Die anderen spielt der Computer.
 *
 * Am Anfang tippst du auf eine Figur. Nur die steuerst du.
 * Alle anderen werfen von allein (Computer-Gegner).
 * „👥 ALLE ZUSAMMEN“ = alte Variante: jeder darf jede Figur antippen, kein Computer.
 */

let playerActor = null; // Name der eigenen Figur, null = alle zusammen
let cpuNextThrow = {};  // Wann wirft welche Computer-Figur das nächste Mal?

// Spielt der Computer diese Figur?
function isCpu(name) {
  return playerActor !== null && name !== playerActor;
}

// Figur auswählen und los geht's!
function chooseAndStart(name) {
  playerActor = name;
  startGame();
}

// Wird bei jedem Start aufgerufen: Knöpfe der Computer-Figuren sperren,
// Computer-Würfe neu planen (erster Wurf nach einer kleinen Pause).
function setupPlayers() {
  const now = performance.now();
  cpuNextThrow = {};
  for (const name in actors) {
    document.getElementById(`${name}Btn`).classList.toggle('cpu', isCpu(name));
    cpuNextThrow[name] = now + 1200 + Math.random() * GAME_CONFIG.cpuThrowMs;
  }
}

// 🤖 In jedem Bild: Ist eine Computer-Figur dran? Dann wirft sie.
function updateCpu(now) {
  if (playerActor === null) return;
  for (const name in actors) {
    if (!isCpu(name) || !isAlive(name)) continue;
    if (now >= cpuNextThrow[name]) {
      shootBomb(name);
      // Nicht alle im gleichen Takt: etwas Zufall dazu
      cpuNextThrow[name] = now + GAME_CONFIG.cpuThrowMs * (0.6 + Math.random() * 0.8);
    }
  }
}

// ⭐ „DU“-Markierung über der eigenen Figur (wird in drawActors aufgerufen).
function drawPlayerMarker(name, now) {
  if (name !== playerActor) return;
  ctx.font = '900 14px -apple-system, sans-serif';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#111827';
  ctx.fillStyle = '#ffde59';
  const y = -52 + Math.sin(now / 200) * 3;
  ctx.strokeText('⭐ DU ⭐', 0, y);
  ctx.fillText('⭐ DU ⭐', 0, y);
}

// 👇 Auswahl-Knöpfe auf dem Startbildschirm bauen – eine Kachel pro Figur.
// Neue Figuren in actors.js tauchen hier automatisch auf.
const pickGrid = document.getElementById('pickGrid');
for (const name in actors) {
  const btn = document.createElement('button');
  btn.className = 'pick-btn';
  btn.type = 'button';
  btn.innerHTML = `<span class="pick-emoji">${GAME_CONFIG[`${name}Emoji`]}</span>${actors[name].name}`;
  btn.addEventListener('click', () => chooseAndStart(name));
  pickGrid.appendChild(btn);
}

startBtn.addEventListener('click', () => chooseAndStart(null));
changeBtn.addEventListener('click', () => {
  gameOverScreen.classList.remove('active');
  startScreen.classList.add('active');
});
