const { openDb } = require('../db');

// Load: schreibt die transformierten Zeilen in die SQLite-DB (Full Refresh).
function load(rows, dbPath) {
  const db = openDb(dbPath);
  db.exec(`
    DROP TABLE IF EXISTS begegnungszonen;
    CREATE TABLE begegnungszonen (
      nr TEXT PRIMARY KEY,
      gebiet TEXT NOT NULL,
      realisiert TEXT,
      jahr INTEGER,
      lat REAL,
      lon REAL
    );
  `);
  const insert = db.prepare('INSERT OR REPLACE INTO begegnungszonen VALUES (?, ?, ?, ?, ?, ?)');
  db.exec('BEGIN');
  try {
    for (const r of rows) insert.run(r.nr, r.gebiet, r.realisiert, r.jahr, r.lat, r.lon);
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
