// Élő profilpanel: ugyanabból az adatból épül, mint a terminál, reagál a parancsokra, és követi a nyelvet.
window.createPanel = function createPanel({ exec }) {
  const el = document.getElementById('panel');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let selected = null;
  let data;

  function render() {
    data = Lang.content();
    const c = data.contact;
    const gh = c.github || (data.githubUser ? `https://github.com/${data.githubUser}` : null);
    const initials = data.name.split(/\s+/).map(w => w[0]).join('');
    const avatar = data.photo
      ? `<img src="${esc(data.photo)}" alt="${esc(data.photoAlt || data.name)}" width="240" height="264">`
      : `<span aria-hidden="true">${esc(initials)}</span>`;
    const links = [
      gh && `<a href="${esc(gh)}" target="_blank" rel="noopener">GitHub</a>`,
      c.linkedin && `<a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,
      `<a href="mailto:${esc(c.email)}">E-mail</a>`,
    ].filter(Boolean).join('');

    el.innerHTML = `
      <section class="card profile" id="sec-profile">
        <div class="avatar${data.photo ? ' has-photo' : ''}">${avatar}</div>
        <h1 class="name">${esc(data.name)}</h1>
        <p class="role">${esc(data.role)}</p>
        <p class="status"><i></i>${esc(data.status)}</p>
        <div class="links">${links}</div>
      </section>

      <section class="card" id="sec-about">
        <h3>${L('Rólam', 'About')}</h3>
        ${data.about.map(p => `<p>${esc(p)}</p>`).join('')}
      </section>

      <section class="card" id="sec-skills">
        <h3>${L('Készségek', 'Skills')}</h3>
        ${data.skills.map(s => `<div class="sk"><span>${esc(s.name)}</span><em class="lv">${esc(s.level)}</em><b>${s.share ? s.share + '%' : ''}</b></div>`).join('')}
        <p class="hint">${L('A százalék a GitHub-repóim kódjában mért arány.', 'Percentages show the share of my GitHub code.')}</p>
      </section>

      <section class="card" id="sec-projects">
        <h3>${L('Projektek', 'Projects')}</h3>
        <div class="projs">
          ${data.projects.map(p => `
            <button type="button" class="proj${p.id === selected ? ' active' : ''}" data-id="${esc(p.id)}">
              <span class="t">${esc(p.title)}${p.demo ? ` <em class="live">▶ live</em>` : ''}</span>
              <small>${esc(p.stack)}</small>
              <span class="d">${esc(p.desc)}</span>
            </button>`).join('')}
        </div>
      </section>

      <section class="card" id="sec-contact">
        <h3>${L('Kapcsolat', 'Contact')}</h3>
        <a class="mail" href="mailto:${esc(c.email)}">${esc(c.email)}</a>
        <p class="hint">${L('Van egy ötleted? Írj bátran!', 'Got an idea? Drop me a line!')}</p>
      </section>`;
    el.querySelector('#sec-skills').classList.add('play');
  }

  const section = id => el.querySelector('#sec-' + id);

  function flash(id) {
    const s = section(id);
    if (!s) return;
    s.classList.remove('flash');
    void s.offsetWidth; // az animáció újraindításához
    s.classList.add('flash');
    if (el.offsetParent !== null) s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function replaySkills() {
    const s = section('skills');
    s.classList.remove('play');
    void s.offsetWidth;
    s.classList.add('play');
  }

  function select(id) {
    selected = id;
    el.querySelectorAll('.proj').forEach(p => p.classList.toggle('active', p.dataset.id === id));
  }

  const idFromArg = arg => {
    const k = (arg || '').toLowerCase().replace(/\.md$/, '').split('/').pop();
    const i = data.projects.findIndex((p, n) => p.id === k || String(n + 1) === k);
    return i >= 0 ? data.projects[i].id : null;
  };

  // A terminálban futtatott parancs hatása a panelre
  function sync(name, args) {
    if (name === 'about') flash('about');
    else if (name === 'skills') { flash('skills'); replaySkills(); }
    else if (name === 'projects') flash('projects');
    else if (name === 'contact' || name === 'send') flash('contact');
    else if (name === 'open' || name === 'run') { const id = idFromArg(args[0]); if (id) { select(id); flash('projects'); } }
    else if (name === 'cat' && args[0]) {
      const f = args[0].split('/').pop();
      if (f === 'about.md') flash('about');
      else if (f === 'skills.txt') { flash('skills'); replaySkills(); }
      else if (f === 'contact.txt') flash('contact');
      else { const id = idFromArg(f); if (id) { select(id); flash('projects'); } }
    }
  }

  el.addEventListener('click', e => {
    const card = e.target.closest('.proj');
    if (card) exec('open ' + card.dataset.id);
  });

  render();
  return { sync, render };
};
