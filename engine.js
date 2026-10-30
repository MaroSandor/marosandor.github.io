// Terminál-motor: parancsok, fájlrendszer, módok (játékok, űrlap), nyelvváltás.
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverDevice = matchMedia('(hover: hover)');
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bar = n => '█'.repeat(Math.round(n / 10)) + '░'.repeat(10 - Math.round(n / 10));
  const cmdLink = (cmd, label) => `<a href="#" class="cmd-link" data-cmd="${esc(cmd)}">${esc(label ?? cmd)}</a>`;
  const isDir = n => n !== null && typeof n === 'object';
  const commonPrefix = list => list.reduce((a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
  const txt = x => (Array.isArray(x) ? L(x[0], x[1]) : x); // [hu, en] pár vagy sima szöveg

  window.createTerminal = function createTerminal(opts) {
    const key = opts.id || 'term';
    const out = $('out'), form = $('form'), input = $('cmd'), ps1 = $('ps1');
    const history = [];
    let hIndex = 0, cwd = [], mode = null, D = Lang.content(), fs;

    const githubUrl = () => D.contact.github || (D.githubUser ? `https://github.com/${D.githubUser}` : null);

    // ----- Virtuális fájlrendszer (nyelvváltáskor újraépül) -----
    function buildFs() {
      D = Lang.content();
      const none = L('(még nincs megadva)', '(not set yet)');
      fs = {
        'about.md': D.about.join('\n\n'),
        'skills.txt': D.skills.map(s => `${s.name.padEnd(11)} ${s.level.padEnd(15)} ${s.share ? s.share + L('% a GitHub-kódból', '% of GitHub code') : ''}`.trimEnd()).join('\n'),
        'contact.txt': `E-mail:   ${D.contact.email}\nGitHub:   ${githubUrl() ?? none}\nLinkedIn: ${D.contact.linkedin ?? none}`,
        projects: Object.fromEntries(D.projects.map(p => [p.id + '.md', `# ${p.title}\nStack: ${p.stack}\n\n${p.desc}\n\nLink: ${p.url}`])),
      };
    }
    buildFs();

    const getNode = path => path.reduce((n, p) => n[p], fs);
    function resolve(arg = '') {
      let path = arg.startsWith('/') || arg.startsWith('~') ? [] : [...cwd];
      for (const part of arg.split('/').filter(Boolean)) {
        if (part === '~') { path = []; continue; }
        if (part === '.') continue;
        if (part === '..') { path.pop(); continue; }
        const dir = getNode(path);
        if (!isDir(dir) || !Object.hasOwn(dir, part)) return null;
        path.push(part);
      }
      return { path, node: getNode(path) };
    }

    // ----- Prompt és kimenet -----
    const cwdLabel = () => (cwd.length ? '~/' + cwd.join('/') : '~');
    const promptHtml = () => opts.prompt(cwdLabel());
    const updatePrompt = () => { if (mode) ps1.textContent = mode.prompt; else ps1.innerHTML = promptHtml(); };
    const scroll = () => { out.scrollTop = out.scrollHeight; };

    function print(html, cls = '') {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      div.innerHTML = html;
      out.appendChild(div);
      scroll();
      return div;
    }
    function setMode(m) { mode = m; updatePrompt(); }
    function endMode() { mode = null; updatePrompt(); }

    const ctx = {
      get data() { return D; },
      print, esc, cmdLink, bar, reduceMotion, setMode, endMode, scroll, githubUrl,
      getHistory: () => history,
      isShareable: name => (opts.shareable || []).includes(name),
    };

    // ----- Parancsok -----
    const cmds = {};
    const err = msg => `<span class="err">${msg}</span>`;
    const dim = msg => `<span class="dim">${msg}</span>`;

    cmds.help = {
      desc: ['ez a lista', 'this list'],
      run: () => [
        `${L('Elérhető parancsok', 'Available commands')} ${dim(L('(Tab: kiegészít, ↑/↓: előzmények)', '(Tab: complete, ↑/↓: history)'))}`, '',
        ...Object.entries(cmds).filter(([, d]) => !d.hidden).map(([name, d]) => {
          const label = d.usage || name;
          return `<span class="hrow"><span class="cn">${cmdLink(name, label)}</span>${dim(esc(txt(d.desc)))}</span>`;
        }),
        '', dim(L('Vannak titkos parancsok is…', 'There are secret commands too…')),
      ],
    };
    cmds.welcome = { desc: ['üdvözlő képernyő', 'welcome screen'], run: () => opts.welcome(ctx) };
    cmds.about = { desc: ['bemutatkozás', 'about me'], run: () => fs['about.md'].split('\n').map(esc) };
    cmds.skills = { desc: ['készségek', 'skills'], run: () => fs['skills.txt'].split('\n').map(esc) };
    cmds.projects = {
      desc: ['projektek listája', 'list of projects'],
      run: () => [
        ...D.projects.map((p, i) => `${i + 1}. ${cmdLink('open ' + p.id, p.title)} ${dim(`(${esc(p.stack)})`)}${p.demo ? ` ${dim('▶ live')}` : ''}`),
        '', dim(L('Kattints egy névre, vagy: open <id>', 'Click a name, or: open <id>').replace(/</g, '&lt;')),
      ],
    };

    const findProject = k => D.projects.find((p, i) => p.id === k || String(i + 1) === k);
    cmds.open = {
      desc: ['egy projekt részletei', 'project details'],
      usage: 'open <id>',
      man: ['Megnyitja a projekt leírását az azonosítója\nvagy a sorszáma alapján. Példa: open todo', 'Shows a project by its id or number.\nExample: open todo'],
      run(args) {
        const k = (args[0] || '').toLowerCase();
        const p = findProject(k);
        if (!p) return [err(`open: ${L('nincs ilyen projekt', 'no such project')}: ${esc(k || '—')}`), dim(`${L('Azonosítók', 'Ids')}: ${D.projects.map(p => p.id).join(', ')}`)];
        return [
          `<span class="hl">${esc(p.title)}</span>`, `Stack: ${esc(p.stack)}`, esc(p.desc),
          ...(p.shot ? [`<img class="shot" src="${esc(p.shot)}" alt="${esc(p.title)}" loading="lazy">`] : []),
          `Link: <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>`,
          ...(p.demo ? [cmdLink('run ' + p.id, L('▶ élő demó indítása', '▶ launch live demo'))] : []),
        ];
      },
    };

    // Relatív útvonal vagy https cím lehet; mást nem engedünk beágyazni
    function demoSrc(demo) {
      if (/^https:\/\//i.test(demo)) return demo;
      if (/^[a-z][a-z0-9+.-]*:/i.test(demo) || demo.startsWith('/') || demo.includes('..')) return null;
      return `${demo}${demo.includes('?') ? '&' : '?'}lang=${Lang.get()}`;
    }
    cmds.run = {
      desc: ['élő demó a terminálban', 'live demo inside the terminal'],
      usage: 'run <id>',
      man: ['Beágyazva elindítja a projekt működő demóját.\nPélda: run todo', 'Launches the live demo of a project inline.\nExample: run todo'],
      run(args) {
        const k = (args[0] || '').toLowerCase();
        const p = findProject(k);
        if (!p) return [err(`run: ${L('nincs ilyen projekt', 'no such project')}: ${esc(k || '—')}`), dim(`${L('Azonosítók', 'Ids')}: ${D.projects.map(p => p.id).join(', ')}`)];
        const src = p.demo && demoSrc(p.demo);
        if (!src) return [dim(L(`A(z) „${esc(p.title)}” projekthez még nincs élő demó.`, `There is no live demo for “${esc(p.title)}” yet.`))];
        return [`<div class="embed"><div class="embed-bar"><span>${esc(p.title)} · ${L('élő demó', 'live demo')}</span><a href="${esc(src)}" target="_blank" rel="noopener">${L('megnyitás új lapon ↗', 'open in new tab ↗')}</a></div><iframe src="${esc(src)}" title="${esc(p.title)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"></iframe></div>`];
      },
    };

    cmds.contact = {
      desc: ['elérhetőségek', 'how to reach me'],
      run() {
        const c = D.contact, gh = githubUrl();
        const none = dim(L('(még nincs megadva)', '(not set yet)'));
        const link = u => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`;
        return [`E-mail:   <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`, `GitHub:   ${gh ? link(gh) : none}`, `LinkedIn: ${c.linkedin ? link(c.linkedin) : none}`];
      },
    };
    cmds.ls = {
      desc: ['könyvtár tartalma', 'list directory'],
      usage: 'ls [path]',
      man: ['Kilistázza a könyvtár tartalmát. A fájlnevekre kattinthatsz.', 'Lists a directory. File names are clickable.'],
      run(args) {
        const arg = args[0] || '';
        const r = resolve(arg);
        if (!r) return [err(`ls: ${L('nincs ilyen hely', 'no such place')}: ${esc(arg)}`)];
        if (!isDir(r.node)) return [esc(arg)];
        const prefix = arg ? arg.replace(/\/$/, '') + '/' : '';
        return [Object.keys(r.node).sort().map(n => (isDir(r.node[n]) ? `<span class="dir">${esc(n)}/</span>` : cmdLink('cat ' + prefix + n, n))).join('   ')];
      },
    };
    cmds.cd = {
      desc: ['könyvtárváltás', 'change directory'],
      usage: 'cd <path>',
      man: ['Könyvtárat vált. cd .. visszalép, cd ~ a kezdőkönyvtárba visz.', 'Changes directory. cd .. goes up, cd ~ goes home.'],
      run(args) {
        const arg = args[0] || '~';
        const r = resolve(arg);
        if (!r) return [err(`cd: ${L('nincs ilyen könyvtár', 'no such directory')}: ${esc(arg)}`)];
        if (!isDir(r.node)) return [err(`cd: ${L('ez nem könyvtár', 'not a directory')}: ${esc(arg)}`)];
        cwd = r.path;
        updatePrompt();
      },
    };
    cmds.cat = {
      desc: ['fájl tartalma', 'print a file'],
      usage: 'cat <file>',
      man: ['Kiírja egy fájl tartalmát. Példa: cat projects/todo.md', 'Prints a file. Example: cat projects/todo.md'],
      run(args) {
        if (!args[0]) return [err(`cat: ${L('add meg a fájl nevét', 'missing file name')}`)];
        const r = resolve(args[0]);
        if (!r) return [err(`cat: ${L('nincs ilyen fájl', 'no such file')}: ${esc(args[0])}`)];
        if (isDir(r.node)) return [err(`cat: ${L('ez egy könyvtár', 'is a directory')}: ${esc(args[0])}`)];
        return r.node.split('\n').map(esc);
      },
    };
    cmds.pwd = { desc: ['jelenlegi hely', 'current location'], hidden: true, run: () => [cwd.length ? '/home/visitor/' + cwd.join('/') : '/home/visitor'] };
    cmds.whoami = { desc: ['ki vagyok', 'who am i'], hidden: true, run: () => ['visitor'] };
    cmds.date = { desc: ['dátum és idő', 'date and time'], hidden: true, run: () => [new Date().toLocaleString(L('hu-HU', 'en-GB'))] };
    cmds.echo = { desc: ['szöveg kiírása', 'print text'], hidden: true, usage: 'echo <text>', run: args => [esc(args.join(' '))] };
    cmds.neofetch = {
      desc: ['rendszerinfó', 'system info'],
      run() {
        const art = [' __  __ ____ ', '|  \\/  / ___|', '| |\\/| \\___ \\', '| |  | |___) |', '|_|  |_|____/ '];
        const hl = s => `<span class="hl">${s}</span>`;
        const info = [
          `${hl(esc(D.name))}@portfolio`, '---------------------',
          `${hl(L('Szerep', 'Role'))}      ${esc(D.role)}`, `${hl('Stack')}       HTML, CSS, JavaScript`,
          `${hl(L('Projektek', 'Projects'))}   ${D.projects.length}`,
          `${hl(L('Mód', 'Mode'))}         ${document.documentElement.dataset.mode}`,
        ];
        return art.map((a, i) => `${hl(esc(a))}   ${info[i] ?? ''}`).concat(info.slice(art.length));
      },
    };
    cmds.lscmds = {
      desc: ['az összes parancs egy sorban', 'all commands on one line'],
      run: () => [Object.entries(cmds).filter(([, d]) => !d.hidden).map(([n]) => cmdLink(n)).join('  '), dim(L('(a titkosakat nem mutatom meg)', "(secret ones aren't listed)"))],
    };
    cmds.man = {
      desc: ['kézikönyv egy parancshoz', 'manual for a command'],
      usage: 'man <command>',
      man: ['Megmutatja egy parancs leírását. Példa: man cat', 'Shows the manual of a command. Example: man cat'],
      run(args) {
        const n = (args[0] || '').toLowerCase();
        if (!n) return [`${L('Melyik parancsról? Például', 'Which command? For example')}: ${cmdLink('man ls')}`];
        if (!Object.hasOwn(cmds, n)) return [err(`man: ${L('nincs kézikönyv-oldal', 'no manual entry')}: ${esc(n)}`)];
        const d = cmds[n];
        return [
          `<span class="hl">${L('NÉV', 'NAME')}</span>`, `  ${esc(n)} - ${esc(txt(d.desc))}`, '',
          `<span class="hl">${L('HASZNÁLAT', 'USAGE')}</span>`, `  ${esc(d.usage || n)}`,
          ...(d.man ? ['', `<span class="hl">${L('LEÍRÁS', 'DESCRIPTION')}</span>`, ...txt(d.man).split('\n').map(l => '  ' + esc(l))] : []),
        ];
      },
    };
    cmds.history = { desc: ['korábbi parancsok', 'previous commands'], run: () => (history.length ? history.map((c, i) => `${String(i + 1).padStart(3)}  ${esc(c)}`) : [dim(L('(üres)', '(empty)'))]) };
    cmds.clear = { desc: ['képernyő törlése', 'clear the screen'], run() { out.innerHTML = ''; } };
    cmds.sudo = { desc: ['rendszergazda', 'superuser'], hidden: true, run: () => [err(L('Nincs jogod hozzá. De a kedvességedet értékelem. 😄', "Permission denied. But I appreciate the effort. 😄"))] };
    cmds.exit = { desc: ['kilépés', 'exit'], hidden: true, run: () => [dim(L('Nincs hova menekülni.', 'Nowhere to run.'))] };

    // Modulok: játékok, titkok, github, send, link… Mindegyik (ctx) => { parancs: definíció }
    (opts.extras || []).forEach(name => Object.assign(cmds, window.TermExtras[name](ctx)));
    if (opts.commands) Object.assign(cmds, opts.commands(ctx));

    // ----- Futtatás -----
    function exec(raw) {
      if (mode) {
        print(`<span class="ps">${esc(mode.prompt)}</span> ${esc(raw)}`, 'cmd');
        if (mode.onInput(raw.trim(), ctx) === false) endMode();
        return;
      }
      print(`<span class="ps">${promptHtml()}</span> ${esc(raw)}`, 'cmd');
      const trimmed = raw.trim();
      if (!trimmed) return;
      history.push(trimmed);
      hIndex = history.length;
      const [name, ...args] = trimmed.split(/\s+/);
      const k = name.toLowerCase();
      if (!Object.hasOwn(cmds, k)) {
        print(`${err(`${L('Ismeretlen parancs', 'Unknown command')}: ${esc(name)}`)} ${dim(L('(próbáld: help)', '(try: help)'))}`);
        return;
      }
      (cmds[k].run(args, ctx) || []).forEach(line => print(line));
      if (opts.onRun) opts.onRun(k, args);
    }
    // UI-ból (link, gomb) jövő parancs: egy futó játékot/űrlapot előbb kilépteti
    function execFromUI(cmd) {
      if (mode) endMode();
      exec(cmd);
      if (hoverDevice.matches) input.focus({ preventScroll: true });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value;
      input.value = '';
      exec(v);
    });
    out.addEventListener('click', e => {
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        e.preventDefault();
        navigator.clipboard?.writeText(copy.dataset.copy).then(() => { copy.textContent = L('Másolva ✓', 'Copied ✓'); }).catch(() => {});
        return;
      }
      const link = e.target.closest('[data-cmd]');
      if (!link) return;
      e.preventDefault();
      execFromUI(link.dataset.cmd);
    });
    const chips = $('chips');
    if (chips) chips.addEventListener('click', e => {
      const btn = e.target.closest('[data-run]');
      if (btn) execFromUI(btn.dataset.run);
    });
    $('term').addEventListener('click', e => {
      if (!e.target.closest('a, button, iframe') && !getSelection().toString()) input.focus({ preventScroll: true });
    });

    // ----- Billentyűk -----
    function complete() {
      if (mode) return;
      const parts = input.value.split(/\s+/);
      const last = parts[parts.length - 1];
      let candidates;
      if (parts.length === 1) {
        candidates = Object.entries(cmds).filter(([, d]) => !d.hidden).map(([n]) => n);
      } else {
        const slash = last.lastIndexOf('/');
        const dirPart = slash >= 0 ? last.slice(0, slash + 1) : '';
        const r = resolve(dirPart || '.');
        candidates = r && isDir(r.node) ? Object.keys(r.node).map(n => dirPart + n + (isDir(r.node[n]) ? '/' : '')) : [];
        if (['open', 'run'].includes(parts[0].toLowerCase())) candidates = D.projects.map(p => p.id);
      }
      const matches = candidates.filter(c => c.startsWith(last));
      if (!matches.length) return;
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0] + (matches[0].endsWith('/') ? '' : ' ');
      } else {
        parts[parts.length - 1] = commonPrefix(matches);
        print(dim(matches.map(esc).join('   ')));
      }
      input.value = parts.join(' ');
    }
    input.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.key === 'ArrowUp' && history.length && !mode) { e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex]; }
      else if (e.key === 'ArrowDown' && history.length && !mode) { e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ''; }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    });

    // ----- Nyelvváltás: a fájlrendszer és a prompt újraépül -----
    Lang.on(() => { buildFs(); updatePrompt(); if (opts.onLang) opts.onLang(); });

    // ----- Indítás -----
    async function boot() {
      updatePrompt();
      const seen = (() => { try { return localStorage.getItem(key + '-booted') === '1'; } catch { return false; } })();
      const wait = ms => new Promise(r => setTimeout(r, reduceMotion || seen ? 0 : ms));
      input.disabled = true;
      for (const line of (opts.bootLines ? opts.bootLines() : [])) { print(dim(esc(line))); await wait(260); }
      opts.welcome(ctx).forEach(l => print(l));
      input.disabled = false;
      try { localStorage.setItem(key + '-booted', '1'); } catch {}
      if (hoverDevice.matches) input.focus({ preventScroll: true });
    }
    const ready = boot();

    // Közvetlen link: csak engedélyezett parancsokat futtat
    async function runList(list) {
      for (const raw of list) {
        const name = raw.trim().split(/\s+/)[0]?.toLowerCase();
        if (!(opts.shareable || []).includes(name)) continue;
        execFromUI(raw.trim());
        await new Promise(r => setTimeout(r, reduceMotion ? 0 : 400));
      }
    }

    return { exec: execFromUI, ready, runList };
  };
})();
