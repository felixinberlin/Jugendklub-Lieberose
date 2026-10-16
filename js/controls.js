/**
 * 🕹️ controls.js – Querformat-Steuerung für Handy (Joystick & Knöpfe) und PC (WASD, Maus, F)
 *
 * 📱 Handy / Touchscreen:
 *   - Unten links: Joystick / Steuerkreuz zum Bewegen
 *   - Unten rechts: Großer runder Knopf zum Schießen
 *   - Rechts darüber: Kleiner quadratischer Knopf für die Spezialfähigkeit
 *
 * ⌨️ Tastatur & Maus:
 *   - W, A, S, D (oder Pfeiltasten): Bewegen
 *   - Linke Maustaste: Schießen
 *   - Taste F: Spezialfähigkeit auslösen
 */

const actionHud = document.getElementById('actionHud');
const movePad = document.getElementById('movePad');
const moveStick = document.getElementById('moveStick');
const shootBtn = document.getElementById('shootBtn');
const shootIconEl = document.getElementById('shootIcon');
const abilityBtn = document.getElementById('abilityBtn');
const abilityIconEl = document.getElementById('abilityIcon');
const abilityFillEl = document.getElementById('abilityFill');
const abilityCountEl = document.getElementById('abilityCount');
const rotateOverlay = document.getElementById('rotateOverlay');
const dismissRotateBtn = document.getElementById('dismissRotateBtn');

// ⌨️ Gedrückte Tasten (WASD + Pfeiltasten)
const keysDown = { up: false, down: false, left: false, right: false };
// 🕹️ Joystick-Auslenkung (-1 bis +1)
let joyVec = { x: 0, y: 0, pointerId: null };
let shootHoldTimer = null;

// Welche Figuren steuerst DU gerade?
function myControlledActors() {
  if (playerTeam && playerTeam.length) return playerTeam.filter(isAlive);
  if (playerActor && isAlive(playerActor)) return [playerActor];
  // Bei „Alle zusammen“: die erste lebende Original-Figur (oder alle eigenen)
  const first = Object.keys(actors).find(n => !actors[n].kind && isAlive(n));
  return first ? [first] : [];
}

// 🔄 Versucht auf Handys automatisch ins Querformat zu wechseln
function tryLockLandscape() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      screen.orientation.lock('landscape').catch(() => {});
    }
  } catch (e) {}
}

dismissRotateBtn.addEventListener('click', () => {
  rotateOverlay.classList.add('dismissed');
});

// 🎯 Schießen auslösen (runder Knopf unten rechts oder linke Maustaste)
function triggerPlayerShoot(aimX, aimY) {
  if (!isPlaying) return;
  initAudio();
  const mine = myControlledActors();
  if (!mine.length) return;

  // Wenn mit der Maus in die Nähe eines Gegners geklickt wurde, dorthin zielen
  let aimedEnemy = null;
  if (typeof aimX === 'number' && typeof aimY === 'number') {
    let bestD = 120;
    for (const n in actors) {
      if (!isAlive(n) || mine.includes(n)) continue;
      if (teamMode && teamOf(n) === 'mine') continue;
      const d = Math.hypot(actors[n].body.position.x - aimX, actors[n].body.position.y - aimY);
      if (d < bestD) { bestD = d; aimedEnemy = n; }
    }
  }

  for (const name of mine) {
    shootBomb(name, aimedEnemy);
  }
  shootBtn.classList.add('pressed');
  setTimeout(() => shootBtn.classList.remove('pressed'), 110);
}

// ⚡ Fähigkeit auslösen (quadratischer Knopf über dem Schieß-Knopf oder Taste F)
function triggerPlayerSpecial() {
  if (!isPlaying) return;
  initAudio();
  const mine = myControlledActors();
  let usedAny = false;
  for (const name of mine) {
    if (specialReady(name) && trySpecial(name)) usedAny = true;
  }
  abilityBtn.classList.add('pressed');
  setTimeout(() => abilityBtn.classList.remove('pressed'), 140);
  updateControlHud();
  return usedAny;
}

// 🔄 Aktualisiert das Aussehen vom runden Schieß-Knopf und dem quadratischen Fähigkeits-Knopf
function updateControlHud() {
  actionHud.hidden = !isPlaying;
  if (!isPlaying) return;
  const mine = myControlledActors();
  if (!mine.length) return;

  const lead = mine[0];
  shootIconEl.textContent = actorCfg(lead, 'Bomb') || GAME_CONFIG.bombEmoji;

  // Beste / vollste Spezialkraft deiner gesteuerten Figuren auf dem quadratischen Knopf zeigen
  const need = GAME_CONFIG.specialChargeHits;
  let bestActor = lead;
  let bestCharge = -1;
  for (const name of mine) {
    if (!hasSpecial(name)) continue;
    const c = actors[name].specialCharge || 0;
    if (c > bestCharge) { bestCharge = c; bestActor = name; }
  }
  const sp = SPECIALS[kindOf(bestActor)];
  if (sp) {
    const charge = actors[bestActor].specialCharge || 0;
    const ready = specialReady(bestActor);
    abilityIconEl.textContent = sp.icon;
    abilityFillEl.style.width = `${Math.min(100, (charge / need) * 100)}%`;
    abilityCountEl.textContent = ready ? 'BEREIT!' : `${charge}/${need}`;
    abilityBtn.classList.toggle('ready', ready);
  }
}

// ---------- 🕹️ Virtueller Joystick unten links (Handy / Touch) ----------
function updateJoystickFromEvent(event) {
  const rect = movePad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = rect.width * 0.36;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const clamped = Math.min(dist, maxR);
  const nx = (dx / dist) * (clamped / maxR);
  const ny = (dy / dist) * (clamped / maxR);
  joyVec.x = nx;
  joyVec.y = ny;
  moveStick.style.transform = `translate(${nx * maxR}px, ${ny * maxR}px)`;
}

function resetJoystick() {
  joyVec.x = 0;
  joyVec.y = 0;
  joyVec.pointerId = null;
  moveStick.style.transform = 'translate(0px, 0px)';
  movePad.classList.remove('active');
}

movePad.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  event.stopPropagation();
  initAudio();
  tryLockLandscape();
  joyVec.pointerId = event.pointerId;
  movePad.classList.add('active');
  movePad.setPointerCapture(event.pointerId);
  updateJoystickFromEvent(event);
});

movePad.addEventListener('pointermove', (event) => {
  if (joyVec.pointerId !== event.pointerId) return;
  event.preventDefault();
  updateJoystickFromEvent(event);
});

for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  movePad.addEventListener(type, (event) => {
    if (joyVec.pointerId === event.pointerId) resetJoystick();
  });
}

// ---------- 🔴 Runder Schieß-Knopf & 🟦 Quadratischer Fähigkeits-Knopf unten rechts ----------
shootBtn.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  event.stopPropagation();
  tryLockLandscape();
  triggerPlayerShoot();
  clearInterval(shootHoldTimer);
  shootHoldTimer = setInterval(() => {
    if (!isPlaying) { clearInterval(shootHoldTimer); return; }
    triggerPlayerShoot();
  }, GAME_CONFIG.throwCooldownMs + 20);
});
for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
  shootBtn.addEventListener(type, () => clearInterval(shootHoldTimer));
}

abilityBtn.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  event.stopPropagation();
  tryLockLandscape();
  triggerPlayerSpecial();
});

// ---------- ⌨️ Tastatur (WASD + F) & 🖱️ Linke Maustaste ----------
function setKey(event, down) {
  const code = event.code;
  const key = (event.key || '').toLowerCase();
  if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') keysDown.up = down;
  if (code === 'KeyS' || key === 's' || code === 'ArrowDown') keysDown.down = down;
  if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') keysDown.left = down;
  if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') keysDown.right = down;
  if (down && (code === 'KeyF' || key === 'f') && isPlaying) {
    event.preventDefault();
    triggerPlayerSpecial();
  }
}

window.addEventListener('keydown', (event) => setKey(event, true));
window.addEventListener('keyup', (event) => setKey(event, false));
window.addEventListener('blur', () => {
  keysDown.up = keysDown.down = keysDown.left = keysDown.right = false;
  resetJoystick();
  clearInterval(shootHoldTimer);
});

// 🖱️ Linke Maustaste auf dem Spielfeld = Schießen!
canvas.addEventListener('pointerdown', (event) => {
  if (!isPlaying || event.pointerType !== 'mouse' || event.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  // Wenn oben auf Sonne/Mond oder Wolke geklickt wurde, kümmert sich handleSkyTap darum –
  // wir schießen trotzdem oder zielen auf den Mauszeiger!
  triggerPlayerShoot(x, y);
});

// ---------- 🏃 In jedem Bild: Eigene Figur(en) mit WASD oder Joystick bewegen ----------
function updatePlayerControls() {
  if (!isPlaying) return;
  let vx = (keysDown.right ? 1 : 0) - (keysDown.left ? 1 : 0) + joyVec.x;
  let vy = (keysDown.down ? 1 : 0) - (keysDown.up ? 1 : 0) + joyVec.y;
  const mag = Math.hypot(vx, vy);
  if (mag < 0.05) return;
  if (mag > 1) { vx /= mag; vy /= mag; }

  const speed = GAME_CONFIG.playerMoveSpeed || 4.2;
  const mine = myControlledActors();
  for (const name of mine) {
    const actor = actors[name];
    if (!actor || !actor.body || isStunned(name) || actor.jump) continue;
    if (Math.abs(vx) > 0.1) actor.runDir = vx < 0 ? -1 : 1;
    const nx = actor.body.position.x + vx * speed;
    const ny = actor.body.position.y + vy * speed;
    moveActor(name, nx, ny);
    actor.homeRx = actor.body.position.x / width;
    actor.homeRy = actor.body.position.y / height;
    // Falls Musialas Riesenball fliegt, folgt er auch der Bewegungsrichtung
    if (!steer.active) {
      steer.x = actor.body.position.x + vx * 160;
      steer.y = actor.body.position.y + vy * 160;
    }
  }
}
