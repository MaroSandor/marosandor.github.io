// Nyelvkezelés (hu / en). A tartalomban {hu, en} párok vannak, a kódban L('magyar', 'english').
(() => {
  const SUPPORTED = ['hu', 'en'];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const listeners = [];

  // Sorrend: ?lang= paraméter, mentett választás, böngésző nyelve
  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(q)) return q;
    const saved = store.get('lang');
    if (SUPPORTED.includes(saved)) return saved;
    return (navigator.language || 'hu').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  let lang = detect();
  document.documentElement.lang = lang;

  const isPair = o => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length === 2 && 'hu' in o && 'en' in o;
  const resolve = v => {
    if (isPair(v)) return v[lang];
    if (Array.isArray(v)) return v.map(resolve);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)]));
    return v;
  };

  window.Lang = {
    SUPPORTED,
    get: () => lang,
    set(next) {
      if (!SUPPORTED.includes(next) || next === lang) return false;
      lang = next;
      store.set('lang', next);
      document.documentElement.lang = next;
      listeners.forEach(fn => fn(next));
      return true;
    },
    on: fn => { listeners.push(fn); },
    content: () => resolve(window.DATA),
  };
  window.L = (hu, en) => (lang === 'hu' ? hu : en);

  // Statikus szövegek a HTML-ben: data-hu / data-en, aria-label: data-aria-hu / data-aria-en
  window.applyStaticLang = () => {
    document.querySelectorAll('[data-hu]').forEach(el => { el.textContent = el.dataset[lang]; });
    document.querySelectorAll('[data-aria-hu]').forEach(el => el.setAttribute('aria-label', el.dataset[lang === 'hu' ? 'ariaHu' : 'ariaEn']));
  };
})();
