// Transform: validiert Rohzeilen und bringt sie in das Zielschema.
function transform(rows) {
  const out = [];
  for (const r of rows) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(r.realisiert || '');
    if (!r.nr || !r.gebiet) continue;
    const num = (v) => (v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
    out.push({
      nr: r.nr,
      gebiet: r.gebiet,
      realisiert: m ? `${m[1]}-${m[2]}-${m[3]}` : null,
      jahr: m ? Number(m[1]) : null,
      lat: num(r.lat),
      lon: num(r.lon),
    });
  }
  return out;
}

module.exports = { transform };
