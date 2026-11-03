/**
 * 🪽 drachenfluegel.js – Große Drachenflügel, die hoch und runter schlagen!
 *
 * Das Drachen-Bild (drache.png) hat keine Flügel mehr – die werden hier
 * gemalt, damit man sie GANZ sieht und sie sich bewegen können.
 * Steht der Drache still, schlagen sie ruhig. Bewegt er sich, schlagen sie
 * schnell und kräftig. Einschalten mit `<name>Wings` in config.js.
 */

// Wo die Flügel am Körper sitzen (Anteil vom Bild: 0 = links/oben, 1 = rechts/unten)
const WING_ROOTS = {
  near: { x: 0.35, y: 0.345 }, // vorderer Flügel an der Schulter
  far: { x: 0.625, y: 0.27 }   // hinterer Flügel hinter dem Hals
};

// Flügel-Form (zeigt nach oben links). Einheit = Flügellänge.
const WING_WRIST = { x: -0.28, y: -0.62 };
const WING_TIPS = [
  { x: -0.72, y: -0.95 },
  { x: -1.0, y: -0.5 },
  { x: -0.85, y: -0.08 },
  { x: -0.42, y: 0.12 }
];

// Malt einen Flügel am Punkt (0, 0). dir = -1 zeigt nach links, 1 nach rechts.
function paintWing(len, dir, dark) {
  // Für dir = -1 bleibt die Form, für dir = 1 wird sie gespiegelt
  const P = (pt) => ({ x: (dir < 0 ? pt.x : -pt.x) * len, y: pt.y * len });
  const wrist = P(WING_WRIST);
  const tips = WING_TIPS.map(P);

  // Hautsegel: von Spitze zu Spitze mit nach innen gebogenen Bögen
  const grad = ctx.createLinearGradient(0, 0, tips[0].x, tips[0].y);
  grad.addColorStop(0, dark ? '#3f0f12' : '#5b1a1a');
  grad.addColorStop(0.6, dark ? '#7c2d12' : '#9a3412');
  grad.addColorStop(1, dark ? '#b45309' : '#ea580c');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#2a0a0a';
  ctx.lineWidth = Math.max(1, len * 0.03);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(wrist.x, wrist.y);
  ctx.lineTo(tips[0].x, tips[0].y);
  for (let i = 1; i < tips.length; i++) {
    const a = tips[i - 1], b = tips[i];
    // Kontrollpunkt Richtung Handgelenk = Bogen nach innen (gezackter Rand)
    const cx = (a.x + b.x) / 2 * 0.72 + wrist.x * 0.28;
    const cy = (a.y + b.y) / 2 * 0.72 + wrist.y * 0.28;
    ctx.quadraticCurveTo(cx, cy, b.x, b.y);
  }
  ctx.quadraticCurveTo(tips[3].x * 0.4, tips[3].y * 0.2 + len * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Knochen: Arm bis zum Handgelenk, dann Finger zu jeder Spitze
  ctx.strokeStyle = dark ? '#2a0a0a' : '#3b0d0d';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, len * 0.07);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(wrist.x, wrist.y);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, len * 0.035);
  ctx.beginPath();
  for (const t of tips) {
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(t.x, t.y);
  }
  ctx.stroke();

  // Kleine goldene Kralle am Handgelenk
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.moveTo(wrist.x, wrist.y);
  ctx.lineTo(wrist.x + (dir < 0 ? -1 : 1) * len * 0.05, wrist.y - len * 0.14);
  ctx.lineTo(wrist.x + (dir < 0 ? 1 : -1) * len * 0.04, wrist.y - len * 0.02);
  ctx.closePath();
  ctx.fill();
}

// Aus drawActors (actors.js): beide Flügel HINTER den Körper malen.
// w, h = Größe, in der das Drachen-Bild gemalt wird.
function drawDragonWings(actor, w, h) {
  // Wie schnell bewegt sich der Drache gerade? (für kräftigeres Schlagen)
  const pos = actor.body.position;
  const moved = actor.wingPrev ? Math.hypot(pos.x - actor.wingPrev.x, pos.y - actor.wingPrev.y) : 0;
  actor.wingPrev = { x: pos.x, y: pos.y };
  const target = Math.min(1, moved / 2.5);
  actor.wingEnergy = (actor.wingEnergy || 0) * 0.9 + target * 0.1;
  const e = actor.wingEnergy;
  actor.wingPhase = (actor.wingPhase || 0) + 0.035 + e * 0.1; // langsame, kräftige Schläge – beim Bewegen etwas schneller
  const flap = Math.sin(actor.wingPhase);                      // 1 = ganz oben, -1 = ganz unten
  const amp = 0.25 + e * 0.45;                                 // wie weit hoch und runter

  const len = h * 0.85;
  const wings = [
    { root: WING_ROOTS.far, dir: 1, dark: true, scale: 0.9 },
    { root: WING_ROOTS.near, dir: -1, dark: false, scale: 1 }
  ];
  for (const wing of wings) {
    ctx.save();
    ctx.translate((wing.root.x - 0.5) * w, (wing.root.y - 0.5) * h);
    // Hoch = Flügel dreht nach oben, runter = nach außen/unten. Dazu etwas gestaucht (sieht nach Schlagen aus)
    ctx.rotate(-wing.dir * flap * amp);
    ctx.scale(1, 0.8 + flap * 0.2);
    paintWing(len * wing.scale, wing.dir, wing.dark);
    ctx.restore();
  }
}
