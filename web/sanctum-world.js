(() => {
  'use strict';

  const roomGuardians = window.MYTHICAL_GUARDIANS_ROOM || [];

  const byId = (id) => document.getElementById(id);
  const safeStorage = {
    get(key, fallback) {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { /* Storage is optional. */ }
    },
  };

  const roomStage = byId('roomStage');
  const timeToggle = byId('timeToggle');
  const timeLabel = byId('timeLabel');
  const timeIcon = byId('timeIcon');
  const lampToggle = byId('lampToggle');
  const laptopHotspot = document.querySelector('.laptop-hotspot');

  if (!roomStage || !timeToggle || !lampToggle) return;

  function describeRoom() {
    const asleep = roomStage.dataset.lamp === 'off';
    const art = document.querySelector('.room-art');
    if (art) {
      art.alt = `Mythical Guardians collector sanctum at ${roomStage.dataset.time}: ${asleep ? 'a guardian resting under the blanket, a closed laptop and the bedside lamp off' : 'an open laptop, ancient scrolls, 25 framed guardians and a lit bedside lamp'}.`;
    }
  }

  function setLamp(on) {
    roomStage.dataset.lamp = on ? 'on' : 'off';
    lampToggle.setAttribute('aria-pressed', String(on));
    lampToggle.title = on ? 'Turn lamp off' : 'Turn lamp on';
    if (laptopHotspot) {
      laptopHotspot.disabled = !on;
      laptopHotspot.hidden = !on;
    }
    describeRoom();
    safeStorage.set('mg-sanctum-lamp', on ? 'on' : 'off');
  }

  function setTime(mode) {
    const next = mode === 'day' ? 'day' : 'night';
    roomStage.dataset.time = next;
    document.body.dataset.time = next;
    const isDay = next === 'day';
    timeToggle.setAttribute('aria-pressed', String(isDay));
    if (timeLabel) timeLabel.textContent = isDay ? 'Day' : 'Night';
    if (timeIcon) timeIcon.textContent = isDay ? '☀' : '☾';
    safeStorage.set('mg-sanctum-time', next);
    describeRoom();
  }

  setTime(safeStorage.get('mg-sanctum-time', 'night'));
  setLamp(safeStorage.get('mg-sanctum-lamp', 'on') !== 'off');
  timeToggle.addEventListener('click', () => setTime(roomStage.dataset.time === 'night' ? 'day' : 'night'));
  lampToggle.addEventListener('click', () => setLamp(roomStage.dataset.lamp !== 'on'));

  // Persistent touch-only cue, outside the scrolling panorama.
  {
    const shell = roomStage.closest('.room-shell');
    if (shell) {
      const hint = document.createElement('p');
      hint.className = 'room-swipe-hint';
      hint.hidden = true;
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↔ ';
      hint.append(arrow, 'Swipe to explore sanctum');
      shell.after(hint);

      const touchLayout = matchMedia('(max-width:600px) and (pointer:coarse)');
      function updateHint() {
        hint.hidden = !touchLayout.matches || shell.scrollWidth <= shell.clientWidth + 1;
      }
      const observer = new ResizeObserver(updateHint);
      observer.observe(shell);
      observer.observe(roomStage);
      touchLayout.addEventListener('change', updateHint);
      updateHint();
    }
  }

  // Every painted frame is an exact interactive target on the 640x240 room grid (9 + 8 + 8 = 25 frames).
  const frenDialog = byId('frenDialog');
  const photoHotspots = byId('photoHotspots');
  const photoRows = [
    {count: 9, x: 252, y: 24},
    {count: 8, x: 273, y: 66},
    {count: 8, x: 273, y: 108},
  ];
  let roomFrenIndex = 0;
  let activeWallGuardian = null;

  function openFren(index) {
    const g = roomGuardians[index];
    if (!g || !frenDialog) return;
    activeWallGuardian = g;
    const number = String(g.id).padStart(4, '0');
    const image = byId('frenDialogImage');
    image.src = g.file;
    image.alt = `${g.name} — ${g.tier} ${g.element} ${g.archetype}`;
    byId('frenDialogNumber').textContent = `Guardian #${number} · ${g.tier}`;
    byId('frenDialogTitle').textContent = g.name;
    byId('frenDialogTraits').textContent = `${g.element} Element · ${g.stance} · ${g.realm}`;

    const osLink = byId('frenDialogOpenSea');
    if (osLink) {
      const contract = window.guardianApp?.contractAddress || '0x27a0A6B0DF634719863767832CBF99D3a80d65bd';
      osLink.href = `https://opensea.io/item/robinhood/${contract}/${g.id}`;
    }

    if (!frenDialog.open) frenDialog.showModal();
    byId('closeFren')?.focus();
  }

  if (photoHotspots) {
    for (const row of photoRows) {
      for (let column = 0; column < row.count; column += 1) {
        const index = roomFrenIndex;
        const g = roomGuardians[index];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'photo-hotspot';
        button.style.setProperty('--left', `${((row.x + column * 42) / 640) * 100}%`);
        button.style.setProperty('--top', `${((row.y - 2) / 240) * 100}%`);
        button.style.setProperty('--width', `${(40 / 640) * 100}%`);
        button.style.setProperty('--height', `${(44 / 240) * 100}%`);
        button.style.setProperty('--art-position', `${((row.x + column * 42) / (640 - 40)) * 100}% ${((row.y - 2) / (240 - 44)) * 100}%`);
        button.setAttribute('aria-label', `Inspect framed Guardian ${index + 1}${g ? `: ${g.name} (${g.tier} ${g.element})` : ''}`);
        button.addEventListener('click', () => openFren(index));
        photoHotspots.append(button);
        roomFrenIndex += 1;
      }
    }
  }

  byId('closeFren')?.addEventListener('click', () => frenDialog?.close());
  frenDialog?.addEventListener('click', (event) => { if (event.target === frenDialog) frenDialog.close(); });

  byId('frenDialogInspectBtn')?.addEventListener('click', () => {
    if (frenDialog?.open) frenDialog.close();
    if (activeWallGuardian && window.guardianApp) {
      const fullToken = window.guardianApp.tokens?.find(t => t.id === activeWallGuardian.id) || activeWallGuardian;
      window.guardianApp.openInspectorModal(fullToken);
    }
  });
})();
