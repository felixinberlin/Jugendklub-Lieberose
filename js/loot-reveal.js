/** 📦 Erst geht die Kiste auf, danach enthüllst du jedes Item einzeln. */
let currentLoot = null;
let lootOpeningTimer = null;
function lootCharacterName(name) {
  const label = actors[name].name;
  return label[0] + label.slice(1).toLocaleLowerCase('de-DE');
}
function showLootResults(chest, results) {
  clearTimeout(lootOpeningTimer);
  currentLoot = { chest, results, shown: 0, opening: true };
  document.getElementById('lootTitle').textContent = `📦 ${chest.name.toUpperCase()}`;
  document.getElementById('lootSummary').textContent = 'Die Kiste öffnet sich …';
  const grid = document.getElementById('lootResults'); grid.replaceChildren(); grid.hidden = true;
  const art = document.getElementById('openingChest');
  art.hidden = false; art.className = `opening-chest shop-chest-${chest.id}`;
  void art.offsetWidth; art.classList.add('is-opening');
  const next = document.getElementById('lootNextBtn');
  next.hidden = false; next.disabled = true; next.textContent = '📦 Kiste öffnet sich …';
  document.getElementById('lootCloseBtn').hidden = true;
  shopScreen.classList.remove('active'); lootScreen.classList.add('active'); lootScreen.scrollTop = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  lootOpeningTimer = setTimeout(() => {
    if (!currentLoot) return;
    currentLoot.opening = false;
    art.hidden = true; grid.hidden = false; revealNextLootItem();
  }, reduced ? 0 : GAME_CONFIG.lootOpenMs);
}
function revealNextLootItem() {
  if (!currentLoot || currentLoot.opening || currentLoot.shown >= currentLoot.results.length) return false;
  const reward = currentLoot.results[currentLoot.shown++];
  const rarity = reward.rarity || GAME_CONFIG.actorRarities[reward.name];
  const tile = document.createElement('article');
  tile.className = `loot-item${rarity ? ` loot-${rarity}` : ''}`;
  const icon = reward.kind === 'xp' ? '⭐' : reward.kind === 'coins' ? '🪙' : reward.kind === 'jewels' ? '💎' : null;
  const title = reward.kind === 'xp' ? `${reward.amount} XP für ${lootCharacterName(reward.name)}`
    : reward.kind === 'character' ? lootCharacterName(reward.name) : rewardLabel(reward);
  tile.innerHTML = `<div class="loot-icon">${icon || actorIconHtml(reward.name)}</div><div><strong>${title}</strong>` +
    (reward.kind === 'character' ? `<p>${reward.duplicate ? 'Schon freigeschaltet' : '🎉 NEU FREIGESCHALTET!'}</p>${rarityHtml(reward.name)}` : '') + '</div>';
  document.getElementById('lootResults').replaceChildren(tile);
  document.getElementById('lootSummary').textContent = `Belohnung ${currentLoot.shown} von ${currentLoot.results.length}`;
  const finished = currentLoot.shown === currentLoot.results.length;
  const next = document.getElementById('lootNextBtn');
  next.disabled = false; next.hidden = finished; next.textContent = '✨ NÄCHSTE BELOHNUNG';
  const close = document.getElementById('lootCloseBtn'); close.hidden = !finished;
  (finished ? close : next).focus({ preventScroll: true });
  lootScreen.scrollTop = 0;
  return true;
}
function closeLootResults() {
  if (!currentLoot || currentLoot.opening || currentLoot.shown < currentLoot.results.length) return false;
  clearTimeout(lootOpeningTimer); currentLoot = null;
  lootScreen.classList.remove('active'); shopScreen.classList.add('active');
  renderShop(); document.getElementById('shopBackBtn').focus();
  return true;
}
document.getElementById('lootNextBtn').addEventListener('click', revealNextLootItem);
document.getElementById('lootCloseBtn').addEventListener('click', closeLootResults);
