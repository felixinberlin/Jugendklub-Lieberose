/** 📦 Jede Kiste zieht eine feste Anzahl Items; alle Zahlen sind lokale Spielwerte. */
const lootScreen = document.getElementById('lootScreen');
function weightedLootPick(entries, weight, rng = Math.random) {
  const total = entries.reduce((sum, entry) => sum + weight(entry), 0);
  if (!entries.length || total <= 0) return null;
  let roll = Math.max(0, Math.min(1 - Number.EPSILON, rng())) * total;
  for (const entry of entries) { roll -= weight(entry); if (roll < 0) return entry; }
  return entries[entries.length - 1];
}
function chestLuck(chest) { return Number(String(chest.luck).replace(',', '.')) || 1; }
function rewardWeight(entry, chest) {
  return entry.chance * (entry.kind === 'character' || entry.kind === 'skin' ? chestLuck(chest) : 1);
}
function xpRecipient(rng = Math.random) {
  const groups = Object.entries(GAME_CONFIG.xpRarityWeights).map(([rarity, weight]) => ({
    weight, names: characterOrder().filter(name => ownsCharacter(name) && GAME_CONFIG.actorRarities[name] === rarity)
  })).filter(group => group.names.length);
  const group = weightedLootPick(groups, group => group.weight, rng);
  return group ? group.names[Math.min(group.names.length - 1, Math.floor(Math.max(0, rng()) * group.names.length))] : null;
}
function addLootNumber(value, amount) { return Math.min(Number.MAX_SAFE_INTEGER, value + amount); }
function grantLootReward(entry, rng = Math.random) {
  if (entry.kind === 'coins' || entry.kind === 'jewels') {
    shopWallet[entry.kind] = addLootNumber(shopWallet[entry.kind], entry.amount);
    return { kind: entry.kind, amount: entry.amount };
  }
  if (entry.kind === 'xp') {
    const name = xpRecipient(rng);
    if (!name) return null; // Öffnen setzt mindestens eine freigeschaltete Figur voraus.
    const progress = getCharacterProgress(name);
    progress.xp = addLootNumber(progress.xp, entry.amount);
    return { kind: 'xp', name, amount: entry.amount };
  }
  const candidates = characterOrder().filter(name => GAME_CONFIG.actorRarities[name] === entry.rarity);
  const name = candidates[Math.min(candidates.length - 1, Math.floor(Math.max(0, rng()) * candidates.length))];
  const duplicate = ownsCharacter(name);
  getCharacterProgress(name).owned = 1;
  return { kind: 'character', name, rarity: entry.rarity, duplicate };
}
function rollChestRewards(chest, rng = Math.random) {
  const results = [];
  for (let i = 0; i < chest.items; i++) {
    const entry = weightedLootPick(GAME_CONFIG.chestRewards, entry => rewardWeight(entry, chest), rng);
    results.push(grantLootReward(entry, rng));
  }
  return results;
}
function rewardLabel(entry) {
  if (entry.kind === 'xp') return `${entry.amount} XP`;
  if (entry.kind === 'coins') return `${entry.amount} Coins`;
  if (entry.kind === 'jewels') return `${entry.amount} Juwelen`;
  return `${RARITIES[entry.rarity]} · Charakter`;
}
function showLootResults(chest, results) {
  document.getElementById('lootTitle').textContent = `📦 ${chest.name.toUpperCase()}`;
  document.getElementById('lootSummary').textContent = `${results.length} Items erhalten!`;
  const grid = document.getElementById('lootResults');
  grid.replaceChildren();
  for (const reward of results) {
    const tile = document.createElement('article');
    tile.className = `loot-item${reward.rarity ? ` loot-${reward.rarity}` : ''}`;
    const icon = reward.kind === 'xp' ? '⭐' : reward.kind === 'coins' ? '🪙' : reward.kind === 'jewels' ? '💎' : null;
    tile.innerHTML = `<div class="loot-icon">${icon || actorIconHtml(reward.name)}</div>` +
      `<strong>${reward.kind === 'character' ? actors[reward.name].name : rewardLabel(reward)}</strong>` +
      (reward.name ? `<p>${reward.kind === 'xp' ? `für ${actors[reward.name].name}` : reward.duplicate ? 'Schon freigeschaltet' : '🎉 NEU FREIGESCHALTET!'}</p>` : '') +
      (reward.rarity ? rarityHtml(reward.name) : '');
    grid.appendChild(tile);
  }
  shopScreen.classList.remove('active');
  lootScreen.classList.add('active');
  lootScreen.scrollTop = 0;
  document.getElementById('lootCloseBtn').focus({ preventScroll: true });
}
function openLootChest(id, stored = false, rng = Math.random) {
  if (lootScreen.classList.contains('active')) return false;
  const chest = GAME_CONFIG.shopChests.find(chest => chest.id === id);
  if (!chest) return false;
  if (!characterOrder().some(ownsCharacter)) {
    shopMessage.textContent = '🎁 Wähle zuerst unter „Charaktere“ deine Startfigur!';
    return false;
  }
  if (stored) { if (!shopWallet.chests[id]) return false; }
  else if (shopWallet[chest.currency] < chest.price) return false;
  if (stored) shopWallet.chests[id]--;
  else shopWallet[chest.currency] -= chest.price;
  const results = rollChestRewards(chest, rng);
  saveShopWallet(); // Preis, alle Belohnungen und Fortschritt zusammen speichern.
  refreshStarterChoice(); refreshMainMenu(); renderShop();
  showLootResults(chest, results);
  return true;
}
function openStoredChest(id) { return openLootChest(id, true); }
function renderLootOdds() {
  const chest = GAME_CONFIG.shopChests.find(chest => chest.id === document.getElementById('lootOddsChest').value);
  const total = GAME_CONFIG.chestRewards.reduce((sum, entry) => sum + rewardWeight(entry, chest), 0);
  document.getElementById('lootOddsTable').innerHTML = '<table><thead><tr><th>Belohnung</th><th>Chance pro Item</th></tr></thead><tbody>' +
    GAME_CONFIG.chestRewards.map(entry => `<tr><td>${rewardLabel(entry)}</td><td>${(rewardWeight(entry, chest) / total * 100).toLocaleString('de-DE', { maximumFractionDigits: 3 })} %</td></tr>`).join('') + '</tbody></table>';
}
const lootOddsSelect = document.getElementById('lootOddsChest');
for (const chest of GAME_CONFIG.shopChests) { const option = document.createElement('option'); option.value = chest.id; option.textContent = chest.name; lootOddsSelect.appendChild(option); }
lootOddsSelect.addEventListener('change', renderLootOdds);
renderLootOdds();
document.getElementById('lootCloseBtn').addEventListener('click', () => {
  lootScreen.classList.remove('active'); shopScreen.classList.add('active');
  renderShop(); document.getElementById('shopBackBtn').focus();
});
