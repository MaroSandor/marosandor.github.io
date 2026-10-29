// Funkció-modulok: github (repos, git log), send (üzenet), share (link).
(() => {
  const err = m => `<span class="err">${m}</span>`;
  const dim = m => `<span class="dim">${m}</span>`;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------- GitHub ----------
  const cache = {
    get(k) { try { const v = JSON.parse(sessionStorage.getItem('gh:' + k)); if (v && Date.now() - v.t < 600000) return v.d; } catch {} return null; },
    set(k, d) { try { sessionStorage.setItem('gh:' + k, JSON.stringify({ t: Date.now(), d })); } catch {} },
  };
  async function gh(path) {
    const hit = cache.get(path);
    if (hit) return hit;
    const res = await fetch('https://api.github.com' + path, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? 'rate' : res.status === 404 ? 'notfound' : 'http');
    const data = await res.json();
    cache.set(path, data);
    return data;
  }
  const ghError = e => err(e.message === 'rate' ? L('A GitHub API limitje elfogyott, próbáld később.', 'GitHub API rate limit reached, try again later.')
    : e.message === 'notfound' ? L('Nem található.', 'Not found.')
    : L('A lekérdezés nem sikerült (offline?).', 'Request failed (offline?).'));
  const fmtDate = iso => new Date(iso).toLocaleDateString(L('hu-HU', 'en-GB'));
  const safeRepo = name => /^[\w.-]+$/.test(name || '');
  const noUser = () => [dim(L('A GitHub-felhasználónév még nincs megadva (data.js → githubUser).', 'GitHub username is not set yet (data.js → githubUser).'))];

  // ---------- Üzenetküldés ----------
  function ask(c, steps, i, data) {
    const s = steps[i];
    c.print(s.question());
    c.setMode({
      prompt: s.prompt(),
      onInput(v) {
        if (v.toLowerCase() === 'q') { c.print(dim(L('Megszakítva.', 'Cancelled.'))); return false; }
        const problem = s.check(v);
        if (problem) { c.print(err(problem)); return true; }
        data[s.key] = v;
        if (i + 1 < steps.length) { ask(c, steps, i + 1, data); return true; }
        deliver(c, data);
        return false;
      },
    });
  }

  async function deliver(c, d) {
    const endpoint = c.data.formEndpoint;
    if (!endpoint) {
      const href = `mailto:${c.data.contact.email}?subject=${encodeURIComponent(L('Üzenet a portfolióból', 'Message from your portfolio'))}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})`)}`;
      c.print(`${L('Nincs beállítva küldő szolgáltatás, ezért a levelezőprogramodban fejezheted be', 'No form service is configured, so finish it in your mail app')}: <a href="${c.esc(href)}">${L('levél megnyitása ↗', 'open the draft ↗')}</a>`);
      return;
    }
    const el = c.print(dim(L('Küldés…', 'Sending…')));
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: d.name, email: d.email, message: d.message }) });
      if (!res.ok) throw new Error('http');
      el.innerHTML = L('Köszönöm, az üzeneted megérkezett! Hamarosan válaszolok. ✓', 'Thanks, your message has arrived! I will reply soon. ✓');
    } catch {
      el.innerHTML = err(L('A küldés nem sikerült. Írj inkább e-mailt:', 'Sending failed. Please email me instead:')) + ` <a href="mailto:${c.esc(c.data.contact.email)}">${c.esc(c.data.contact.email)}</a>`;
    }
    c.scroll();
  }

  Object.assign(window.TermExtras, {
    github(ctx) {
      return {
        repos: {
          desc: ['legutóbbi GitHub repók', 'recent GitHub repositories'],
          man: ['A GitHub API-ból lekéri a legutóbb frissített repóimat.\nA repó nevére kattintva a commitjait is megnézheted.', 'Fetches my most recently updated repositories from the GitHub API.\nClick a repo name to see its commits.'],
          run(args, c) {
            const user = c.data.githubUser;
            if (!user) return noUser();
            const el = c.print(dim(L('Lekérdezés…', 'Fetching…')));
            gh(`/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=10`).then(repos => {
              const rows = repos.filter(r => !r.fork).slice(0, 5).map(r =>
                `${c.cmdLink('git log ' + r.name, r.name)} ${dim(`${c.esc(r.language || '—')} · ★${r.stargazers_count} · ${fmtDate(r.pushed_at)}`)}${r.description ? `\n  ${c.esc(r.description)}` : ''}`);
              el.innerHTML = rows.length ? rows.join('\n') : dim(L('Nincs nyilvános repó.', 'No public repositories.'));
              c.scroll();
            }).catch(e => { el.innerHTML = ghError(e); c.scroll(); });
          },
        },
        git: {
          desc: ['git log: legutóbbi commitok', 'git log: recent commits'],
          usage: 'git log [repo]',
          run(args, c) {
            if ((args[0] || '').toLowerCase() !== 'log') return [dim(`${L('Használat', 'Usage')}: git log [repo]`)];
            const user = c.data.githubUser;
            if (!user) return noUser();
            if (args[1] && !safeRepo(args[1])) return [err(L('Érvénytelen repónév.', 'Invalid repository name.'))];
            const el = c.print(dim(L('Lekérdezés…', 'Fetching…')));
            (async () => {
              let repo = args[1];
              if (!repo) {
                const repos = await gh(`/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=10`);
                repo = (repos.find(r => !r.fork) || {}).name;
                if (!repo) throw new Error('notfound');
              }
              const commits = await gh(`/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/commits?per_page=6`);
              el.innerHTML = [`<span class="hl">${c.esc(repo)}</span>`, ...commits.map(k =>
                `<span class="hl">${c.esc(k.sha.slice(0, 7))}</span> ${c.esc((k.commit.message || '').split('\n')[0])} ${dim(fmtDate(k.commit.author.date))}`)].join('\n');
              c.scroll();
            })().catch(e => { el.innerHTML = ghError(e); c.scroll(); });
          },
        },
      };
    },

    send(ctx) {
      return {
        send: {
          desc: ['üzenet küldése nekem', 'send me a message'],
          man: ['Három kérdésre válaszolva üzenetet írhatsz nekem.\nKilépés bármikor: q', 'Answer three questions to send me a message.\nQuit any time: q'],
          run(args, c) {
            ask(c, [
              { key: 'name', prompt: () => L('név>', 'name>'), question: () => L('Hogy hívnak?', "What's your name?") + ' ' + dim(L('(kilépés: q)', '(quit: q)')),
                check: v => (!v ? L('A név kötelező.', 'Name is required.') : v.length > 80 ? L('Túl hosszú név.', 'Name is too long.') : '') },
              { key: 'email', prompt: () => 'email>', question: () => L('Milyen e-mail címen válaszolhatok?', 'Which email can I reply to?'),
                check: v => (EMAIL.test(v) ? '' : L('Ez nem tűnik e-mail címnek.', "That doesn't look like an email address.")) },
              { key: 'message', prompt: () => L('üzenet>', 'message>'), question: () => L('Mit szeretnél üzenni?', 'What would you like to say?'),
                check: v => (v.length < 10 ? L('Legalább 10 karakter legyen.', 'Please write at least 10 characters.') : v.length > 2000 ? L('Túl hosszú üzenet.', 'Message is too long.') : '') },
            ], 0, {});
          },
        },
      };
    },

    share(ctx) {
      return {
        link: {
          desc: ['megosztható link egy parancshoz', 'shareable link for a command'],
          usage: 'link [command]',
          man: ['Közvetlen linket ad egy parancshoz: aki megnyitja, azt látja,\namit te. Parancs nélkül az utoljára futtatottat használja.\nPélda: link open todo', 'Creates a direct link to a command: whoever opens it sees what you see.\nWithout arguments it uses the last command you ran.\nExample: link open todo'],
          run(args, c) {
            const cmd = args.join(' ') || [...c.getHistory()].reverse().find(h => !h.startsWith('link')) || '';
            if (!cmd) return [dim(L('Előbb futtass egy parancsot, vagy: link open todo', 'Run a command first, or: link open todo'))];
            const name = cmd.trim().split(/\s+/)[0].toLowerCase();
            if (!c.isShareable(name)) return [err(L('Ez a parancs nem osztható meg linkkel.', "This command can't be shared as a link."))];
            const base = location.href.split(/[?#]/)[0];
            const url = `${base}?cmd=${encodeURIComponent(cmd)}&lang=${Lang.get()}`;
            return [`<span class="hl">${c.esc(cmd)}</span>`, `<a href="${c.esc(url)}">${c.esc(url)}</a>`, `<a href="#" class="cmd-link" data-copy="${c.esc(url)}">${L('Link másolása', 'Copy link')}</a>`];
          },
        },
      };
    },
  });
})();
