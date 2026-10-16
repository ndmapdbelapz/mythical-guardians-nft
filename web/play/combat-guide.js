/* Static instructional diagrams, rendered from the real game sprites. They do
 * not animate, pause the runner, or mutate its traits/random-number stream. */
(() => {
  'use strict';
  const data=window.ROBIN_FRENS_GAME_DATA;
  const fren=document.createElement('canvas');fren.width=fren.height=data.grid;
  const fctx=fren.getContext('2d');
  function pixels(ctx,trait){
    for(const [key,color] of Object.entries(trait?.pixels||{})){
      const index=Number(key);ctx.fillStyle=color;ctx.fillRect(index%data.grid,Math.floor(index/data.grid),1,1);
    }
  }
  for(const slot of data.order)pixels(fctx,data.base[slot]);
  const garment=data.base.clothes;
  const indices=Object.keys(garment.pixels).map(Number);
  const minX=Math.min(...indices.map(i=>i%data.grid)),minY=Math.min(...indices.map(i=>Math.floor(i/data.grid)));
  const maxX=Math.max(...indices.map(i=>i%data.grid)),maxY=Math.max(...indices.map(i=>Math.floor(i/data.grid)));
  const gear=document.createElement('canvas');gear.width=maxX-minX+1;gear.height=maxY-minY+1;
  const gctx=gear.getContext('2d');gctx.translate(-minX,-minY);pixels(gctx,garment);
  function item(ctx,x,y,size=42){
    const ratio=Math.min(size/gear.width,size/gear.height);
    ctx.save();ctx.translate(x,y);ctx.rotate(-.16);
    ctx.drawImage(gear,-gear.width*ratio/2,-gear.height*ratio/2,gear.width*ratio,gear.height*ratio);ctx.restore();
  }
  function arrow(ctx,x,y){
    ctx.save();ctx.translate(x,y);ctx.scale(.75,.75);
    window.RF_COMBAT_ART.drawArrow(ctx,{x:0,y:0,trail:[]});ctx.restore();
  }
  function guard(ctx,x,y,armored=false,angle=0){
    ctx.save();ctx.translate(x+36,y+116);ctx.rotate(angle);ctx.scale(.5,.5);
    window.RF_GUARD_ART.draw(ctx,{x:-72,hp:armored?2:1,flash:0},0,0);ctx.restore();
  }
  function shard(ctx,kind,x,y,angle){
    ctx.save();ctx.translate(x,y);ctx.scale(.45,.45);
    window.RF_GUARD_ART.drawDebris(ctx,{kind,x:0,y:0,rotation:angle,life:1});ctx.restore();
  }
  function next(ctx,x,y,length){
    ctx.fillStyle='#849b9b';ctx.fillRect(x,y,length,2);
    ctx.fillRect(x+length-6,y-4,2,10);ctx.fillRect(x+length-3,y-2,2,6);
  }
  function impact(ctx,x,y){
    ctx.fillStyle='#e5c478';ctx.fillRect(x-3,y-3,6,6);
    for(const [dx,dy] of [[-10,-11],[8,-12],[-13,7],[10,8]])ctx.fillRect(x+dx,y+dy,4,4);
  }
  for(const canvas of document.querySelectorAll('canvas[data-guide]')){
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#283b42';ctx.fillRect(12,120,236,2);
    switch(canvas.dataset.guide){
      case 'duck':
        ctx.drawImage(window.RF_COMBAT_ART.duckSprite(fren),20,68,80,52);
        arrow(ctx,142,25);arrow(ctx,122,50);
        ctx.fillStyle='#9bc6a3';ctx.fillRect(104,97,3,9);ctx.fillRect(107,103,3,6);ctx.fillRect(110,100,3,6);ctx.fillRect(113,94,3,9);
        break;
      case 'arrow':
        item(ctx,85,68,46);next(ctx,24,68,27);arrow(ctx,142,68);
        // A visible split in the shaft, with flying wood fragments.
        ctx.fillStyle='#101f29';ctx.fillRect(175,55,10,28);
        ctx.fillStyle='#e6c577';ctx.fillRect(174,48,8,3);ctx.fillRect(183,89,7,3);
        impact(ctx,129,68);
        break;
      case 'armour':
        item(ctx,21,84,29);guard(ctx,43,2,true);next(ctx,123,83,39);guard(ctx,174,2);
        shard(ctx,'helmet',211,38,-.35);shard(ctx,'plate',234,64,.35);
        break;
      case 'guard':
        item(ctx,37,78,44);next(ctx,68,77,33);guard(ctx,116,-2,false,.65);impact(ctx,126,70);
        break;
    }
    canvas.dataset.ready='true';
  }
})();
