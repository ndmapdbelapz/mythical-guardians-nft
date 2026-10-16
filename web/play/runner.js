(() => {
  'use strict';

  const studies = (window.ROBIN_FRENS_LOCATIONS || []).filter((item) => item.inGame);
  const data = window.ROBIN_FRENS_GAME_DATA;
  if (!data || !studies.length) throw new Error('Game data is missing');

  const byId = (id) => document.getElementById(id);
  const canvas = byId('gameCanvas');
  const ctx = canvas.getContext('2d');
  const resultCanvas = byId('resultCanvas');
  const resultCtx = resultCanvas.getContext('2d');
  const finalMode=true;
  let selected=studies[0];
  const sceneImages=new Map();
  const route=finalMode?window.RF_RUN_ROUTE.create(studies.map(s=>s.id)):null;
  let background = new Image();
  let loadToken = 0;

  const W = canvas.width;
  const H = canvas.height;
  const groundY = 438;
  const jumpVelocity = -760;
  const gravity = 1900;
  const arrowLanes = [groundY-110,groundY-190];
  const actionSwitchMargin = .18;
  const guardLootChance = .2;
  const armoredGuardChance = .5;
  const armoredGuardStart = 900;
  const spriteScale = 4;
  const spriteSize = data.grid * spriteScale;
  const allSlots = [...data.order];
  const colourSlots = ['body', 'ears', 'coat', 'muzzle', 'eyes', 'face'];
  const equipmentSlots = ['clothes', 'masks', 'headwear', 'held_item'];
  const pickupCategoryPool = [...equipmentSlots, 'mystery'];
  const removalWeights = {clothes:1,masks:2,headwear:1,held_item:1};
  const mysteryRemoveChance = .44;
  const slotLabels = {
    body:'Body', ears:'Ears', coat:'Coat', muzzle:'Muzzle', eyes:'Eyes', face:'Face colour',
    clothes:'Outfit', masks:'Face gear', headwear:'Headwear', held_item:'Item',
  };
  const rarityPoints = {Common:100,Uncommon:160,Rare:260,Epic:420,Legendary:650,Trait:100};
  const traitCache = new Map();
  const iconCache = new Map();

  const state = {
    ready:false, mode:'loading', distance:0, score:0, speed:260, runClock:0,
    playerY:groundY-spriteSize, velocityY:0, grounded:true,
    obstacles:[], pickups:[], flyoffs:[], obstacleCountdown:0, pickupCountdown:360,
    traits:{...data.base}, lastPickup:{}, notice:null, raf:0, lastFrame:0,
    duckHeld:false, arrows:[], arrowWarning:null, shots:[], sparks:[],
    throwCooldown:0, throws:0, deflections:0, lastThrow:null, nextVolley:0,
    guard:null, guardPending:false, guardDebris:[], nextGuardDistance:0,
    guardsDefeated:0, armorBreaks:0,
    nextEncounterAt:0, arrowFollowup:null, equipFlights:[], lootDrops:0,
    nextSceneDistance:sceneEndDistance(0),scenePending:false,sceneFade:0,sceneBanner:0,oldScene:null,
  };
  const duckInputs=new Set(),heldKeys=new Set();
  let controlsKey='';
  const guideDialog=byId('guideDialog');
  const pauseDialog=byId('pauseDialog');
  let introShown=false,guideReturnMode='running',guideIsIntro=false;

  function openGuide(intro=false){
    if(!state.ready||guideDialog.open)return;
    guideReturnMode=state.mode;guideIsIntro=intro;
    cancelAnimationFrame(state.raf);clearInputs();state.mode='guide';
    byId('guideAction').textContent=intro?'Play':guideReturnMode==='running'?'Resume':'Close';
    guideDialog.showModal();
    byId('guideAction').focus({preventScroll:true});
  }
  function closeGuide(){
    if(!guideDialog.open)return;
    guideDialog.close();clearInputs();state.mode=guideReturnMode;
    if(state.mode==='running'){
      state.lastFrame=performance.now();state.raf=requestAnimationFrame(frame);
      canvas.focus({preventScroll:true});
    }else byId('helpButton').focus({preventScroll:true});
  }
  byId('helpButton').addEventListener('click',()=>openGuide());
  byId('guideAction').addEventListener('click',closeGuide);
  guideDialog.addEventListener('cancel',event=>{event.preventDefault();if(!guideIsIntro)closeGuide();});
  function pauseRun(){
    if(!finalMode||state.mode!=='running')return;
    cancelAnimationFrame(state.raf);clearInputs();state.mode='paused';pauseDialog.showModal();
  }
  function resumeRun(){
    if(state.mode!=='paused')return;
    pauseDialog.close();state.mode='running';state.lastFrame=performance.now();
    canvas.focus({preventScroll:true});state.raf=requestAnimationFrame(frame);
  }
  byId('pauseButton')?.addEventListener('click',pauseRun);
  byId('resumeRun')?.addEventListener('click',resumeRun);
  byId('pauseRestart')?.addEventListener('click',resetRun);
  pauseDialog?.addEventListener('cancel',event=>{event.preventDefault();resumeRun();});

  function choose(items) { return items[Math.floor(Math.random() * items.length)]; }
  function random(min,max) { return min + Math.random() * (max-min); }
  function rect(target,color,x,y,width,height) { target.fillStyle=color; target.fillRect(Math.round(x),Math.round(y),Math.round(width),Math.round(height)); }
  function overlaps(a,b) { return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y; }
  function sweptOverlap(a0,a1,b0,b1){
    if(overlaps(a0,b0)||overlaps(a1,b1))return true;
    let enter=0,exit=1;
    for(const [axis,size] of [['x','width'],['y','height']]){
      const velocity=(a1[axis]-a0[axis])-(b1[axis]-b0[axis]);
      if(Math.abs(velocity)<1e-9){if(a0[axis]+a0[size]<=b0[axis]||a0[axis]>=b0[axis]+b0[size])return false;continue;}
      const times=[(b0[axis]-a0[axis]-a0[size])/velocity,(b0[axis]+b0[size]-a0[axis])/velocity].sort((a,b)=>a-b);
      enter=Math.max(enter,times[0]);exit=Math.min(exit,times[1]);if(enter>exit)return false;
    }
    return enter<=exit&&exit>=0&&enter<=1;
  }

  function paintPixels(target,pixels,offsetX=0,offsetY=0,scale=1) {
    target.save(); target.imageSmoothingEnabled=false;
    for (const [key,color] of Object.entries(pixels)) {
      const index=Number(key); target.fillStyle=color;
      target.fillRect(offsetX+(index%data.grid)*scale,offsetY+Math.floor(index/data.grid)*scale,scale,scale);
    }
    target.restore();
  }

  function composeFren(backgroundTrait=null,animated=false) {
    const hidden=animated?new Set(state.equipFlights.filter(f=>equipmentSlots.includes(f.slot)&&f.life>0&&state.traits[f.slot]?.id===f.trait.id).map(f=>f.slot)):new Set();
    const key=`${backgroundTrait?.id||'transparent'}|${data.order.map((slot)=>hidden.has(slot)?'incoming':state.traits[slot]?.id||'none').join('|')}`;
    if (traitCache.has(key)) return traitCache.get(key);
    const output=document.createElement('canvas'); output.width=data.grid; output.height=data.grid;
    const outputCtx=output.getContext('2d');
    if(backgroundTrait)paintPixels(outputCtx,backgroundTrait.pixels);
    for (const slot of data.order) if (state.traits[slot]&&!hidden.has(slot)) paintPixels(outputCtx,state.traits[slot].pixels);
    traitCache.set(key,output); return output;
  }

  function traitIcon(trait) {
    const key=`${trait.id}:${Object.keys(trait.pixels).length}`;
    if(iconCache.has(key))return iconCache.get(key);
    const indexes=Object.keys(trait.pixels).map(Number);
    const minX=Math.min(...indexes.map((index)=>index%data.grid));
    const maxX=Math.max(...indexes.map((index)=>index%data.grid));
    const minY=Math.min(...indexes.map((index)=>Math.floor(index/data.grid)));
    const maxY=Math.max(...indexes.map((index)=>Math.floor(index/data.grid)));
    const output=document.createElement('canvas');output.width=Math.max(1,maxX-minX+1);output.height=Math.max(1,maxY-minY+1);
    const outputCtx=output.getContext('2d');outputCtx.imageSmoothingEnabled=false;
    for(const [rawIndex,color] of Object.entries(trait.pixels)){
      const index=Number(rawIndex),x=index%data.grid,y=Math.floor(index/data.grid);
      outputCtx.fillStyle=color;outputCtx.fillRect(x-minX,y-minY,1,1);
    }
    iconCache.set(key,output);return output;
  }

  const art=window.RF_WORLD_ART;
  const obstacleSpecs=art.definitions;
  const locationObstacleTypes=art.locations;
  let previousObstacle=null;
  let previousHazard='ground';

  function drawBackground() {
    window.RF_SCENE_ART.draw(ctx,selected.id,background,state.distance);
    if(state.sceneFade>0&&state.oldScene){
      ctx.save();ctx.globalAlpha=state.sceneFade/.55;
      window.RF_SCENE_ART.draw(ctx,state.oldScene.id,state.oldScene.image,state.distance);ctx.restore();
    }
  }
  function enterNextScene(initial=false){
    const oldScene={id:selected.id,image:background};
    const nextId=route.next();
    selected=studies.find(s=>s.id===nextId);background=sceneImages.get(selected.id);
    state.oldScene=initial?null:oldScene;state.sceneFade=initial?0:.55;state.sceneBanner=2.4;
    state.scenePending=false;state.nextSceneDistance=sceneEndDistance(state.distance);previousObstacle=null;
    if(byId('sceneValue'))byId('sceneValue').textContent=selected.name;
  }
  function drawSceneTitle(){
    if(!finalMode||state.sceneBanner<=0)return;
    ctx.save();ctx.globalAlpha=Math.min(1,state.sceneBanner/.45);
    ctx.textAlign='center';ctx.font='bold 28px monospace';ctx.lineWidth=5;
    ctx.strokeStyle='#08131ac9';ctx.strokeText(selected.name,W/2,90);
    ctx.fillStyle='#f2edcc';ctx.fillText(selected.name,W/2,90);ctx.restore();
  }

  function guardChanceForDistance(distance){
    return Math.min(80,30+Math.floor(Math.max(0,distance)/2000)*10)/100;
  }

  function spawnObstacle() {
    if(previousHazard==='ground'){
      // From 0m: 30%, +10 percentage points every 2000m, capped at 80%.
      // This is NOT a guard/arrow split. Armour is rolled separately on spawn.
      if(state.distance>=state.nextGuardDistance&&Math.random()<guardChanceForDistance(state.distance)){
        state.guardPending=true;state.obstacleCountdown=state.speed*.5;
        previousHazard='guard';return;
      }
      // Original arrow roll; no guaranteed-arrow replacement for a guard.
      if(state.distance>=90&&Math.random()<.28){
        queueVolley();
        state.obstacleCountdown=state.speed*.5;previousHazard='volley';return;
      }
    }
    spawnGroundObstacle();
  }
  function groundInterval(){return (random(520,720)+state.speed*.75)/state.speed;}
  function spawnGroundObstacle(){
    previousHazard='ground';
    const pool=locationObstacleTypes[selected.id].filter(type=>type!==previousObstacle);
    const type=choose(pool),{width,height}=obstacleSpecs[type];previousObstacle=type;
    const obstacle={x:W+30,width,height,type};state.obstacles.push(obstacle);
    state.obstacleCountdown=groundInterval()*state.speed;
    state.nextEncounterAt=state.runClock+(W+30-226+state.obstacleCountdown)/state.speed;
    if(state.pickupCountdown<state.speed+250&&Math.random()<.4)spawnPickup('obstacle',obstacle);
  }
  function volleySpeed(){return Math.min(700,520+state.speed*.15);}
  function queueVolley(){
    const flight=(W+20-226)/volleySpeed();
    state.arrowWarning={waiting:true,remaining:0,arrivalAt:Math.max(state.runClock+flight,state.nextEncounterAt+actionSwitchMargin)};
  }

  function isDucking(){return state.duckHeld&&state.grounded;}
  function equippedSlots(){return equipmentSlots.filter(slot=>state.traits[slot]?.id&&state.traits[slot].id!=='none');}
  function syncControls(){
    const count=equippedSlots().length;
    const key=`${count}:${state.duckHeld}:${state.throwCooldown>0}`;if(key===controlsKey)return;controlsKey=key;
    byId('throwStock').textContent=count;
    byId('gearStock').textContent=count;
    byId('throwButton').classList.toggle('empty',count===0);
    byId('throwButton').classList.toggle('cooling',state.throwCooldown>0);
    byId('duckButton').setAttribute('aria-pressed',String(state.duckHeld));
  }
  function setDuckInput(source,active){
    if(active&&state.mode!=='running')return;
    if(active)duckInputs.add(source);else duckInputs.delete(source);
    state.duckHeld=duckInputs.size>0;syncControls();
  }
  function clearInputs(){duckInputs.clear();heldKeys.clear();state.duckHeld=false;syncControls();}
  function spawnVolley(x=W+20,followup=false){
    const id=++state.nextVolley,speed=Math.min(700,520+state.speed*.15);
    for(const y of arrowLanes)state.arrows.push({id,x,y,px:x,py:y,speed,trail:[]});
    if(followup){
      state.arrowFollowup={arrivalAt:state.runClock+(x-226)/speed+groundInterval()+actionSwitchMargin};
      if(state.pickupCountdown<state.speed+250&&Math.random()<.4)spawnPickup('duck',state.arrows[state.arrows.length-1]);
    }
  }
  function combatActive(){return Boolean(state.arrowWarning||state.arrows.length||state.arrowFollowup||state.guardPending||state.guard);}
  function spawnGuard(x=W+20,armored=state.distance>=armoredGuardStart&&Math.random()<armoredGuardChance){
    const hp=armored?2:1;
    state.guard={x,px:x,hp,maxHp:hp,speed:Math.min(440,280+state.speed*.12),flash:0,stun:0};
    state.nextGuardDistance=state.distance+900;
  }
  function hitGuard(){
    const guard=state.guard;if(!guard)return;
    guard.hp--;guard.flash=.14;
    window.RF_PICKUP_AUDIO?.play(guard.hp>0?'armorHit':'guardHit');
    if(guard.hp>0){
      state.armorBreaks++;guard.stun=.14;
      for(const [kind,dx,dy,vx,vy,spin] of [
        ['helmet',84,-128,105,-280,5],['plate',80,-68,155,-160,7],['shoulder',122,-84,215,-230,9],
      ])state.guardDebris.push({kind,x:guard.x+dx,y:groundY+dy,vx,vy,rotation:0,spin,life:1});
    }else{
      state.guardsDefeated++;
      state.guardDebris.push({kind:'guard',x:guard.x+72,y:groundY-116,vx:160,vy:-130,rotation:0,spin:2.8,life:.65});
      state.guard=null;
      if(Math.random()<guardLootChance){
        const outcome=visibleTraitOutcome();
        state.pickups.push({x:guard.x+64,y:groundY-112,width:54,height:54,vy:-160,pattern:'loot',...outcome});
        state.lootDrops++;
      }
    }
    for(let i=0;i<8;i++)state.sparks.push({x:guard.x+28,y:groundY-110,vx:random(-100,120),vy:random(-130,70),life:.3,color:i%2?'#e5c277':'#d8e7dc',width:4});
  }
  function throwGear(){
    if(state.mode!=='running'||state.throwCooldown>0)return false;
    const available=equippedSlots();
    if(!available.length){state.notice={time:1.4,removed:true,text:state.guard||state.guardPending?'No gear — cannot attack':'No gear — hold ↓ to duck'};return false;}
    const slot=choose(available),trait=state.traits[slot];
    const none=data.slots[slot].find(item=>item.id==='none');
    if(!none)throw new Error(`Missing none trait: ${slot}`);
    state.traits[slot]=none;traitCache.clear();
    state.equipFlights=state.equipFlights.filter(f=>f.slot!==slot);
    const startY=isDucking()?groundY-35:state.playerY+78;
    // A short, predetermined upward toss, then straight forward. No target
    // search or tracking; airborne throws retain the height at launch.
    state.shots.push({trait,slot,x:226,y:startY,px:226,py:startY,startY,
      laneY:state.playerY+34,age:0,life:1.4,speed:900,rotation:0});
    state.throwCooldown=.32;state.throws++;state.lastThrow={slot,id:trait.id};
    window.RF_PICKUP_AUDIO?.play('throw');
    state.notice={time:1.1,removed:true,text:`Attack · ${trait.name}`};
    syncControls();return true;
  }
  function arrowBox(item,previous=false){return{x:previous?item.px:item.x,y:(previous?item.py:item.y)-6,width:118,height:12};}
  function shotBox(item,previous=false){return{x:(previous?item.px:item.x)-20,y:(previous?item.py:item.y)-20,width:40,height:40};}
  function arrowPlayerBox(y=state.playerY){return isDucking()?playerHurtbox():{x:158,y:y+26,width:68,height:107};}
  function shatterArrow(item){
    window.RF_PICKUP_AUDIO?.play('arrowHit');
    for(let i=0;i<12;i++)state.sparks.push({x:item.x+12+i*8,y:item.y,vx:random(-150,100),vy:random(-170,170),life:.55,color:i>8?'#ed7771':i%2?'#e6c577':'#d8e7dc',width:i%3?7:14});
    state.deflections++;
  }
  function updateCombat(dt,previousPlayerY){
    const hadGuard=Boolean(state.guard||state.guardPending);
    state.throwCooldown=Math.max(0,state.throwCooldown-dt);
    if(state.guardPending&&state.obstacles.every(item=>item.x+item.width<108)&&state.grounded){
      state.guardPending=false;spawnGuard();
    }
    if(state.guard){
      const guard=state.guard;guard.px=guard.x;
      guard.flash=Math.max(0,guard.flash-dt);
      const moveTime=Math.max(0,dt-guard.stun);guard.stun=Math.max(0,guard.stun-dt);
      guard.x-=guard.speed*moveTime;
    }
    if(state.arrowWarning){
      const warning=state.arrowWarning;
      const flight=(W+20-226)/volleySpeed();
      const clearIn=Math.max(0,...state.obstacles.map(o=>(o.x+o.width-146)/state.speed));
      const rise=groundY-spriteSize-state.playerY;
      const landIn=state.grounded?0:(-state.velocityY+Math.sqrt(state.velocityY**2+2*gravity*rise))/gravity;
      warning.remaining=Math.max(0,warning.arrivalAt-state.runClock-flight);
      if(warning.remaining<=0&&flight>=Math.max(clearIn+.45,landIn+actionSwitchMargin)){
        spawnVolley(W+20,true);state.arrowWarning=null;
      }
    }
    for(const arrow of state.arrows){
      arrow.px=arrow.x;arrow.py=arrow.y;
      arrow.x-=arrow.speed*dt; // y is intentionally NEVER changed.
      if(dt>0){arrow.trail.push({x:arrow.x,y:arrow.y});if(arrow.trail.length>5)arrow.trail.shift();}
    }
    for(const shot of state.shots){
      shot.px=shot.x;shot.py=shot.y;shot.age+=dt;shot.life-=dt;shot.x+=shot.speed*dt;shot.rotation+=dt*10;
      const progress=Math.min(1,shot.age/.14);shot.y=shot.startY+(shot.laneY-shot.startY)*(1-(1-progress)**2);
      for(const arrow of state.arrows){
        if(arrow.broken)continue;
        if(sweptOverlap(shotBox(shot,true),shotBox(shot),arrowBox(arrow,true),arrowBox(arrow))){
          arrow.broken=true;shot.life=0;shatterArrow(arrow);break;
        }
      }
      if(shot.life>0&&state.guard){
        const before=window.RF_GUARD_ART.boxes(state.guard,groundY,true),after=window.RF_GUARD_ART.boxes(state.guard,groundY);
        if(after.some((box,i)=>sweptOverlap(shotBox(shot,true),shotBox(shot),before[i],box))){shot.life=0;hitGuard();}
      }
    }
    state.shots=state.shots.filter(item=>item.life>0&&item.x<W+80);
    state.arrows=state.arrows.filter(item=>!item.broken&&item.x+124>-30);
    for(const spark of state.sparks){spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=480*dt;spark.life-=dt;}
    state.sparks=state.sparks.filter(item=>item.life>0);
    for(const piece of state.guardDebris){piece.x+=piece.vx*dt;piece.y+=piece.vy*dt;piece.vy+=600*dt;piece.rotation+=piece.spin*dt;piece.life-=dt;}
    state.guardDebris=state.guardDebris.filter(piece=>piece.life>0);
    for(const arrow of state.arrows){
      if(sweptOverlap(arrowBox(arrow,true),arrowBox(arrow),arrowPlayerBox(previousPlayerY),arrowPlayerBox())){finishRun();return;}
    }
    if(state.guard){
      const before=window.RF_GUARD_ART.boxes(state.guard,groundY,true),after=window.RF_GUARD_ART.boxes(state.guard,groundY);
      const player=playerHurtbox(),previousPlayer={...player,y:player.y+previousPlayerY-state.playerY};
      if(after.some((box,i)=>sweptOverlap(before[i],box,previousPlayer,player))){finishRun();return;}
    }
    if(state.arrowFollowup){
      const groundFlight=(W+30-226)/state.speed;
      const clearIn=Math.max(0,...state.arrows.map(a=>(a.x+124-146)/a.speed));
      if(state.runClock+groundFlight>=state.arrowFollowup.arrivalAt&&groundFlight>=clearIn+.35){
        state.arrowFollowup=null;spawnGroundObstacle();
      }
    }
    if(hadGuard&&!state.guard&&!state.guardPending)state.obstacleCountdown=Math.max(state.obstacleCountdown,state.speed*.5);
    syncControls();
  }

  function visibleTraitOutcome(forcedSlot) {
    const slot=forcedSlot||choose(equipmentSlots);
    const current=state.traits[slot]?.id;
    const choices=data.slots[slot].filter((trait)=>trait.id!=='none'&&trait.id!==current&&trait.id!==state.lastPickup[slot]);
    const fallback=data.slots[slot].filter((trait)=>trait.id!=='none'&&trait.id!==current);
    return {pickupType:'visible',slot,trait:choose(choices.length?choices:fallback)};
  }

  // Removal is a separate roll. `none` never competes with colour variants in
  // their arrays: the crate either removes one equipped item, or rerolls one
  // hidden colour layer.
  function mysteryOutcome(forcedColourSlot,forcedRemoveSlot) {
    const equipped=equipmentSlots.filter((slot)=>state.traits[slot]?.id&&state.traits[slot].id!=='none');
    const weightedEquipped=equipped.flatMap((slot)=>Array(removalWeights[slot]).fill(slot));
    const removeSlot=forcedRemoveSlot||(forcedColourSlot?null:(weightedEquipped.length&&Math.random()<mysteryRemoveChance?choose(weightedEquipped):null));
    if(removeSlot){
      const none=data.slots[removeSlot].find((trait)=>trait.id==='none');
      return {pickupType:'mystery',mysteryType:'remove',slot:removeSlot,trait:none};
    }
    const slot=forcedColourSlot||choose(colourSlots);
    const choices=data.slots[slot].filter((trait)=>trait.id!==state.traits[slot]?.id);
    return {pickupType:'mystery',mysteryType:'colour',slot,trait:choose(choices)};
  }

  function randomPickupOutcome(){
    const category=choose(pickupCategoryPool);
    const outcome=category==='mystery'?mysteryOutcome():visibleTraitOutcome(category);
    state.lastPickup[outcome.slot]=outcome.trait.id;
    return outcome;
  }
  function spawnPickup(pattern='free',anchor=null) {
    const base={x:W+25,width:54,height:54,pattern};
    if(pattern==='obstacle'&&anchor){
      state.pickups.push({...base,x:anchor.x+anchor.width/2-27,y:groundY-224,...randomPickupOutcome()});
    }else if(pattern==='duck'&&anchor){
      state.pickups.push({...base,x:anchor.x+20,y:groundY-68,speed:anchor.speed,...randomPickupOutcome()});
    }else state.pickups.push({...base,y:choose([groundY-102,groundY-188]),...randomPickupOutcome()});
    state.pickupCountdown=random(450,760)+state.speed*.42;
  }

  function drawObstacle(item) {art.drawObstacle(ctx,item,groundY);}

  function drawMysteryBox(item) {
    const bob=Math.round(Math.sin(state.runClock*6+item.x*.02)*4),phase=Math.floor(state.runClock*7)%3;
    const glow=['#8ed1b5','#d8bd70','#c486a2'][phase],glow2=['#c486a2','#8ed1b5','#d8bd70'][phase];
    const x=Math.round(item.x),y=Math.round(item.y+bob);
    rect(ctx,'#06101777',x+8,y+10,50,50);
    rect(ctx,glow,x-3,y+8,4,38);rect(ctx,glow2,x+53,y+13,4,32);rect(ctx,glow2,x+8,y-3,38,4);
    rect(ctx,'#d6c77e',x,y+7,54,47);rect(ctx,'#56476a',x+4,y+11,46,39);rect(ctx,'#1b2431',x+9,y+16,36,29);
    rect(ctx,glow,x+4,y,46,10);rect(ctx,'#ecdfaa',x+10,y+3,34,4);rect(ctx,'#77623f',x+23,y+7,8,47);
    rect(ctx,'#e9e4c8',x+23,y+23,8,8);rect(ctx,'#e9e4c8',x+25,y+31,4,7);
    ctx.fillStyle=glow2;ctx.font='900 12px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',x+39,y+32);
    rect(ctx,'#e8df9c',x-10,y+17,5,5);rect(ctx,glow,x+60,y+37,5,5);rect(ctx,glow2,x+5,y+61,4,4);
  }

  function drawVisibleTrait(item) {
    const bob=Math.round(Math.sin(state.runClock*6+item.x*.02)*4),icon=traitIcon(item.trait);
    const ratio=Math.min(56/icon.width,56/icon.height),width=Math.max(1,Math.floor(icon.width*ratio)),height=Math.max(1,Math.floor(icon.height*ratio));
    const x=Math.round(item.x+(54-width)/2),y=Math.round(item.y+bob+(54-height)/2);
    ctx.save();ctx.globalAlpha=.3;ctx.drawImage(icon,x+5,y+6,width,height);ctx.restore();ctx.drawImage(icon,x,y,width,height);
    rect(ctx,'#e7df9b',item.x-7,item.y+bob+11,5,5);rect(ctx,'#9bd8bd',item.x+58,item.y+bob+37,5,5);
  }

  function drawPickup(item){item.pickupType==='mystery'?drawMysteryBox(item):drawVisibleTrait(item);}

  function drawFlyoff(item) {
    const icon=traitIcon(item.trait),ratio=Math.min(64/icon.width,64/icon.height),width=Math.max(1,Math.floor(icon.width*ratio)),height=Math.max(1,Math.floor(icon.height*ratio));
    ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.rotation);ctx.globalAlpha=Math.min(1,item.life*1.4);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(icon,-width/2,-height/2,width,height);ctx.restore();
  }

  function drawPlayer() {
    const sprite=composeFren(null,true); const frame=Math.floor(state.runClock*12)%4; const bob=state.grounded?[0,2,0,1][frame]:0;
    if(isDucking()){
      ctx.imageSmoothingEnabled=false;ctx.drawImage(window.RF_COMBAT_ART.duckSprite(sprite),118,groundY-104,160,104);
      rect(ctx,'#b5c0af55',128,groundY+3,24,3);return;
    }
    ctx.save(); ctx.translate(122,Math.round(state.playerY+bob)); if(!state.grounded)ctx.rotate(Math.max(-.06,Math.min(.06,state.velocityY/900)));
    ctx.imageSmoothingEnabled=false; ctx.drawImage(sprite,0,0,spriteSize,spriteSize); ctx.restore();
    if(state.grounded&&frame===1){rect(ctx,'#b5c0af77',130,groundY+4,20,5);rect(ctx,'#b5c0af44',118,groundY+9,12,4);}
  }

  function drawCombat(){
    if(state.guard)window.RF_GUARD_ART.draw(ctx,state.guard,groundY,state.runClock);
    for(const piece of state.guardDebris)window.RF_GUARD_ART.drawDebris(ctx,piece);
    for(const arrow of state.arrows)window.RF_COMBAT_ART.drawArrow(ctx,arrow);
    for(const shot of state.shots){
      const icon=traitIcon(shot.trait),ratio=Math.min(48/icon.width,48/icon.height);
      ctx.save();ctx.translate(Math.round(shot.x),Math.round(shot.y));ctx.rotate(shot.rotation);
      ctx.drawImage(icon,-icon.width*ratio/2,-icon.height*ratio/2,icon.width*ratio,icon.height*ratio);ctx.restore();
      rect(ctx,'#e8d8a788',shot.x-36,shot.y-2,10,3);
    }
    for(const spark of state.sparks){ctx.globalAlpha=Math.min(1,spark.life*3);rect(ctx,spark.color,spark.x,spark.y,spark.width,3);}ctx.globalAlpha=1;
  }

  function drawNotice() {
    if(!state.notice||state.notice.time<=0)return;
    ctx.globalAlpha=Math.min(1,state.notice.time*2); ctx.font='900 18px ui-monospace,monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle='#061017dd';ctx.fillText(state.notice.text,W/2+3,104);ctx.fillStyle=state.notice.removed?'#d9a0aa':'#d9c37d';ctx.fillText(state.notice.text,W/2,101);ctx.globalAlpha=1;
  }

  function slotPosition(slot){
    const offsets={headwear:[190,22],masks:[190,62],clothes:[190,101],held_item:[231,103]};
    const [x,y]=offsets[slot]||[190,78];return{x,y:isDucking()?groundY-72+y*.45:state.playerY+y};
  }
  function drawPickupFeedback(){
    for(const flight of state.equipFlights){
      const t=1-flight.life/flight.duration,ease=1-(1-t)**3,target=slotPosition(flight.slot);
      const x=flight.x+(target.x-flight.x)*ease,y=flight.y+(target.y-flight.y)*ease-Math.sin(t*Math.PI)*20;
      const icon=traitIcon(flight.trait),scale=(48-16*t)/Math.max(icon.width,icon.height);
      ctx.drawImage(icon,x-icon.width*scale/2,y-icon.height*scale/2,icon.width*scale,icon.height*scale);
      rect(ctx,'#d6e6b2',x-4,y-4,3,3);
    }
  }
  function drawGame() {
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);drawBackground();state.obstacles.forEach(drawObstacle);
    state.pickups.forEach(drawPickup);
    drawPlayer();state.flyoffs.forEach(drawFlyoff);drawPickupFeedback();drawCombat();drawNotice();drawSceneTitle();
  }

  function applyOutcome(outcome) {
    const previous=state.traits[outcome.slot],removed=outcome.trait.id==='none';
    if((removed||equipmentSlots.includes(outcome.slot))&&previous?.id!=='none'&&previous?.id!==outcome.trait.id){
      const position=slotPosition(outcome.slot);
      state.flyoffs.push({trait:previous,...position,vx:random(-190,-110),vy:random(-270,-180),rotation:0,spin:random(-7,-4),life:.8});
    }
    state.equipFlights=state.equipFlights.filter(f=>f.slot!==outcome.slot);
    if(!removed)state.equipFlights.push({trait:outcome.trait,slot:outcome.slot,x:(outcome.x??164)+27,y:(outcome.y??state.playerY+42)+27,life:.22,duration:.22});
    window.RF_PICKUP_AUDIO?.play(outcome.mysteryType==='remove'?'mystery':'gear');
    state.traits[outcome.slot]=outcome.trait;const points=removed?100:(rarityPoints[outcome.trait.rarity]||100);state.score+=points;byId('scoreValue').textContent=state.score;
    syncControls();const prefix=outcome.pickupType==='mystery'?'Mystery · ':'';
    state.notice={time:1.7,removed,text:removed?`${prefix}${slotLabels[outcome.slot]} flew off`:`${prefix}${slotLabels[outcome.slot]} · ${outcome.trait.name}  +${points}`};traitCache.clear();
  }

  function playerBox(){return isDucking()?{x:146,y:groundY-78,width:99,height:67}:{x:146,y:state.playerY+30,width:91,height:103};}
  // Equipment and the outer fur pixels are not solid. Keep the wider pickup
  // reach above; hazards collide with the core of the fren's head and body.
  function playerHurtbox(){return isDucking()?{x:158,y:groundY-67,width:68,height:56}:{x:158,y:state.playerY+38,width:68,height:95};}
  function smoothstep(value){const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);}
  function speedSegment(distance,startDistance,endDistance,startSpeed,endSpeed){
    const progress=smoothstep((distance-startDistance)/(endDistance-startDistance));
    return startSpeed+(endSpeed-startSpeed)*progress;
  }
  function speedForDistance(distance){
    const progress=Math.max(0,distance);
    if(progress<=4000)return speedSegment(progress,0,4000,260,600);
    if(progress<=12000)return speedSegment(progress,4000,12000,600,1200);
    return 1200;
  }
  function sceneEndDistance(distance){
    // Freeze a metre milestone on entry: roughly 12 seconds at entry speed.
    // The HUD advances at speed / 7 metres per second. No scene timer is used.
    const length=Math.round((speedForDistance(distance)*12/7)/10)*10;
    return Math.ceil(distance+length);
  }
  let hubStarted=false;
  function update(dt) {
    if(!hubStarted){hubStarted=true;window.dispatchEvent(new Event('frens-hub:run-started'));}
    const previousPlayerY=state.playerY;
    state.runClock+=dt;state.speed=speedForDistance(state.distance);state.distance+=state.speed*dt/7;byId('distanceValue').textContent=Math.floor(state.distance);
    if(finalMode){
      state.scenePending=state.distance>=state.nextSceneDistance;
      state.sceneFade=Math.max(0,state.sceneFade-dt);state.sceneBanner=Math.max(0,state.sceneBanner-dt);
      if(!state.sceneFade)state.oldScene=null;
    }
    if(state.notice)state.notice.time=Math.max(0,state.notice.time-dt);state.velocityY+=gravity*dt;state.playerY+=state.velocityY*dt;
    state.flyoffs.forEach((item)=>{item.x+=item.vx*dt;item.y+=item.vy*dt;item.vy+=760*dt;item.rotation+=item.spin*dt;item.life-=dt;});state.flyoffs=state.flyoffs.filter((item)=>item.life>0);
    state.equipFlights.forEach(f=>f.life-=dt);state.equipFlights=state.equipFlights.filter(f=>f.life>0);
    if(state.playerY>=groundY-spriteSize){state.playerY=groundY-spriteSize;state.velocityY=0;state.grounded=true;}
    const travel=state.speed*dt;
    if(!combatActive()&&!state.scenePending&&!state.sceneFade){state.obstacleCountdown-=travel;if(state.obstacleCountdown<=0)spawnObstacle();}
    state.pickupCountdown-=travel;if(state.pickupCountdown<=0)spawnPickup();
    state.obstacles.forEach((item)=>{item.x-=travel;});state.pickups.forEach((item)=>{
      item.x-=(item.speed??state.speed)*dt;
      if(item.vy!==undefined){item.y+=item.vy*dt;item.vy+=800*dt;if(item.y>=groundY-86){item.y=groundY-86;delete item.vy;}}
    });state.obstacles=state.obstacles.filter((item)=>item.x+item.width>-30);
    const hurtbox=playerHurtbox();for(const obstacle of state.obstacles){if(art.collisionBoxes(obstacle,groundY).some(box=>overlaps(hurtbox,box)))return finishRun();}
    updateCombat(dt,previousPlayerY);if(state.mode!=='running')return;
    const player=playerBox();
    state.pickups=state.pickups.filter(pickup=>{
      if(overlaps(player,pickup)){applyOutcome(pickup);return false;}
      return pickup.x+pickup.width>-30;
    });
    if(finalMode&&state.scenePending&&!state.obstacles.length&&!combatActive()&&state.grounded){
      enterNextScene();
    }
  }

  function frame(time) { if(state.mode!=='running')return;const dt=Math.min(.035,Math.max(0,(time-state.lastFrame)/1000||0));state.lastFrame=time;update(dt);drawGame();if(state.mode==='running')state.raf=requestAnimationFrame(frame); }

  function resetRun() {
    hubStarted=false;
    if(guideDialog.open)guideDialog.close();
    if(pauseDialog?.open)pauseDialog.close();
    previousObstacle=null;previousHazard='ground';clearInputs();
    cancelAnimationFrame(state.raf);Object.assign(state,{mode:'running',distance:0,score:0,speed:260,runClock:0,playerY:groundY-spriteSize,velocityY:0,grounded:true,obstacles:[],pickups:[],flyoffs:[],obstacleCountdown:0,pickupCountdown:320,traits:{...data.base},lastPickup:{},notice:null,lastFrame:performance.now()});
    Object.assign(state,{duckHeld:false,arrows:[],arrowWarning:null,shots:[],sparks:[],throwCooldown:0,throws:0,deflections:0,lastThrow:null,nextVolley:0});syncControls();
    Object.assign(state,{guard:null,guardPending:false,guardDebris:[],nextGuardDistance:0,guardsDefeated:0,armorBreaks:0});
    Object.assign(state,{nextEncounterAt:0,arrowFollowup:null,equipFlights:[],lootDrops:0});
    Object.assign(state,{nextSceneDistance:sceneEndDistance(0),scenePending:false,sceneFade:0,sceneBanner:0,oldScene:null});
    if(finalMode){enterNextScene(true);byId('pauseButton').disabled=false;}
    traitCache.clear();byId('distanceValue').textContent='0';byId('scoreValue').textContent='0';byId('resultScreen').hidden=true;document.querySelector('.game-shell').classList.remove('has-result');drawGame();state.raf=requestAnimationFrame(frame);
  }

  function jump(){
    if(state.mode!=='running'||!state.grounded||state.duckHeld)return;
    // Fixed original arc at every running speed. Fit hazards to this jump,
    // never stretch airtime to compensate for oversized obstacle artwork.
    state.velocityY=jumpVelocity;
    state.grounded=false;
  }

  function renderResultPhoto() {
    resultCtx.imageSmoothingEnabled=false;resultCtx.clearRect(0,0,360,360);
    const collectionBackground=data.backgrounds.find((trait)=>trait.id===selected.id);
    if(!collectionBackground)throw new Error(`Collection background missing: ${selected.id}`);
    resultCtx.drawImage(composeFren(collectionBackground),0,0,360,360);
    byId('resultDistance').textContent=Math.floor(state.distance);byId('resultScore').textContent=state.score;byId('resultLocation').textContent=selected.name;byId('photoLocation').textContent=selected.name;
    const photo=photoForDownload(),card=byId('photoCard');
    card.getContext('2d').drawImage(photo,0,0);
    card.setAttribute('aria-label',selected.name+' — '+Math.floor(state.distance)+' metres — Style score '+state.score);
  }

  function finishRun(){if(state.mode!=='running')return;state.mode='over';clearInputs();queueMicrotask(()=>window.dispatchEvent(new CustomEvent('frens-hub:run-finished',{detail:{distance:Math.floor(state.distance),score:state.score,duration:state.runClock,location:selected.name,locationId:selected.id,recipe:Object.fromEntries(data.order.map(slot=>[slot,state.traits[slot]?.id??null]))}})));cancelAnimationFrame(state.raf);renderResultPhoto();document.querySelector('.game-shell').classList.add('has-result');byId('resultScreen').hidden=false;if(finalMode){byId('pauseButton').disabled=true;byId('runAgain').focus({preventScroll:true});}}

  byId('runAgain').addEventListener('click',()=>{resetRun();canvas.focus({preventScroll:true});});
  for(const [id,action] of [['jumpButton',jump],['throwButton',throwGear]]){
    byId(id).addEventListener('pointerdown',event=>{event.preventDefault();action();});
    byId(id).addEventListener('click',event=>{if(event.detail===0)action();});
  }
  canvas.addEventListener('pointerdown',event=>{event.preventDefault();canvas.focus({preventScroll:true});jump();});
  const duckButton=byId('duckButton');
  duckButton.addEventListener('pointerdown',event=>{event.preventDefault();duckButton.setPointerCapture(event.pointerId);setDuckInput(`pointer:${event.pointerId}`,true);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])duckButton.addEventListener(name,event=>setDuckInput(`pointer:${event.pointerId}`,false));
  duckButton.addEventListener('click',event=>{if(event.detail===0)setDuckInput('accessible-toggle',!duckInputs.has('accessible-toggle'));});
  function isFormTarget(target){return target?.isContentEditable||target?.closest('input,select,textarea,a,button:not([data-run-action])');}
  window.addEventListener('keydown',event=>{
    if(finalMode&&event.code==='Escape'&&state.mode==='running'){event.preventDefault();pauseRun();return;}
    if(state.mode!=='running'||isFormTarget(event.target))return;
    const code=event.code;
    if(!['Space','ArrowUp','KeyW','ArrowDown','KeyS','KeyX'].includes(code))return;
    event.preventDefault();
    if(event.repeat||heldKeys.has(code))return;heldKeys.add(code);
    if(['ArrowUp','KeyW'].includes(code))jump();
    else if(['ArrowDown','KeyS'].includes(code))setDuckInput(code,true);
    else throwGear();
  });
  window.addEventListener('keyup',event=>{heldKeys.delete(event.code);if(['ArrowDown','KeyS'].includes(event.code))setDuckInput(event.code,false);});
  window.addEventListener('blur',()=>{clearInputs();pauseRun();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();pauseRun();}});
  function photoForDownload(){
    if(!finalMode)return resultCanvas;
    const photo=document.createElement('canvas');photo.width=440;photo.height=540;
    const context=photo.getContext('2d');context.imageSmoothingEnabled=false;
    context.fillStyle='#e8eadf';context.fillRect(0,0,440,540);
    context.drawImage(resultCanvas,20,20,400,400);
    context.fillStyle='#1d282a';context.font='bold 17px monospace';context.textAlign='center';
    context.fillText(selected.name,220,450,396);
    context.fillStyle='#bec3b8';context.fillRect(30,467,380,1);
    context.fillStyle='#1d282a';context.font='bold 24px monospace';context.textAlign='left';
    context.fillText(String(Math.floor(state.distance)),30,498,175);
    context.textAlign='right';context.fillText(String(state.score),410,498,175);
    context.fillStyle='#51625a';context.font='bold 11px monospace';context.textAlign='left';
    context.fillText('METRES',30,520);context.textAlign='right';context.fillText('STYLE SCORE',410,520);
    return photo;
  }

  byId('savePhoto').addEventListener('click',()=>{const link=document.createElement('a');link.download=`mythical-guardian-${selected.id}-${Math.floor(state.distance)}m.png`;link.href=photoForDownload().toDataURL('image/png');link.click();});

  async function loadFinalGame(){
    state.mode='loading';state.ready=false;
    byId('pauseButton').disabled=true;
    const label=byId('loadingLabel');byId('retryLoad').hidden=true;
    let loaded=0;
    try{
      const loads=await Promise.allSettled(studies.map(study=>new Promise((resolve,reject)=>{
        if(sceneImages.has(study.id)){loaded++;resolve();return;}
        const image=new Image();
        image.onload=()=>{sceneImages.set(study.id,image);label.textContent=`Loading world · ${++loaded}/${studies.length}`;resolve();};
        image.onerror=()=>reject(new Error(study.name));image.src=study.file;
      })));
      if(loads.some(result=>result.status==='rejected'))throw new Error('Scene loading failed');
      state.ready=true;byId('loadingCard').hidden=true;resetRun();introShown=true;openGuide(true);
    }catch(error){
      state.ready=false;state.mode='loading';cancelAnimationFrame(state.raf);
      byId('loadingCard').hidden=false;byId('loadingCard').dataset.error=error.message;
      label.textContent='Could not load the world. Please retry.';byId('retryLoad').hidden=false;
    }
  }
  window.FRENS_HUB_GAME=Object.freeze({pause:pauseRun,resume:resumeRun,status:()=>({mode:state.mode,distance:state.distance}),photo:()=>state.mode==='over'?photoForDownload():null});
  byId('retryLoad').addEventListener('click',loadFinalGame);loadFinalGame();
})();
