const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const os=require('node:os');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try{
 for(const [width,height]of [[390,760],[844,390],[1440,900],[568,320]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});await context.route('https://**/*',r=>r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
  await page.goto(url);
  await page.evaluate(()=>{welcomeNameScreen.classList.remove('active');startScreen.classList.add('active');requestGameFullscreen=()=>{};updateCpu=()=>{};});
  if(width<height)await page.setViewportSize({width:760,height:390});
  await page.locator('#charactersStartBtn').click();await page.locator('[data-starter="corn"]').click();
  await page.locator('#charCardCloseBtn').click();await page.locator('#charactersBackBtn').click();
  const hp=await page.evaluate(()=>Object.fromEntries(characterOrder().map(n=>[n,getCharStat(n,'hp')])));
  assert.deepEqual(hp,{corn:100,katze:100,maus:100,kobold:110,fledermaus:110,musiala:110,goblin:120,yamal:120,drache:130,zeus:140});
  const bonus=await page.evaluate(()=>{
   const before=getCharStat('corn','attackDamage');characterProgress.corn.xp=10;upgradeCharacter('corn');
   const after=getCharStat('corn','attackDamage');
   const card=getCharData('corn').weaponDamage;
   playerActor='maus';playerTeam=['maus'];const bot=normalerWurf('corn').damage;
   characterProgress.corn.level=1;saveShopWallet();return{before,after,card,bot};
  });
  assert.deepEqual(bonus,{before:2.7,after:2.8,card:2.8,bot:2.7});
  await page.evaluate(()=>{currentPlayerName='🦉 Todesmutiger-Waldläufer';refreshMainMenu();});
  for(const id of ['mainProfileBtn','shopStartBtn','charactersStartBtn','mainRankBtn','mainPlayBtn']){
   const b=await page.locator('#'+id).boundingBox();const vp=page.viewportSize();
   assert.ok(b.width>=44&&b.height>=44&&b.x>=0&&b.y>=0&&b.x+b.width<=vp.width+1&&b.y+b.height<=vp.height+1,id);
  }
  assert.ok((await page.locator('#mainPlayBtn').boundingBox()).height<=116);
  assert.ok((await page.locator('#shopStartBtn').boundingBox()).height<=136);
  assert.equal(await page.locator('#startScreen').evaluate(el=>el.scrollWidth===el.clientWidth&&el.scrollHeight===el.clientHeight),true);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-compact-${width}.png`)});
  await page.locator('#mainPlayBtn').click();assert.equal(await page.evaluate(()=>isPlaying&&!trophyMode),true);
  assert.equal(await page.locator('#modeScreen').isVisible(),false);
  await page.evaluate(()=>{isPlaying=false;spectating=false;startScreen.classList.add('active');});
  await page.locator('#mainRankBtn').click();assert.equal(await page.evaluate(()=>isPlaying&&trophyMode),true);
  assert.equal(await page.locator('#modeScreen').isVisible(),false);
  assert.equal(await page.evaluate(()=>actors.corn.maxHp),100);
  await page.evaluate(()=>{isPlaying=false;spectating=false;startScreen.classList.add('active');});
  await page.locator('#shopStartBtn').click();
  assert.equal(await page.locator('#dailyChestBtn').isEnabled(),true);
  const clock=await page.evaluate(()=>{window.testNow=Date.now();Date.now=()=>testNow;Math.random=()=>0;return testNow;});
  const coins=await page.evaluate(()=>shopWallet.coins);
  await page.locator('#dailyChestBtn').click();
  assert.equal(await page.locator('#openingChest').isVisible(),true);
  assert.equal(await page.locator('#lootResults .loot-item').count(),0);
  assert.equal(await page.locator('#lootNextBtn').isDisabled(),true);
  assert.equal(await page.evaluate(()=>claimDailyChest(()=>0)),false);
  await page.waitForTimeout(450);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-opening-${width}.png`)});
  await page.waitForFunction(()=>currentLoot&&!currentLoot.opening);
  assert.equal(await page.locator('#lootResults .loot-item').count(),1);
  assert.equal(await page.locator('#lootResults').innerText().then(t=>t.includes('5 XP für Mais')),true);
  assert.equal(await page.locator('#lootSummary').textContent(),'Belohnung 1 von 4');
  await page.locator('#lootNextBtn').click();assert.equal(await page.locator('#lootSummary').textContent(),'Belohnung 2 von 4');
  assert.equal(await page.locator('#lootResults .loot-item').count(),1);
  assert.equal(await page.locator('#lootScreen').evaluate(el=>el.scrollHeight===el.clientHeight),true);
  const titleBox=await page.locator('#lootTitle').boundingBox();
  assert.ok(titleBox.y>=0 && titleBox.height>=24);
  await page.waitForTimeout(300);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-single-loot-${width}.png`)});
  await page.locator('#lootNextBtn').click();await page.locator('#lootNextBtn').click();await page.locator('#lootCloseBtn').click();
  assert.equal(await page.evaluate(()=>shopWallet.coins),coins);
  assert.equal(await page.evaluate(()=>shopWallet.nextFreeChestAt),clock+86400000);
  assert.equal(await page.locator('#dailyChestBtn').isDisabled(),true);
  await page.reload();
  assert.equal(await page.evaluate(()=>freeChestRemaining()>0),true);
  const limit=await page.evaluate(()=>shopWallet.nextFreeChestAt);
  const boundary=await page.evaluate(limit=>{
   window.testNow=limit-1;Date.now=()=>testNow;
   const blocked=claimDailyChest(()=>0);const wait=freeChestRemaining();
   testNow=limit;GAME_CONFIG.lootOpenMs=0;
   const opened=claimDailyChest(()=>0);return{blocked,wait,opened,next:shopWallet.nextFreeChestAt};
  },limit);
  assert.deepEqual(boundary,{blocked:false,wait:1,opened:true,next:limit+86400000});
  await page.waitForFunction(()=>currentLoot&&!currentLoot.opening);
  await page.evaluate(()=>{while(revealNextLootItem()){};closeLootResults();});
  // Auch ein zweiter Tab darf die laufenden 24 Stunden nicht neu beanspruchen.
  const second=await context.newPage();await second.goto(url);
  assert.equal(await second.evaluate(()=>claimDailyChest(()=>0)),false);
  assert.deepEqual(errors,[]);
  console.log(`${width}×${height}: HP, Upgrade-Schaden ohne Bot-Bonus, Direktstart, kompakte Knöpfe, Öffnungsanimation, einzelne Items & 24h-Gratis-Kiste mit Speicherung OK`);
  await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
