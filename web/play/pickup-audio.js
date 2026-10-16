/* Quiet, optional game feedback. Audio starts only after a user gesture. */
(() => {
  'use strict';
  const button=document.getElementById('soundButton'),key='frens-hub-preview-sound';
  let enabled=true,context=null;
  const lastNotes=new Map();
  // [delay, start Hz, end Hz, duration, volume, waveform]
  const sounds={
    gear:[[0,660,660,.1,.025,'sine'],[.045,990,990,.1,.025,'sine']],
    mystery:[[0,587,587,.1,.025,'sine'],[.045,880,880,.1,.025,'sine']],
    throw:[[0,760,180,.12,.035,'triangle']],
    arrowHit:[[0,1700,420,.065,.03,'triangle'],[.025,940,230,.08,.02,'square']],
    armorHit:[[0,1240,640,.15,.03,'triangle'],[.012,1830,950,.12,.02,'sine']],
    guardHit:[[0,220,65,.13,.045,'triangle'],[.015,440,110,.07,.02,'sine']],
  };
  try{
    const saved=localStorage.getItem(key);
    enabled=saved===null||saved==='on';
  }catch{}
  function sync(){button.textContent=enabled?'♪ Sound: On':'♪ Sound: Off';button.setAttribute('aria-pressed',String(enabled));}
  function unlock(){
    if(!enabled)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      context??=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});
    }catch{}
  }
  function play(kind){
    if(!enabled||context?.state!=='running'||!sounds[kind])return;
    const now=context.currentTime;
    // A pickup or throw must not mute a different impact in the same moment.
    if(now-(lastNotes.get(kind)??-1)<.07)return;
    lastNotes.set(kind,now);
    for(const [offset,freq,endFreq,duration,volume,wave] of sounds[kind]){
      const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=wave;
      oscillator.frequency.setValueAtTime(freq,now+offset);
      if(endFreq!==freq)oscillator.frequency.exponentialRampToValueAtTime(endFreq,now+offset+duration);
      gain.gain.setValueAtTime(0,now+offset);gain.gain.linearRampToValueAtTime(volume,now+offset+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+offset+duration);
      oscillator.connect(gain);gain.connect(context.destination);oscillator.start(now+offset);oscillator.stop(now+offset+duration+.01);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }
  }
  button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off');}catch{}sync();if(enabled){unlock();}else if(context)context.suspend().catch(()=>{});});
  document.addEventListener('pointerdown',event=>{if(event.isTrusted)unlock();},{capture:true});
  document.addEventListener('keydown',event=>{if(event.isTrusted&&['Space','ArrowUp','ArrowDown','KeyW','KeyS','KeyX'].includes(event.code))unlock();},{capture:true});
  window.RF_PICKUP_AUDIO={play,get enabled(){return enabled;},get status(){return context?.state||'not-started';}};sync();
})();
