const fs = require('node:fs');
const config = require('../config');

const BASE = 'https://stadt-stgallen.opendatasoft.com/api/explore/v2.1/catalog/datasets/begegnungszonen/records';
const quote = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// Lädt alle Records von der Opendatasoft-API und aktualisiert die CSV-Kopie in data/.
async function fetchDataset(csvPath = config.csvPath) {
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${BASE}?lang=de&limit=100&offset=${offset}`);
    if (!res.ok) throw new Error(`API-Fehler ${res.status}`);
    const { results, total_count: total } = await res.json();
    rows.push(...results);
    if (!results.length || rows.length >= total) break;
  }
  const lines = ['nr,gebiet,realisiert,lat,lon'].concat(
    rows.map((r) =>
      [r.nr, r.gebiet, r.realisiert, r.geo_point_2d?.lat, r.geo_point_2d?.lon]
        .map((v) => quote(v == null ? '' : String(v)))
        .join(',')
    )
  );
  fs.writeFileSync(csvPath, lines.join('\n') + '\n');
  return rows.length;
}

if (require.main === module) {
  fetchDataset()
    .then((n) => console.log(`${n} Records nach ${config.csvPath} geschrieben`))
    .catch((e) => { console.error(e.message); process.exit(1); });
}

module.exports = { fetchDataset };
