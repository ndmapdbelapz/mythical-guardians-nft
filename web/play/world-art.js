/* Prototype-only art. No dependency from the production site. Coordinates are
 * authored on a 2px grid; gallery, review sheet and runner use this same renderer. */
(() => {
  'use strict';
  const C={ink:'#18212b',shade:'#35434d',steel:'#71858b',silver:'#bac6bd',cream:'#eadfb7',wood:'#86603e',tan:'#c59960',gold:'#ddb65c',red:'#c76567',darkRed:'#773f50',mint:'#81c1a0',green:'#4f826b',blue:'#7babc0',purple:'#a28bb5',paper:'#dbd7c0'};
  const definitions={}, cache=new Map();
  function painter(ctx){
    const r=(c,x,y,w,h)=>{ctx.fillStyle=C[c]||c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const l=(c,x,y,x2,y2,t=1)=>{const n=Math.max(Math.abs(x2-x),Math.abs(y2-y));for(let i=0;i<=n;i++)r(c,x+(x2-x)*i/(n||1),y+(y2-y)*i/(n||1),t,t);};
    const e=(c,x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(((i+.5-w/2)/(w/2))**2+((j+.5-h/2)/(h/2))**2<=1)r(c,x+i,y+j,1,1);};
    const p=(c,points)=>{const minY=Math.min(...points.map(a=>a[1])),maxY=Math.max(...points.map(a=>a[1]));for(let y=minY;y<maxY;y++){const hits=[];points.forEach(([x1,y1],i)=>{const [x2,y2]=points[(i+1)%points.length];if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))hits.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));});hits.sort((a,b)=>a-b);for(let i=0;i<hits.length;i+=2)r(c,Math.ceil(hits[i]),y,Math.ceil(hits[i+1])-Math.ceil(hits[i]),1);}};
    const box=(x,y,w,h,base='steel',top='silver')=>{r(base,x,y,w,h);r(top,x,y,w,2);r('ink',x+w-3,y+2,3,h-2);};
    const wheel=(x,y,size=7)=>{e('ink',x,y,size,size);e('steel',x+2,y+2,size-4,size-4);};
    const book=(x,y,w,h,color)=>{box(x,y,w,h,color,color);r('paper',x+3,y+2,w-5,h-4);r(color,x+5,y+3,w-7,1);};
    const cash=(x,y,w=22)=>{box(x,y,w,7,'green','mint');r('cream',x+w/2-2,y,4,7);r('shade',x+2,y+4,5,1);};
    const flame=(x,y)=>{p('red',[[x+5,y],[x+10,y+9],[x+12,y+15],[x+9,y+20],[x+1,y+20],[x-1,y+13],[x+2,y+8]]);p('gold',[[x+5,y+6],[x+9,y+14],[x+7,y+19],[x+2,y+18],[x+2,y+13]]);r('cream',x+4,y+14,3,5);};
    const monitor=(x,y,w=24,h=18)=>{box(x,y,w,h,'shade','steel');r('ink',x+3,y+3,w-6,h-6);r('steel',x+w/2-2,y+h,4,4);r('silver',x+5,y+h+4,w-10,2);};
    return {r,l,e,p,box,wheel,book,cash,flame,monitor};
  }
  function def(id,name,sourceW,sourceH,paint){
    // Static gameplay size, never dependent on run speed. Large props are fitted
    // proportionally to the original short jump; small props keep their size.
    const scale=Math.min(1,34/sourceW,30/sourceH);
    const w=Math.max(1,Math.floor(sourceW*scale)),h=Math.max(1,Math.floor(sourceH*scale));
    definitions[id]={name,width:w*2,height:h*2,w,h,sourceW,sourceH,paint};
  }

  // Woodland and outdoor silhouettes: round cut ends, roots, branching plants.
  def('stump','Split tree stump',32,32,({r,e,l})=>{r('wood',8,8,20,22);e('tan',7,5,22,9);e('wood',11,7,14,5);e('cream',14,8,8,2);r('wood',3,28,29,4);l('ink',13,13,11,28,2);l('tan',24,13,24,27,2);r('wood',3,18,9,5);r('tan',4,16,4,3);});
  def('log','Fallen log',44,21,({r,e,l})=>{r('wood',6,7,32,13);e('wood',1,5,14,16);e('tan',32,4,12,17);e('wood',35,7,6,11);e('cream',37,9,2,6);l('tan',8,7,30,7,2);l('ink',10,15,29,15);l('wood',18,8,23,0,3);});
  def('target','Archery target',32,39,({r,e,l})=>{l('wood',13,22,5,38,3);l('wood',19,22,27,38,3);e('tan',1,0,30,30);e('cream',4,3,24,24);e('red',8,7,16,16);e('cream',12,11,8,8);r('red',14,13,4,4);});
  def('thorns','Thorn bramble',39,25,({l,r})=>{for(let i=0;i<4;i++){const x=4+i*9;l('green',x,24,x+4,6,3);l('mint',x+3,12,x-1,7,2);l('green',x+4,17,x+10,10,3);r('tan',x+8,8,2,4);}r('wood',1,22,36,3);});
  def('mushrooms','Moonlit mushrooms',36,26,({r,e})=>{[[2,10,16,12],[16,1,19,14]].forEach(([x,y,w,h])=>{r('paper',x+w/2-2,y+h-2,5,26-y-h);e('purple',x,y,w,h);r('darkRed',x,y+h-3,w,3);r('cream',x+4,y+3,4,3);r('cream',x+w-6,y+5,3,3);});});
  def('roots','Exposed tree roots',42,22,({l,r})=>{l('wood',0,20,14,8,5);l('wood',14,8,28,16,5);l('wood',25,13,35,2,5);l('wood',30,12,40,21,4);l('tan',3,17,14,9,2);l('tan',17,10,26,15,2);r('green',10,7,8,2);});
  def('rock','Trail boulder',36,24,({p,l})=>{p('steel',[[0,23],[4,9],[14,1],[25,3],[35,14],[35,24]]);p('silver',[[5,10],[14,2],[24,4],[18,12]]);p('shade',[[19,12],[25,5],[34,14],[34,23],[26,23]]);l('silver',4,18,16,18);});
  def('snowLog','Snow-covered log',43,24,({r,e})=>{r('wood',3,10,38,14);e('tan',32,8,11,16);e('wood',35,11,5,10);r('silver',2,6,32,8);r('cream',6,4,23,6);r('silver',8,12,4,5);});
  def('iceRock','Blue ice ridge',34,30,({p,l})=>{p('blue',[[0,30],[4,15],[12,0],[22,6],[33,24],[33,30]]);p('silver',[[6,16],[12,2],[17,10],[15,28]]);l('cream',10,7,7,19,2);p('steel',[[20,7],[29,20],[33,29],[22,29]]);});
  def('snowdrift','Powder drift',43,20,({e,r})=>{e('blue',0,6,43,22);e('silver',3,1,36,23);r('cream',12,2,17,3);r('blue',0,18,43,2);});
  def('sapling','Snowy young pine',28,35,({r,p})=>{r('wood',12,26,5,9);p('green',[[14,0],[22,14],[19,14],[27,26],[1,26],[8,14],[5,14]]);p('silver',[[14,0],[22,14],[5,14]]);r('cream',10,9,9,3);r('silver',3,24,17,3);});
  def('cactus','Desert cactus',29,38,({r,e})=>{e('green',10,0,11,38);r('green',2,14,6,14);r('green',4,24,10,5);r('green',22,8,6,15);r('green',17,19,10,5);r('mint',12,3,3,31);r('mint',3,15,2,9);r('tan',19,5,2,2);r('cream',18,12,2,2);r('tan',11,26,2,2);});
  def('tumbleweed','Tumbleweed',35,30,({e,l})=>{e('wood',1,1,33,29);e('#b59258',3,3,29,25);for(let i=0;i<6;i++){l('tan',3+i*5,5,29-i*4,26);l('cream',4,7+i*3,30,22-i*3);}e('wood',12,10,9,8);l('tan',4,22,27,7);});
  def('sandstone','Eroded sandstone',39,26,({p,r})=>{p('wood',[[0,26],[4,13],[13,11],[16,0],[28,2],[35,13],[39,26]]);r('tan',18,3,10,5);r('gold',6,14,24,3);r('tan',4,21,31,3);r('shade',27,8,4,4);});
  def('amphora','Half-buried amphora',29,31,({r,e})=>{e('wood',1,8,27,15);e('ink',4,11,21,8);e('tan',5,7,20,24);r('tan',10,2,11,9);r('cream',8,1,15,3);r('wood',10,4,10,2);r('wood',7,17,16,4);r('gold',2,28,26,3);});
  def('cairn','Stacked trail stones',33,31,({e,r})=>{[[0,23,33,8],[5,15,23,9],[10,8,15,9],[12,1,12,8]].forEach(([x,y,w,h])=>{e('steel',x,y,w,h);r('silver',x+4,y+1,w-8,2);});});
  def('backpack','Hiking pack',29,33,({r,e,box})=>{e('wood',1,2,28,31);box(5,5,20,27,'green','mint');r('tan',7,1,16,5);r('cream',9,2,2,5);r('cream',19,2,2,5);r('mint',8,19,15,10);r('gold',13,20,4,3);});
  def('trailMarker','Trail marker',28,35,({r,p})=>{r('wood',12,0,4,34);p('tan',[[1,4],[20,4],[27,10],[20,16],[1,16]]);r('cream',4,7,13,2);r('steel',5,30,20,5);});
  def('sled','Wooden sled',43,24,({r,l})=>{r('silver',1,20,41,3);l('silver',38,21,41,14,2);r('wood',6,13,3,7);r('wood',31,13,3,7);r('tan',3,9,33,5);r('wood',8,7,2,8);r('wood',26,7,2,8);l('tan',35,9,41,1);});
  def('fishingBox','Ice-fishing kit',35,30,({r,box,l})=>{box(1,12,28,18,'red','cream');r('ink',12,19,5,3);r('steel',31,3,3,27);l('wood',30,11,20,0,2);l('silver',21,1,10,16);});
  def('iceHole','Ice fishing hole',44,17,({e,r})=>{e('silver',0,0,44,17);e('blue',4,3,36,11);e('#142a39',8,5,28,8);r('cream',7,2,14,2);r('blue',2,11,4,4);});
  def('reeds','Frozen reed bed',36,32,({r,l})=>{for(let i=0;i<5;i++){const x=3+i*7,y=(i%3)*5;l('tan',x,31,x+2,y+3,2);r('wood',x,y,4,9);r('silver',x,y,4,3);}r('silver',0,29,35,3);});

  // Cinema, respawn chamber and space exploration.
  def('projector','Film projector',35,35,({r,e,box})=>{for(const x of [1,19]){e('steel',x,0,15,15);e('ink',x+4,4,7,7);r('silver',x+6,1,3,3);}box(4,14,25,16,'shade','steel');r('gold',28,18,7,8);r('ink',8,19,14,4);r('silver',5,30,4,5);r('silver',24,30,4,5);});
  def('reel','Leaning film reel',31,31,({e,r})=>{e('silver',0,0,31,31);e('steel',2,2,27,27);e('ink',12,12,7,7);[[13,3],[3,11],[20,9],[6,22],[19,22]].forEach(([x,y])=>e('ink',x,y,7,6));r('cream',8,2,10,2);});
  def('filmCans','Film canisters',36,25,({e,r})=>{for(let i=0;i<3;i++){const x=i%2*4,y=17-i*8;r('steel',x,y,31,8);e('silver',x,y-2,31,6);r('ink',x+1,y+5,29,2);}r('gold',11,19,12,4);});
  def('camera','Camera tripod',33,40,({r,box,l})=>{box(6,3,22,15,'shade','steel');r('ink',28,7,5,9);r('gold',8,6,5,4);r('silver',16,18,3,19);l('steel',17,21,2,39,2);l('steel',18,21,30,39,2);r('red',12,0,7,3);});
  def('brazier','Checkpoint brazier',30,38,({r,p,flame})=>{flame(9,0);p('steel',[[1,20],[29,20],[24,28],[7,28]]);r('silver',1,20,28,2);r('wood',13,28,5,7);r('steel',6,35,19,3);});
  def('respawnStone','Respawn rune stone',30,35,({p,r,l})=>{p('#655b77',[[1,35],[1,9],[7,1],[23,1],[29,9],[29,35]]);r('purple',7,2,16,2);l('mint',9,13,15,7,2);l('mint',15,7,21,13,2);l('mint',21,13,15,20,2);l('mint',15,20,9,13,2);r('mint',14,23,3,6);r('steel',5,32,20,3);});
  def('urn','Dungeon urn',28,32,({r,e})=>{e('#746080',2,7,25,25);e('purple',5,9,17,21);r('#746080',8,2,12,8);r('gold',6,1,16,3);r('gold',3,14,23,3);r('shade',17,9,5,22);r('cream',6,9,3,6);});
  def('rubble','Broken dungeon masonry',41,23,({box,r})=>{box(0,13,21,10,'#686476','purple');box(21,10,19,13,'shade','steel');box(9,1,23,12,'steel','silver');r('ink',20,3,2,7);r('ink',15,7,7,2);});
  def('popcorn','Spilled popcorn tub',33,32,({p,r,e})=>{p('paper',[[4,9],[27,9],[24,32],[8,32]]);for(const x of [8,17])r('red',x,12,4,18);for(const [x,y] of [[4,5],[10,1],[19,2],[24,6],[12,7],[20,8],[29,25],[0,27]]){e('gold',x,y,6,6);r('cream',x+1,y,4,3);}r('cream',9,20,14,4);});
  def('cash','Money bundles',38,25,({cash})=>{cash(0,18,26);cash(12,10,26);cash(6,2,24);});
  def('velvetRope','Premiere velvet rope',41,37,({r,e,l})=>{for(const x of [3,32]){e('gold',x,0,7,7);r('tan',x+2,7,3,28);r('gold',x-2,34,11,3);}l('darkRed',8,11,21,18,3);l('red',20,18,34,11,3);});
  def('clapper','Premiere clapperboard',34,30,({r,l,box})=>{box(1,11,32,19,'shade','steel');r('cream',4,16,24,2);r('silver',4,22,9,2);r('silver',16,22,10,2);l('ink',1,0,32,7,5);for(let i=0;i<5;i++)l('cream',3+i*6,1+i,5+i*6,5+i,2);});
  def('rover','Lunar rover',46,32,({r,wheel,box,l})=>{box(5,13,33,12,'steel','silver');r('gold',24,14,10,6);r('silver',16,4,3,10);r('shade',11,2,14,6);r('blue',12,2,8,3);l('silver',33,14,40,0);r('red',40,0,3,3);r('shade',0,24,45,2);for(const x of [1,18,35])wheel(x,23,10);});
  def('crater','Raised crater rim',48,21,({e,r})=>{e('steel',0,0,48,21);e('silver',2,0,43,15);e('shade',7,3,33,12);e('ink',12,6,23,7);r('cream',9,2,10,2);r('steel',4,16,36,5);r('silver',4,16,5,2);});
  def('lander','Small lunar lander',38,38,({r,p,l})=>{p('silver',[[13,0],[24,0],[28,9],[28,24],[9,24],[9,9]]);r('cream',13,2,10,3);r('blue',13,9,11,7);r('ink',15,11,7,3);r('gold',10,20,17,6);l('steel',13,25,3,36,3);l('steel',25,25,34,36,3);r('silver',0,35,9,3);r('silver',29,35,9,3);r('shade',16,26,6,4);});
  def('moonFlag','Lunar flag and sample bag',39,40,({r,p,box})=>{r('silver',9,1,2,38);p('paper',[[11,1],[34,1],[31,7],[34,15],[11,15]]);r('red',12,6,18,2);r('blue',12,2,6,5);box(18,27,17,13,'tan','cream');r('wood',24,28,4,12);r('steel',2,36,16,4);});
  def('fuelDrum','Rocket fuel drum',28,34,({r,e})=>{r('steel',2,4,24,27);e('silver',2,0,24,8);e('steel',2,27,24,7);r('gold',2,13,24,9);r('ink',11,14,6,6);r('silver',5,8,3,18);r('shade',20,7,4,22);});
  def('cone','Launch safety cone',30,32,({p,r})=>{p('red',[[12,0],[18,0],[26,28],[4,28]]);r('cream',10,9,11,4);r('cream',7,20,17,4);r('shade',0,28,30,4);});
  def('nozzle','Rocket engine nozzle',35,30,({p,r})=>{r('silver',10,0,15,6);p('steel',[[12,6],[22,6],[33,27],[1,27]]);r('shade',4,24,26,5);r('gold',6,20,22,3);r('silver',3,28,30,2);});
  def('serviceCart','Launch service cart',41,34,({box,r,wheel})=>{box(2,10,32,15,'steel','silver');box(6,1,22,10,'tan','gold');r('cream',15,2,4,8);r('silver',36,2,3,24);r('steel',31,25,8,3);wheel(5,27);wheel(29,27);});

  // Digital world and trading room use their own readable physical metaphors.
  def('gasCan','Gas-fee canister',30,35,({r,box,p})=>{r('gold',6,1,15,5);r('ink',9,3,8,3);r('steel',23,1,5,8);box(3,7,25,28,'tan','gold');r('wood',6,11,19,19);p('cream',[[16,12],[22,21],[21,26],[17,29],[12,27],[10,23]]);r('gold',15,22,4,5);});
  def('blockCube','Linked data block',36,32,({p,r,l})=>{p('mint',[[1,8],[17,0],[35,8],[19,17]]);p('green',[[1,8],[19,17],[19,32],[1,23]]);p('steel',[[19,17],[35,8],[35,24],[19,32]]);l('silver',5,9,16,14);r('cream',8,16,5,5);r('mint',24,18,5,5);});
  def('validator','Validator terminal',28,37,({box,r})=>{box(3,0,23,32,'shade','steel');r('ink',6,4,17,14);r('mint',9,12,3,3);r('mint',12,14,3,3);r('mint',15,8,3,7);r('gold',8,23,4,3);r('green',15,23,7,3);r('silver',0,32,28,5);});
  def('chainLinks','Blockchain links',43,25,({e,r})=>{[[0,9],[13,2],[26,8]].forEach(([x,y],i)=>{e(i===1?'mint':'silver',x,y,17,15);e('ink',x+4,y+4,9,7);});r('steel',10,12,5,3);r('green',23,10,5,3);});
  def('redCandle','Red price candle',28,39,({r})=>{r('red',13,0,3,38);r('darkRed',5,9,20,21);r('red',5,9,16,19);r('#ed9a87',7,11,3,15);r('ink',8,31,13,2);});
  def('orderRoll','Order tape roll',36,30,({e,r,l})=>{r('paper',8,5,22,22);e('cream',0,0,21,17);e('wood',5,4,11,9);e('ink',8,6,5,5);r('paper',20,8,10,19);l('paper',21,26,34,29,3);for(let y=10;y<24;y+=5)r('green',23,y,5,1);});
  def('tradingScreen','Trading terminal',35,34,({monitor,r,l})=>{monitor(1,0,32,24);l('red',6,7,12,14,2);l('red',12,14,19,10,2);l('red',19,10,27,18,2);r('gold',6,19,6,2);});
  def('gameCases','Game case stack',35,27,({book,r})=>{book(0,19,34,8,'purple');book(4,10,29,8,'green');book(9,1,25,8,'red');r('cream',12,3,5,3);});
  def('consoleBox','Console delivery box',37,31,({box,r})=>{box(0,3,37,28,'blue','silver');r('ink',3,7,31,20);r('paper',6,10,7,14);r('shade',8,11,2,11);r('purple',18,16,11,5);r('silver',19,15,4,2);r('mint',25,17,2,2);r('paper',4,1,21,2);});
  def('handheld','Handheld display',29,34,({box,r})=>{box(3,0,23,30,'purple','silver');r('ink',6,4,17,13);r('mint',8,6,13,9);r('green',10,10,7,3);r('ink',7,21,8,2);r('ink',10,18,2,8);r('red',20,21,3,3);r('shade',0,30,29,4);});
  def('gameDisplay','New-release display',31,38,({box,r})=>{box(0,0,31,38,'wood','tan');r('red',2,2,27,5);for(let row=0;row<2;row++){for(let i=0;i<3;i++){r(['purple','blue','green'][i],3+i*9,10+row*13,7,10);r('paper',4+i*9,12+row*13,4,2);}r('cream',1,21+row*13,28,2);}});

  // Public buildings, work and home. Items remain smaller than a fren.
  def('rosePlanter','White House rose planter',39,32,({r,e,p})=>{p('paper',[[1,17],[38,17],[33,32],[6,32]]);r('silver',0,16,39,3);for(const x of [5,16,27]){r('green',x+2,6,2,11);e('green',x-1,12,10,5);e('red',x,1,8,8);r('cream',x+3,4,2,2);}});
  def('securityBarrier','Security road barrier',45,28,({p,r,l})=>{p('steel',[[4,28],[7,0],[38,0],[41,28]]);r('silver',9,1,27,4);r('shade',0,24,45,4);r('gold',7,11,32,7);for(let x=10;x<37;x+=9)l('ink',x,11,x-4,17,3);});
  def('podium','Press briefing podium',32,38,({r,p,e})=>{r('ink',10,1,2,8);r('steel',5,0,8,2);p('wood',[[3,9],[30,9],[26,37],[8,37]]);r('tan',1,7,31,4);e('blue',10,17,14,13);e('gold',13,20,8,7);r('cream',16,21,2,4);r('tan',4,35,27,3);});
  def('bollards','Security bollard pair',33,33,({r,e})=>{for(const [x,y] of [[1,7],[21,0]]){e('silver',x,y,10,8);r('paper',x,y+4,10,29-y);r('steel',x+7,y+5,3,28-y);r('gold',x,y+10,10,3);}});
  def('lawBooks','Bound law volumes',37,29,({book})=>{book(0,19,36,10,'darkRed');book(3,10,31,9,'blue');book(8,1,28,9,'green');});
  def('ballotBox','Ballot box',32,34,({r,box})=>{box(0,9,32,25,'blue','silver');r('ink',8,10,16,2);r('paper',11,0,10,12);r('steel',13,3,6,1);r('paper',9,20,14,9);r('green',12,23,3,3);r('green',15,21,3,5);});
  def('stanchion','Capitol brass barrier',38,34,({e,r,l})=>{for(const x of [2,28]){e('gold',x,0,7,7);r('tan',x+2,6,3,27);r('gold',x-1,31,9,3);}l('silver',8,10,19,17,2);l('silver',19,17,29,10,2);});
  def('briefcase','Committee briefcase',35,25,({r,box})=>{r('tan',11,0,14,5);r('ink',14,2,8,3);box(0,5,35,20,'wood','tan');r('darkRed',2,13,29,3);r('gold',7,12,4,5);r('gold',24,12,4,5);});
  def('chair','Wheeled office chair',35,39,({r,e,l,wheel})=>{e('blue',7,0,22,18);r('steel',17,15,3,9);r('blue',3,22,30,5);r('silver',1,15,3,11);r('silver',31,15,3,11);r('steel',17,27,3,8);l('steel',18,33,4,37,2);l('steel',18,33,31,37,2);wheel(2,35,5);wheel(28,35,5);});
  def('printer','Office printer',38,29,({box,r})=>{box(1,7,36,22,'steel','silver');r('paper',8,0,22,9);r('shade',11,2,15,1);r('ink',5,16,27,10);r('paper',9,19,18,10);r('steel',11,22,13,1);r('mint',30,11,3,2);});
  def('archiveBox','Archive file box',35,29,({r,box})=>{box(1,7,33,22,'tan','cream');r('paper',5,2,6,6);r('gold',12,0,7,8);r('blue',21,3,6,5);r('cream',9,17,16,7);r('ink',13,18,8,2);});
  def('waterCooler','Water cooler',25,40,({r,e,box})=>{e('blue',5,0,15,20);r('silver',7,1,8,2);r('steel',7,13,11,5);box(2,18,22,22,'paper','silver');r('shade',7,24,13,10);r('blue',8,23,3,4);r('red',15,23,3,4);});
  def('slippers','Cat slippers',40,18,({e,r,p})=>{for(const [x,y] of [[0,5],[21,0]]){e('purple',x,y,18,18-y/3);e('darkRed',x+4,y+7,10,6);p('purple',[[x+1,y+4],[x+1,y-1],[x+6,y+3]]);p('purple',[[x+12,y+3],[x+17,y-1],[x+17,y+6]]);r('cream',x+4,y+4,2,2);r('cream',x+12,y+4,2,2);}});
  def('laundry','Laundry basket',36,29,({r,e,p})=>{e('blue',3,1,18,13);e('purple',16,3,16,13);p('tan',[[0,9],[35,9],[31,29],[4,29]]);r('cream',0,9,35,3);for(let y=16;y<28;y+=5)for(let x=5;x<31;x+=6)r('wood',x,y,3,2);});
  def('pillows','Bed pillows',40,27,({e,l})=>{e('purple',0,12,40,15);l('paper',5,16,33,16);e('paper',3,1,31,15);l('silver',7,12,30,12);});
  def('toyTrain','Toy train',43,24,({r,wheel,box})=>{box(1,10,22,10,'red','gold');box(4,1,10,10,'blue','silver');r('cream',6,3,6,5);r('ink',18,5,3,6);r('wood',23,17,4,3);box(27,12,16,8,'green','mint');for(const x of [2,16,29,37])wheel(x,18,6);});
  def('miniArcade','Bartop arcade',31,40,({p,r})=>{p('purple',[[3,0],[28,0],[28,21],[31,27],[31,40],[0,40],[0,27],[4,20]]);r('gold',6,2,19,4);r('ink',6,9,19,15);r('green',8,11,15,11);r('cream',12,15,7,3);r('silver',2,26,26,3);r('red',20,25,3,2);r('ink',7,23,2,4);r('shade',4,32,22,7);r('gold',15,33,3,2);});
  def('joystick','Arcade fight stick',39,25,({p,r,e})=>{p('purple',[[4,13],[32,13],[39,20],[39,25],[0,25],[0,20]]);r('silver',4,14,31,3);r('steel',9,3,3,12);e('red',6,0,9,8);for(const [x,y] of [[23,15],[29,17],[20,19],[26,21]])r('gold',x,y,3,2);});
  def('beanbag','Gaming beanbag',40,29,({e,p,r})=>{e('darkRed',0,0,40,29);p('purple',[[8,3],[29,2],[35,15],[29,26],[8,26],[3,18]]);e('darkRed',11,8,21,13);r('red',8,24,22,2);});
  def('soda','Stacked soda cans',33,27,({r,e})=>{for(const [x,y,c] of [[0,12,'red'],[20,12,'blue'],[10,0,'purple']]){r(c,x,y+2,12,13);e('silver',x,y,12,4);r('cream',x+5,y+6,3,6);r('ink',x+5,y+1,3,1);}});

  // Waterfront, machinery and old-world props.
  def('lifering','Life ring',32,32,({e,r})=>{e('paper',0,0,32,32);e('ink',8,8,16,16);r('red',13,0,6,8);r('red',13,24,6,8);r('red',0,13,8,6);r('red',24,13,8,6);});
  def('rope','Mooring rope coil',39,21,({e})=>{for(let i=0;i<3;i++){e('wood',0,8-i*4,39,13);e('tan',2,8-i*4,35,10);e('wood',7,10-i*4,25,6);e('cream',11,10-i*4,17,5);e('ink',15,11-i*4,9,3);}});
  def('capstan','Deck capstan',31,30,({r,e})=>{r('steel',8,4,16,23);e('silver',2,0,28,9);r('tan',7,13,18,3);r('tan',7,18,18,3);r('silver',1,27,30,3);r('ink',0,5,31,2);});
  def('anchor','Deck anchor',36,36,({e,r,l})=>{e('silver',13,0,10,10);e('ink',16,3,4,4);r('steel',16,8,4,24);r('silver',5,12,27,3);l('steel',3,25,18,35,3);l('steel',18,35,32,25,3);r('silver',0,22,8,5);r('silver',29,22,7,5);});
  def('sandcastle','Sandcastle',38,30,({r,p})=>{r('tan',2,10,34,20);r('gold',4,10,30,3);r('tan',12,0,15,23);for(const x of [12,18,24])r('gold',x,0,3,5);for(const x of [2,8,29,34])r('gold',x,8,3,5);p('wood',[[15,30],[15,21],[19,18],[23,21],[23,30]]);r('cream',15,6,3,6);});
  def('beachball','Beach ball',29,29,({e,r})=>{e('paper',0,0,29,29);e('blue',2,2,24,24);r('gold',11,1,7,27);r('red',2,12,25,6);e('cream',11,10,8,8);});
  def('cooler','Beach cooler',36,27,({box,r})=>{box(2,6,32,21,'blue','silver');r('cream',0,2,36,7);r('silver',5,0,25,3);r('paper',0,11,4,10);r('paper',32,11,4,10);r('paper',15,7,6,7);});
  def('oxygen','Oxygen cylinders',30,37,({r,e})=>{for(const x of [1,17]){e('silver',x,5,12,32);r('blue',x,14,12,5);r('steel',x+4,0,4,7);r('gold',x+1,1,10,2);r('paper',x+2,10,2,20);}});
  def('robot','Maintenance droid',32,36,({box,r,wheel})=>{box(4,12,24,16,'steel','silver');box(6,1,20,11,'paper','silver');r('ink',8,4,16,4);r('mint',10,5,3,2);r('mint',19,5,3,2);r('gold',10,17,13,6);r('steel',0,16,4,8);r('steel',28,16,4,8);wheel(4,28,8);wheel(21,28,8);});
  def('powerCell','Starship power cell',33,30,({r,box})=>{box(4,2,25,25,'shade','steel');r('blue',8,5,17,19);r('silver',11,5,4,19);r('mint',18,6,4,17);r('steel',0,0,33,5);r('steel',0,25,33,5);});
  def('spaceCargo','Strapped space cargo',35,29,({box,r})=>{box(0,2,35,27,'silver','paper');r('steel',3,5,29,21);r('gold',6,2,4,27);r('gold',25,2,4,27);r('ink',14,14,7,5);});
  def('rack','Rolling server rack',31,40,({box,r,wheel})=>{box(1,0,29,34,'silver','cream');r('gold',2,0,27,3);for(let y=5;y<31;y+=8){r('ink',4,y,23,6);r('steel',6,y+1,12,1);r('mint',22,y+2,3,2);}wheel(3,34,6);wheel(22,34,6);});
  def('cableSpool','Network cable drum',36,29,({e,r,l})=>{e('wood',5,0,25,29);r('purple',2,6,28,17);for(let x=5;x<28;x+=4)r('ink',x,6,1,16);e('tan',0,0,10,29);e('ink',2,9,5,10);l('purple',28,18,35,26,2);r('gold',31,25,5,3);});
  def('ups','Backup power unit',30,34,({box,r})=>{box(0,0,30,34,'steel','silver');r('paper',1,3,2,29);r('mint',5,5,20,9);r('green',8,7,11,5);for(let y=20;y<31;y+=4)r('ink',5,y,20,2);r('gold',13,16,4,2);});
  def('drives','Drive caddies',36,24,({box,r})=>{for(let i=0;i<3;i++){const x=i*3,y=16-i*8;box(x,y,29,8,'steel','silver');r('ink',x+3,y+3,18,2);r('mint',x+24,y+3,2,2);}});
  def('barrel','Oak barrel',30,32,({e,r})=>{e('wood',0,0,30,32);e('tan',3,0,24,8);r('ink',10,8,1,21);r('tan',6,9,2,19);r('shade',1,10,28,4);r('steel',3,11,22,1);r('shade',1,25,28,4);r('steel',3,26,22,1);});
  def('shield','Leaning guard shield',29,37,({p,r,l})=>{p('silver',[[0,0],[29,0],[29,24],[14,37],[0,24]]);p('darkRed',[[3,3],[26,3],[26,23],[14,32],[3,23]]);r('gold',12,5,5,23);r('gold',6,12,17,5);l('paper',1,4,1,21);});
  def('armor','Fallen helmet',34,28,({e,r,p})=>{e('steel',3,0,28,26);r('silver',8,2,12,3);p('silver',[[3,14],[33,14],[30,27],[1,27]]);r('ink',7,14,21,4);r('gold',13,21,3,3);r('steel',3,24,27,3);});
  def('chest','Treasure chest',38,32,({box,e,r})=>{e('tan',1,0,36,24);box(0,12,38,20,'wood','tan');r('ink',1,16,35,2);r('gold',5,5,4,27);r('gold',29,5,4,27);r('gold',15,15,9,10);r('ink',18,18,3,4);});
  def('gold','Gold bullion',39,24,({p,r})=>{for(const [x,y] of [[0,14],[20,14],[10,2]]){p('tan',[[x,y+10],[x+3,y],[x+15,y],[x+18,y+10]]);r('gold',x+4,y,10,3);r('cream',x+5,y+1,7,1);}});
  def('coinSack','Overflowing coin sack',34,31,({e,r,l})=>{e('tan',2,10,30,21);r('wood',10,8,13,5);e('gold',10,1,13,9);r('cream',13,2,6,2);l('wood',10,17,8,25);for(const x of [0,24,29]){e('gold',x,26,7,5);r('cream',x+2,26,3,1);}});
  def('goblet','Royal goblet',23,32,({p,r})=>{p('gold',[[0,0],[23,0],[21,14],[15,20],[8,20],[2,14]]);r('cream',3,2,3,11);r('tan',17,2,3,11);r('red',9,7,5,5);r('gold',10,19,3,10);r('gold',3,29,17,3);});
  def('stalagmite','Limestone spires',38,38,({p,l})=>{p('steel',[[0,38],[9,8],[16,32],[25,0],[38,38]]);l('silver',24,8,18,34,2);l('silver',9,15,5,34,2);});
  def('crystals','Cave crystals',34,32,({p,l})=>{p('purple',[[2,29],[1,12],[6,8],[15,29],[14,4],[20,0],[28,27],[29,15],[33,12],[34,32]]);l('cream',19,4,22,24);l('silver',5,12,11,27);});
  def('minecart','Ore minecart',43,31,({r,box,wheel,p})=>{p('steel',[[5,8],[10,1],[17,3],[22,0],[31,4],[37,10]]);box(1,10,41,14,'wood','tan');r('steel',7,12,3,12);r('steel',32,12,3,12);wheel(6,23,8);wheel(29,23,8);});
  def('cashTrolley','Cash trolley',42,36,({cash,r,wheel})=>{cash(1,18,29);cash(4,10,26);cash(2,2,28);r('silver',34,0,3,30);r('steel',0,28,38,3);wheel(5,30,6);wheel(31,30,6);});
  def('safeBox','Deposit safe',32,32,({box,r,e})=>{box(0,0,32,32,'steel','silver');r('shade',4,5,24,23);r('paper',7,9,9,2);e('silver',18,13,7,7);r('gold',20,15,3,3);r('silver',6,24,5,2);});
  def('securityBag','Sealed bank cash bag',29,32,({e,r})=>{e('green',0,7,29,25);r('mint',8,1,14,8);r('gold',5,7,18,3);r('paper',8,16,13,10);r('green',13,17,3,7);r('green',10,19,9,2);});
  def('vent','Rooftop ventilation unit',39,32,({box,r})=>{box(0,0,39,32,'steel','silver');r('shade',4,5,31,21);for(let y=7;y<25;y+=4)r('silver',6,y,26,2);r('ink',4,30,5,2);r('ink',30,30,5,2);});
  def('dish','Satellite dish',35,40,({e,p,l,r})=>{e('silver',0,0,32,25);p('steel',[[5,18],[26,3],[31,15],[24,24],[14,24]]);l('gold',15,12,31,7,2);r('cream',29,5,5,5);l('steel',18,24,9,38,3);l('steel',18,24,28,38,3);r('silver',5,37,26,3);});
  def('toolbox','Rooftop tool box',37,25,({r,box})=>{r('silver',12,0,14,5);r('ink',15,2,8,3);box(0,5,37,20,'darkRed','red');r('silver',0,13,35,2);r('gold',16,11,6,7);});
  def('duct','Elbow air duct',36,29,({r,e})=>{r('steel',11,11,24,18);e('silver',0,0,27,25);e('shade',4,4,18,17);e('ink',7,7,12,11);r('silver',15,24,20,3);r('steel',12,1,2,21);});
  def('hay','Bound hay bale',40,26,({r,e,l})=>{e('tan',0,0,40,26);r('gold',5,2,31,21);for(let y=5;y<24;y+=4)l('cream',3,y,35,y);r('wood',10,1,3,24);r('wood',29,2,3,22);});
  def('wantedBoard','Wanted A-board',31,38,({r,l,box})=>{l('wood',4,0,0,37,3);l('wood',25,0,30,37,3);box(3,1,24,30,'wood','tan');r('paper',6,4,18,24);r('darkRed',8,6,14,2);r('green',11,12,8,5);r('wood',12,18,6,5);r('red',9,25,12,1);});
  def('stocks','Town stocks',42,29,({r,e})=>{r('wood',0,0,5,29);r('wood',37,0,5,29);r('tan',4,5,34,16);r('cream',4,5,34,2);e('ink',14,8,14,10);e('ink',6,11,5,5);e('ink',31,11,5,5);r('steel',1,3,3,3);r('steel',38,3,3,3);});
  def('paint','Recruitment paint pots',37,28,({r,e})=>{for(const [x,y,c] of [[0,10,'mint'],[20,4,'purple']]){r('silver',x,y,16,24-y);e('paper',x,y-2,16,6);e(c,x+2,y,12,3);r(c,x+3,y+3,4,9);r('tan',x+10,y-5,2,12);}});
  def('banner','Frens pennant stand',33,40,({r,p})=>{r('tan',6,0,3,38);p('green',[[9,1],[31,1],[26,9],[31,17],[9,17]]);r('cream',14,5,9,7);r('green',16,6,2,2);r('green',20,6,2,2);r('wood',0,37,20,3);});
  def('posters','Rolled recruitment posters',39,26,({r,e})=>{for(const [x,y] of [[0,16],[8,8],[3,0]]){r('paper',x,y+1,28,7);e('cream',x+24,y,9,9);e('wood',x+27,y+2,4,5);r('green',x+10,y+1,4,7);}});
  def('leaflets','Leaflet stand',30,35,({r,l})=>{l('wood',6,0,1,34,3);l('wood',23,0,28,34,3);r('tan',3,9,24,4);r('tan',2,24,26,4);for(const y of [0,15])for(const x of [6,16]){r('paper',x,y,8,12);r('green',x+2,y+2,4,3);r('wood',x+2,y+8,4,1);}});
  def('quiver','Hideout arrow quiver',29,38,({r,l,p})=>{for(const x of [9,16,23]){l('tan',x,0,x-5,23);p('paper',[[x-2,0],[x+2,2],[x+1,6],[x-2,4]]);}p('wood',[[3,14],[23,16],[19,38],[0,36]]);l('tan',5,18,21,20,2);l('gold',4,29,19,31,2);});
  def('provisions','Hideout provisions',37,30,({e,r,box})=>{e('tan',0,8,22,22);r('wood',5,5,11,4);box(20,13,17,17,'wood','tan');r('red',24,8,8,8);r('green',28,5,3,5);});
  def('scrolls','Royal tax scrolls',37,28,({r,e})=>{for(const [x,y] of [[0,16],[7,8],[3,0]]){r('paper',x+3,y,27,10);e('gold',x,y,7,11);e('wood',x+2,y+3,3,5);r('red',x+17,y,4,10);}});
  def('inkwell','Tax clerk ink and quill',31,36,({r,p,box})=>{box(1,22,20,14,'shade','steel');r('gold',4,19,14,4);lQuill();function lQuill(){p('paper',[[13,21],[16,7],[28,0],[30,11],[22,15]]);r('tan',15,15,2,12);p('silver',[[16,18],[29,2],[24,13]]);}});
  def('taxChest','Royal tax collection chest',37,29,({box,r})=>{box(0,1,37,28,'wood','tan');r('gold',6,1,4,28);r('gold',27,1,4,28);r('ink',1,11,33,3);r('paper',12,5,12,17);r('darkRed',15,16,7,7);r('red',16,17,4,4);});
  def('scales','Tax weighing scales',40,37,({r,l,p})=>{r('gold',19,0,3,34);r('tan',5,5,32,3);for(const x of [0,24]){l('tan',x+8,7,x+1,22);l('tan',x+8,7,x+15,22);p('gold',[[x,22],[x+16,22],[x+12,27],[x+4,27]]);}r('gold',11,34,20,3);});

  const locations={
    'scene-sherwood-path':['stump','log','target','thorns'],
    'scene-moon-clearing':['mushrooms','roots','stump','log'],
    'scene-projector-room':['projector','reel','filmCans','camera'],
    'scene-checkpoint':['brazier','respawnStone','urn','rubble'],
    'scene-movie-marquee':['popcorn','cash','velvetRope','clapper'],
    'scene-moon-surface':['rover','crater','lander','moonFlag'],
    'scene-launch-platform':['fuelDrum','cone','nozzle','serviceCart'],
    'scene-snowy-pines':['snowLog','iceRock','snowdrift','sapling'],
    'scene-sand-dunes':['cactus','tumbleweed','sandstone','amphora'],
    'scene-mountain-terrace':['cairn','backpack','trailMarker','rock'],
    'scene-aurora-lake':['sled','fishingBox','iceHole','reeds'],
    'scene-network-nodes':['gasCan','blockCube','validator','chainLinks'],
    'scene-buy-back-room':['redCandle','orderRoll','cash','tradingScreen'],
    'place-gamestop':['gameCases','consoleBox','handheld','gameDisplay'],
    'place-white-house':['rosePlanter','securityBarrier','podium','bollards'],
    'place-capitol':['lawBooks','ballotBox','stanchion','briefcase'],
    'place-office':['chair','printer','archiveBox','waterCooler'],
    'place-bedroom':['slippers','laundry','pillows','toyTrain'],
    'place-gaming-room':['miniArcade','joystick','beanbag','soda'],
    'place-yacht-deck':['lifering','rope','capstan','anchor'],
    'place-beach':['log','sandcastle','beachball','cooler'],
    'place-starship-cabin':['oxygen','robot','powerCell','spaceCargo'],
    'place-server-room':['rack','cableSpool','ups','drives'],
    'place-castle-hall':['barrel','brazier','shield','armor'],
    'place-treasury':['chest','gold','coinSack','goblet'],
    'place-cave':['stalagmite','crystals','minecart','rock'],
    'place-bank-vault':['cash','cashTrolley','safeBox','securityBag'],
    'place-rooftop':['vent','dish','toolbox','duct'],
    'frens-wanted-poster':['wantedBoard','stocks','hay','barrel'],
    'frens-join-the-frens':['paint','banner','posters','leaflets'],
    'frens-sherwood-hideout':['target','quiver','provisions','log'],
    'frens-royal-tax-notice':['scrolls','inkwell','taxChest','scales'],
  };

  function sprite(id){
    if(cache.has(id))return cache.get(id);
    const d=definitions[id];if(!d)throw new Error(`Unknown obstacle: ${id}`);
    const source=document.createElement('canvas');source.width=d.sourceW+2;source.height=d.sourceH+2;
    const sourceCtx=source.getContext('2d');sourceCtx.translate(1,1);d.paint(painter(sourceCtx));
    const raw=document.createElement('canvas');raw.width=d.w+2;raw.height=d.h+2;
    const ctx=raw.getContext('2d');ctx.imageSmoothingEnabled=false;
    ctx.drawImage(source,1,1,d.sourceW,d.sourceH,1,1,d.w,d.h);
    const alpha=ctx.getImageData(0,0,raw.width,raw.height).data;
    // Collision follows actual occupied pixels, not the full transparent rectangle.
    // Ignore the outline and conservatively inset each horizontal run by one pixel.
    const hitboxes=[];
    for(let y=1;y<raw.height-1;y+=2){let start=-1;for(let x=1;x<raw.width;x++){
      const solid=x<raw.width-1&&(alpha[(y*raw.width+x)*4+3]||alpha[((Math.min(y+1,raw.height-2))*raw.width+x)*4+3]);
      if(solid&&start<0)start=x;
      if(!solid&&start>=0){const inset=x-start>4?1:0;hitboxes.push({x:(start-1+inset)*2,y:(y-1)*2,width:(x-start-inset*2)*2,height:Math.min(4,d.height-(y-1)*2)});start=-1;}
    }}
    const out=document.createElement('canvas');out.width=raw.width;out.height=raw.height;
    const o=out.getContext('2d');
    for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(alpha[(y*raw.width+x)*4+3]){
      o.fillStyle=C.ink;o.fillRect(x-1,y,3,1);o.fillRect(x,y-1,1,3);
    }
    o.drawImage(raw,0,0);
    const result={canvas:out,hitboxes};cache.set(id,result);return result;
  }
  function drawObstacle(ctx,item,ground=438){
    const d=definitions[item.type];if(!d)return;
    const x=Math.round(item.x),y=ground-d.height;
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#111a2390';ctx.fillRect(x-3,ground-3,d.width+6,6);
    ctx.drawImage(sprite(item.type).canvas,x-2,y-2,d.width+4,d.height+4);ctx.restore();
  }
  function collisionBoxes(item,ground=438){const d=definitions[item.type];return sprite(item.type).hitboxes.map(b=>({x:item.x+b.x,y:ground-d.height+b.y,width:b.width,height:b.height}));}

  window.RF_WORLD_ART={definitions,locations,painter,drawObstacle,collisionBoxes,sprite};
})();
