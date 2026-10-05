const test = require('node:test');
const assert = require('node:assert');
const { transform } = require('./etl/transform');
const { runEtl } = require('./etl/run');
const { getStats } = require('./queries');
const os = require('node:os');
const path = require('node:path');

test('transform verwirft ungültige Zeilen und ergänzt Felder', () => {
  const out = transform([
    { zeitstempel: '2023-01-02 13:00:00', standort: 'A', anzahl: '5' },
    { zeitstempel: 'x', standort: 'A', anzahl: '5' },
    { zeitstempel: '2023-01-02 13:00:00', standort: 'A', anzahl: '-1' },
  ]);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].wochentag, 0);
  assert.strictEqual(out[0].stunde, 13);
});

test('ETL lädt CSV in SQLite und Stats sind abfragbar', () => {
  const db = path.join(os.tmpdir(), `lv-${process.pid}.db`);
  const r = runEtl(undefined, db);
  assert.ok(r.loaded > 0);
  const s = getStats(db);
  assert.strictEqual(s.perHour.length, 24);
  assert.strictEqual(s.perMonth.length, 12);
});
