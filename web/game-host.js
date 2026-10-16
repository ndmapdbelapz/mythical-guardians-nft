/* Guest-only runner game window host. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const dialog = byId('gameDialog'), frame = byId('gameFrame');
  const exitDialog = byId('gameExitDialog'), loading = byId('gameLoading');
  const room = document.querySelector('.room-shell');
  if (!dialog || !frame || !exitDialog || !loading) return;
  let opener = null, ready = false, timer = null;
  let roomPosition = null;
  const send = type => {
    if (ready) frame.contentWindow.postMessage({type:'frens-hub:' + type}, location.origin);
  };
  function status() {
    if (!dialog.open || !ready || frame.getAttribute('src') === 'about:blank') return null;
    try { return frame.contentWindow.FRENS_HUB_GAME?.status(); } catch { return null; }
  }
  function inProgress(state = status()) {
    return state?.mode === 'running' || (['paused','guide'].includes(state?.mode) && state.distance > 0);
  }
  function closeGame() {
    if (exitDialog.open) exitDialog.close();
    if (dialog.open) dialog.close();
  }
  function requestExit() {
    if (!dialog.open || exitDialog.open) return;
    const state = status();
    if (!inProgress(state)) { closeGame(); return; }
    send('pause');
    exitDialog.showModal();
  }
  function keepPlaying() {
    exitDialog.close();
    send('resume');
    frame.focus({preventScroll:true});
  }
  function loadGame() {
    clearTimeout(timer); ready = false;
    loading.hidden = false;
    byId('gameLoadingLabel').textContent = 'Opening Guardians Run…';
    byId('retryGameLoad').hidden = true;
    frame.src = 'play/index.html';
    timer = setTimeout(() => {
      if (ready || !dialog.open) return;
      byId('gameLoadingLabel').textContent = 'The realm is taking longer to load.';
      byId('retryGameLoad').hidden = false;
    }, 15000);
  }
  function openGame(event) {
    if (dialog.open) return;
    opener = event?.currentTarget ?? document.querySelector('.site-nav [data-open-game]');
    roomPosition = {x:scrollX, y:scrollY, pan:room ? room.scrollLeft : 0};
    document.body.classList.add('game-open');
    dialog.showModal();
    loadGame();
  }
  for (const button of document.querySelectorAll('[data-open-game]')) button.addEventListener('click', openGame);
  byId('closeGame')?.addEventListener('click', requestExit);
  byId('cancelGameLoad')?.addEventListener('click', closeGame);
  byId('retryGameLoad')?.addEventListener('click', loadGame);
  byId('stayGame')?.addEventListener('click', keepPlaying);
  byId('leaveGame')?.addEventListener('click', closeGame);
  exitDialog.addEventListener('cancel', event => { event.preventDefault(); keepPlaying(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestExit(); });
  dialog.addEventListener('close', () => {
    clearTimeout(timer); ready = false;
    if (exitDialog.open) exitDialog.close();
    frame.src = 'about:blank';
    document.body.classList.remove('game-open');
    if (location.hash === '#run') history.replaceState(null, '', location.pathname + location.search);
    opener?.focus({preventScroll:true});
    if (roomPosition) {
      if (room) room.scrollLeft = roomPosition.pan;
      scrollTo({left:roomPosition.x, top:roomPosition.y, behavior:'instant'});
    }
  });
  window.addEventListener('message', event => {
    if (!dialog.open || event.source !== frame.contentWindow || event.origin !== location.origin || !event.data) return;
    if (event.data.type === 'frens-hub:ready') {
      ready = true; clearTimeout(timer); loading.hidden = true;
      if (document.hidden || exitDialog.open) send('pause');
      else frame.focus({preventScroll:true});
    }
    if (event.data.type === 'frens-hub:request-exit') requestExit();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) send('pause'); });
  window.addEventListener('pagehide', () => send('pause'));
  window.addEventListener('beforeunload', event => { if (inProgress()) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('hashchange', () => { if (location.hash === '#run') openGame(); });
  if (location.hash === '#run') openGame();
})();
