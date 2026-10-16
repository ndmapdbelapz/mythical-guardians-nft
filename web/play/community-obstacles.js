/* Generated approved community obstacles. Rebuild with sync-community-game-art.cjs. */
(() => {
  'use strict';
  const world = window.RF_WORLD_ART;
  if (!world) throw new Error('Load the prototype world renderer before community obstacles.');
  const definitions = {};

  function define(id, name, w, h, paint) {
    if (world.definitions[id]) throw new Error('Duplicate community obstacle: ' + id);
    if (w > 34 || h > 30) throw new Error('Community obstacle exceeds the short-jump envelope.');
    const definition = {name, width:w * 2, height:h * 2, w, h, sourceW:w, sourceH:h, paint};
    definitions[id] = definition;
    world.definitions[id] = definition;
  }

  // Gigaverse: the cyan ring lamp and clay vessel take their silhouettes and
  // palette from the supplied actual dungeon reference, not a generic castle.
  define('community-giga-cyan-lamp', 'Cyan dungeon lamp', 28, 27, ({r, e}) => {
    r('#20232c', 9, 0, 10, 2); r('#7cfff4', 8, 2, 3, 8); r('#25bbce', 18, 2, 3, 8);
    r('#24c7d6', 11, 0, 7, 2); r('#111e27', 11, 3, 7, 6); r('#b4ffff', 9, 2, 2, 4);
    r('#bbc5c2', 7, 9, 15, 4); r('#777985', 5, 12, 19, 6); r('#bdc5c3', 7, 13, 14, 2);
    e('#464657', 1, 15, 27, 11); r('#909aa0', 3, 17, 23, 6); r('#c4d4ce', 5, 17, 17, 2);
    r('#24d6dd', 2, 18, 3, 5); r('#72fff0', 5, 22, 18, 2); r('#24d6dd', 23, 18, 3, 5);
    r('#343541', 7, 25, 15, 2); r('#c4ffff', 3, 18, 2, 3); r('#bac5c9', 9, 10, 10, 2);
  });

  define('community-giga-dungeon-sword', 'Dungeon sword in broken stone', 30, 30, ({r, p, l}) => {
    // Gold crossguard, red gem and pale blade echo the reference's attack
    // icon. The grounded stone base clearly separates this hazard from loot.
    r('#c89642', 13, 0, 5, 3); r('#f5d16b', 14, 0, 3, 1); r('#814830', 14, 3, 3, 5);
    r('#d4a045', 14, 4, 3, 1); r('#d4a045', 14, 6, 3, 1);
    p('#af7737', [[5,8],[12,9],[19,9],[25,7],[25,11],[18,12],[12,12],[5,11]]);
    r('#f5cd60', 6, 8, 6, 2); r('#e8b34c', 19, 8, 5, 2);
    r('#d49e3d', 12, 8, 7, 5); r('#9b283e', 14, 9, 3, 3); r('#f0645b', 14, 9, 2, 1);
    p('#a8babb', [[12,13],[19,13],[18,22],[15,27],[12,22]]);
    p('#e2ece2', [[12,13],[15,13],[15,25],[13,22]]);
    p('#6b888e', [[16,13],[19,13],[18,22],[15,27],[16,20]]);
    r('#fff4c9', 13, 14, 1, 5);
    p('#46434f', [[1,27],[6,23],[12,24],[17,22],[24,23],[29,27],[28,30],[1,30]]);
    p('#7b7889', [[6,23],[12,24],[17,22],[24,23],[21,26],[8,27],[1,27]]);
    p('#595767', [[21,26],[24,23],[29,27],[28,30],[19,30]]);
    l('#282b38', 15, 24, 11, 27); l('#282b38', 11, 27, 14, 29);
    r('#a39bac', 7, 24, 3, 1); r('#a39bac', 20, 23, 3, 1);
  });

  define('community-giga-rune-shield', 'Rune shield and magic shard', 29, 30, ({r, p, l}) => {
    p('#8d9cae', [[5,2],[28,0],[26,19],[14,29],[3,21]]);
    p('#c2d3d5', [[5,2],[28,0],[27,3],[7,5],[5,20],[3,21]]);
    p('#29637c', [[8,6],[24,4],[22,18],[14,24],[7,19]]);
    p('#13374f', [[20,5],[24,4],[22,18],[14,24],[14,19],[19,17]]);
    r('#28d7df', 12, 8, 3, 11); r('#73ffff', 10, 11, 9, 3); r('#28d7df', 17, 8, 3, 3);
    r('#7fdfec', 10, 8, 3, 2); r('#28d7df', 17, 14, 3, 5); r('#cdfbfa', 13, 10, 2, 2);
    p('#532965', [[0,21],[5,15],[11,21],[5,29]]);
    p('#b64bdd', [[1,21],[5,17],[9,21],[5,27]]); l('#f5b4fc', 5, 18, 5, 25);
    r('#fce2ff', 3, 21, 5, 1); r('#e981f5', 1, 20, 1, 3);
  });

  define('community-giga-loot-vessel', 'Dungeon loot vessel', 25, 27, ({r, e}) => {
    e('#533e47', 7, 0, 11, 10); r('#382b36', 9, 1, 7, 5); r('#a57d7f', 7, 1, 3, 6);
    e('#8e6269', 3, 8, 21, 18); r('#aa7a7d', 5, 8, 17, 9); r('#bd9690', 7, 8, 11, 4);
    r('#664955', 20, 11, 4, 10); r('#795362', 6, 21, 16, 4); r('#a98281', 5, 17, 15, 3);
    r('#c09c91', 7, 14, 3, 5); r('#7b525e', 9, 6, 9, 3); r('#533e47', 8, 25, 11, 2);
    r('#bdcb70', 1, 22, 4, 4); r('#e2ec96', 1, 22, 3, 1); r('#58835b', 2, 24, 2, 2);
    r('#728d4e', 20, 24, 4, 2); r('#b9d680', 21, 23, 3, 2);
  });

  // Degen Hub: the red cap keeps the user's reference's three pale patches,
  // square cream stem and two unmistakable black eyes.
  define('community-degen-mushroom', 'Red degen mushroom', 29, 29, ({r}) => {
    r('#6f2334', 9, 0, 12, 2); r('#952b3a', 6, 2, 18, 3); r('#af3240', 3, 5, 23, 4);
    r('#af3240', 1, 9, 27, 9); r('#812a37', 2, 16, 25, 3);
    r('#d36b6d', 6, 4, 4, 2); r('#d14f56', 3, 7, 3, 7);
    r('#ddd6c4', 12, 2, 6, 3); r('#eee4ce', 10, 5, 10, 6); r('#c6c3b5', 12, 11, 6, 2);
    r('#d7d0bc', 4, 10, 5, 5); r('#f1e7cf', 5, 9, 3, 5);
    r('#d3cdbc', 22, 10, 4, 5); r('#ece1c7', 21, 8, 3, 5);
    r('#937e68', 7, 19, 16, 10); r('#d3c5a1', 8, 19, 14, 9); r('#e6d8b8', 9, 20, 12, 7);
    r('#2a2523', 11, 21, 2, 6); r('#2a2523', 17, 21, 2, 6);
    r('#b8a582', 9, 27, 12, 2); r('#eeead1', 9, 20, 1, 5);
  });

  define('community-degen-fallen-portrait', 'Fallen NFT portrait', 34, 30, ({r, p}) => {
    // An original, deliberately simple PFP: one large head and bold shades
    // remain readable at runner scale. No owner's NFT or remote asset is used.
    p('#644432', [[31,4],[34,27],[30,29],[25,28]]);
    for (let y = 0; y < 29; y++) {
      const x = 4 - Math.floor(y / 8);
      r('#866744', x, y, 29, 1); r('#d8b56b', x + 1, y, 2, 1); r('#563d32', x + 26, y, 3, 1);
      if (y < 3 || y > 25) r(y < 2 ? '#ebd799' : '#b1874d', x + 2, y, 24, 1);
      else {
        r('#477a78', x + 3, y, 23, 1);
      }
    }
    const q = (color, x, y, width, height) => {
      for (let row = y; row < y + height; row++) r(color, 7 - Math.floor((row + 3) / 8) + x, row + 3, width, 1);
    };
    q('#85a9a1', 1, 1, 4, 1); q('#85a9a1', 18, 4, 3, 1);
    q('#5b406c', 3, 19, 18, 4); q('#a07999', 6, 19, 3, 4);
    q('#b88160', 9, 15, 6, 6); q('#e2b27e', 9, 16, 3, 4);
    q('#bb875f', 5, 5, 14, 12); q('#e2b27e', 5, 5, 11, 10);
    q('#e2b27e', 3, 9, 3, 5); q('#9c634d', 18, 9, 2, 4);
    q('#412e39', 5, 2, 14, 4); q('#412e39', 3, 4, 5, 3);
    q('#77503f', 7, 2, 10, 1); q('#412e39', 5, 6, 2, 3);
    q('#172b32', 5, 8, 15, 2); q('#172b32', 6, 9, 5, 4); q('#172b32', 14, 9, 5, 4);
    q('#91c4c0', 7, 9, 3, 1); q('#91c4c0', 15, 9, 3, 1);
    q('#9c634d', 12, 12, 2, 3); q('#633d39', 10, 16, 6, 1);
    // Corner chips and one broken frame splinter make it a discarded physical
    // obstacle rather than an unrelated floating collectible.
    r('#f0d897', 5, 0, 4, 1); r('#d9b66c', 1, 25, 2, 3); r('#a67d4d', 30, 29, 3, 1);
  });

  define('community-degen-liquidation-candle', 'Liquidation candle', 23, 30, ({r, p}) => {
    r('#8e344f', 11, 0, 2, 28); r('#fb766b', 11, 1, 1, 5);
    r('#712b42', 4, 7, 16, 17); r('#c43a51', 4, 7, 13, 15); r('#f56661', 5, 8, 3, 12);
    r('#eb6261', 8, 7, 8, 2); r('#92253e', 15, 10, 4, 14);
    r('#702a41', 6, 27, 13, 3); r('#a5394f', 2, 28, 20, 2);
    p('#f6d795', [[9,11],[14,11],[12,15],[15,15],[9,20],[10,16],[7,16]]);
    r('#cf5c5e', 0, 25, 3, 2); r('#f28575', 20, 25, 3, 2); r('#e5af79', 17, 28, 3, 1);
  });

  define('community-degen-token-briefcase', 'Spilled token briefcase', 34, 25, ({r, p, e}) => {
    p('#734c5c', [[3,3],[27,0],[30,12],[5,15]]); p('#312b3d', [[5,5],[25,3],[27,11],[7,13]]);
    r('#b08a9b', 12, 0, 8, 2); r('#423049', 12, 2, 2, 2); r('#423049', 19, 1, 2, 3);
    p('#242b36', [[1,13],[29,10],[33,16],[29,22],[2,23],[0,19]]);
    p('#6c586b', [[1,13],[29,10],[32,15],[4,19]]); p('#383541', [[4,19],[32,15],[29,22],[2,23]]);
    r('#bb9a63', 8, 19, 4, 3); r('#bb9a63', 23, 17, 4, 3);
    for (const [x,y] of [[6,10],[12,9],[20,8],[25,12],[16,13]]) {
      e('#90734b', x, y, 7, 6); e('#e4bd63', x, y, 6, 4); r('#f6e49e', x + 1, y, 3, 1); r('#9b7637', x + 2, y + 1, 1, 2);
    }
    e('#d3a94f', 27, 21, 7, 4); r('#f5dda0', 28, 21, 4, 1);
    e('#bb9550', 0, 22, 6, 3); r('#eadb93', 1, 22, 3, 1);
  });

  // Haven is a private-lounge mood: brass, deep green and warm paper. These
  // are atmosphere concepts, not a claim of official Cabal/Haven affiliation.
  define('community-haven-velvet-rope', 'Private lounge velvet rope', 34, 29, ({r, e, l}) => {
    for (const x of [4,26]) {
      e('#a48654', x - 2, 0, 6, 6); r('#e1c880', x - 1, 1, 3, 2);
      r('#a78653', x, 5, 2, 21); r('#dfc58a', x, 7, 1, 17);
      e('#725b42', x - 4, 24, 11, 5); r('#c4a76c', x - 3, 25, 8, 2);
    }
    l('#283e36', 7, 7, 14, 13, 3); l('#283e36', 14, 13, 21, 13, 3); l('#283e36', 21, 13, 26, 7, 3);
    l('#4b7561', 7, 7, 14, 12, 1); l('#4b7561', 14, 12, 21, 12, 1); l('#4b7561', 21, 12, 26, 7, 1);
    r('#d2b87b', 13, 15, 9, 7); r('#e4d096', 14, 15, 7, 1); r('#314238', 15, 18, 5, 1);
  });

  define('community-haven-sealed-dossier', 'Sealed cabal dossier', 31, 24, ({r, p, e}) => {
    p('#514736', [[2,6],[25,1],[30,18],[28,23],[1,23],[0,9]]);
    p('#9e8b58', [[2,6],[25,1],[29,19],[6,23]]);
    p('#c5b17b', [[2,6],[25,1],[28,18],[6,22]]); p('#e4d5aa', [[5,8],[23,4],[26,17],[8,20]]);
    p('#18352e', [[1,3],[11,1],[14,4],[26,2],[29,18],[5,22]]);
    p('#2c5443', [[2,4],[10,3],[14,6],[25,4],[27,16],[6,20]]);
    r('#c6b27d', 8, 9, 12, 1); r('#81917a', 9, 12, 8, 1); r('#6a816a', 9, 14, 6, 1);
    e('#633441', 16, 13, 9, 8); e('#ac6264', 17, 13, 7, 6); r('#d19182', 18, 14, 3, 1);
    r('#653942', 19, 15, 2, 3); r('#663d43', 17, 17, 5, 1); r('#c1a165', 6, 6, 1, 10);
  });

  define('community-haven-poker-case', 'Private table poker case', 34, 26, ({r, p, e}) => {
    p('#967c50', [[2,1],[29,1],[32,11],[5,13]]); p('#314e3d', [[4,3],[27,3],[29,9],[7,11]]);
    r('#d1b782', 5, 2, 23, 1); r('#a68d5b', 13, 0, 8, 2);
    p('#3a4438', [[1,11],[31,9],[33,20],[3,22],[0,17]]); p('#9e8351', [[1,11],[31,9],[32,12],[3,15]]);
    p('#223c30', [[3,15],[32,12],[32,20],[4,22]]); r('#bc9b61', 8, 19, 4, 3); r('#bc9b61', 25, 17, 4, 3);
    for (const [x,y,color] of [[6,9,'#a95054'],[14,8,'#d8cead'],[23,7,'#698d70']]) {
      r(color, x, y, 6, 6); e(color, x - 1, y - 2, 8, 5); r('#eee0b8', x, y + 2, 2, 1); r('#303c31', x + 4, y + 3, 2, 1);
      r('#ecdaa4', x + 2, y - 1, 2, 1);
    }
    p('#e6dfc3', [[21,19],[29,16],[32,22],[24,25]]); p('#ba5756', [[25,19],[27,19],[28,20],[26,22],[24,21]]);
    e('#a05154', 1, 22, 8, 4); r('#eee0b8', 2, 22, 2, 1); r('#d59a8b', 5, 23, 2, 1);
  });

  define('community-haven-club-safe', 'Private club safe', 30, 29, ({r, p, e}) => {
    p('#566755', [[0,4],[5,0],[29,0],[25,4]]); p('#182e2a', [[25,4],[29,0],[29,24],[25,27]]);
    r('#304d3c', 0, 4, 26, 23); r('#ac9561', 1, 4, 24, 1); r('#728570', 1, 5, 1, 20);
    r('#141f23', 4, 7, 18, 17); r('#aa9564', 5, 8, 17, 16); r('#283f34', 6, 9, 15, 14);
    r('#58715b', 7, 10, 1, 12); r('#ccbc82', 4, 10, 3, 3); r('#ccbc82', 4, 19, 3, 3);
    e('#937e51', 11, 12, 9, 9); e('#d1bc7e', 12, 12, 7, 7); e('#344b3c', 14, 14, 3, 3);
    r('#f1dda1', 15, 12, 1, 2); r('#7e663f', 13, 16, 5, 1); r('#aa9564', 10, 4, 7, 2);
    r('#d6c18a', 11, 4, 5, 1); r('#172724', 2, 27, 5, 2); r('#172724', 21, 27, 5, 2);
    r('#728570', 5, 1, 22, 1); r('#405746', 27, 4, 1, 19);
  });

  const locations = {
    giga: ['community-giga-cyan-lamp', 'community-giga-dungeon-sword', 'community-giga-rune-shield', 'community-giga-loot-vessel'],
    degen: ['community-degen-mushroom', 'community-degen-fallen-portrait', 'community-degen-liquidation-candle', 'community-degen-token-briefcase'],
    haven: ['community-haven-velvet-rope', 'community-haven-sealed-dossier', 'community-haven-poker-case', 'community-haven-club-safe'],
  };
  const mapIds={"community-giga-dungeon-ladder-left-v2":"giga","community-degen-hub-plaque-noise":"degen","community-haven-private-bar-muted":"haven"};
  for(const [id,key]of Object.entries(mapIds)){
    if(world.locations[id])throw Error('Duplicate community obstacle pool: '+id);
    world.locations[id]=locations[key];
  }
})();
