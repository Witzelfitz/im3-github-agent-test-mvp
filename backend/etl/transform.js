// Transform: validiert Rohzeilen und bringt sie in das Zielschema.
function transform(rows) {
  const out = [];
  for (const r of rows) {
    const date = new Date(r.zeitstempel.replace(' ', 'T') + 'Z');
    const anzahl = Number.parseInt(r.anzahl, 10);
    if (Number.isNaN(date.getTime()) || !r.standort || !Number.isFinite(anzahl) || anzahl < 0) {
      continue;
    }
    const iso = date.toISOString();
    out.push({
      zeitstempel: iso.slice(0, 19).replace('T', ' '),
      datum: iso.slice(0, 10),
      stunde: date.getUTCHours(),
      wochentag: (date.getUTCDay() + 6) % 7, // 0 = Montag
      monat: date.getUTCMonth() + 1,
      standort: r.standort,
      anzahl,
    });
  }
  return out;
}

module.exports = { transform };
