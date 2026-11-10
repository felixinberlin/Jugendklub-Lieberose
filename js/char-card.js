/**
 * 🃏 char-card.js – Interaktive Helden-Karte für den Startbildschirm
 *
 * Beim Antippen einer Figur auf dem Startbildschirm öffnet sich
 * die Helden-Karte mit allen Details: Leben, Tempo, Hitbox, DPS, Waffe,
 * Spezialkraft und Taktik-Tipps!
 */

const CHAR_CARDS = {
  musiala: {
    id: 'musiala',
    name: 'Musialla #10',
    role: '⚽ Dribbler & Spielmacher',
    motto: 'Lässt Gegner mit flüssigen Haken ins Leere laufen!',
    color: '#facc15',
    hp: 100,
    hitbox: 66,
    hitboxLabel: '66 px (flink & beweglich)',
    hitboxScore: 8.0,
    weaponName: 'Fußball',
    weaponIcon: '⚽',
    weaponSpeed: 'Tempo 12 (Präzise)',
    specialName: 'GROSSER BALL',
    specialIcon: '⚽',
    specialDesc: 'Schießt einen riesigen Riesenball (10 Schaden), den du 5 Sekunden lang mit Finger oder Maus über das Feld lenkst!',
    specialEqualizer: '🔄 Levelt das Spiel: Rollt durch gegnerische Deckungen und trifft mehrere Feinde auf einmal!',
    tactic: 'Nutze dein ständiges Dribbling, um Geschossen auszuweichen, und schieße aus vollem Lauf!'
  },
  kobold: {
    id: 'kobold',
    name: 'Kobold',
    role: '🧌 Belagerungs-Tank & Brecher',
    motto: 'Wirft seine Klinge und schützt sich mit Mini-Kobolden!',
    color: '#4ade80',
    hp: 120,
    hitbox: 70,
    hitboxLabel: '70 px (robuste Statur)',
    hitboxScore: 6.5,
    weaponName: 'Klinge',
    weaponIcon: '🗡️',
    weaponSpeed: 'Tempo 12 (Gezackte Klinge)',
    specialName: 'MINI-KOBOLDE',
    specialIcon: '🧌',
    specialDesc: '3 rotierende Mini-Kobolde umkreisen dich 5 Sekunden lang und fangen 100 % aller feindlichen Bomben physisch ab!',
    specialEqualizer: '🔄 Levelt das Spiel: Schaltet feindliche Bombardements komplett ab und rettet vor K.o.!',
    tactic: 'Setze Gegner auf mittlere Distanz unter Druck und zünde die Minis bei Gefahr.'
  },
  corn: {
    id: 'corn',
    name: 'Mais',
    role: '🌽 Lanzenwerfer',
    motto: 'Wirft seine Lanze und zündet Popcorn als Spezialkraft!',
    color: '#fde047',
    hp: 100,
    hitbox: 74,
    hitboxLabel: '74 px (großes Ziel, +52% Fläche!)',
    hitboxScore: 4.5,
    weaponName: 'Mais-Lanze',
    weaponIcon: '🗡️',
    weaponSpeed: 'Tempo 15 (Lanze)',
    specialName: 'POPCORN-SALVE',
    specialIcon: '🍿',
    specialDesc: 'Feuert 5 Popcorn-Körner gleichzeitig auf die Feinde – jedes Korn macht 4 Schaden mit Explosion (bis zu 20 Schaden!).',
    specialEqualizer: '🔄 Levelt das Spiel: Mit gezielten Lanzen-Treffern lädt Mais seine Popcorn-Spezialkraft auf!',
    tactic: 'Dauerfeuer! Da jeder Treffer die Spezialkraft lädt, hast du deine Salve blitzschnell bereit.'
  },
  maus: {
    id: 'maus',
    name: 'Maus',
    role: '🐭 Schatten-Ninja & Flitzer',
    motto: 'Kleine Hitbox und 6 Sekunden unantastbar!',
    color: '#93c5fd',
    hp: 105,
    hitbox: 60,
    hitboxLabel: '60 px (winzig · 52% schwerer zu treffen!)',
    hitboxScore: 10.0,
    weaponName: 'Mäuse-Lanze',
    weaponIcon: '🪓',
    weaponSpeed: 'Tempo 14 (Sehr schnell, flache Flugbahn)',
    specialName: 'VERSTECKEN',
    specialIcon: '🕳️',
    specialDesc: 'Taucht für volle 6 Sekunden im Mauseloch unter. Du bist 100 % unverwundbar und Bots können dich nicht anvisieren!',
    specialEqualizer: '🔄 Levelt das Spiel: Übersteht selbst tödliche Spezialkräfte anderer Helden völlig ohne Schaden.',
    tactic: 'Umkreise Feinde mit deiner winzigen Hitbox. Verschwinde im Loch, wenn es brenzlig wird!'
  },
  katze: {
    id: 'katze',
    name: 'Katze',
    role: '🐱 Heavy Bruiser & Stunner',
    motto: 'Trifft mit 5 Schaden wie ein Hammer und betäubt 4 Sekunden!',
    color: '#fb923c',
    hp: 110,
    hitbox: 70,
    hitboxLabel: '70 px (gute Balance)',
    hitboxScore: 6.5,
    weaponName: 'Stachelkeule',
    weaponIcon: '🏏',
    weaponSpeed: 'Tempo 8 (Schwere Bogen-Keule)',
    specialName: 'WIRBELSTURM',
    specialIcon: '🌪️',
    specialDesc: 'Springt auf einen Gegner, fügt 5 Schaden zu und betäubt ihn für 4 Sekunden (kann weder laufen noch werfen)!',
    specialEqualizer: '🔄 Levelt das Spiel: Schaltet den stärksten Boss oder Führenden für 4 Sekunden komplett aus.',
    tactic: 'Setze den Wirbelsturm ein und lande während des Stuns zwei sichere Keulentreffer (+10 Schaden!).'
  },
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    role: '👺 Pyro-Skirmisher & Flankierer',
    motto: 'Extrem flink und brennt Löcher mit dem glühenden Dreizack!',
    color: '#f87171',
    hp: 100,
    hitbox: 68,
    hitboxLabel: '68 px (kompakt & wendig)',
    hitboxScore: 7.5,
    weaponName: 'Lava-Dreizack',
    weaponIcon: '🔱',
    weaponSpeed: 'Tempo 11 (Guter Stoß)',
    specialName: 'FEUER-DREIZACK',
    specialIcon: '🔱🔥',
    specialDesc: 'Schleudert einen brennenden Dreizack mit Tempo 12: 10 Direktschaden + 6 Brand-Schaden = 16 Gesamtschaden!',
    specialEqualizer: '🔄 Levelt das Spiel: 16-Schaden-Burst schmilzt selbst die dicksten Tanks im Nu ein.',
    tactic: 'Nutze dein 1.3-Tempo für Flankenangriffe und finishe geschwächte Gegner mit dem Feuerspeer.'
  },
  zeus: {
    id: 'zeus',
    name: 'Zeus',
    role: '🧔🏼‍♂️ Götter-Scharfschütze & Gewitter',
    motto: 'Laser-artige Blitze, 130 HP und ein vernichtender Gewittersturm!',
    color: '#38bdf8',
    hp: 130,
    hitbox: 74,
    hitboxLabel: '74 px (große göttliche Statur)',
    hitboxScore: 5.0,
    weaponName: 'Zickzack-Blitz',
    weaponIcon: '⚡',
    weaponSpeed: 'Tempo 20 (Sofort-Treffer Laser, 0 Schwerkraft)',
    specialName: 'BLITZ-REGEN',
    specialIcon: '🌩️',
    specialDesc: 'Beschwört eine Gewitterwolke über dem Ziel (82 px Radius): schlägt 4 Sekunden lang ein (bis zu 55 AoE-Schaden!).',
    specialEqualizer: '🔄 Levelt das Spiel: Zwingt alle Gegner zur Flucht und löscht enge Gegnergruppen komplett aus.',
    tactic: 'Verfehle nie: Deine Blitze fliegen mit Tempo 20 sofort ins Ziel. Halte Abstand beim Nachladen.'
  },
  yamal: {
    id: 'yamal',
    name: 'Lamine Yamal #19',
    role: '🌟 Goldenes Wunderkind & Turbo-Stürmer',
    motto: 'Flinker Dribbler mit verheerender Stern-Explosion!',
    color: '#eab308',
    hp: 105,
    hitbox: 65,
    hitboxLabel: '65 px (schlank & flink)',
    hitboxScore: 8.5,
    weaponName: 'Fußball',
    weaponIcon: '⚽',
    weaponSpeed: 'Tempo 12 (Präzise)',
    specialName: 'STERNEN-EXPLOSION',
    specialIcon: '🌟💥',
    specialDesc: 'Fliegt ins Spielfeld-Zentrum und explodiert in einer goldenen Schockwelle – fügt einem zufälligen Gegner 12 Sofort-Schaden zu!',
    specialEqualizer: '🔄 Levelt das Spiel: Trifft verlässlich auch schwer erreichbare Feinde und bietet die 42-Schaden-Combo mit Musialla!',
    tactic: 'Nutze dein Bewegungstempo, um Gegnern davonzulaufen, und feuere Bälle im Vorbeilaufen ab.'
  },
  fledermaus: {
    id: 'fledermaus',
    name: 'Fledermaus',
    role: '🦇 Vampir-Duellantin & Zermürberin',
    motto: 'Wechselt Speer & Morgenstern und heilt sich mit Blutsaugen!',
    color: '#c084fc',
    hp: 100,
    hitbox: 68,
    hitboxLabel: '68 px (flatternde Flügel)',
    hitboxScore: 7.5,
    weaponName: 'Speer / Morgenstern',
    weaponIcon: '🗡️⛓️',
    weaponSpeed: 'Wechselt: Tempo 16 Speer & Tempo 8.5 Morgenstern',
    specialName: 'BLUTSAUGEN',
    specialIcon: '🩸',
    specialDesc: 'Saugt 5-mal je 3 Leben vom Gegner ab (15 Schaden) und HEILT sich selbst um +15 Leben wieder hoch!',
    specialEqualizer: '🔄 Levelt das Spiel: 30-HP-Netto-Schwung im Duell – dreht fast verlorene Runden im Alleingang!',
    tactic: 'Überlebe den Beginn mit Tempo 1.1 und sauge dem stärksten Feind das Leben ab, um dich vollzuheilen.'
  },
  drache: {
    id: 'drache',
    name: 'Drache',
    role: '🐉 Urzeit-Koloss & Raid-Boss',
    motto: '130 HP, unberechenbare Wellen-Feuerbälle und ein 14-Schaden-Biss!',
    color: '#ef4444',
    hp: 130,
    hitbox: 74,
    hitboxLabel: '74 px (riesiges Ziel, +52% Fläche!)',
    hitboxScore: 4.0,
    weaponName: 'Wellen-Feuerball',
    weaponIcon: '🔥',
    weaponSpeed: 'Tempo 10 (zusätzlich 2 Feuerschaden)',
    specialName: 'DRACHENBISS',
    specialIcon: '🦷',
    specialDesc: 'Stürzt im Bogen herab und beißt für 14 brachialen Sofortschaden zu + 1.5 Sekunden Betäubung!',
    specialEqualizer: '🔄 Levelt das Spiel: Brachialer 14-Schaden-Finisher schaltet jeden angeschlagenen Gegner mit einem Happs aus!',
    tactic: 'Feuerbälle schlängeln sich um Hindernisse. Halte durch deine 130 HP stand und finishe mit dem Drachenbiss.'
  }
};

const CHAR_ORDER = characterOrder();
let currentCharIndex = 0;

function getCharData(name) {
  const k = (typeof kindOf === 'function' ? kindOf(name) : name) || name;
  const base = CHAR_CARDS[k] || CHAR_CARDS.musiala;
  const damage = getCharStat(k, 'attackDamage');
  const cooldown = getCharStat(k, 'attackCooldown');
  const speed = getCharStat(k, 'speed');
  const hits = Math.ceil(100 / damage);
  return { ...base, hp: getCharStat(k, 'hp'),
    speed: `${speed}× Tempo`, speedScore: Math.min(10, speed / 1.6 * 10),
    weaponDamage: damage, weaponCd: cooldown, dps: damage / cooldown,
    ttk: `${((hits - 1) * cooldown).toFixed(1)} s gegen 100 Leben (${hits} Treffer)`
  };
}

function openCharCard(name) {
  const k = (typeof kindOf === 'function' ? kindOf(name) : name) || name;
  const idx = CHAR_ORDER.indexOf(k);
  currentCharIndex = idx >= 0 ? idx : 0;
  renderCurrentCharCard();
  const modal = document.getElementById('charCardModal');
  if (modal) {
    modal.hidden = false;
    modal.classList.add('active');
  }
}

function closeCharCard() {
  const modal = document.getElementById('charCardModal');
  if (modal) {
    modal.hidden = true;
    modal.classList.remove('active');
  }
}

function renderCurrentCharCard() {
  const key = CHAR_ORDER[currentCharIndex];
  const data = getCharData(key);
  if (!data) return;

  const modal = document.getElementById('charCardModal');
  if (!modal) return;

  // Portrait
  const portraitEl = document.getElementById('charCardPortrait');
  if (portraitEl) {
    portraitEl.innerHTML = typeof actorIconHtml === 'function' ? actorIconHtml(key) : data.weaponIcon;
    portraitEl.style.borderColor = data.color;
  }

  renderCardRarity(key);
  renderUpgradeCard(key);

  // Titles
  const roleEl = document.getElementById('charCardRole');
  if (roleEl) roleEl.textContent = data.role;
  const nameEl = document.getElementById('charCardName');
  if (nameEl) {
    nameEl.textContent = data.name;
    nameEl.style.color = data.color;
  }
  const mottoEl = document.getElementById('charCardMotto');
  if (mottoEl) mottoEl.textContent = data.motto;

  // Counter
  const counterEl = document.getElementById('charCardCounter');
  if (counterEl) counterEl.textContent = `${currentCharIndex + 1} / ${CHAR_ORDER.length}`;

  // Stat Bars
  const hpEl = document.getElementById('charCardHp');
  if (hpEl) hpEl.textContent = `${data.hp} HP`;
  const hpBar = document.getElementById('charCardHpBar');
  if (hpBar) hpBar.style.width = `${Math.min(100, (data.hp / 130) * 100)}%`;

  const speedEl = document.getElementById('charCardSpeed');
  if (speedEl) speedEl.textContent = data.speed;
  const speedBar = document.getElementById('charCardSpeedBar');
  if (speedBar) speedBar.style.width = `${data.speedScore * 10}%`;

  const dpsEl = document.getElementById('charCardDps');
  if (dpsEl) dpsEl.textContent = `${data.dps.toFixed(2)} DPS (${data.ttk})`;
  const dpsBar = document.getElementById('charCardDpsBar');
  if (dpsBar) dpsBar.style.width = `${Math.min(100, (data.dps / 6.0) * 100)}%`;

  const hitboxEl = document.getElementById('charCardHitbox');
  if (hitboxEl) hitboxEl.textContent = data.hitboxLabel;
  const hitboxBar = document.getElementById('charCardHitboxBar');
  if (hitboxBar) hitboxBar.style.width = `${data.hitboxScore * 10}%`;

  // Weapon
  const wIcon = document.getElementById('charCardWeaponIcon');
  if (wIcon) wIcon.textContent = data.weaponIcon;
  const wName = document.getElementById('charCardWeaponName');
  if (wName) wName.textContent = data.weaponName;
  const wDetails = document.getElementById('charCardWeaponDetails');
  if (wDetails) wDetails.textContent = `${data.weaponDamage} Schaden · alle ${data.weaponCd}s`;
  const wSpecs = document.getElementById('charCardWeaponSpecs');
  if (wSpecs) wSpecs.textContent = data.weaponSpeed;

  // Special
  const sIcon = document.getElementById('charCardSpecialIcon');
  if (sIcon) sIcon.textContent = data.specialIcon;
  const sName = document.getElementById('charCardSpecialName');
  if (sName) sName.textContent = data.specialName;
  const sDesc = document.getElementById('charCardSpecialDesc');
  if (sDesc) sDesc.textContent = data.specialDesc;
  const sEqualizer = document.getElementById('charCardSpecialEqualizer');
  if (sEqualizer) sEqualizer.textContent = data.specialEqualizer;

  // Tactic
  const tacticEl = document.getElementById('charCardTactic');
  if (tacticEl) tacticEl.textContent = data.tactic;

  // Play Button
  const playBtn = document.getElementById('charCardPlayBtn');
  if (playBtn) {
    playBtn.disabled = !isActorUnlocked(key);
    playBtn.textContent = isActorUnlocked(key) ? `⚔️ MIT ${data.name.toUpperCase()} KÄMPFEN! 🥊` : '🔒 NOCH NICHT FREIGESCHALTET';
  }
}

// Event Listeners initialisieren
function initCharCardUi() {
  const closeBtn = document.getElementById('charCardCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeCharCard);

  const backdrop = document.getElementById('charCardBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeCharCard);

  const prevBtn = document.getElementById('charCardPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCharIndex = (currentCharIndex - 1 + CHAR_ORDER.length) % CHAR_ORDER.length;
      renderCurrentCharCard();
    });
  }

  const nextBtn = document.getElementById('charCardNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCharIndex = (currentCharIndex + 1) % CHAR_ORDER.length;
      renderCurrentCharCard();
    });
  }

  const playBtn = document.getElementById('charCardPlayBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const key = CHAR_ORDER[currentCharIndex];
      closeCharCard();
      if (typeof chooseAndStart === 'function') {
        chooseAndStart(key);
      }
    });
  }

  // Tastatur: ESC schließt, Pfeiltasten blättern
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('charCardModal');
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') closeCharCard();
    else if (e.key === 'ArrowLeft') {
      currentCharIndex = (currentCharIndex - 1 + CHAR_ORDER.length) % CHAR_ORDER.length;
      renderCurrentCharCard();
    } else if (e.key === 'ArrowRight') {
      currentCharIndex = (currentCharIndex + 1) % CHAR_ORDER.length;
      renderCurrentCharCard();
    }
  });

  // Verbinde alle Startbildschirm-Kacheln in pickGrid
  const pickGridEl = document.getElementById('pickGrid');
  if (pickGridEl) {
    pickGridEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.pick-btn');
      if (!btn) return;
      const charName = btn.dataset.name;
      if (charName) {
        e.preventDefault();
        e.stopPropagation();
        openCharCard(charName);
      }
    }, true); // Capture phase, damit es vor chooseAndStart abfängt und die Karte öffnet!
  }
}

// Beim Laden starten
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharCardUi);
} else {
  initCharCardUi();
}
