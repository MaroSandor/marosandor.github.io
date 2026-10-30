const desktop = matchMedia('(min-width: 901px)');
const err = m => `<span class="err">${m}</span>`;
let panel;

// Ezeket futtathatja egy megosztott link (?cmd=…). Minden más tiltott.
const SHAREABLE = ['about', 'skills', 'projects', 'open', 'run', 'contact', 'ls', 'cat', 'neofetch', 'repos', 'git', 'man', 'help', 'welcome'];

// ---------- Nézet (telefonon: terminál / profil fül) ----------
function setView(view) {
  document.body.dataset.view = view;
  document.querySelectorAll('[data-view-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.viewBtn === view)));
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-view-btn]').forEach(b => b.addEventListener('click', () => setView(b.dataset.viewBtn)));

// ---------- Mód és nyelv a fejlécben ----------
const modeBtn = document.getElementById('mode-btn');
modeBtn.addEventListener('click', () => Theme.toggle());
document.querySelectorAll('[data-lang-btn]').forEach(b => b.addEventListener('click', () => Lang.set(b.dataset.langBtn)));

function refreshChrome() {
  applyStaticLang();
  const light = Theme.effective === 'light';
  modeBtn.textContent = light ? '☾' : '☀';
  modeBtn.setAttribute('aria-label', light ? L('Sötét mód', 'Dark mode') : L('Világos mód', 'Light mode'));
  modeBtn.title = modeBtn.getAttribute('aria-label');
  document.querySelectorAll('[data-lang-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.langBtn === Lang.get())));
  const d = Lang.content();
  document.title = `${d.name} – ${L('Junior mobil- és backend fejlesztő', 'Junior mobile & backend developer')}`;
  document.querySelector('meta[name="description"]').content = L(`${d.name} junior ${d.role.toLowerCase()} portfolioja: Java, C#, Python és JavaScript projektek a GitHubról, egy működő terminállal és élő profilpanellel.`, `Portfolio of ${d.name}, junior ${d.role.toLowerCase()}: Java, C#, Python and JavaScript projects from GitHub, with a working terminal and a live profile panel.`);
}
Theme.on(refreshChrome);

// A csak beállítás után működő funkciók gombját elrejtjük
const configured = { repos: Boolean(DATA.githubUser) };
document.querySelectorAll('#chips [data-run]').forEach(b => { if (b.dataset.run in configured && !configured[b.dataset.run]) b.remove(); });

// ---------- Terminál ----------
const term = createTerminal({
  id: 'merged',
  extras: ['games', 'secrets', 'github', 'send', 'share'],
  shareable: SHAREABLE,
  bootLines: () => [
    L('Rendszer indítása…', 'Booting…'),
    L('Fájlrendszer csatolása: about.md  skills.txt  contact.txt  projects/  [OK]', 'Mounting filesystem: about.md  skills.txt  contact.txt  projects/  [OK]'),
    L('Téma betöltve  [OK]', 'Theme loaded  [OK]'),
  ],
  prompt: cwd => `<span class="p-user">visitor</span>@<span class="p-host">maro.dev</span>:<span class="p-cwd">${cwd}</span>$`,
  welcome: ctx => {
    const banner = ctx.data.name.split(/\s+/).map(asciiArt).join('\n\n');
    return [
      '',
      `<pre class="ascii" aria-label="${ctx.esc(ctx.data.name)}">${ctx.esc(banner)}</pre>`,
      `<span class="dim">${ctx.esc(ctx.data.role)} · ${L('verzió', 'version')} ${ctx.esc(ctx.data.version)}</span>`,
      '',
      L(`Üdv! Ez a portfolio egy működő terminál. Írd be: ${ctx.cmdLink('help')}, vagy kattints a gombokra alul.`, `Welcome! This portfolio is a working terminal. Type ${ctx.cmdLink('help')}, or click the buttons below.`),
      L(`Terminál nélkül is megtalálsz itt mindent: ${ctx.cmdLink('panel', 'profil panel')}.`, `No terminal needed, everything is also here: ${ctx.cmdLink('panel', 'profile panel')}.`),
    ];
  },
  commands: ctx => ({
    panel: {
      desc: ['profil panel megnyitása', 'open the profile panel'],
      run() {
        if (desktop.matches) return [L('A profil panel a jobb oldalon látható.', 'The profile panel is on the right.')];
        setView('panel');
      },
    },
    theme: {
      desc: ['világos / sötét mód: light | dark | auto', 'light / dark mode: light | dark | auto'],
      usage: 'theme [mode]',
      man: ['A megjelenést állítja: light (világos), dark (sötét)\nvagy auto (a rendszerbeállítást követi). Példa: theme light', 'Sets the appearance: light, dark or auto\n(follows your system setting). Example: theme light'],
      run(args) {
        const n = (args[0] || '').toLowerCase();
        if (!Theme.MODES.includes(n)) return [`${L('Mód', 'Mode')}: ${Theme.MODES.map(t => ctx.cmdLink('theme ' + t, t)).join(', ')}`];
        Theme.setMode(n);
        return [`${L('Mód beállítva', 'Mode set')}: <span class="hl">${ctx.esc(n)}</span>`];
      },
    },
    lang: {
      desc: ['nyelv / language: hu | en', 'language: hu | en'],
      usage: 'lang [hu|en]',
      run(args) {
        const n = (args[0] || '').toLowerCase();
        if (!Lang.SUPPORTED.includes(n)) return [`${L('Nyelv', 'Language')}: ${Lang.SUPPORTED.map(l => ctx.cmdLink('lang ' + l, l)).join(', ')}`];
        Lang.set(n);
        return [`${L('Nyelv beállítva', 'Language set')}: <span class="hl">${n === 'hu' ? 'magyar' : 'English'}</span>`];
      },
    },
  }),
  onRun: (name, args) => panel && panel.sync(name, args),
  onLang: () => { refreshChrome(); panel && panel.render(); },
});

panel = createPanel({ exec: term.exec });
refreshChrome();

// ---------- Közvetlen linkek: ?cmd=open todo;run todo  vagy  #projects ----------
term.ready.then(() => {
  const params = new URLSearchParams(location.search);
  const fromQuery = (params.get('cmd') || '').split(';').map(s => s.trim()).filter(Boolean);
  const hash = decodeURIComponent(location.hash.slice(1)).replace(/^\/+/, '').trim();
  term.runList(fromQuery.length ? fromQuery : hash ? [hash] : []);
});
