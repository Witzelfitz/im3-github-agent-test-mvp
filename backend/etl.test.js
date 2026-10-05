const test = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');
const { transform } = require('./etl/transform');
const { runEtl } = require('./etl/run');
const { getStats } = require('./queries');

test('transform verwirft ungültige Zeilen und ergänzt Jahr', () => {
  const out = transform([
    { nr: '1.2', gebiet: 'Mittlere Altstadt', realisiert: '2017-06-30', lat: '47.4', lon: '9.37' },
    { nr: '', gebiet: 'X', realisiert: '2017-06-30' },
    { nr: '9', gebiet: 'Y', realisiert: '', lat: '', lon: '' },
  ]);
  assert.strictEqual(out.length, 2);
  assert.strictEqual(out[0].jahr, 2017);
  assert.strictEqual(out[1].jahr, null);
  assert.strictEqual(out[1].lat, null);
});

test('ETL lädt CSV in SQLite und Stats sind abfragbar', () => {
  const db = path.join(os.tmpdir(), `bz-${process.pid}.db`);
  const r = runEtl(undefined, db);
  assert.ok(r.loaded > 0);
  const s = getStats(db);
  assert.strictEqual(s.total, r.loaded);
  assert.strictEqual(s.cumulative.at(-1).anzahl, s.perYear.reduce((a, b) => a + b.anzahl, 0));
});
