/**
 * 🔊 audio.js – Alle Töne des Spiels
 *
 * Es gibt keine Sounddateien! Jeder Piep und jedes Bumm wird hier
 * live vom Computer berechnet (Web Audio API Synthesizer).
 */

let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playSound(type) {
  if (type === 'point') {
    playTone(600, 'square', 0.08, 0.15);
    setTimeout(() => playTone(880, 'square', 0.12, 0.15), 60);
  } else if (type === 'gem') {
    playTone(750, 'triangle', 0.08, 0.2);
    setTimeout(() => playTone(1200, 'triangle', 0.18, 0.2), 70);
  } else if (type === 'hit') {
    playTone(180, 'sawtooth', 0.3, 0.25);
    setTimeout(() => playTone(90, 'sawtooth', 0.3, 0.25), 50);
  } else if (type === 'bounce') {
    playTone(320, 'sine', 0.05, 0.08);
  } else if (type === 'throw') {
    playTone(300, 'triangle', 0.1, 0.15);
    setTimeout(() => playTone(500, 'triangle', 0.1, 0.15), 60);
  } else if (type === 'coin') {
    // 🧌🪙 Kobold-Angriff: helles Münzen-Klimpern!
    playTone(1320, 'sine', 0.07, 0.16);
    setTimeout(() => playTone(1760, 'sine', 0.11, 0.16), 45);
    setTimeout(() => playTone(2090, 'triangle', 0.09, 0.12), 95);
  } else if (type === 'cornpop') {
    // 🌽🍿 Mais-Angriff: knackiges Popcorn-Pop!
    playTone(920, 'square', 0.035, 0.16);
    setTimeout(() => playTone(480, 'triangle', 0.045, 0.14), 28);
  } else if (type === 'catthrow') {
    // 🐱🐟 Katzen-Angriff: kurzes Miau-Platsch!
    playTone(680, 'triangle', 0.07, 0.14);
    setTimeout(() => playTone(520, 'sine', 0.09, 0.13), 50);
  } else if (type === 'mousethrow') {
    // 🐭🧀 Maus-Angriff: hohes Piepsen!
    playTone(1500, 'sine', 0.045, 0.13);
    setTimeout(() => playTone(1850, 'sine', 0.05, 0.13), 40);
  } else if (type === 'firethrow') {
    // 👺🔥 Goblin-Angriff: fauchender Feuerball!
    playTone(190, 'sawtooth', 0.11, 0.16);
    setTimeout(() => playTone(130, 'sawtooth', 0.1, 0.14), 45);
  } else if (type === 'kick') {
    // ⚽👟 Musiala-Angriff: satter Fußball-Schuss!
    playTone(135, 'sine', 0.09, 0.24);
    setTimeout(() => playTone(260, 'triangle', 0.06, 0.14), 30);
  } else if (type === 'rain') {
    playTone(900, 'sine', 0.06, 0.1);
    setTimeout(() => playTone(700, 'sine', 0.06, 0.1), 70);
    setTimeout(() => playTone(1000, 'sine', 0.06, 0.1), 140);
  } else if (type === 'night') {
    playTone(520, 'triangle', 0.15, 0.15);
    setTimeout(() => playTone(330, 'triangle', 0.2, 0.15), 100);
  } else if (type === 'day') {
    playTone(330, 'triangle', 0.15, 0.15);
    setTimeout(() => playTone(660, 'triangle', 0.2, 0.15), 100);
  } else if (type === 'sixseven') {
    playTone(600, 'square', 0.12, 0.15);  // „Six…“
    setTimeout(() => playTone(700, 'square', 0.16, 0.15), 160); // „…seven!“
  } else if (type === 'ready') {
    playTone(660, 'triangle', 0.1, 0.15);  // 🔔 Spezialkraft bereit!
    setTimeout(() => playTone(990, 'triangle', 0.15, 0.15), 90);
  } else if (type === 'hide') {
    // 🐭🕳️ Maus versteckt sich: schnelles Flitz-Piepsen abwärts!
    playTone(1600, 'sine', 0.05, 0.14);
    setTimeout(() => playTone(1100, 'sine', 0.06, 0.13), 45);
    setTimeout(() => playTone(450, 'triangle', 0.1, 0.12), 90);
  } else if (type === 'popcorn') {
    // 🌽🍿 Mais-Spezial: ganz viele knackige Popcorn-Pops hintereinander!
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        playTone(800 + Math.random() * 650, 'square', 0.035, 0.14);
        setTimeout(() => playTone(420 + Math.random() * 250, 'triangle', 0.04, 0.12), 22);
      }, i * 42);
    }
  } else if (type === 'spear') {
    // 👺🔥 Goblin-Feuerspeer: donnerndes Feuer-Zischen!
    playTone(160, 'sawtooth', 0.16, 0.2);
    setTimeout(() => playTone(320, 'sawtooth', 0.14, 0.16), 50);
    setTimeout(() => playTone(580, 'sawtooth', 0.12, 0.14), 100);
  } else if (type === 'bigball') {
    // ⚽ Musiala-Riesenball: Anpfiff + Mega-Schuss!
    playTone(1450, 'sine', 0.09, 0.16);
    setTimeout(() => playTone(110, 'square', 0.22, 0.26), 85);
    setTimeout(() => playTone(240, 'triangle', 0.16, 0.2), 140);
  } else if (type === 'minis') {
    // 🧌🪙 Mini-Kobolde: dreifaches Goldmünzen-Klingeln!
    playTone(1200, 'sine', 0.07, 0.15);
    setTimeout(() => playTone(1500, 'sine', 0.07, 0.15), 55);
    setTimeout(() => playTone(1850, 'sine', 0.09, 0.16), 110);
    setTimeout(() => playTone(2200, 'triangle', 0.12, 0.15), 165);
  } else if (type === 'jump') {
    playTone(420, 'triangle', 0.09, 0.16);
    setTimeout(() => playTone(840, 'sine', 0.12, 0.16), 65);
  } else if (type === 'whirl') {
    playTone(250, 'sawtooth', 0.25, 0.14);
    setTimeout(() => playTone(380, 'sawtooth', 0.2, 0.12), 85);
  } else if (type === 'scratch') {
    // 🐉🐾 Drachen-Kratzspur: scharfer Krallen-Hieb!
    playTone(980, 'sawtooth', 0.055, 0.15);
    setTimeout(() => playTone(620, 'sawtooth', 0.075, 0.15), 38);
    setTimeout(() => playTone(390, 'sawtooth', 0.08, 0.13), 75);
  } else if (type === 'bite') {
    // 🐉🦷 Drachenbiss: tiefes Drachen-Schnappen!
    playTone(135, 'sawtooth', 0.15, 0.25);
    playTone(88, 'square', 0.17, 0.22);
    setTimeout(() => playTone(210, 'sawtooth', 0.08, 0.18), 60);
  } else if (type === 'zap') {
    // ⚡ Zeus-Blitzschuss: elektrisches Zischen!
    playTone(1750, 'sawtooth', 0.045, 0.16);
    setTimeout(() => playTone(920, 'square', 0.055, 0.15), 28);
    setTimeout(() => playTone(1420, 'sawtooth', 0.04, 0.13), 55);
  } else if (type === 'thunder') {
    // 🌩️ Zeus-Gewittersturm: Donnergrollen + Blitzschlag!
    playTone(1650, 'sawtooth', 0.06, 0.18);
    playTone(95, 'sawtooth', 0.28, 0.24);
    setTimeout(() => playTone(68, 'square', 0.26, 0.22), 70);
  } else if (type === 'boom') {
    playTone(120, 'sawtooth', 0.28, 0.28);
    playTone(70, 'square', 0.28, 0.2);
  }
}

// 🎵 Passender Sound für den normalen Angriff jeder Figur
function playAttackSound(actorName) {
  const kind = kindOf(actorName);
  const map = {
    kobold: 'coin',      // 🪙 Münzen-Klimpern
    corn: 'cornpop',     // 🍿 Popcorn-Pop
    katze: 'catthrow',   // 🐱🐟 Miau-Wurf
    maus: 'mousethrow',  // 🐭🧀 Maus-Pieps
    goblin: 'firethrow', // 👺🔥 Feuerball
    musiala: 'kick',     // ⚽ Fußball-Kick
    drache: 'scratch',   // 🐉🐾 Krallen-Kratzer
    zeus: 'zap'          // ⚡ Elektrischer Blitz
  };
  playSound(map[kind] || 'throw');
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
});
