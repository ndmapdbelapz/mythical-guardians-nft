/* Code-native pixel art for the runner's straight-flying sheriff arrows. */
(() => {
  'use strict';
  const arrow=document.createElement('canvas');arrow.width=124;arrow.height=32;
  const {r,p}=window.RF_WORLD_ART.painter(arrow.getContext('2d'));
  // Dark outside edge + ivory inner edge keep the thin silhouette readable on
  // both moon/snow/sand and the dark dungeon. Tip points left.
  p('#14202b',[[0,16],[23,2],[23,10],[88,10],[99,2],[121,2],[112,15],[122,28],[99,28],[88,21],[23,21],[23,30]]);
  r('#f1daa0',22,12,85,7);r('#ae7847',25,17,67,3);r('#fff0bd',24,12,69,2);
  p('#e4ebe0',[[3,16],[20,6],[20,26]]);p('#91b2ba',[[6,17],[20,16],[20,25]]);
  p('#ec7771',[[88,12],[100,4],[116,4],[107,12]]);
  p('#c43e51',[[88,20],[100,26],[116,26],[107,19]]);
  r('#ffb199',100,5,11,2);r('#f2a085',99,24,12,2);r('#eadbad',91,11,3,10);
  const duckCache=new WeakMap();
  function duckSprite(sprite){
    if(duckCache.has(sprite))return duckCache.get(sprite);
    const output=document.createElement('canvas');output.width=40;output.height=26;
    const ctx=output.getContext('2d');ctx.imageSmoothingEnabled=false;
    // Fold the body down/back; retain the head, eyes and ears at their original
    // pixel size instead of squashing the entire character into a pancake.
    ctx.drawImage(sprite,0,21,36,15,0,17,36,9);
    ctx.drawImage(sprite,0,0,36,21,4,0,36,21);
    duckCache.set(sprite,output);return output;
  }
  function drawArrow(ctx,item){
    const x=Math.round(item.x),y=Math.round(item.y);
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(let i=0;i<item.trail.length;i++){
      const t=item.trail[i];ctx.globalAlpha=(i+1)/item.trail.length*.6;
      ctx.fillStyle=i%2?'#ffdf93':'#e96568';ctx.fillRect(Math.round(t.x)+110,Math.round(t.y)-2,8,4);
    }
    ctx.globalAlpha=1;ctx.drawImage(arrow,x,y-16);
    ctx.restore();
  }
  window.RF_COMBAT_ART={drawArrow,duckSprite};
})();
