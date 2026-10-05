const { openDb } = require('./db');

// Alle Auswertungen laufen auf der lokalen SQLite-DB.
function getStats(dbPath) {
  const db = openDb(dbPath);
  try {
    const all = (sql) => db.prepare(sql).all();
    const perYear = all(
      'SELECT jahr, COUNT(*) AS anzahl FROM begegnungszonen WHERE jahr IS NOT NULL GROUP BY jahr ORDER BY jahr'
    );
    let sum = 0;
    const cumulative = perYear.map((r) => ({ jahr: r.jahr, anzahl: (sum += r.anzahl) }));
    return {
      total: all('SELECT COUNT(*) AS n FROM begegnungszonen')[0].n,
      perYear,
      cumulative,
      perDecade: all(
        'SELECT (jahr / 10) * 10 AS dekade, COUNT(*) AS anzahl FROM begegnungszonen WHERE jahr IS NOT NULL GROUP BY dekade ORDER BY dekade'
      ),
      latest: all(
        'SELECT nr, gebiet, realisiert FROM begegnungszonen WHERE realisiert IS NOT NULL ORDER BY realisiert DESC LIMIT 5'
      ),
      oldest: all(
        'SELECT nr, gebiet, realisiert FROM begegnungszonen WHERE realisiert IS NOT NULL ORDER BY realisiert ASC LIMIT 1'
      )[0] || null,
    };
  } finally {
    db.close();
  }
}

module.exports = { getStats };
