/* Equal-weight scene bags: visit every location before repeating one. */
(() => {
  'use strict';
  function create(ids,rng=Math.random){
    let bag=[],recent=[];
    function refill(){
      bag=[...ids];
      for(let i=bag.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
      // Keep the last three scenes away from the start of the next bag.
      const protectedCount=Math.min(3,Math.floor(ids.length/2));
      for(let i=0;i<protectedCount;i++){
        if(!recent.includes(bag[i]))continue;
        const candidates=bag.map((id,j)=>j>=protectedCount&&!recent.includes(id)?j:-1).filter(j=>j>=0);
        if(candidates.length){const j=candidates[Math.floor(rng()*candidates.length)];[bag[i],bag[j]]=[bag[j],bag[i]];}
      }
    }
    return {next(){
      if(!bag.length)refill();
      const id=bag.shift();recent.push(id);recent=recent.slice(-Math.min(3,Math.floor(ids.length/2)));
      return id;
    }};
  }
  window.RF_RUN_ROUTE={create};
})();
