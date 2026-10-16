/**
 * 🎬 credits.js – Der Abspann: Alle Wünsche der Kinder, wie im Kino
 *
 * Jeder Wunsch, der ins Spiel kommt, bekommt hier eine Zeile und eine
 * neue Versionsnummer. Neuer Wunsch? → Unten in WISHES eintragen und
 * GAME_VERSION hochzählen (z. B. 2.22 → 2.23).
 */

const GAME_VERSION = '2.28';
const REPO_URL = 'https://github.com/felixinberlin/Jugendklub-Lieberose';

const WISHES = [
  { workshop: '🎪 Workshop 1 · 8.–9. Oktober' },
  { v: '1.0', text: 'Das allererste Spiel 🚀' },
  { v: '1.1', text: 'Regenbogen-Hintergrund 🌈' },
  { v: '1.2', text: 'Echte Physik – alles hüpft und fliegt' },
  { v: '1.3', text: 'Kobold 🧌 links, Maispflanze 🌽 rechts' },
  { v: '1.4', text: 'Der Mais wirft Bomben 💣' },
  { v: '1.5', text: 'Kobold und Mais werfen sich Bomben zu' },
  { v: '1.6', text: 'Handy schütteln = Bomben werfen 📳' },
  { v: '1.7', text: 'Antippen = werfen, Ziehen = ausweichen 👆' },
  { v: '1.8', text: 'Der Lieberoser Zauberwald 🌲🌙' },
  { workshop: '🎪 Workshop 2 · 13. Oktober' },
  { v: '2.0', text: 'Neue Figur: die Katze 🐱' },
  { v: '2.1', text: 'Tag statt Nacht ☀️ mit Schmetterlingen 🦋' },
  { v: '2.2', text: 'Es regnet 🌧️ – und unten wachsen Bäume 🌱🌳' },
  { v: '2.3', text: 'Wolke antippen = Regen, Sonne antippen = Nacht 🌙' },
  { v: '2.4', text: 'Breitbild für Beamer und Handy quer 🖥️' },
  { v: '2.5', text: 'Treffer-Zähler für jede Figur 🎯💥' },
  { v: '2.6', text: 'Neue Figur: die Maus 🐭 – sie wirft Käse 🧀' },
  { v: '2.7', text: 'Neue Figur: der Goblin 👺 – er wirft Feuer 🔥' },
  { v: '2.8', text: 'Neue Figur: Musiala ⚽' },
  { v: '2.9', text: 'Musiala zieht ein Trikot an 👕' },
  { v: '2.10', text: 'Musiala dribbelt über das Feld 🏃' },
  { v: '2.11', text: 'Six seven! 🤲' },
  { v: '2.12', text: 'Lebensleiste ❤️ – wer zu oft getroffen wird, ist raus 💀' },
  { v: '2.13', text: 'Raus nach 20 Treffern – Bomben treffen jeden im Weg' },
  { v: '2.14', text: 'Figur auswählen 🎮 – die anderen spielt der Computer 🤖' },
  { v: '2.15', text: 'Level! 🏅 Erst 3, dann 5 (Level 3 war zu schwer 😅)' },
  { v: '2.16', text: 'Team-Modus ⚔️ – rote Gegner, 8 Level, immer mehr Gegner' },
  { v: '2.17', text: 'Leben auswählen: 5, 10, 20 oder 50 💀' },
  { v: '2.18', text: 'Spezialkräfte ⚡ Riesenball, Mini-Kobolde, Wirbelsprung' },
  { v: '2.19', text: 'Spezialkraft-Knopf – lädt mit 20 Treffern auf' },
  { v: '2.20', text: 'Popcorn-Attacke 🍿 und Feuerspeer 🔥' },
  { v: '2.21', text: 'Goldsack 💰 mit Goldmünzen 🪙, Maiskörner und Fische 🐟' },
  { v: '2.22', text: 'Turbo 🚀 bei vielen Figuren – und dieser Abspann 🎬' },
  { v: '2.23', text: 'Abspann-Knopf auch auf dem Startbildschirm 🎬' },
  { v: '2.24', text: 'Die Maus kann sich verstecken 🐭🕳️ – 6 Sekunden kein Schaden' },
  { v: '2.25', text: 'Spezialkraft-Treffer bleiben fürs nächste Level ⚡➡️' },
  { v: '2.26', text: 'Spezialkräfte werden am Anfang erklärt 📖⚡' },
  { v: '2.27', text: 'Link zum Code für Eltern 👨‍👩‍👧' },
  { v: '2.28', text: 'Schlaue Computer-Gegner 🤖 – bewegen sich, wehren ab & flüchten vor dem Riesenball ⚽' }
];

// Abspann-Inhalt einmal beim Laden bauen
function buildCredits() {
  let html = '<p class="credits-title">🎬 KOBOLD, MAIS & CO.</p>' +
    `<p class="credits-version">Version ${GAME_VERSION}</p>` +
    '<p class="credits-sub">Ein Spiel vom Jugendklub Lieberose 🏰</p>' +
    '<p class="credits-head">✨ Eure Wünsche ✨</p>';
  for (const w of WISHES) {
    html += w.workshop
      ? `<p class="credits-workshop">${w.workshop}</p>`
      : `<p class="credits-wish"><span class="credits-v">v${w.v}</span> ${w.text}</p>`;
  }
  html += '<p class="credits-head">💡 Ideen</p><p class="credits-wish">Die Kinder vom Jugendklub Lieberose</p>' +
    '<p class="credits-head">⌨️ Programmiert</p><p class="credits-wish">live auf der Bühne – mit KI 🤖</p>' +
    '<p class="credits-head">👨‍👩‍👧 Für Eltern</p>' +
    `<p class="credits-wish">Der ganze Code ist offen:<br><a class="credits-link" href="${REPO_URL}" target="_blank" rel="noopener">github.com/felixinberlin/Jugendklub-Lieberose</a></p>` +
    '<p class="credits-end">Danke fürs Spielen! ❤️</p>';
  creditsRoll.innerHTML = html;
  versionEl.textContent = `v${GAME_VERSION}`;
}

// 🎬 Abspann starten: Text rollt von unten nach oben durchs Bild
function showCredits() {
  creditsScreen.classList.add('active');
  creditsRoll.style.animation = 'none';
  void creditsRoll.offsetHeight; // Animation neu starten
  creditsRoll.style.animation = `credits-roll ${WISHES.length * 1.1 + 8}s linear forwards`;
}

function hideCredits() {
  creditsScreen.classList.remove('active');
}

buildCredits();
creditsBtn.addEventListener('click', showCredits);
document.getElementById('creditsStartBtn').addEventListener('click', showCredits); // Auch auf dem Startbildschirm
creditsScreen.addEventListener('click', (event) => {
  if (event.target.closest('a')) return; // Link antippen = Link öffnen, Abspann läuft weiter
  hideCredits(); // Sonst: Antippen = zurück
});
creditsRoll.addEventListener('animationend', hideCredits); // Ende = zurück
