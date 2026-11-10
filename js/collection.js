/** 🎁 Startfigur und Seltenheiten – ohne Konto, nur auf deinem Gerät. */
const RARITIES = {
  rare: 'Selten', epic: 'Episch', mythic: 'Mythisch',
  secret: 'Secret', divine: 'Divine · Göttlich'
};
let starterActor = null;
try {
  const saved = localStorage.getItem('lieberose_starter');
  if (saved !== null && /^[0-2]$/.test(saved)) starterActor = GAME_CONFIG.starterActors[Number(saved)];
} catch (e) { /* Ohne Speicher bleibt die Wahl für diesen Tab erhalten. */ }

function rarityHtml(name) {
  const rarity = GAME_CONFIG.actorRarities[kindOf(name)];
  return `<span class="rarity rarity-${rarity}">${RARITIES[rarity] || ''}</span>`;
}

function renderTileRarity(btn, name) {
  if (!btn.querySelector('.rarity')) btn.insertAdjacentHTML('beforeend', rarityHtml(name));
}

function renderCardRarity(name) {
  const title = document.querySelector('.char-card-title-group');
  const old = title.querySelector('.rarity');
  if (old) old.remove();
  title.insertAdjacentHTML('afterbegin', rarityHtml(name));
}

function refreshStarterChoice() {
  document.getElementById('starterChoice').hidden = !!starterActor;
  document.getElementById('collectionHint').textContent = starterActor
    ? `🎁 Deine Startfigur: ${actors[starterActor].name}. Weitere Figuren sind noch gesperrt.`
    : '🎁 Wähle zuerst oben deine Startfigur. Alle anderen kannst du schon anschauen!';
  refreshUnlockTiles();
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('starterGrid');
  for (const name of GAME_CONFIG.starterActors) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick-btn';
    btn.dataset.starter = name;
    btn.innerHTML = `<span class="pick-emoji">${actorIconHtml(name)}</span>${actors[name].name}${rarityHtml(name)}`;
    btn.addEventListener('click', () => {
      if (starterActor) return;
      starterActor = name;
      try { localStorage.setItem('lieberose_starter', String(GAME_CONFIG.starterActors.indexOf(name))); } catch (e) {}
      refreshStarterChoice();
      openCharCard(name);
    });
    grid.appendChild(btn);
  }
  refreshStarterChoice();
});
