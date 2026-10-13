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
  } else if (type === 'popcorn') {
    for (let i = 0; i < 5; i++) setTimeout(() => playTone(700 + Math.random() * 600, 'square', 0.04, 0.1), i * 45); // Pop-pop-pop!
  } else if (type === 'spear') {
    playTone(200, 'sawtooth', 0.15, 0.15);  // Wusch!
    setTimeout(() => playTone(500, 'sawtooth', 0.12, 0.12), 60);
  } else if (type === 'bigball') {
    playTone(150, 'square', 0.2, 0.25);  // Wumms!
    setTimeout(() => playTone(300, 'square', 0.15, 0.2), 80);
  } else if (type === 'minis') {
    playTone(900, 'triangle', 0.06, 0.12);
    setTimeout(() => playTone(1100, 'triangle', 0.06, 0.12), 60);
    setTimeout(() => playTone(1300, 'triangle', 0.06, 0.12), 120);
  } else if (type === 'jump') {
    playTone(400, 'sine', 0.1, 0.15);
    setTimeout(() => playTone(800, 'sine', 0.12, 0.15), 70);
  } else if (type === 'whirl') {
    playTone(250, 'sawtooth', 0.25, 0.12);
    setTimeout(() => playTone(350, 'sawtooth', 0.2, 0.1), 90);
  } else if (type === 'boom') {
    playTone(120, 'sawtooth', 0.28, 0.28);
    playTone(70, 'square', 0.28, 0.2);
  }
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
});
