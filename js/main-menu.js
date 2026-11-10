/** 🎮 Euer Hauptmenü: Arena, große Knöpfe und die gewählte Figur. */
const charactersScreen = document.getElementById('charactersScreen');
function refreshMainMenu() {
  document.getElementById('mainCoins').textContent = shopWallet.coins.toLocaleString('de-DE');
  document.getElementById('mainJewels').textContent = shopWallet.jewels.toLocaleString('de-DE');
  const name = equippedActor();
  document.getElementById('mainHeroPortrait').innerHTML = name ? actorIconHtml(name) : '<span class="main-gift">🎁</span>';
  document.getElementById('mainHeroName').textContent = name ? actors[name].name : 'WÄHLE DEINE STARTFIGUR';
  document.getElementById('mainHeroRarity').innerHTML = name ? rarityHtml(name) : '';
}
function openCharactersMenu() {
  refreshStarterChoice();
  startScreen.classList.remove('active');
  charactersScreen.classList.add('active');
  charactersScreen.scrollTop = 0;
  document.getElementById('charactersBackBtn').focus();
}
document.getElementById('charactersStartBtn').addEventListener('click', openCharactersMenu);
document.getElementById('charactersBackBtn').addEventListener('click', () => {
  charactersScreen.classList.remove('active');
  refreshMainMenu();
  startScreen.classList.add('active');
  document.getElementById('charactersStartBtn').focus();
});
document.getElementById('mainProfileBtn').addEventListener('click', openProfileScreen);
document.getElementById('mainRankBtn').addEventListener('click', () => {
  const name = equippedActor();
  if (!name) { openCharactersMenu(); return; }
  chooseAndStart(name, true);
});
for (const id of ['mainCoinsBtn', 'mainJewelsBtn']) {
  document.getElementById(id).addEventListener('click', () => document.getElementById('shopStartBtn').click());
}
document.getElementById('mainPlayBtn').addEventListener('click', () => {
  const name = equippedActor();
  if (!name) { openCharactersMenu(); return; }
  chooseAndStart(name);
});
document.getElementById('mainLandscapeBtn').addEventListener('click', tryLockLandscape);
// Guthaben und Figur auch nach Rückkehr aus einem anderen Menü aktualisieren.
new MutationObserver(() => {
  if (startScreen.classList.contains('active')) refreshMainMenu();
}).observe(startScreen, { attributes: true, attributeFilter: ['class'] });
refreshMainMenu();
