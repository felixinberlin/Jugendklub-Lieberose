/** 🎁 Eine kostenlose normale Kiste, dann genau 24 Stunden ab dem Abholen warten. */
function freeChestRemaining(now = Date.now()) {
  try {
    const saved = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || '{}') || {};
    shopWallet.nextFreeChestAt = Math.max(shopWallet.nextFreeChestAt, shopNumber(saved.nextFreeChestAt));
  } catch (e) {}
  return Math.max(0, shopWallet.nextFreeChestAt - now);
}
function updateFreeChestButton() {
  const btn = document.getElementById('dailyChestBtn');
  if (!btn) return;
  const wait = freeChestRemaining();
  const hasCharacter = characterOrder().some(ownsCharacter);
  btn.disabled = wait > 0 || !hasCharacter;
  if (!hasCharacter) { btn.textContent = '🎁 Erst Startfigur wählen'; return; }
  if (!wait) { btn.textContent = '🎁 GRATIS ABHOLEN'; return; }
  const seconds = Math.ceil(wait / 1000);
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  btn.textContent = `🎁 Gratis in ${hh}:${mm}:${ss}`;
}
function claimDailyChest(rng = Math.random) { return openLootChest('normal', false, rng, true); }
setInterval(() => { if (shopScreen.classList.contains('active')) updateFreeChestButton(); }, 1000);
