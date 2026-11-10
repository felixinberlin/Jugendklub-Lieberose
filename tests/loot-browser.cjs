const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const os=require('node:os');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try{
 for(const [width,height]of [[390,760],[844,390],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});
  await context.route('https://**/*',route=>route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.evaluate(()=>{welcomeNameScreen.classList.remove('active');startScreen.classList.add('active');requestGameFullscreen=()=>{};});
  if(width<height)await page.setViewportSize({width:760,height:390});
  await page.locator('#charactersStartBtn').click();
  await page.locator('[data-starter="corn"]').click();await page.locator('#charCardCloseBtn').click();
  await page.locator('#charactersBackBtn').click();await page.locator('#shopStartBtn').click();
  assert.equal(await page.locator('.chest-stock').count(),0);
  const distribution=await page.evaluate(()=>{
   const seed=initial=>{let s=initial;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
   const rng=seed(1234);const counts={};
   for(let i=0;i<10000;i++){const n=xpRecipient(rng);counts[n]=(counts[n]||0)+1;}
   characterProgress.kobold.owned=1;
   const mixed={};for(let i=0;i<30000;i++){const n=xpRecipient(rng);mixed[n]=(mixed[n]||0)+1;}
   characterProgress.kobold.owned=0;characterProgress.katze.owned=1;
   const same={};for(let i=0;i<10000;i++){const n=xpRecipient(rng);same[n]=(same[n]||0)+1;}
   characterProgress.katze.owned=0;
   const allRarities={};
   for(const n of ['kobold','goblin','drache','zeus'])characterProgress[n].owned=1;
   for(let i=0;i<30000;i++){const rarity=GAME_CONFIG.actorRarities[xpRecipient(rng)];allRarities[rarity]=(allRarities[rarity]||0)+1;}
   // Alle 21 möglichen Belohnungen einmal gezielt durch den echten Picker ziehen.
   const chest=GAME_CONFIG.shopChests[0];const total=GAME_CONFIG.chestRewards.reduce((sum,e)=>sum+e.chance,0);
   let before=0;const all=[];
   for(const entry of GAME_CONFIG.chestRewards){
    let calls=0;const position=(before+entry.chance/2)/total;
    const [reward]=rollChestRewards({...chest,items:1},()=>calls++===0?position:0);
    all.push({expected:entry.kind==='skin'?'character':entry.kind,kind:reward.kind,amount:reward.amount||null,rarity:reward.rarity||null});before+=entry.chance;
   }
   // Isolierte Kauf-/Upgrade-Prüfung beginnt wieder nur mit der Startfigur.
   for(const n of CHARACTER_IDS)characterProgress[n]={owned:0,xp:0,level:1};
   shopWallet.coins=100000;shopWallet.jewels=10000;Math.random=()=>0;renderShop();
   return{counts,mixed,same,allRarities,all,total};
  });
  assert.deepEqual(distribution.counts,{corn:10000});
  assert.ok(Math.abs(distribution.mixed.corn/30000-30/55)<.015);
  assert.ok(Math.abs(distribution.mixed.kobold/30000-25/55)<.015);
  assert.ok(Math.abs(distribution.same.corn/10000-.5)<.02);
  assert.ok(Math.abs(distribution.same.katze/10000-.5)<.02);
  for(const [rarity,weight]of Object.entries({rare:30,epic:25,mythic:20,secret:10,divine:5}))assert.ok(Math.abs(distribution.allRarities[rarity]/30000-weight/90)<.015);
  assert.equal(distribution.all.length,21);distribution.all.forEach(item=>assert.equal(item.kind,item.expected));
  assert.ok(Math.abs(distribution.total-294.4)<1e-8);
  await page.locator('.shop-chest-normal .chest-buy').click();
  assert.equal(await page.locator('#lootResults .loot-item').count(),4);
  assert.equal(await page.evaluate(()=>characterProgress.corn.xp),20);
  const blocked=await page.evaluate(()=>{const coins=shopWallet.coins;return{result:buyShopChest('normal'),before:coins,after:shopWallet.coins};});
  assert.equal(blocked.result,false);assert.equal(blocked.before,blocked.after);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-loot-${width}.png`)});
  await page.locator('#lootCloseBtn').click();
  for(const [id,count]of [['rare',8],['gold',16],['god',50]]){
   assert.equal(await page.evaluate(id=>openLootChest(id,false,()=>0),id),true);
   assert.equal(await page.locator('#lootResults .loot-item').count(),count);
   await page.locator('#lootCloseBtn').click();
  }
  assert.deepEqual(await page.evaluate(()=>[shopWallet.coins,shopWallet.jewels,characterProgress.corn.xp]),[88000,9801,390]);
  // Alte Kisten werden ohne erneute Bezahlung geöffnet.
  await page.evaluate(()=>{shopWallet.chests.normal=1;renderShop();});
  await page.locator('.shop-chest-normal .chest-open').click();
  assert.deepEqual(await page.evaluate(()=>[shopWallet.coins,shopWallet.chests.normal,characterProgress.corn.xp]),[88000,0,410]);
  await page.locator('#lootCloseBtn').click();
  // Divine-Freischaltung und doppelte Charaktere bleiben eindeutige Item-Ziehungen.
  await page.evaluate(()=>openLootChest('normal',false,()=>.99999));
  assert.equal(await page.evaluate(()=>isActorUnlocked('zeus')),true);
  assert.equal(await page.locator('#lootResults .loot-item').count(),4);
  assert.equal(await page.locator('#lootResults').innerText().then(t=>t.includes('NEU FREIGESCHALTET')),true);
  assert.equal(await page.locator('#lootResults').innerText().then(t=>t.includes('Schon freigeschaltet')),true);
  await page.locator('#lootCloseBtn').click();
  // XP-Raritäten berücksichtigen nur vorhandene Figuren; die letzte Gruppe ist Zeus.
  assert.equal(await page.evaluate(()=>xpRecipient(()=>.99999)),'zeus');
  await page.locator('#shopBackBtn').click();await page.locator('#charactersStartBtn').click();
  await page.locator('#pickGrid [data-name="corn"]').click();
  assert.equal(await page.locator('#charUpgradeBtn').isEnabled(),true);
  await page.locator('#charUpgradeBtn').click();
  assert.deepEqual(await page.evaluate(()=>[characterProgress.corn.level,characterProgress.corn.xp,nextUpgradeXp('corn')]),[2,400,20]);
  await page.locator('#charUpgradeBtn').click();
  assert.deepEqual(await page.evaluate(()=>[characterProgress.corn.level,characterProgress.corn.xp,nextUpgradeXp('corn')]),[3,380,40]);
  const max=await page.evaluate(()=>{
   characterProgress.corn.level=1;characterProgress.corn.xp=1000000;
   let steps=0;while(upgradeCharacter('corn'))steps++;
   return{steps,level:characterProgress.corn.level,xp:characterProgress.corn.xp,cost:nextUpgradeXp('corn'),blocked:upgradeCharacter('corn')};
  });
  assert.deepEqual(max,{steps:15,level:16,xp:672330,cost:null,blocked:false});
  assert.equal(await page.locator('#charUpgradeBtn').isDisabled(),true);
  assert.equal(await page.locator('.char-card-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  await page.screenshot({path:path.join(os.tmpdir(),`jugend-upgrade-${width}.png`)});
  await page.locator('#charCardCloseBtn').click();await page.locator('#pickGrid [data-name="zeus"]').click();
  await page.locator('#charCardPlayBtn').click();await page.locator('#modeBackBtn').click();
  assert.equal(await page.locator('#mainHeroName').textContent(),'ZEUS');
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>[isActorUnlocked('zeus'),characterProgress.corn.level,characterProgress.corn.xp,equippedActor()]),[true,16,672330,'zeus']);
  assert.deepEqual(errors,[]);
  console.log(`${width}×${height}: feste Itemzahl, 21 Belohnungen, XP-Verteilung, alte Kisten, Doppelöffnungsschutz, Freischalten, Level 1–16 & Speicherung OK`);
  await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
