/* Guest game lifecycle and sharing. Run results stay in this frame's memory. */
(() => {
  'use strict';
  const origin=location.origin, embedded=parent!==window;
  document.body.dataset.hubEmbedded=String(embedded);
  const byId=id=>document.getElementById(id);
  const pauseDialog=byId('pauseDialog'),guideDialog=byId('guideDialog');
  const pauseTools=document.createElement('div');
  pauseTools.className='hub-pause-tools';pauseTools.setAttribute('role','group');pauseTools.setAttribute('aria-label','Help and sound');pauseTools.hidden=true;
  byId('pauseRestart').after(pauseTools);
  // Move the existing controls so their game/audio listeners and saved state stay intact.
  const mobileTools=['helpButton','soundButton'].map(id=>{
    const button=byId(id),home=document.createComment(`${id} desktop position`);
    button.before(home);return {button,home};
  });
  const coarsePointer=window.matchMedia('(any-pointer: coarse)');
  function syncPauseTools(){
    const focusedTool=mobileTools.some(({button})=>button===document.activeElement);
    for(const {button,home} of mobileTools){
      if(coarsePointer.matches)pauseTools.append(button);
      else home.after(button);
    }
    pauseTools.hidden=!coarsePointer.matches;
    document.body.classList.toggle('hub-mobile-game-tools',coarsePointer.matches);
    if(focusedTool&&!guideDialog.open){
      if(pauseDialog.open)byId('resumeRun').focus({preventScroll:true});
      else if(!byId('pauseButton').disabled)byId('pauseButton').focus({preventScroll:true});
    }
  }
  coarsePointer.addEventListener('change',syncPauseTools);syncPauseTools();
  // Keep Pause open beneath Help: runner restores its paused mode when Help closes.
  // A pointer change may have moved Help outside the modal, so retain usable focus.
  guideDialog.addEventListener('close',()=>{
    if(pauseDialog.open&&!pauseDialog.contains(document.activeElement))byId('resumeRun').focus({preventScroll:true});
  });
  function send(type,payload={}){if(embedded&&origin!=='null')parent.postMessage({type:'frens-hub:'+type,...payload},origin);}
  for(const element of document.querySelectorAll('[data-close-game]'))element.addEventListener('click',event=>{
    event.preventDefault();
    const status=window.FRENS_HUB_GAME?.status();
    window.FRENS_HUB_GAME?.pause();
    if(embedded)send('request-exit',{active:['running','paused','guide'].includes(status?.mode)});
    else location.href='../index.html';
  });
  window.addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==origin||!event.data||typeof event.data!=='object'||Object.keys(event.data).length!==1)return;
    if(event.data.type==='frens-hub:pause')window.FRENS_HUB_GAME?.pause();
    if(event.data.type==='frens-hub:resume')window.FRENS_HUB_GAME?.resume();
  });
  const resultCopyButton=byId('copyResultImage'),resultCopyFeedback=byId('resultCopyFeedback');
  let result=null,resultPhotoBlob=null,resultPhotoGeneration=0;
  function resetResultPhoto(){resultPhotoGeneration++;resultPhotoBlob=null;resultCopyButton.disabled=true;resultCopyFeedback.textContent='';}
  window.addEventListener('frens-hub:run-started',()=>{result=null;resetResultPhoto();});
  window.addEventListener('frens-hub:run-finished',event=>{
    result=event.detail;resetResultPhoto();
    const generation=resultPhotoGeneration,photo=window.FRENS_HUB_GAME?.photo();
    if(photo)photo.toBlob(blob=>{
      if(generation!==resultPhotoGeneration)return;
      resultPhotoBlob=blob;resultCopyButton.disabled=!blob;
    },'image/png');
  });
  function canCopyImage(){return Boolean(window.isSecureContext&&navigator.clipboard?.write&&window.ClipboardItem&&(typeof ClipboardItem.supports!=='function'||ClipboardItem.supports('image/png')));}
  const copyUnavailable='This browser cannot copy images. Download and attach in X.';
  function publicSiteUrl(){
    try{const url=new URL(window.FRENS_SHARE?.siteUrl);if(url.protocol!=='https:'||url.username||url.password||(url.hash&&url.hash!=='#game')||url.hostname==='localhost'||url.hostname.endsWith('.localhost')||url.hostname.endsWith('.local')||url.hostname.startsWith('[')||/^\d+(?:\.\d+){3}$/.test(url.hostname))return '';return url.href;}catch{return '';}
  }
  byId('postToX').addEventListener('click',()=>{
    if(!result)return;
    const site=publicSiteUrl();
    const text=`${result.distance.toLocaleString('en-US')} metres in Kunlun Sanctuary ⚡\n📍 ${result.location} · style score: ${result.score.toLocaleString('en-US')}\n\n@mythicalguardia · 2,222 Celestial Guardians on Robinhood Chain`+(site?'\n'+site:'');
    // Open only on the visitor's click. X handles editing and publication.
    window.open('https://x.com/intent/tweet?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
  });
  resultCopyButton.addEventListener('click',async()=>{
    if(!resultPhotoBlob||!canCopyImage()){resultCopyFeedback.textContent=copyUnavailable;return;}
    const generation=resultPhotoGeneration;
    resultCopyButton.disabled=true;
    try{
      // The PNG is prepared before this click, so write keeps user activation.
      // Write only on the explicit Copy image action; never read the clipboard.
      await navigator.clipboard.write([new ClipboardItem({'image/png':resultPhotoBlob})]);
      if(generation===resultPhotoGeneration)resultCopyFeedback.textContent='Image copied. Paste it into your X post.';
    }catch{
      if(generation===resultPhotoGeneration)resultCopyFeedback.textContent='Copying was blocked. Download and attach in X.';
    }finally{if(generation===resultPhotoGeneration)resultCopyButton.disabled=false;}
  });
  send('ready');
})();
