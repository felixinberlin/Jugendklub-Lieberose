/**
 * 🧠 state.js – Das Gedächtnis des Spiels
 *
 * Alles, was mehrere Dateien gemeinsam brauchen: die Zeichenfläche (Canvas),
 * die HTML-Elemente, die Spielfeldgröße und der Punktestand.
 */

// Matter.js Module
const { Engine, Bodies, Body, Composite, Events } = Matter;

// Canvas & DOM Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const newRecordMsgEl = document.getElementById('newRecordMsg');
const winnerMsgEl = document.getElementById('winnerMsg');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const changeBtn = document.getElementById('changeBtn');
const soundToggle = document.getElementById('soundToggle');

// Dimensions & DPR Handling
let width = 360;
let height = 640;

// Game State
let isPlaying = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('lieberose_highscore') || '0', 10);
highScoreEl.textContent = highScore;

// Matter.js Physik-Welt (wird in physics.js gebaut)
let engine;
