// A skills lista `share` értékeit frissíti a GitHub-fiók nyelvstatisztikájából.
// Futtatás: node tools/update-skills.js   (GITHUB_TOKEN megadása opcionális, csak a limitet emeli)
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data.js');
let src = fs.readFileSync(FILE, 'utf8');

const user = (src.match(/githubUser:\s*'([^']+)'/) || [])[1];
if (!user) throw new Error('data.js: nincs megadva a githubUser');

const headers = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }) };
async function gh(url) {
  const res = await fetch(url.startsWith('http') ? url : 'https://api.github.com' + url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

(async () => {
  const repos = (await gh(`/users/${user}/repos?per_page=100`)).filter(r => !r.fork);
  const bytes = {};
  for (const r of repos) {
    for (const [lang, n] of Object.entries(await gh(r.languages_url))) bytes[lang] = (bytes[lang] || 0) + n;
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  if (!total) throw new Error('Nincs mérhető kód a repókban');

  // Csak azokat a sorokat írjuk át, ahol a share nem null (pl. a Git nem nyelv)
  src = src.replace(/(\{ name: '([^']+)',[^\n]*?share: )(\d+)/g, (m, head, name, old) => {
    const next = Math.round(((bytes[name] || 0) / total) * 100);
    if (String(next) !== old) console.log(`${name}: ${old}% → ${next}%`);
    return head + next;
  });
  fs.writeFileSync(FILE, src);
  console.log(`Kész: ${repos.length} repó, ${total} bájt kód.`);
})().catch(e => { console.error(e.message); process.exit(1); });
