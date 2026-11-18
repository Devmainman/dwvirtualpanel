// Every button that starts a server request shows a spinner and can't be pressed
// again until that request finishes, so nobody double-pays or double-submits
// because "nothing happened".
//
// How: a click on a button is remembered for a short moment. Any fetch / XHR
// (axios uses XHR) that starts in that moment is tied to the button. While any
// of those requests is running the button gets data-busy (spinner, no clicks).
// Buttons that only navigate or switch tabs never start a request, so they are
// left alone. Opt a button out with data-no-busy.
const WINDOW_MS = 1200; // async work (e.g. resizing a photo) may delay the request a little
const SELECTOR = 'button, [role="button"], input[type="submit"], input[type="button"]';

let lastPress = null; // { el, at }
const counts = new WeakMap();

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function pressedButton() {
  if (!lastPress) return null;
  if (now() - lastPress.at > WINDOW_MS) return null;
  const el = lastPress.el;
  return el && el.isConnected ? el : null;
}

function setBusy(el, on) {
  if (on) {
    if (el.hasAttribute('data-busy')) return;
    const cs = getComputedStyle(el);
    el.style.setProperty('--busy-color', cs.color);
    if (cs.position === 'static') { el.style.position = 'relative'; el.dataset.busyPos = '1'; }
    el.setAttribute('data-busy', '');
    el.setAttribute('aria-busy', 'true');
  } else {
    el.removeAttribute('data-busy');
    el.removeAttribute('aria-busy');
    if (el.dataset.busyPos) { el.style.position = ''; delete el.dataset.busyPos; }
  }
}

function track(el) {
  if (!el) return () => {};
  counts.set(el, (counts.get(el) || 0) + 1);
  setBusy(el, true);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const n = (counts.get(el) || 1) - 1;
    counts.set(el, n);
    if (n <= 0) setBusy(el, false);
  };
}

export function installPressBusy() {
  if (typeof window === 'undefined' || window.__pressBusy) return;
  window.__pressBusy = true;

  // Remember the pressed button; swallow presses on a button that is still busy.
  const onPress = (e) => {
    const el = e.target?.closest?.(SELECTOR);
    if (!el || el.hasAttribute('data-no-busy') || el.closest('[data-no-busy]')) return;
    if (el.hasAttribute('data-busy')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    lastPress = { el, at: now() };
  };
  document.addEventListener('click', onPress, true);
  // Pressing Enter in a form submits through its submit button.
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const btn = e.submitter || form?.querySelector?.('button[type="submit"], button:not([type]), input[type="submit"]');
    if (!btn || btn.hasAttribute('data-no-busy')) return;
    if (btn.hasAttribute('data-busy')) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    lastPress = { el: btn, at: now() };
  }, true);

  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function patchedFetch(...args) {
      const release = track(pressedButton());
      let p;
      try { p = origFetch.apply(this, args); } catch (err) { release(); throw err; }
      return p.then((r) => { release(); return r; }, (err) => { release(); throw err; });
    };
  }

  const XHR = window.XMLHttpRequest;
  if (XHR) {
    const send = XHR.prototype.send;
    XHR.prototype.send = function patchedSend(...args) {
      const release = track(pressedButton());
      this.addEventListener('loadend', release, { once: true });
      try { return send.apply(this, args); } catch (err) { release(); throw err; }
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    [data-busy]{ pointer-events:none !important; cursor:progress !important; color:transparent !important; }
    [data-busy] > *{ visibility:hidden !important; }
    [data-busy]::after{
      content:""; position:absolute; left:50%; top:50%;
      width:15px; height:15px; margin:-7.5px 0 0 -7.5px; box-sizing:border-box;
      border-radius:9999px; border:2px solid var(--busy-color, currentColor);
      border-right-color:transparent; animation:press-busy-spin .7s linear infinite;
      visibility:visible;
    }
    @keyframes press-busy-spin{ to{ transform:rotate(360deg) } }
  `;
  document.head.appendChild(style);
}
