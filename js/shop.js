/** 🛍️ Shop: Spielgeld, Kisten und Fortschritt bleiben lokal auf deinem Gerät. */
const SHOP_STORAGE_KEY = 'lieberose_shop_v1';
const shopScreen = document.getElementById('shopScreen');
const shopMessage = document.getElementById('shopMessage');
function shopNumber(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
function loadShopWallet() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || '{}') || {}; } catch (e) {}
  const chests = {};
  for (const chest of GAME_CONFIG.shopChests) chests[chest.id] = shopNumber(saved.chests?.[chest.id]);
  return { coins: shopNumber(saved.coins), jewels: shopNumber(saved.jewels), nextFreeChestAt: shopNumber(saved.nextFreeChestAt), chests, characters: characterProgress, equipped: CHARACTER_IDS.indexOf(equippedCharacter) };
}
let shopWallet = loadShopWallet();
function saveShopWallet() {
  shopWallet.characters = characterProgress;
  shopWallet.equipped = CHARACTER_IDS.indexOf(equippedCharacter);
  try {
    const saved = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || '{}') || {};
    shopWallet.nextFreeChestAt = Math.max(shopWallet.nextFreeChestAt, shopNumber(saved.nextFreeChestAt));
  } catch (e) {}
  try { localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(shopWallet)); }
  catch (e) { shopMessage.textContent += ' Dein Browser kann gerade nicht speichern. Dein Spielstand bleibt nur in diesem Tab.'; }
}
function shopPrice(chest) {
  return chest.currency === 'jewels' ? `💎 ${chest.price} Juwelen` : `🪙 ${chest.price / 1000}K Coins`;
}
function renderShop() {
  document.getElementById('shopWallet').textContent = `🪙 ${shopWallet.coins.toLocaleString('de-DE')} Coins     💎 ${shopWallet.jewels.toLocaleString('de-DE')} Juwelen`;
  const row = document.getElementById('shopChestRow');
  if (!row.children.length) {
    for (const chest of GAME_CONFIG.shopChests) {
      const card = document.createElement('article');
      card.className = `shop-chest shop-chest-${chest.id}`;
      card.innerHTML = `<div class="chest-art" aria-hidden="true"><span class="chest-spark">✦</span><div class="chest-lid"></div><div class="chest-box"><span>◆</span></div></div>` +
        `<h3>${chest.name}</h3><p class="chest-luck">${chest.luck ? `${chest.luck}× Glück` : '✦ Göttlicher Glanz'}</p>` +
        `<p class="chest-price">${shopPrice(chest)}</p><p class="chest-items">📦 ${chest.items} Items</p>`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn chest-buy';
      btn.addEventListener('click', () => buyShopChest(chest.id));
      card.appendChild(btn);
      const oldChest = document.createElement('button');
      oldChest.type = 'button'; oldChest.className = 'chest-open';
      oldChest.textContent = '📦 Gekaufte Kiste öffnen';
      oldChest.addEventListener('click', () => openStoredChest(chest.id));
      card.appendChild(oldChest);
      if (chest.id === 'normal') {
        const free = document.createElement('button');
        free.id = 'dailyChestBtn'; free.className = 'daily-chest-btn'; free.type = 'button';
        free.addEventListener('click', () => claimDailyChest()); card.appendChild(free);
      }
      row.appendChild(card);
    }
  }
  GAME_CONFIG.shopChests.forEach((chest, i) => {
    const card = row.children[i];
    const btn = card.querySelector('.chest-buy');
    card.querySelector('.chest-open').hidden = shopWallet.chests[chest.id] === 0;
    btn.disabled = shopWallet[chest.currency] < chest.price;
    btn.textContent = shopWallet[chest.currency] < chest.price ? (chest.currency === 'jewels' ? 'Juwelen fehlen' : 'Coins fehlen') : 'KAUFEN';
    btn.setAttribute('aria-label', `${chest.name}: ${shopPrice(chest)}`);
  });
  updateFreeChestButton();
  document.getElementById('shopExchangeBtn').disabled = shopWallet.jewels < GAME_CONFIG.shopExchange.jewels;
}
function buyShopChest(id) {
  return openLootChest(id, false);
}
function exchangeShopJewels() {
  const exchange = GAME_CONFIG.shopExchange;
  if (shopWallet.jewels < exchange.jewels || shopWallet.coins > Number.MAX_SAFE_INTEGER - exchange.coins) return false;
  shopWallet.jewels -= exchange.jewels;
  shopWallet.coins += exchange.coins;
  shopMessage.textContent = '🪙 Getauscht! Du hast 5K Coins für 20 Juwelen bekommen.';
  saveShopWallet();
  renderShop();
  return true;
}
document.getElementById('shopStartBtn').addEventListener('click', () => {
  renderShop();
  shopMessage.textContent = '';
  startScreen.classList.remove('active');
  shopScreen.classList.add('active');
  shopScreen.scrollTop = 0;
  document.getElementById('shopBackBtn').focus();
});
document.getElementById('shopBackBtn').addEventListener('click', () => {
  shopScreen.classList.remove('active');
  startScreen.classList.add('active');
  document.getElementById('shopStartBtn').focus();
});
document.getElementById('shopExchangeBtn').addEventListener('click', exchangeShopJewels);
