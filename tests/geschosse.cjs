// Ohne Installation: node tests/geschosse.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Matter = require('../matter.min.js');
const world = vm.createContext({
  ...Matter, console, performance, Math, document: { hidden: false },
  teamMode: false, TEAM_BITS: { mine:256, enemy:512 }, MINI_BIT: 1024, width: 1400, height: 900, isPaused: false,
  engine: Matter.Engine.create(), actors: {},
  mapScale: () => 0.72, battleRunning: () => true, isStunned: () => false,
  isAlive: n => Boolean(world.actors[n]), targetOf: () => 'corn',
  decoyFor: () => null, playAttackSound: () => {},
  actorCfg: (n, key) => vm.runInContext(`GAME_CONFIG.${n}${key}`, world),
  leadPosition: (n, frames, lead) => ({
    x: world.actors[n].body.position.x + 0.7 * frames * lead,
    y: world.actors[n].body.position.y - 0.2 * frames * lead
  })
});
for (const file of ['config.js', 'geschosse.js', 'bombs.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), world);
}
const run = source => vm.runInContext(source, world);
world.engine.gravity.y = 0.9;
Matter.Events.on(world.engine, 'beforeUpdate', world.bewegeGeschosse);
const names = run('Object.keys(CHAR_STATS)');
for (const [i, name] of names.entries()) {
  world.actors[name] = { body: Matter.Bodies.circle(150 + i * 40, 450, 20), category: 4 << i, lastThrow: -Infinity };
}
Matter.Body.setPosition(world.actors.corn.body, { x: 1000, y: 300 });
let flights = 0;
for (const name of names) {
  for (const charge of [0, 0.5, 1]) {
    for (const free of [false, true]) {
      run('clearAllBodies()');
      world.testName = name;
      world.testCharge = charge;
      world.testFree = free;
      const plan = run(`(() => {
        const opts = normalerWurf(testName, testCharge);
        if (testFree) opts.aimPoint = { x: 1200, y: 200 };
        launchArc(testName, testName === 'corn' ? 'kobold' : 'corn', opts);
        return fallingBodies[0].customData.flugplan;
      })()`);
      const body = run('fallingBodies[0]');
      let frame = 0;
      // Wechselnde Bildraten: Vorschau und echte Matter-Position bleiben gleich.
      for (const dt of Array.from({ length: 25 }, (_, i) => [8, 16, 23, 12][i % 4])) {
        Matter.Engine.update(world.engine, dt);
        frame += dt / (1000 / 60);
        const expected = world.punktAufFlugbahn(plan, Math.min(frame, body.customData.zuendBild || Infinity));
        assert.ok(Math.hypot(body.position.x - expected.x, body.position.y - expected.y) < 1e-7);
      }
      if (free) {
        // Maus/Finger wählt den Landungsort. Aufladen darf diesen nicht verschieben.
        const landung = world.punktAufFlugbahn(plan, plan.flugBilder);
        assert.ok(Math.hypot(landung.x - 1200, landung.y - 200) < 1e-7);
      } else {
        const endpoint = world.punktAufFlugbahn(plan, plan.flugBilder);
        assert.ok(Number.isFinite(endpoint.x) && Number.isFinite(endpoint.y));
      }
      flights++;
    }
  }
}
run('clearAllBodies()');
assert.equal(world.naechsteWaffe('fledermaus'), 'spear');
for (let i = 0; i < 50; i++) world.normalerWurf('fledermaus');
assert.equal(world.naechsteWaffe('fledermaus'), 'spear');
world.shootBomb('fledermaus', 'corn');
assert.equal(world.naechsteWaffe('fledermaus'), 'flail');
world.shootBomb('fledermaus', 'corn'); // Cooldown darf keine Waffe überspringen.
assert.equal(world.naechsteWaffe('fledermaus'), 'flail');
world.actors.fledermaus.lastThrow = -Infinity;
world.shootBomb('fledermaus', 'corn');
assert.equal(world.naechsteWaffe('fledermaus'), 'spear');
assert.equal(world.normalerWurf('fledermaus').damage, 1.2);
run('GAME_CONFIG.waffenProfile.spear.schaden = 0');
assert.equal(world.normalerWurf('fledermaus').damage, 0);
run('GAME_CONFIG.waffenProfile.spear.schaden = 9');
assert.equal(world.normalerWurf('fledermaus').damage, 9);
run('clearAllBodies()');
world.launchArc('kobold', 'corn', { size: 25, emoji: '🍿', damage: 4, special: true, flightFrames: 36 });
assert.equal(run('fallingBodies[0].customData.flugplan'), null);
const legacy = run('fallingBodies[0]');
const originalY = legacy.position.y, originalVy = legacy.velocity.y;
Matter.Engine.update(world.engine, 1000 / 60);
assert.ok(Math.abs(legacy.position.y - originalY - originalVy - 0.25) < 1e-8);
console.log(`PASS: ${flights} flights match Matter at varying frame rates; weapon sequence, cooldown, damage overrides and legacy special arcs`);

// Trefferfolgen getrennt prüfen: Ein kleiner Ersatz für applyHit zeichnet Schäden auf.
// Die echte Verdrahtung mit physics.js wird zusätzlich im Browser geprüft.
world.versteckteFiguren = new Set();
world.teams = {};
world.treffer = [];
world.isHidden = figur => world.versteckteFiguren.has(figur);
world.teamOf = figur => world.teams[figur] || 'mine';
world.playSound = () => {};
world.spawnParticles = () => {};
world.applyHit = (ziel, werfer, schaden, spezial) => {
  if (world.isHidden(ziel)) return;
  world.actors[ziel].hp -= schaden;
  world.treffer.push({ ziel, werfer, schaden, spezial });
};
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/trefferfolgen.js'), 'utf8'), world);
run('clearAllBodies()');
world.teamMode = true;
for (const figur of names) {
  world.actors[figur].hp = 100;
  Matter.Body.setPosition(world.actors[figur].body, { x: 1300, y: 100 });
}
for (const figur of ['corn','katze','goblin']) world.teams[figur] = 'enemy';
Matter.Body.setPosition(world.actors.corn.body, { x: 530, y: 500 });
Matter.Body.setPosition(world.actors.katze.body, { x: 520, y: 520 });
Matter.Body.setPosition(world.actors.maus.body, { x: 520, y: 500 }); // Freund im Kreis.
Matter.Body.setPosition(world.actors.goblin.body, { x: 520, y: 500 }); // Versteckter Feind.
world.versteckteFiguren.add('goblin');
// Explosionen unabhängig von der aktuell ausgerüsteten Kobold-Waffe prüfen.
const testBombe = { ...world.normalerWurf('kobold'), weapon: 'bomb', damage: 4, explosionsRadius: run('GAME_CONFIG.waffenProfile.bomb.explosionsRadius') * 0.72 };
world.launchArc('kobold', 'corn', testBombe);
const bombe = run('fallingBodies[0]');
Matter.Body.setPosition(bombe, { x: 500, y: 500 });
world.explodeBomb(bombe);
world.explodeBomb(bombe); // Zweites Ereignis darf keinen doppelten Schaden verursachen.
assert.equal(world.treffer.length, 2);
assert.equal(world.actors.corn.hp, 96);
assert.equal(world.actors.katze.hp, 96);
assert.equal(world.actors.maus.hp, 100);
assert.equal(world.actors.goblin.hp, 100);
world.teamMode = false;
world.versteckteFiguren.clear();
world.actors.corn.hp = 100;
const feuer = world.normalerWurf('drache');
world.treffeMitGeschoss('corn', { ...feuer, shooter:'drache' });
assert.equal(world.actors.corn.hp, 97);
world.aktualisiereTrefferfolgen(250);
world.treffeMitGeschoss('corn', { ...feuer, shooter:'drache', damage:0 });
world.aktualisiereTrefferfolgen(250);
assert.equal(world.actors.corn.hp, 96.5); // Erneuern hat den Tick nicht hinausgeschoben.
assert.equal(run('aktiveTrefferfolgen.size'), 1);
world.isPaused = true;
world.aktualisiereTrefferfolgen(10000);
assert.equal(world.actors.corn.hp, 96.5);
world.isPaused = false;
world.aktualisiereTrefferfolgen(1750);
assert.equal(world.actors.corn.hp, 95);
assert.equal(run('aktiveTrefferfolgen.size'), 0);
const gift = run('GAME_CONFIG.waffenProfile.venom.trefferfolgen[0]');
run('TREFFERFOLGEN').zeitSchaden('corn','maus',gift);
run('TREFFERFOLGEN').zeitSchaden('corn','drache',feuer.trefferfolgen[0]);
assert.equal(run('aktiveTrefferfolgen.size'), 2); // Feuer und Gift dürfen zusammen wirken.
world.loescheTrefferfolgen();
assert.equal(run('aktiveTrefferfolgen.size'), 0);
assert.equal(run('explosionsWellen.length'), 0);
// Ein explosiver Wurf zündet auch ohne direkten Gegnerkontakt.
Matter.Events.on(world.engine,'afterUpdate',world.zuendeGeschosse);
world.launchArc('kobold','corn',testBombe);
const wurfOhneTreffer = run('fallingBodies[0]');
for(let bild=0; bild<200 && !wurfOhneTreffer.exploded; bild++) Matter.Engine.update(world.engine,1000/60);
assert.equal(wurfOhneTreffer.exploded,true);
console.log('PASS: Explosion trifft alle Gegner einmal, schützt Team und Versteckte; Zeit-Schaden, Erneuern, Pause, Reset und Zündung ohne direkten Treffer');
