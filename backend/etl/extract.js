const fs = require('node:fs');

function parseLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

// Extract: liest die CSV-Kopie und liefert Rohzeilen als Objekte.
function extract(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const [header, ...lines] = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const cols = parseLine(header).map((c) => c.trim());
  return lines.map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(cols.map((c, i) => [c, (values[i] ?? '').trim()]));
  });
}

module.exports = { extract };
