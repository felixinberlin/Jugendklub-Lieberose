/**
 * 🖼️ sprites.js – Schneller malen mit einem Bilder-Speicher
 *
 * Ein buntes Emoji als Schrift zu malen ist für das Handy richtig viel Arbeit.
 * Bei 13 Figuren, Bomben und Funken 60-mal pro Sekunde wird das Spiel langsam.
 * Trick: Jedes Emoji (und jedes Namensschild) wird EINMAL in ein kleines
 * unsichtbares Bild gemalt. Danach wird nur noch das fertige Bild kopiert –
 * das geht blitzschnell.
 */

let renderDpr = 1;              // Pixeldichte der Leinwand (setzt resizeCanvas in physics.js)
const spriteCache = new Map();  // Alle schon gemalten Mini-Bilder

// Holt ein Mini-Bild aus dem Speicher – oder malt es mit `paint` neu.
// w, h = Größe in normalen Pixeln
function getSprite(key, w, h, paint) {
  const fullKey = `${key}|${renderDpr}`;
  let sprite = spriteCache.get(fullKey);
  if (sprite) return sprite;
  if (spriteCache.size > 600) spriteCache.clear(); // Speicher nicht volllaufen lassen
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * renderDpr);
  c.height = Math.ceil(h * renderDpr);
  const g = c.getContext('2d');
  g.scale(renderDpr, renderDpr);
  paint(g);
  sprite = { canvas: c, w, h };
  spriteCache.set(fullKey, sprite);
  return sprite;
}

// Malt ein Emoji mit der Mitte bei (x, y). `bottom = true`: (x, y) ist die Unterkante.
function drawEmoji(emoji, x, y, size, bottom = false) {
  size = Math.max(4, Math.round(size)); // Ganze Zahlen, damit der Speicher klein bleibt
  const box = Math.ceil(size * 1.35);
  const sprite = getSprite(`e|${emoji}|${size}`, box, box, (g) => {
    g.font = `${size}px -apple-system, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(emoji, box / 2, box / 2);
  });
  const cy = bottom ? y - size / 2 : y;
  ctx.drawImage(sprite.canvas, x - box / 2, cy - box / 2, box, box);
}

// Malt einen Text mit dunklem Rand (Namensschilder, Zähler) mit der Mitte bei (x, y).
// o = { size, weight, fill, stroke, lineWidth }
function drawLabel(text, x, y, o) {
  const font = `${o.weight || 'bold'} ${o.size}px -apple-system, sans-serif`;
  const lw = o.lineWidth || 0;
  const key = `t|${text}|${font}|${o.fill}|${o.stroke}|${lw}`;
  let sprite = spriteCache.get(`${key}|${renderDpr}`);
  if (!sprite) {
    ctx.save();
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width + lw * 2 + 4);
    ctx.restore();
    const h = Math.ceil(o.size * 1.6 + lw * 2);
    sprite = getSprite(key, w, h, (g) => {
      g.font = font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      if (lw) {
        g.lineWidth = lw;
        g.strokeStyle = o.stroke;
        g.strokeText(text, w / 2, h / 2);
      }
      g.fillStyle = o.fill;
      g.fillText(text, w / 2, h / 2);
    });
  }
  ctx.drawImage(sprite.canvas, x - sprite.w / 2, y - sprite.h / 2, sprite.w, sprite.h);
}
