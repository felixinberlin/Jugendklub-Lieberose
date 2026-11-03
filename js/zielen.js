/**
 * 🎯 zielen.js – Ziel-Modus: gedrückt halten = besser zielen!
 *
 *  - KURZ tippen (Schieß-Knopf / linke Maustaste): Schuss sofort auf deinen Ziel-Gegner.
 *  - GEDRÜCKT HALTEN: Ziel-Modus! Ein Fadenkreuz zieht sich um den Gegner zusammen.
 *    Je länger du hältst (bis `aim.fullMs`), desto SCHNELLER fliegt der Schuss und desto
 *    besser trifft er Gegner, die gerade wegrennen (er zielt dorthin, wo der Gegner gleich ist).
 *    Loslassen = Schuss!
 *  - Gegner wechseln: Taste TAB oder der eckige 🎯-Knopf links über dem Joystick.
 *    Mit der Maus: in die Nähe eines Gegners klicken.
 *
 * Zahlen in config.js unter `aim`.
 */

let aimTarget = null;    // Dein gewählter Gegner (bleibt, bis er raus ist oder du wechselst)
let aim = null;          // Läuft gerade ein Drücken? { start, pointerId, fullPlayed }
let aimShowUntil = 0;    // Fadenkreuz kurz zeigen (nach dem Wechseln)
let aimQueueTimer = null; // Losgelassen, aber Wurf-Pause noch nicht vorbei → gleich nachholen
const targetBtn = document.getElementById('targetBtn');
const targetBtnChar = document.getElementById('targetBtnChar');

// Wen kann ich anvisieren? (alle lebenden Gegner, von links nach rechts sortiert)
function aimCandidates() {
  const mine = myControlledActors();
  return Object.keys(actors)
    .filter((n) => isAlive(n) && !mine.includes(n) && !isHidden(n) && !(teamMode && teamOf(n) === 'mine'))
    .sort((a, b) => actors[a].body.position.x - actors[b].body.position.x);
}

// Aktueller Ziel-Gegner – ohne Auswahl einfach der nächste Gegner
function currentAimTarget() {
  const list = aimCandidates();
  if (aimTarget && list.includes(aimTarget)) return aimTarget;
  const lead = myControlledActors()[0];
  if (!lead || !list.length) return null;
  const p = actors[lead].body.position;
  const dist = (n) => Math.hypot(actors[n].body.position.x - p.x, actors[n].body.position.y - p.y);
  aimTarget = list.reduce((best, n) => (dist(n) < dist(best) ? n : best), list[0]);
  return aimTarget;
}

// 🔄 Nächsten Gegner anvisieren (TAB / 🎯-Knopf)
function cycleAimTarget() {
  if (!isPlaying || isPaused) return;
  const list = aimCandidates();
  if (!list.length) return;
  const i = list.indexOf(currentAimTarget());
  aimTarget = list[(i + 1) % list.length];
  aimShowUntil = performance.now() + 1500;
  initAudio();
  playSound('point');
  updateTargetBtn();
}

// Mit der Maus in die Nähe eines Gegners geklickt? Dann wird er dein Ziel.
function pickAimTargetAt(x, y) {
  let best = null;
  let bestD = 120;
  for (const n of aimCandidates()) {
    const d = Math.hypot(actors[n].body.position.x - x, actors[n].body.position.y - y);
    if (d < bestD) { bestD = d; best = n; }
  }
  if (best) aimTarget = best;
}

// Wie weit aufgeladen? 0 = gerade gedrückt, 1 = voll
function aimCharge(now) {
  return aim ? Math.min(1, (now - aim.start) / GAME_CONFIG.aim.fullMs) : 0;
}
function isAiming(now) {
  return Boolean(aim) && now - aim.start >= GAME_CONFIG.aim.holdMs;
}

// 👇 Drücken beginnt (Schieß-Knopf oder linke Maustaste)
function startAim(pointerId) {
  if (!isPlaying || isPaused) return;
  initAudio();
  aim = { start: performance.now(), pointerId, fullPlayed: false };
}

// 👆 Loslassen: kurz = normaler Schuss, lang = gezielter Schuss
function releaseAim(pointerId) {
  if (!aim || (pointerId !== undefined && aim.pointerId !== pointerId)) return;
  const now = performance.now();
  const held = now - aim.start;
  const charge = aimCharge(now);
  aim = null;
  if (held < GAME_CONFIG.aim.holdMs) {
    triggerPlayerShoot();
  } else {
    triggerPlayerShoot(undefined, undefined, { target: currentAimTarget(), charge });
  }
}

function cancelAim() {
  aim = null;
  clearTimeout(aimQueueTimer);
}

// Neue Runde: Auswahl vergessen
function resetAim() {
  cancelAim();
  aimTarget = null;
  aimShowUntil = 0;
  for (const n in actors) actors[n].vel = { x: 0, y: 0 };
  updateTargetBtn();
}

// Jedes Bild: Tempo jeder Figur messen (für das Vorhalten bei gezielten Schüssen)
function updateAim(now) {
  for (const n in actors) {
    const a = actors[n];
    if (!a.body) continue;
    const p = a.body.position;
    if (a.aimPrev) {
      const v = a.vel || { x: 0, y: 0 };
      a.vel = { x: v.x * 0.7 + (p.x - a.aimPrev.x) * 0.3, y: v.y * 0.7 + (p.y - a.aimPrev.y) * 0.3 };
    }
    a.aimPrev = { x: p.x, y: p.y };
  }
  if (aim && !aim.fullPlayed && aimCharge(now) >= 1) {
    aim.fullPlayed = true;
    playSound('ready'); // 🔔 Voll aufgeladen!
  }
  updateTargetBtn();
}

// Wohin fliegt ein gezielter Schuss? Dorthin, wo der Gegner nach `frames` Bildern ist (× lead)
function leadPosition(targetName, frames, lead) {
  const a = actors[targetName];
  const v = a.vel || { x: 0, y: 0 };
  return {
    x: Math.max(0, Math.min(width, a.body.position.x + v.x * frames * lead)),
    y: Math.max(0, Math.min(height, a.body.position.y + v.y * frames * lead))
  };
}

// 🎯 Fadenkreuz um den Ziel-Gegner malen
function drawAim(now) {
  if (!isPlaying) return;
  const aiming = isAiming(now);
  if (!aiming && now > aimShowUntil) return;
  const t = currentAimTarget();
  if (!t) return;
  const charge = aiming ? aimCharge(now) : 0;
  const full = charge >= 1;
  const p = actors[t].body.position;
  const r = 70 - charge * 40; // zieht sich zusammen
  const color = full ? '#22c55e' : '#facc15';
  ctx.save();
  // Gestrichelte Linie von dir zum Ziel
  const lead = myControlledActors()[0];
  if (aiming && lead && actors[lead]) {
    const s = actors[lead].body.position;
    ctx.globalAlpha = 0.55;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Kreis + 4 Striche, die sich drehen
  ctx.globalAlpha = 0.95;
  ctx.translate(p.x, p.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = full ? 5 : 4;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.rotate(now / 400);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(r - 12, 0);
    ctx.lineTo(r + 12, 0);
    ctx.stroke();
  }
  ctx.restore();
  if (aiming) {
    const text = full ? '🎯 VOLL!' : `🎯 ${Math.round(charge * 100)}%`;
    drawLabel(text, p.x, p.y - r - 16, { size: 16, weight: '900', fill: color, stroke: '#0f172a', lineWidth: 4 });
  }
}

// Eckiger 🎯-Knopf: zeigt, wen du gerade anvisierst
let shownTargetKind = null;
function updateTargetBtn() {
  if (!targetBtnChar) return;
  const t = isPlaying ? currentAimTarget() : null;
  const kind = t ? kindOf(t) : null;
  if (kind === shownTargetKind) return;
  shownTargetKind = kind;
  targetBtnChar.innerHTML = kind ? actorIconHtml(t) : '';
}

// ---------- Eingaben ----------
if (targetBtn) {
  targetBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    cycleAimTarget();
  });
}
window.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' && isPlaying && !isPaused) {
    event.preventDefault(); // Tab soll nicht durch die Knöpfe springen
    cycleAimTarget();
  }
});
// Maus losgelassen (irgendwo) → Schuss
window.addEventListener('pointerup', (event) => {
  if (aim && aim.pointerId === event.pointerId) releaseAim(event.pointerId);
});
window.addEventListener('pointercancel', (event) => {
  if (aim && aim.pointerId === event.pointerId) cancelAim();
});
window.addEventListener('blur', cancelAim);
