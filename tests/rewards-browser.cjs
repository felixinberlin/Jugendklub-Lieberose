const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try{
 for(const [width,height] of [[390,760],[844,390],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.evaluate(()=>{requestGameFullscreen=()=>{};welcomeNameScreen.classList.remove('active');startScreen.classList.add('active');updateCpu=()=>{};});
  if(width<height)await page.setViewportSize({width:760,height:390});
  assert.equal(await page.locator('#teamModeBtn,#pauseBtn,#pauseScreen,#hitsChoice,#modeHitsChoice,.hits-btn').count(),0);
  const mainDims=await page.locator('#startScreen').evaluate(el=>[el.clientWidth,el.scrollWidth,el.clientHeight,el.scrollHeight]);
  assert.equal(mainDims[0],mainDims[1]);assert.equal(mainDims[2],mainDims[3]);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-rewards-menu-${width}.png`)});
  await page.evaluate(()=>{starterActor='corn';refreshMainMenu();});
  await page.locator('#mainPlayBtn').click();
  assert.equal(await page.locator('#playTrophyBtn').textContent(),'🏅 RANGLISTE SPIELEN');
  assert.equal(await page.locator('#modeScreen').innerText().then(t=>t.includes('MIT PAUSE')),false);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-rewards-modes-${width}.png`)});
  await page.locator('#playNormalBtn').click();
  await page.keyboard.press('p');await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>isPaused),false);
  const crossing=await page.evaluate(()=>{
   clearAllBodies();for(const n in actors)moveActor(n,100,80);
   launchArc('corn','kobold',normalerWurf('corn'));
   launchArc('kobold','corn',normalerWurf('kobold'));
   const [a,b]=fallingBodies;const mid=width/2;
   for(const [bomb,x,vx] of [[a,mid-50,5],[b,mid+50,-5]]){
    bomb.customData.flugplan=null;Body.setPosition(bomb,{x,y:height/2});Body.setVelocity(bomb,{x:vx,y:0});
   }
   const gravity=engine.gravity.y;engine.gravity.y=0;
   for(let i=0;i<30;i++)Engine.update(engine,1000/60);
   engine.gravity.y=gravity;
   Events.trigger(engine,'collisionStart',{pairs:[{bodyA:a,bodyB:b}]});
   return {passed:a.position.x>b.position.x,remain:fallingBodies.includes(a)&&fallingBodies.includes(b),exploded:!!a.exploded||!!b.exploded};
  });
  assert.deepEqual(crossing,{passed:true,remain:true,exploded:false});
  const results=await page.evaluate(()=>{
   shopWallet.coins=0;trophiesData.total=0;trophiesData.solo=0;trophiesData.actors={};
   const states=[];
   for(const ranked of [false,true]){
    trophyMode=ranked;startSoloGame('corn');
    const hp=actors.corn.maxHp;
    for(const n of Object.keys(actors).filter(n=>n!=='corn'&&isAlive(n)))applyHit(n,'corn',10000,false);
    const once=[shopWallet.coins,trophiesData.total];endGame('corn');awardLevelTrophies(true);
    states.push({ranked,won:true,coins:shopWallet.coins,trophies:trophiesData.total,once,hp});
    startSoloGame('corn');applyHit('corn','kobold',10000,false);
    states.push({ranked,won:false,coins:shopWallet.coins,trophies:trophiesData.total});
   }
   return states;
  });
  assert.deepEqual(results,[
   {ranked:false,won:true,coins:200,trophies:1,once:[200,1],hp:100},
   {ranked:false,won:false,coins:200,trophies:1},
   {ranked:true,won:true,coins:400,trophies:1,once:[400,1],hp:100},
   {ranked:true,won:false,coins:400,trophies:1}
  ]);
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>[shopWallet.coins,trophiesData.total]),[400,1]);
  assert.deepEqual(errors,[]);
  console.log(`${width}×${height}: Belohnungen beider Modi, Niederlagen, keine Doppelbelohnung, Speicherung, feste Leben, keine Pause/Team-Auswahl & kreuzende Waffen OK`);
  await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
