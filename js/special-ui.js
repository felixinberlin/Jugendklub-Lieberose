/**
 * ⚡ special-ui.js – Knöpfe, Erklärungen und Fingersteuerung
 *
 * Die Anzeige liest SPECIALS: Neue Kräfte dort mit name, icon, use und desc eintragen.
 * Lädt NACH specials.js und den Auswahl-Kacheln aus cpu.js und teams.js.
 */

// ---------- ⚡ Die Knöpfe unten links ----------
// Ein Knopf für jede Figur, die DU steuerst und die eine Spezialkraft hat.
function setupSpecialBar() {
  specialBar.innerHTML = '';
  const mine = Object.keys(actors).filter(n => !actors[n].kind && hasSpecial(n) && isAlive(n) &&
    (playerTeam === null || playerTeam.includes(n)));
  for (const name of mine) {
    const sp = SPECIALS[name];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'special-btn';
    btn.dataset.name = name;
    btn.setAttribute('aria-label', `${actors[name].name}: ${sp.name}`);
    btn.innerHTML = `<span class="sp-icon">${sp.icon}</span>` +
      '<span class="sp-bar"><i></i></span><span class="sp-count"></span>';
    btn.addEventListener('click', () => { initAudio(); trySpecial(name); });
    specialBar.appendChild(btn);
  }
  updateSpecialBar();
}

// Ladebalken, Zahl und „BEREIT!“ auf den Knöpfen auffrischen
function updateSpecialBar() {
  const need = GAME_CONFIG.specialChargeHits;
  for (const btn of specialBar.children) {
    const name = btn.dataset.name;
    const charge = actors[name].specialCharge || 0;
    const ready = specialReady(name) && isAlive(name);
    btn.classList.toggle('ready', ready);
    btn.hidden = !isAlive(name);
    btn.querySelector('.sp-bar i').style.width = `${(charge / need) * 100}%`;
    btn.querySelector('.sp-count').textContent = ready ? 'BEREIT!' : `${charge}/${need}`;
  }
  if (typeof updateControlHud === 'function') updateControlHud();
}

// ⚡ Kleines Blitz-Zeichen an der Figur: leuchtet, wenn die Kraft bereit ist
function drawSpecialBadge(name, now) {
  if (!hasSpecial(name)) return;
  const ready = specialReady(name);
  ctx.save();
  ctx.globalAlpha = ready ? 1 : 0.35;
  drawEmoji('⚡', 30, -26, ready ? 18 + Math.sin(now / 150) * 2 : 15);
  ctx.restore();
}

// 👆 Finger verfolgen, damit du den Riesenball lenken kannst
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  steer = { active: true, id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
});
window.addEventListener('pointermove', (event) => {
  if (!steer.active || event.pointerId !== steer.id) return;
  const rect = canvas.getBoundingClientRect();
  steer.x = event.clientX - rect.left;
  steer.y = event.clientY - rect.top;
});
for (const type of ['pointerup', 'pointercancel']) {
  window.addEventListener(type, (event) => {
    if (event.pointerId === steer.id) steer.active = false;
  });
}

// 📖 Startbildschirm: Spezialkräfte & alle 19 Team-Combos erklären
function buildSpecialsInfo() {
  const list = document.getElementById('specialsList');
  let html = `<p class="sp-how">🎯 Triff ${GAME_CONFIG.specialChargeHits}-mal → Fähigkeit auf <b>F</b> / 🟦⚡ bereit!</p>`;
  for (const name in SPECIALS) {
    const sp = SPECIALS[name];
    html += `<p class="sp-row"><b>${actorEmoji(name)} ${actors[name].name} · ${sp.icon} ${sp.name}</b><br>${sp.desc()}</p>`;
  }
  if (typeof COMBO_PAIRS !== 'undefined') {
    html += `<p class="sp-how" style="margin-top:14px">🤝 <b>ALLE ${COMBO_PAIRS.length} TEAM-COMBOS (20 Treffer gemeinsam im Team!):</b></p>`;
    for (const c of COMBO_PAIRS) {
      const nameA = actors[c.a] ? actors[c.a].name : c.a.toUpperCase();
      const nameB = actors[c.b] ? actors[c.b].name : c.b.toUpperCase();
      html += `<p class="sp-row"><b>${c.icon} ${nameA} + ${nameB} → ${c.name}</b><br>${c.desc}</p>`;
    }
  }
  list.innerHTML = html;
  for (const tile of document.querySelectorAll('#pickGrid .pick-btn, #teamGrid .pick-btn')) {
    const sp = SPECIALS[tile.dataset.name];
    if (sp) tile.insertAdjacentHTML('beforeend', `<span class="pick-special">${sp.icon}</span>`);
  }
}
buildSpecialsInfo();
