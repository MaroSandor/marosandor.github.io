// Téma: világos / sötét / auto. Az akcentusszín egyetlen, fix zöld (P1 foszfor).
(() => {
  const MODES = ['auto', 'light', 'dark'];
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const mq = matchMedia('(prefers-color-scheme: light)');

  // A ?mode= paraméter felülírja a mentett értéket, de nem menti el
  let mode = [new URLSearchParams(location.search).get('mode'), store.get('mode')].find(m => MODES.includes(m)) || 'auto';

  const effective = () => (mode === 'auto' ? (mq.matches ? 'light' : 'dark') : mode);
  const listeners = [];

  function apply() {
    root.dataset.mode = effective();
    listeners.forEach(fn => fn());
  }
  mq.addEventListener('change', apply);

  window.Theme = {
    MODES,
    get mode() { return mode; },
    get effective() { return effective(); },
    setMode(m) { if (!MODES.includes(m)) return false; mode = m; store.set('mode', m); apply(); return true; },
    toggle() { this.setMode(effective() === 'light' ? 'dark' : 'light'); },
    on: fn => { listeners.push(fn); },
  };
  apply();
})();
