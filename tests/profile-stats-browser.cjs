const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const os = require('node:os');
const expected = {
 maus:[2.9,1.2,1],corn:[2.7,1,1],katze:[3,1.3,1],fledermaus:[3.5,1.2,1.1],
 kobold:[3.4,1.3,1.1],musiala:[3.4,1.2,1.1],yamal:[4.2,1.3,1.3],
 goblin:[4.1,1.2,1.3],drache:[5.1,1.2,1.5],zeus:[6.4,1.1,1.6]
};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try {
 for(const [width,height] of [[390,760],[844,390],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});
  // Namen und Testpunkte bleiben ausschließlich im isolierten Browser.
  await context.route('https://**/*',route=>route.abort());
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.evaluate(()=>{requestGameFullscreen=()=>{};welcomeNameScreen.classList.remove('active');startScreen.classList.add('active');updateCpu=()=>{};});
  if(width<height)await page.setViewportSize({width:760,height:390});
  await page.locator('#mainProfileBtn').click();
  assert.equal(await page.locator('#profileScreen').isVisible(),true);
  assert.equal(await page.locator('#settingsScreen').isVisible(),false);
  assert.equal(await page.locator('#profileScreen .mode-card').count(),1);
  assert.equal(await page.locator('#profileScreen #settingsStatsText,#profileScreen a,#settingsDeleteNameBtn').count(),0);
  assert.equal(await page.locator('#settingsNameInput').getAttribute('readonly'),'');
  await page.locator('#settingsNicknameChips .chip-btn').first().click();
  const nickname=await page.locator('#settingsNameInput').inputValue();
  await page.locator('#settingsNameSaveBtn').click();
  await page.waitForFunction(n=>currentPlayerName===n,nickname);
  assert.equal(await page.locator('#profileScreen').isVisible(),true);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-profile-${width}.png`)});
  await page.locator('#profileBackBtn').click();
  await page.locator('#settingsStartBtn').click();
  assert.equal(await page.locator('#settingsScreen').isVisible(),true);
  assert.equal(await page.locator('#settingsScreen input,#settingsScreen select,#settingsScreen .chip-btn').count(),0);
  assert.equal(await page.locator('#settingsScreen #settingsStatsText').count(),1);
  assert.equal(await page.locator('#settingsScreen #creditsStartBtn').count(),1);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-settings-${width}.png`)});
  await page.locator('#settingsBackBtn').click();
  await page.reload();
  assert.equal(await page.evaluate(()=>currentPlayerName),nickname);
  const actual=await page.evaluate(()=>{
   requestGameFullscreen=()=>{};updateCpu=()=>{};welcomeNameScreen.classList.remove('active');
   const results={};
   for(const name of characterOrder()){
    trophyMode=false;startSoloGame(name);
    const victim=Object.keys(actors).find(n=>n!==name&&isAlive(n));
    moveActor(name,width/2,height/2);keysDown.right=true;
    const x=actors[name].body.position.x;updatePlayerControls();keysDown.right=false;
    const distance=actors[name].body.position.x-x;
    const hp=actors[victim].hp;shootBomb(name,victim);
    const first=fallingBodies[0];
    Events.trigger(engine,'collisionStart',{pairs:[{bodyA:first,bodyB:actors[victim].body}]});
    const hit=Math.round((hp-actors[victim].hp)*10)/10;
    const cooldown=getCharStat(name,'attackCooldown');
    actors[name].lastThrow=performance.now()-cooldown*1000+100;
    shootBomb(name,victim);const blocked=fallingBodies.length===0;
    actors[name].lastThrow=performance.now()-cooldown*1000-100;
    shootBomb(name,victim);const next=fallingBodies[0]?.customData.damage;
    openCharCard(name);const card=getCharData(name);
    results[name]={stats:[getCharStat(name,'attackDamage'),cooldown,getCharStat(name,'speed')],hit,next,blocked,distance,
      card:[card.weaponDamage,card.weaponCd,card.speed],details:document.getElementById('charCardWeaponDetails').textContent};
    closeCharCard();
   }
   return results;
  });
  const baseDistance=actual.corn.distance;
  for(const [name,[damage,cooldown,speed]]of Object.entries(expected)){
   const a=actual[name];assert.deepEqual(a.stats,[damage,cooldown,speed],name);
   assert.equal(a.hit,damage,`${name}: echter Treffer`);assert.equal(a.next,damage,`${name}: nächster Wurf`);
   assert.equal(a.blocked,true,`${name}: Wurfpause`);
   assert.ok(Math.abs(a.distance/baseDistance-speed)<1e-6,`${name}: Tempo`);
   assert.deepEqual(a.card,[damage,cooldown,`${speed}× Tempo`]);
   assert.equal(a.details,`${damage} Schaden · alle ${cooldown}s`);
  }
  const print=await context.newPage();await print.goto(pathToFileURL(path.resolve(__dirname,'../druckansicht.html')).href);
  const rows=await print.locator('tbody tr').evaluateAll(rows=>rows.map(row=>Array.from(row.cells,cell=>cell.textContent)));
  const order=['musiala','kobold','corn','maus','katze','goblin','zeus','yamal','fledermaus','drache'];
  rows.forEach((cells,i)=>{const[dmg,cd,speed]=expected[order[i]];assert.equal(cells[2],`${speed}×`);assert.ok(cells[4].includes(`${dmg}`));assert.equal(cells[5],`${cd} s`);});
  assert.deepEqual(errors,[]);
  console.log(`${width}×${height}: Profil/Namensspeicherung, getrennte Einstellungen, echte Treffer aller 10 Figuren, Cooldowns, Tempo, Karten & Drucktabelle OK`);
  await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
