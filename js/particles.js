/**
 * ✨ particles.js – Funken und Explosions-Glitzer
 *
 * Ein Partikel ist nur ein kleiner bunter Punkt, der wegfliegt und verblasst.
 */

let particles = [];

function spawnParticles(x, y, color = '#ffde59', count = 14) {
  count = Math.min(count, GAME_CONFIG.maxParticles - particles.length); // 🚀 Nicht zu viele
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: Math.random() * 0.03 + 0.02,
      size: Math.random() * 4 + 2,
      color: color
    });
  }
}

// Ein Emoji-Partikel (z. B. 🪙): hüpft kurz hoch, fällt runter und verblasst.
function spawnEmojiParticle(x, y, emoji, size = 14) {
  if (particles.length >= GAME_CONFIG.maxParticles) return; // 🚀 Nicht zu viele
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 3,
    vy: -1 - Math.random() * 2.5,
    gravity: 0.18,
    life: 1.0,
    decay: 0.018,
    size,
    emoji
  });
}

// Bewegt alle Partikel ein Stück weiter und malt sie.
function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    if (p.emoji) {
      p.vy += p.gravity; // Emoji-Partikel fallen nach unten
      ctx.globalAlpha = p.life;
      drawEmoji(p.emoji, p.x, p.y, p.size); // 🖼️ sprites.js
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}
