// ASCII-betűk (5 soros "standard" stílus). Visszaper-jeles sorok miatt sima stringeket használunk.
(() => {
  const GLYPHS = {
    M: [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|'],
    A: ['    _    ', '   / \\   ', '  / _ \\  ', ' / ___ \\ ', '/_/   \\_\\'],
    R: [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
    O: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    S: [' ____  ', '/ ___| ', '\\___ \\ ', ' ___) |', '|____/ '],
    N: [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|'],
    D: [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ '],
    ' ': ['   ', '   ', '   ', '   ', '   '],
  };

  // Ékezetek nélkül, nagybetűvel rajzol. Ismeretlen karaktert kihagy.
  window.asciiArt = text => {
    const chars = [...text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()].filter(c => GLYPHS[c]);
    return [0, 1, 2, 3, 4].map(r => chars.map(c => GLYPHS[c][r]).join('')).join('\n');
  };
})();
