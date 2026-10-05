const { openDb } = require('./db');

// Alle Auswertungen laufen auf der lokalen SQLite-DB.
function getStats(dbPath) {
  const db = openDb(dbPath);
  try {
    const all = (sql) => db.prepare(sql).all();
    return {
      total: all('SELECT SUM(anzahl) AS total FROM laufverkehr')[0].total,
      perMonth: all(
        'SELECT monat, SUM(anzahl) AS anzahl FROM laufverkehr GROUP BY monat ORDER BY monat'
      ),
      perHour: all(
        'SELECT stunde, ROUND(AVG(anzahl)) AS anzahl FROM laufverkehr GROUP BY stunde ORDER BY stunde'
      ),
      perWeekday: all(
        'SELECT wochentag, ROUND(AVG(anzahl)) AS anzahl FROM laufverkehr GROUP BY wochentag ORDER BY wochentag'
      ),
      perLocation: all(
        'SELECT standort, SUM(anzahl) AS anzahl FROM laufverkehr GROUP BY standort ORDER BY anzahl DESC'
      ),
      peakDay: all(
        'SELECT datum, SUM(anzahl) AS anzahl FROM laufverkehr GROUP BY datum ORDER BY anzahl DESC LIMIT 1'
      )[0],
    };
  } finally {
    db.close();
  }
}

module.exports = { getStats };
