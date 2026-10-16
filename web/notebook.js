(() => {
  'use strict';
  const triggers = [...document.querySelectorAll('#openNotebook, [data-open-notebook]')];
  const dialog = document.getElementById('notebookDialog');
  if (!triggers.length || !dialog) return;
  const close = document.getElementById('closeNotebook');
  const pageButtons = [...dialog.querySelectorAll('[data-notebook-page]')];
  let pressedOnBackdrop = false;
  let opener = null;
  let pendingOpen = null;
  let fontReady = false;
  const fontLoading = document.fonts
    ? Promise.all([400, 600].map(weight => document.fonts.load(`${weight} 24px "Fren Hand"`)))
      .then(faces => (fontReady = faces.every(matches => matches.length > 0)), () => false)
    : Promise.resolve(false);
  const loadingStatus = document.createElement('span');
  loadingStatus.className = 'sr-only';
  loadingStatus.setAttribute('role', 'status');
  document.body.append(loadingStatus);

  function setLoading(loading) {
    for (const trigger of triggers) {
      if (loading) trigger.setAttribute('aria-busy', 'true');
      else trigger.removeAttribute('aria-busy');
    }
    loadingStatus.textContent = loading ? 'Opening Kunlun notebook\u2026' : '';
  }
  function cancelPendingOpen() {
    if (!pendingOpen) return;
    pendingOpen = null;
    setLoading(false);
  }
  function waitForFont() {
    return new Promise(resolve => {
      const timeout = setTimeout(() => resolve(false), 1500);
      fontLoading.then(ready => { clearTimeout(timeout); resolve(ready); });
    });
  }

  function selectPage(page) {
    dialog.dataset.page = page;
    for (const button of pageButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.notebookPage === page));
    }
  }
  async function openNotebook(event) {
    if (dialog.open || pendingOpen) return;
    opener = event.currentTarget;
    const request = {};
    pendingOpen = request;
    if (!fontReady) setLoading(true);
    const ready = fontReady || await waitForFont();
    if (pendingOpen !== request) return;
    pendingOpen = null;
    setLoading(false);
    dialog.dataset.font = ready ? 'ready' : 'fallback';
    selectPage('notes');
    dialog.showModal();
    document.body.classList.add('notebook-open');
    for (const page of dialog.querySelectorAll('.notebook-page')) page.scrollTop = 0;
    close.focus({preventScroll: true});
  }
  for (const trigger of triggers) trigger.addEventListener('click', openNotebook);
  document.addEventListener('keydown', event => {
    if (pendingOpen && event.key === 'Escape') {
      cancelPendingOpen();
      event.preventDefault();
    }
  });
  document.addEventListener('click', event => {
    if (!triggers.some(trigger => trigger.contains(event.target))) cancelPendingOpen();
  }, true);
  document.addEventListener('focusin', event => {
    if (!triggers.some(trigger => trigger.contains(event.target))) cancelPendingOpen();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('notebook-open');
    opener?.focus({preventScroll: true});
    pressedOnBackdrop = false;
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, [tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  function outside(event) {
    const r = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom);
  }
  dialog.addEventListener('pointerdown', event => { pressedOnBackdrop = outside(event); });
  dialog.addEventListener('pointercancel', () => { pressedOnBackdrop = false; });
  dialog.addEventListener('click', event => {
    if (pressedOnBackdrop && outside(event)) dialog.close();
    pressedOnBackdrop = false;
  });
  for (const button of pageButtons) {
    button.addEventListener('click', () => selectPage(button.dataset.notebookPage));
  }
})();
