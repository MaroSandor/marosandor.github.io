// Opcionális modulok: játékok és titkos parancsok. Mindegyik (ctx) => { parancs: definíció }.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const err = m => `<span class="err">${m}</span>`;
  const dim = m => `<span class="dim">${m}</span>`;

  window.TermExtras = {
    games(ctx) {
      return {
        games: {
          desc: ['játékmenü', 'game menu'],
          run: () => [
            `${L('Játékok', 'Games')}:`,
            `  ${ctx.cmdLink('guess')}   ${dim(L('számkitalálós (1–50)', 'number guessing (1–50)'))}`,
            `  ${ctx.cmdLink('rps')}     ${dim(L('kő-papír-olló', 'rock-paper-scissors'))}`,
          ],
        },
        guess: {
          desc: ['számkitalálós játék (1–50)', 'number guessing game (1–50)'],
          man: ['Gondolok egy számra 1 és 50 között.\nA tippedre azt mondom, nagyobb vagy kisebb.\nKilépés: q', "I'm thinking of a number from 1 to 50.\nI'll tell you if it's higher or lower.\nQuit: q"],
          run(args, c) {
            const secret = 1 + Math.floor(Math.random() * 50);
            let tries = 0;
            c.print(`${L('Gondoltam egy számra 1 és 50 között. Tippelj!', "I'm thinking of a number from 1 to 50. Guess!")} ${dim(L('(kilépés: q)', '(quit: q)'))}`);
            c.setMode({
              prompt: L('tipp>', 'guess>'),
              onInput(v) {
                if (v.toLowerCase() === 'q') { c.print(dim(L(`Kilépve. A szám a(z) ${secret} volt.`, `Quit. The number was ${secret}.`))); return false; }
                const n = Number(v);
                if (!v || !Number.isInteger(n) || n < 1 || n > 50) { c.print(err(L('Egész számot adj meg 1 és 50 között.', 'Enter a whole number from 1 to 50.'))); return true; }
                tries++;
                if (n === secret) { c.print(L(`Eltaláltad! ${tries} tippből. 🎉`, `You got it in ${tries} tries! 🎉`)); return false; }
                c.print(n < secret ? L('Nagyobb.', 'Higher.') : L('Kisebb.', 'Lower.'));
                return true;
              },
            });
          },
        },
        rps: {
          desc: ['kő-papír-olló', 'rock-paper-scissors'],
          man: ['Írd be: ko, papir vagy ollo.\nKilépés: q', 'Type: rock, paper or scissors.\nQuit: q'],
          run(args, c) {
            const aliases = { ko: 'ko', rock: 'ko', papir: 'papir', paper: 'papir', ollo: 'ollo', scissors: 'ollo' };
            const names = { ko: L('kő', 'rock'), papir: L('papír', 'paper'), ollo: L('olló', 'scissors') };
            const beats = { ko: 'ollo', papir: 'ko', ollo: 'papir' };
            let win = 0, lose = 0;
            c.print(`${L('Kő-papír-olló! Írd be', 'Rock-paper-scissors! Type')}: <span class="hl">${L('ko, papir vagy ollo', 'rock, paper or scissors')}</span> ${dim(L('(kilépés: q)', '(quit: q)'))}`);
            c.setMode({
              prompt: 'rps>',
              onInput(v) {
                const raw = norm(v.trim());
                if (raw === 'q') { c.print(dim(`${L('Állás', 'Score')}: ${win}–${lose}.`)); return false; }
                const me = aliases[raw];
                if (!me) { c.print(err(L('ko, papir vagy ollo', 'rock, paper or scissors'))); return true; }
                const pc = Object.keys(beats)[Math.floor(Math.random() * 3)];
                let res = L('Döntetlen.', 'Draw.');
                if (beats[me] === pc) { win++; res = L('Nyertél!', 'You win!'); }
                else if (beats[pc] === me) { lose++; res = L('Vesztettél.', 'You lose.'); }
                c.print(`${L('Te', 'You')}: ${names[me]} · ${L('Gép', 'CPU')}: ${names[pc]} → ${res}`);
                return true;
              },
            });
          },
        },
      };
    },

    secrets(ctx) {
      return {
        matrix: {
          hidden: true,
          desc: ['zuhogó karakterek', 'falling characters'],
          run() {
            if (reduceMotion) return [dim(L('(az animáció ki van kapcsolva a rendszerbeállításod miatt)', '(animation disabled by your system settings)'))];
            const c = document.createElement('canvas');
            c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:999;background:#000;cursor:pointer';
            c.width = innerWidth; c.height = innerHeight;
            document.body.appendChild(c);
            const g = c.getContext('2d');
            const drops = Array.from({ length: Math.floor(c.width / 16) }, () => Math.random() * -50);
            let raf, timer;
            const stop = () => { cancelAnimationFrame(raf); clearTimeout(timer); c.remove(); document.removeEventListener('keydown', stop); };
            (function draw() {
              g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, c.width, c.height);
              g.fillStyle = '#4ade80'; g.font = '16px monospace';
              drops.forEach((y, i) => {
                g.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), i * 16, y * 16);
                drops[i] = y * 16 > c.height && Math.random() > 0.975 ? 0 : y + 1;
              });
              raf = requestAnimationFrame(draw);
            })();
            timer = setTimeout(stop, 6000);
            c.addEventListener('click', stop);
            document.addEventListener('keydown', stop, { once: true });
            return [dim(L('Kilépés: kattintás vagy billentyű.', 'Exit: click or press a key.'))];
          },
        },
        coffee: {
          hidden: true,
          desc: ['kávé a fejlesztőnek', 'coffee for the developer'],
          run: () => [...['    ( (', '     ) )', '  ........', '  |      |]', '  \\      /', "   `----'"].map(ctx.esc), L('Egy kávé, és már megy is a kód. ☕', 'One coffee and the code writes itself. ☕')],
        },
        rm: {
          hidden: true,
          desc: ['fájlok törlése', 'remove files'],
          usage: 'rm <file>',
          run(args) {
            if (args.join(' ').includes('-rf')) return [err(L('Törlés… törlés… törlés…', 'Deleting… deleting… deleting…')), L('Csak vicceltem. Minden rendben van. 😄', 'Just kidding. Everything is fine. 😄')];
            return [err(L('rm: ebben a portfolióban semmit nem lehet törölni.', 'rm: nothing can be deleted in this portfolio.'))];
          },
        },
      };
    },
  };
})();
