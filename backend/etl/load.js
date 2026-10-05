const { openDb } = require('../db');

// Load: schreibt die transformierten Zeilen in die SQLite-DB (Full Refresh).
function load(rows, dbPath) {
  const db = openDb(dbPath);
  db.exec(`
    DROP TABLE IF EXISTS laufverkehr;
    CREATE TABLE laufverkehr (
      zeitstempel TEXT NOT NULL,
      datum TEXT NOT NULL,
      stunde INTEGER NOT NULL,
      wochentag INTEGER NOT NULL,
      monat INTEGER NOT NULL,
      standort TEXT NOT NULL,
      anzahl INTEGER NOT NULL,
      PRIMARY KEY (zeitstempel, standort)
    );
  `);
  const insert = db.prepare(
    'INSERT OR REPLACE INTO laufverkehr VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  db.exec('BEGIN');
  try {
    for (const r of rows) {
      insert.run(r.zeitstempel, r.datum, r.stunde, r.wochentag, r.monat, r.standort, r.anzahl);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  } finally {
    db.close();
  }
  return rows.length;
}

module.exports = { load };
