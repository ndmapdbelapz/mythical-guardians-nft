/* Expanded collection scenes for the runner. Kept out of assets/
 * so rebuilding the production captures cannot overwrite bundled artwork. */
(() => {
  'use strict';
  const {painter}=window.RF_WORLD_ART;
  const scenes=new Map();
  const font={A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',I:'11111/00100/00100/00100/00100/00100/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/11011/10001',Y:'10001/10001/01010/00100/00100/00100/00100'};
  function letters(r,text,x,y,scale=1,color='#dfce98'){
    for(const ch of text){const rows=font[ch]?.split('/');if(rows)rows.forEach((row,j)=>[...row].forEach((cell,i)=>{if(cell==='1')r(color,x+i*scale,y+j*scale,scale,scale);}));x+=6*scale;}
  }
  function layer(paint){const c=document.createElement('canvas');c.width=480;c.height=270;paint(painter(c.getContext('2d')));return c;}
  function dungeon(){
    const wall=layer(({r,l,e,p})=>{
      r('#2a273b',0,0,480,270);
      for(let y=0;y<211;y+=22)for(let x=-(y/22%2)*28;x<480;x+=56){r('#343044',x+1,y+1,54,20);r('#40394e',x+3,y+2,50,1);r('#302b40',x+40,y+14,12,5);}
      for(const x of [40,280]){
        p('#685c78',[[x,211],[x,51],[x+17,28],[x+34,20],[x+101,20],[x+119,29],[x+137,51],[x+137,211]]);
        p('#40394f',[[x+7,211],[x+7,52],[x+22,34],[x+36,27],[x+99,27],[x+115,35],[x+130,52],[x+130,211]]);
        p('#201f32',[[x+16,207],[x+16,59],[x+29,42],[x+41,36],[x+94,36],[x+108,43],[x+121,60],[x+121,207]]);
        r('#282538',x+24,91,89,117);r('#232234',x+24,96,89,2);
        for(const yy of [70,108,146,185]){r('#302c40',x,yy,16,2);r('#302c40',x+121,yy,16,2);r('#7b6a87',x+1,yy-20,2,19);}
        l('#393045',x+19,27,x+30,40,2);l('#393045',x+110,28,x+104,40,2);r('#80738d',x+64,20,12,14);
        // A low, glowing respawn plinth recessed behind the running lane.
        e('#333148',x+29,182,81,25);e('#526268',x+35,185,69,16);e('#2e3c49',x+40,187,59,11);e('#6eaaa0',x+48,190,43,6);e('#34444e',x+54,191,31,4);
        r('#9cd1b4',x+66,162,5,5);r('#62988d',x+68,150,2,3);r('#4f7a7b',x+77,177,2,2);r('#3c666b',x+56,170,2,3);
      }
      for(const x of [14,214,254,454]){
        // Wall torch: restrained stepped warm halo, iron bracket, orange flame.
        r('#40363e',x-11,92,29,48);r('#4c3c3e',x-7,98,21,31);r('#5c4540',x-3,107,13,20);
        r('#171d2a',x,119,5,27);r('#74604c',x-2,123,10,5);r('#9a6a48',x+1,110,4,18);
        p('#c28a52',[[x+3,98],[x+7,108],[x+8,118],[x-2,118],[x-2,111]]);r('#e4b967',x+1,108,4,11);r('#f1d68c',x+2,113,2,5);
      }
      r('#5f546c',0,211,480,4);r('#373346',0,215,480,4);
    });
    const floor=layer(({r})=>{r('#292b38',0,219,480,51);r('#827583',0,219,480,3);r('#434151',0,222,480,4);for(let y=229;y<270;y+=20)for(let x=-(y%40);x<480;x+=80){r('#353542',x+1,y,78,18);r('#1f2632',x,y+18,80,2);r('#4c4756',x+9,y+2,37,1);}});
    return {wall,floor};
  }
  function premiere(){
    const wall=layer(({r,e,p,l})=>{
      r('#1b2431',0,0,480,270);r('#303543',0,28,480,182);r('#3e404a',0,36,480,6);
      for(let x=0;x<480;x+=40){r('#343947',x,48,2,160);r('#41414b',x+4,204,30,3);}
      // Side poster cases and inset red cinema doors.
      for(const x of [10,378]){
        r('#171e29',x,100,91,104);r('#665c58',x+4,104,83,94);r('#1f2834',x+9,109,73,84);
        r('#95835b',x+17,116,57,7);letters(r,'DUMB',x+24,127,1);letters(r,'MONEY',x+21,137,1);
        for(const [dx,yy] of [[20,162],[39,156],[54,171]]){e('#a78d70',x+dx,yy,10,10);r('#4e7167',x+dx-2,yy+10,14,14);}
        r('#9e7758',x+7,106,2,85);
      }
      r('#161d29',118,100,244,106);
      for(let i=0;i<4;i++){
        const x=125+i*57;r('#8d555d',x,113,50,90);r('#513849',x+4,117,42,81);r('#293240',x+8,122,34,53);
        r('#6b5861',x+8,124,3,40);r('#b1a17c',x+38,161,3,15);r('#b79669',x+6,183,38,2);
      }
      // Marquee belongs to the facade; pixel typography uses no browser font.
      r('#776451',104,52,272,51);r('#b49762',111,56,258,40);r('#2d2b34',118,62,244,28);
      letters(r,'DUMB MONEY',135,67,3,'#e1c78d');
      r('#433a40',108,99,264,16);letters(r,'PREMIERE',216,103,1,'#e6c17e');
      for(let x=113;x<369;x+=13){r('#e0bc7b',x,57,2,2);r('#e0bc7b',x,95,2,2);}
      r('#88786b',105,115,7,88);r('#88786b',367,115,7,88);
      r('#605057',0,207,480,12);r('#382e3b',0,209,480,2);
      // Stanchions here are behind the lane, subdued relative to solid hazards.
      for(let x=14;x<480;x+=80){e('#826e53',x,179,5,5);r('#776955',x+1,184,3,25);r('#696158',x-3,209,11,2);l('#71434d',x+4,187,x+41,197,2);l('#71434d',x+41,197,x+81,187,2);}
    });
    const floor=layer(({r})=>{r('#303440',0,219,480,51);r('#a18271',0,219,480,3);r('#623e4c',0,223,480,27);r('#946654',0,224,480,2);r('#946654',0,247,480,2);for(let x=0;x<480;x+=48){r('#68424e',x+4,231,30,2);r('#222a35',x,259,1,11);r('#444650',x+4,261,27,1);}});
    return {wall,floor};
  }
  const builders={'scene-checkpoint':dungeon,'scene-movie-marquee':premiere};
  function get(id){if(!builders[id])return null;if(!scenes.has(id))scenes.set(id,builders[id]());return scenes.get(id);}
  function repeat(ctx,image,offset,y,height){ctx.save();ctx.beginPath();ctx.rect(0,y,960,height);ctx.clip();const x=-Math.floor(offset%960);ctx.drawImage(image,x,0,960,540);ctx.drawImage(image,x+960,0,960,540);ctx.restore();}
  function draw(ctx,id,background,distance=0){
    if(window.RF_COMMUNITY_SCENE_ART?.draw(ctx,id,distance))return;
    ctx.imageSmoothingEnabled=false;const custom=get(id),pixels=distance*7;
    ctx.fillStyle='#111923';ctx.fillRect(0,0,960,540);
    if(custom){repeat(ctx,custom.wall,pixels*.46,0,438);repeat(ctx,custom.floor,pixels,438,102);}
    else if(background?.complete&&background.naturalWidth){repeat(ctx,background,pixels*.46,0,438);repeat(ctx,background,pixels,438,102);}
  }
  window.RF_SCENE_ART={draw,hasOverride:(id)=>Boolean(builders[id])||Boolean(window.RF_COMMUNITY_SCENE_ART?.has(id))};
})();
