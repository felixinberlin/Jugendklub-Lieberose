const assert = require('node:assert/strict');
// Optionaler Browser-Test: Playwright muss auf diesem Rechner vorhanden sein.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const os = require('node:os');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
 try {
  for (const [width,height] of [[390,760],[844,390],[1440,900]]) {
   const page = await browser.newPage({viewport:{width,height},hasTouch:true});
   const errors = [];
   page.on('pageerror', e => errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
   await page.evaluate(() => {
    requestGameFullscreen = () => {};
    document.getElementById('welcomeNameScreen').classList.remove('active');
    playerActor = 'fledermaus'; playerTeam=['fledermaus']; teamMode=false; trophyMode=false;
    startGame();
    updateCpu = () => {}; updateFootballers = () => {};
    for (const n in actors) cpuNextThrow[n] = Infinity;
   });
   if (await page.locator('#dismissRotateBtn').isVisible()) await page.locator('#dismissRotateBtn').click();
   assert.equal(await page.evaluate(()=>naechsteWaffe('fledermaus')),'spear');
   // Auch auf Touch einen Gegner direkt auswählen und beim Loslassen werfen.
   const beruehrungsZiel = await page.evaluate(() => {
    const figur = aimCandidates()[0];
    moveActor('fledermaus',width*.2,height*.75);
    for (const name of aimCandidates()) Body.setPosition(actors[name].body,{x:width*.85,y:height*.8});
    Body.setPosition(actors[figur].body,{x:width*.5,y:height*.55});
    return { figur, x:width*.5*viewZoom(), y:height*.55*viewZoom() };
   });
   await page.waitForTimeout(50); // Figuren-Knöpfe an die neuen Plätze zeichnen lassen.
   await page.touchscreen.tap(beruehrungsZiel.x,beruehrungsZiel.y);
   assert.equal(await page.evaluate(()=>aimTarget),beruehrungsZiel.figur);
   assert.equal(await page.evaluate(()=>naechsteWaffe('fledermaus')),'flail');
   await page.evaluate(()=>startGame());
   let box = await page.locator('#aimModeBtn').boundingBox();
   assert.ok(box.width>=44 && box.height>=44 && box.y>=0 && box.y+box.height<height);
   await page.locator('#aimModeBtn').click();
   assert.equal(await page.evaluate(()=>zielModus),'frei');
   assert.equal(await page.locator('#targetBtn').isVisible(),false);
   await page.evaluate(()=>{setzeFreiesZiel(width*.6,height*.25);actors.fledermaus.lastThrow=-Infinity;});
   let shoot = await page.locator('#shootBtn').boundingBox();
   const x=shoot.x+shoot.width/2, y=shoot.y+shoot.height/2;
   // Echte Touch-Ereignisse: gedrückt halten, ziehen und loslassen.
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-40,y:y-18,id:1}]});
   await page.waitForTimeout(80);
   const held=await page.evaluate(()=>({active:Boolean(aim),point:freierZielpunkt(),start:aim?.freierStart,input:aim?.eingabe,mode:zielModus}));
   assert.equal(held.active,true);
   assert.ok(Math.hypot(held.point.x-held.start.x,held.point.y-held.start.y)>10);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.evaluate(()=>aim),null);
   assert.equal(await page.evaluate(()=>naechsteWaffe('fledermaus')),'flail');
   // Abbrechen wirft nicht. Neustart setzt die erste Waffe der Figur zurück.
   await page.evaluate(()=>{startAim(55);cancelAim();startGame();});
   assert.equal(await page.evaluate(()=>naechsteWaffe('fledermaus')),'spear');
   assert.equal(await page.evaluate(()=>zielModus),'frei');
   // Q wechselt zurück; Halten lädt auf, Loslassen wirft auf das gebundene Ziel.
   await page.keyboard.press('q');
   assert.equal(await page.evaluate(()=>zielModus),'gebunden');
   shoot=await page.locator('#shootBtn').boundingBox();
   await page.mouse.move(shoot.x+shoot.width/2,shoot.y+shoot.height/2);
   await page.mouse.down();
   await page.waitForTimeout(280);
   assert.equal(await page.evaluate(()=>isAiming(performance.now())),true);
   await page.mouse.up();
   assert.equal(await page.evaluate(()=>aim),null);
   const lock=await page.evaluate(()=>({next:naechsteWaffe('fledermaus'),target:fallingBodies.at(-1)?.customData.target,free:fallingBodies.at(-1)?.customData.flugplan.frei}));
   assert.equal(lock.next,'flail');assert.ok(lock.target);assert.equal(lock.free,false);
   await page.screenshot({path:path.join(os.tmpdir(),`jugend-aim-${width}.png`)});
   // Die Anleitung lässt sich aus einer pausierten Runde öffnen und am Handy lesen.
   await page.evaluate(()=>pauseGame());
   const [anleitung] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator('#pauseScreen a[href^="spielanleitung.html"]').click()
   ]);
   await anleitung.waitForLoadState();
   assert.equal(await anleitung.locator('html').getAttribute('lang'),'de');
   assert.equal(await anleitung.locator('#zielen').count(),1);
   assert.equal(await anleitung.locator('#frei').count(),1);
   assert.equal(await anleitung.locator('#tipps').count(),1);
   assert.equal(await anleitung.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await anleitung.close();
   // Treffer, Freundschutz, Wände und vorhandene Spezialkräfte prüfen.
   const interactions = await page.evaluate(()=>{
    clearAllBodies();
    playerActor='kobold';playerTeam=['kobold'];teamMode=false;startGame();
    moveActor('kobold',width*.25,height*.5);
    const victim=Object.keys(actors).find(n=>n!=='kobold'&&isAlive(n));
    moveActor(victim,width*.65,height*.5);
    const before=actors[victim].hp;
    shootBomb('kobold',victim); const bomb=fallingBodies[0];
    Body.setPosition(bomb,actors[victim].body.position);
    Events.trigger(engine,'collisionStart',{pairs:[{bodyA:bomb,bodyB:actors[victim].body}]});
    const hit=actors[victim].hp===before-getCharStat('kobold','attackDamage') && bomb.exploded;
    actors.kobold.lastThrow=-Infinity;shootBomb('kobold',victim);
    const wallBomb=fallingBodies[0];
    Events.trigger(engine,'collisionStart',{pairs:[{bodyA:wallBomb,bodyB:leftWall}]});
    const wall=wallBomb.exploded && !fallingBodies.includes(wallBomb);
    popcorn('corn'); const special=fallingBodies.length===GAME_CONFIG.popcorn.count && fallingBodies.every(b=>!b.customData.flugplan&&b.customData.special);
    clearAllBodies();
    teamMode=true;chosenTeam=['kobold','fledermaus'];playerActor='fledermaus';startGame();
    const clone=Object.keys(actors).find(n=>actors[n].kind);
    const copy=normalerWurf(clone);
    const clones=Boolean(copy.waffenProfil.tempo&&copy.damage);
    const noFriendlyFire=(everyoneExcept('kobold') & TEAM_BITS.mine)===0;
    startAim(99);switchActiveTeamActor('kobold');
    const switching=aim===null&&naechsteWaffe('kobold')==='bomb';
    startAim(100);pauseGame();const paused=aim===null;resumeGame();
    clearAllBodies();
    return {hit,wall,special,clones,noFriendlyFire,switching,paused};
   });
   for(const [name,passed] of Object.entries(interactions)) assert.equal(passed,true,`${name} failed`);
   const physical = await page.evaluate(() => {
    const results = [];
    teamMode=false;
    for(const shooter of Object.keys(CHAR_STATS)) {
     playerActor=shooter;playerTeam=[shooter];startGame();
     const victim=Object.keys(actors).find(n=>n!==shooter&&isAlive(n));
     for(const n in actors) Body.setPosition(actors[n].body,{x:width+1000,y:height*.5});
     Body.setPosition(actors[shooter].body,{x:width*.2,y:height*.55});
     Body.setPosition(actors[victim].body,{x:width*.65,y:height*.55});
     const before=actors[victim].hp;
     shootBomb(shooter,victim);
     const bomb=fallingBodies[0];
     for(let step=0; step<180&&!bomb.exploded; step++) Engine.update(engine,1000/60);
     const damage=Math.round((before-actors[victim].hp)*10)/10;
     results.push({shooter,damage,expected:bomb.customData.damage,hit:Boolean(bomb.exploded)});
     if(shooter==='drache') {
      const charge=actors[shooter].specialCharge;
      aktualisiereTrefferfolgen(2000);
      results.push({shooter:'burn',damage:Math.round((before-damage-actors[victim].hp)*10)/10,expected:2,hit:charge===actors[shooter].specialCharge});
     }
    }
    return results;
   });
   for(const result of physical) {assert.equal(result.hit,true,JSON.stringify(result));assert.equal(result.damage,result.expected,JSON.stringify(result));}
   assert.ok(!(await page.locator('#actionHud').innerText()).includes('undefined'));
   await page.evaluate(()=>{teamMode=false;playerActor='kobold';playerTeam=['kobold'];startGame();});
   await page.screenshot({path:path.join(os.tmpdir(),`jugend-aim-${width}.png`)});
   assert.deepEqual(errors,[]);
   console.log(`${width}×${height}: PASS touch aim/release, charge, mode switch, restart, hits, walls, specials, team copies, team switch, pause; no page errors`);
   await page.close();
  }
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
