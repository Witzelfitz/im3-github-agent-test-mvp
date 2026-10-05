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
    const dated = all(
      'SELECT nr, gebiet, realisiert FROM begegnungszonen WHERE realisiert IS NOT NULL ORDER BY realisiert ASC'
    );
    const DAY = 86400000;
    const gaps = dated.slice(1).map((r, i) => ({
      von: dated[i].gebiet,
      bis: r.gebiet,
      tage: Math.round((Date.parse(r.realisiert) - Date.parse(dated[i].realisiert)) / DAY),
    }));
    const longestGap = gaps.reduce((a, b) => (b.tage > a.tage ? b : a), { tage: 0 });
    const span = dated.length
      ? (Date.parse(dated[dated.length - 1].realisiert) - Date.parse(dated[0].realisiert)) / DAY / 365.25
      : 0;
    const sameDay = all(
      'SELECT realisiert, COUNT(*) AS n FROM begegnungszonen WHERE realisiert IS NOT NULL GROUP BY realisiert HAVING n > 1'
    );
    return {
      timeline: dated,
      longestGap: dated.length > 1 ? longestGap : null,
      spanYears: Math.round(span * 10) / 10,
      perYearAvg: span ? Math.round((dated.length / span) * 100) / 100 : null,
      sameDay,
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
