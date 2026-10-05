const fs = require('node:fs');

// Extract: liest die CSV-Kopie und liefert Rohzeilen als Objekte.
function extract(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const [header, ...lines] = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const cols = header.split(',').map((c) => c.trim());
  return lines.map((line) => {
    const values = line.split(',');
    return Object.fromEntries(cols.map((c, i) => [c, (values[i] ?? '').trim()]));
  });
}

module.exports = { extract };
