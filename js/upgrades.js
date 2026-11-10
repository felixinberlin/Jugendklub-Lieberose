/** ⬆️ Charakter-Fortschritt: Freischalten, XP und Level bis 16. */
const CHARACTER_IDS = Object.keys(GAME_CONFIG.actorRarities);
let equippedCharacter = null;
function loadCharacterProgress() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('lieberose_shop_v1') || '{}') || {}; } catch (e) {}
  equippedCharacter = Number.isInteger(saved.equipped) ? CHARACTER_IDS[saved.equipped] || null : null;
  const progress = {};
  for (const name of CHARACTER_IDS) {
    const data = saved.characters?.[name] || {};
    progress[name] = {
      owned: data.owned === 1 ? 1 : 0,
      xp: Number.isSafeInteger(data.xp) && data.xp >= 0 ? data.xp : 0,
      level: Number.isInteger(data.level) ? Math.max(1, Math.min(GAME_CONFIG.maxCharacterLevel, data.level)) : 1
    };
  }
  return progress;
}
let characterProgress = loadCharacterProgress();
function getCharacterProgress(name) { return characterProgress[kindOf(name)]; }
function ownsCharacter(name) {
  const kind = kindOf(name);
  return kind === starterActor || characterProgress[kind]?.owned === 1;
}
function equippedActor() { return equippedCharacter && ownsCharacter(equippedCharacter) ? equippedCharacter : starterActor; }
function selectCharacter(name) {
  if (!ownsCharacter(name)) return false;
  equippedCharacter = kindOf(name);
  saveShopWallet();
  return true;
}
function nextUpgradeXp(name) {
  const level = getCharacterProgress(name).level;
  return level >= GAME_CONFIG.maxCharacterLevel ? null : GAME_CONFIG.firstUpgradeXp * 2 ** (level - 1);
}
function upgradeCharacter(name) {
  if (!ownsCharacter(name)) return false;
  const data = getCharacterProgress(name);
  const cost = nextUpgradeXp(name);
  if (cost === null || data.xp < cost) return false;
  data.xp -= cost;
  data.level++;
  saveShopWallet();
  refreshUnlockTiles();
  renderUpgradeCard(name);
  return true;
}
function renderUpgradeCard(name) {
  const section = document.getElementById('charUpgradeSection');
  section.hidden = !ownsCharacter(name);
  if (section.hidden) return;
  const data = getCharacterProgress(name);
  const cost = nextUpgradeXp(name);
  document.getElementById('charUpgradeLevel').textContent = `⭐ Level ${data.level} / ${GAME_CONFIG.maxCharacterLevel}`;
  document.getElementById('charUpgradeXp').textContent = cost === null ? `${data.xp.toLocaleString('de-DE')} XP · Max-Level erreicht!` : `${data.xp.toLocaleString('de-DE')} / ${cost.toLocaleString('de-DE')} XP`;
  const bar = document.getElementById('charUpgradeProgress');
  bar.max = cost || 1; bar.value = cost === null ? 1 : Math.min(data.xp, cost);
  const btn = document.getElementById('charUpgradeBtn');
  btn.disabled = cost === null || data.xp < cost;
  btn.textContent = cost === null ? '🌟 MAX-LEVEL 16' : `⬆️ UPGRADE · ${cost.toLocaleString('de-DE')} XP`;
  btn.onclick = () => upgradeCharacter(name);
}
