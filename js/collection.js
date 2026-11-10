/** 🎁 Startfigur und Seltenheiten – ohne Konto, nur auf deinem Gerät. */
const RARITIES = {
  rare: 'Selten', epic: 'Episch', mythic: 'Mythisch',
  secret: 'Secret', divine: 'Divine'
};
let starterActor = null;
try {
  const saved = localStorage.getItem('lieberose_starter');
  if (saved !== null && /^[0-2]$/.test(saved)) starterActor = GAME_CONFIG.starterActors[Number(saved)];
} catch (e) { /* Ohne Speicher bleibt die Wahl für diesen Tab erhalten. */ }

// Eine gemeinsame Reihenfolge für Sammlung, Team-Auswahl und Helden-Karten.
function characterOrder() {
  const ranks = Object.keys(RARITIES);
  return Object.keys(GAME_CONFIG.actorRarities).filter(name => actors[name])
    .sort((a, b) => ranks.indexOf(GAME_CONFIG.actorRarities[a]) - ranks.indexOf(GAME_CONFIG.actorRarities[b]));
}

function rarityHtml(name) {
  const rarity = GAME_CONFIG.actorRarities[kindOf(name)];
  return `<span class="rarity rarity-${rarity}">${rarity === 'divine' ? '<span class="divine-word">Divine</span>' : RARITIES[rarity] || ''}</span>`;
}

function renderTileRarity(btn, name) {
  if (!btn.querySelector('.rarity')) btn.insertAdjacentHTML('beforeend', rarityHtml(name));
  let level = btn.querySelector('.collection-level');
  if (!level) { level = document.createElement('span'); level.className = 'collection-level'; btn.appendChild(level); }
  level.textContent = ownsCharacter(name) ? `Level ${getCharacterProgress(name).level}` : '';
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
    ? `🎁 ${characterOrder().filter(ownsCharacter).length} Charaktere freigeschaltet · Antippen für XP & Upgrades`
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
      selectCharacter(name);
      refreshStarterChoice();
      openCharCard(name);
    });
    grid.appendChild(btn);
  }
  refreshStarterChoice();
});
