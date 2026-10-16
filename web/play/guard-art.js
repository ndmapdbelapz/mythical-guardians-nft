/* Prototype-only human sheriff guard. All shapes use the same 4px character
 * grid as the fren; the tall, visible halberd, not a hidden wall, blocks jumps. */
(() => {
  'use strict';
  const scale=4,width=36,height=58,cache=new Map();
  const C={ink:'#15212b',edge:'#d5cfab',skin:'#d8aa7e',light:'#f1c99a',skinShade:'#aa765c',
    hair:'#583e36',red:'#93465b',redLight:'#c9676e',redDark:'#62364b',gold:'#dbb968',
    leather:'#70533f',boot:'#3e3640',steel:'#829fa9',bright:'#dae4d9',shade:'#43566d'};
  function make(w,h,paint){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;paint(window.RF_WORLD_ART.painter(canvas.getContext('2d')));return canvas;}
  function helmet({r,p},x=0,y=0){
    p(C.ink,[[x,y+5],[x+3,y+1],[x+11,y],[x+15,y+4],[x+15,y+13],[x+11,y+14],[x+11,y+8],[x,y+8]]);
    p(C.steel,[[x+1,y+5],[x+4,y+2],[x+10,y+1],[x+13,y+4],[x+13,y+12],[x+12,y+12],[x+12,y+7],[x+1,y+7]]);
    r(C.bright,x+4,y+2,6,1);r(C.bright,x+2,y+6,11,1);r(C.shade,x+10,y+3,2,3);
    r(C.gold,x+6,y+3,2,3);r(C.shade,x+13,y+6,1,6);
  }
  function breastplate({r,p},x=0,y=0){
    p(C.ink,[[x+3,y],[x+13,y],[x+17,y+3],[x+15,y+10],[x+9,y+13],[x+2,y+10],[x,y+3]]);
    p(C.steel,[[x+4,y+1],[x+12,y+1],[x+15,y+3],[x+13,y+9],[x+9,y+11],[x+4,y+9],[x+2,y+3]]);
    r(C.bright,x+3,y+2,11,1);r(C.bright,x+4,y+3,2,5);r(C.shade,x+11,y+4,3,5);
    r(C.gold,x+7,y+4,4,4);r(C.redDark,x+8,y+5,2,2);r(C.bright,x+7,y+9,4,1);
  }
  const fragments={helmet:make(16,15,p=>helmet(p)),plate:make(18,14,p=>breastplate(p)),
    shoulder:make(10,6,({r,p})=>{p(C.ink,[[0,2],[3,0],[8,1],[10,5],[0,5]]);r(C.steel,1,2,7,3);r(C.bright,3,1,4,1);})};
  function sprite(armored,frame){
    const key=`${armored}:${frame}`;if(cache.has(key))return cache.get(key);
    const image=make(width,height,painter=>{
      const {r,p}=painter,bob=[0,1,0,1][frame],stride=[-2,0,2,0][frame];
      // Long upright halberd: highlighted shaft and broad steel axe head.
      r(C.ink,3,9,4,48);r(C.leather,4,11,2,45);r(C.gold,4,12,1,41);
      p(C.ink,[[5,1],[8,8],[7,12],[11,12],[12,16],[8,20],[3,17],[1,14],[3,10]]);
      p(C.bright,[[5,3],[7,9],[5,12],[4,9]]);
      p(C.steel,[[6,11],[10,13],[10,15],[7,18],[4,16],[3,14],[5,14]]);
      r(C.bright,8,13,2,3);r(C.shade,5,16,3,1);r(C.gold,3,20,4,2);
      // Back arm and leg, slightly darker than the foreground side.
      r(C.ink,26,36+bob,7,13);r(C.redDark,27,37+bob,4,9);r(C.skinShade,28,46+bob,3,3);
      p(C.ink,[[22,46],[28,46],[28+stride,55],[30+stride,55],[30+stride,58],[21+stride,58],[21+stride,54]]);
      r(C.leather,23,47,4,6);r(C.boot,22+stride,53,6,4);
      // Human face: single protruding nose, jaw and moustache. No cat ears.
      p(C.ink,[[16,23+bob],[27,23+bob],[30,27+bob],[29,34+bob],[25,37+bob],[17,35+bob],[16,32+bob],[13,32+bob],[13,29+bob],[15,28+bob]]);
      r(C.skin,16,26+bob,12,8);r(C.light,16,27+bob,6,5);r(C.skin,14,30+bob,4,2);
      r(C.skinShade,22,33+bob,5,3);r(C.hair,26,27+bob,2,5);
      r(C.hair,16,28+bob,5,1);r(C.ink,16,29+bob,2,2);r(C.bright,16,29+bob,1,1);
      r(C.hair,15,32+bob,6,1);r(C.hair,18,33+bob,4,1);r(C.light,18,34+bob,3,1);
      // Leather cap with a brass sheriff badge, a red surcoat and belt.
      r(C.ink,15,24+bob,14,3);r(C.leather,17,23+bob,10,3);r(C.gold,15,26+bob,13,1);r(C.gold,22,24+bob,2,2);
      p(C.ink,[[17,35+bob],[25,35+bob],[30,39+bob],[29,49],[12,49],[13,39+bob]]);
      p(C.red,[[17,36+bob],[24,36+bob],[28,39+bob],[27,48],[14,48],[15,39+bob]]);
      r(C.redLight,16,38+bob,3,7);r(C.redDark,24,39+bob,3,8);
      r(C.gold,20,37+bob,2,3);r(C.gold,19,38+bob,4,1);r(C.gold,14,47,13,1);
      r(C.leather,14,44,14,2);r(C.gold,20,44,3,2);
      // Forearm visibly grips the shaft. A booted marching step, not a glide.
      r(C.ink,7,38+bob,12,6);r(C.redLight,9,39+bob,9,3);r(C.gold,8,39+bob,2,3);
      r(C.ink,3,37+bob,5,7);r(C.skin,3,38+bob,4,5);r(C.light,3,38+bob,2,2);
      p(C.ink,[[14,48],[21,48],[22-stride,54],[21-stride,58],[11-stride,58],[11-stride,55],[14-stride,54]]);
      r(C.leather,15,49,5,4);r(C.boot,13-stride,54,7,3);r(C.edge,12-stride,57,8,1);
      if(armored){
        // The same man with detachable metal armour; red trim remains visible.
        r(C.ink,23,19+bob,6,5);r(C.redLight,24,19+bob,4,3);r(C.redDark,27,21+bob,3,4);
        helmet(painter,14,22+bob);breastplate(painter,12,35+bob);
        r(C.ink,26,36+bob,7,5);r(C.steel,27,37+bob,5,3);r(C.bright,27,36+bob,4,1);
        r(C.steel,14-stride,52,5,3);r(C.bright,14-stride,52,1,3);
      }
    });cache.set(key,image);return image;
  }
  function draw(ctx,guard,ground,time){
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#080f1955';ctx.fillRect(Math.round(guard.x)+34,ground+2,94,5);
    const image=sprite(guard.hp>1,Math.floor(time*8)%4);
    ctx.drawImage(image,Math.round(guard.x),ground-height*scale,width*scale,height*scale);
    if(guard.flash>0){ctx.globalAlpha=guard.flash/.14;ctx.fillStyle=C.bright;ctx.fillRect(Math.round(guard.x)+32,ground-124,8,8);}
    ctx.restore();
  }
  function boxes(guard,ground,previous=false){
    const x=previous?guard.px:guard.x;
    return [{x:x+16,y:ground-220,width:8,height:212},
      {x:x+56,y:ground-132,width:56,height:126},
      {x:x+32,y:ground-80,width:32,height:24}];
  }
  function drawDebris(ctx,item){
    const image=item.kind==='guard'?sprite(false,2):fragments[item.kind];
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,item.life*2);
    ctx.translate(Math.round(item.x),Math.round(item.y));ctx.rotate(item.rotation);
    ctx.drawImage(image,-image.width*2,-image.height*2,image.width*4,image.height*4);ctx.restore();
  }
  window.RF_GUARD_ART={draw,boxes,drawDebris};
})();
