const INK = '#111';
const fmt = (n) => Number(n).toLocaleString('de-CH');
const fmtDate = (d) => new Date(d).toLocaleDateString('de-CH');
const year = (d) => d.slice(0, 4);

function chart(id, labels, data, label, color, type = 'bar') {
  Chart.defaults.font.family = '"Space Grotesk", Arial, sans-serif';
  Chart.defaults.font.weight = '700';
  Chart.defaults.color = INK;
  new Chart(document.getElementById(id), {
    type,
    data: { labels, datasets: [{ label, data, backgroundColor: color, borderColor: INK, borderWidth: 3, fill: type === 'line', stepped: type === 'line', pointRadius: 5 }] },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: INK }, border: { color: INK, width: 3 } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: INK }, border: { color: INK, width: 3 } },
      },
    },
  });
}

// Lokal: Backend-API; auf GitHub Pages: statisches stats.json
async function loadStats() {
  const res = await fetch('api/stats');
  if (res.ok) return res.json();
  const fallback = await fetch('stats.json');
  if (!fallback.ok) throw new Error('keine Daten verfügbar');
  return fallback.json();
}

const set = (id, html) => { document.getElementById(id).innerHTML = html; };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function main() {
  const s = await loadStats();
  const last = s.timeline[s.timeline.length - 1];
  const daysSince = last ? Math.floor((Date.now() - Date.parse(last.realisiert)) / 86400000) : null;

  set('stats',
    `<div class="stat"><b>${fmt(s.total)}</b><span>Begegnungszonen</span></div>` +
    `<div class="stat"><b>${s.spanYears}</b><span>Jahre zwischen erster und jüngster</span></div>` +
    `<div class="stat"><b>${s.perYearAvg ?? '–'}</b><span>neue Zonen pro Jahr (Ø)</span></div>`);

  set('kpi', s.oldest
    ? `Die älteste: ${esc(s.oldest.gebiet)} (${year(s.oldest.realisiert)}). Die jüngste: ${esc(last.gebiet)} (${year(last.realisiert)}).`
    : `${fmt(s.total)} Begegnungszonen.`);

  const peak = s.perYear.reduce((a, b) => (b.anzahl > a.anzahl ? b : a), { jahr: '-', anzahl: 0 });
  document.getElementById('text-year').textContent =
    `Das Jahr mit den meisten neuen Zonen: ${peak.jahr} (${peak.anzahl}). Dazwischen: oft jahrelang nichts.`;
  chart('chart-year', s.perYear.map((r) => r.jahr), s.perYear.map((r) => r.anzahl), 'Neue Zonen', '#ff6bb5');
  chart('chart-cumulative', s.cumulative.map((r) => r.jahr), s.cumulative.map((r) => r.anzahl), 'Total', '#ffe14d', 'line');
  chart('chart-decade', s.perDecade.map((r) => `${r.dekade}er`), s.perDecade.map((r) => r.anzahl), 'Zonen', '#4dc3ff');

  set('fact-same', s.sameDay.length
    ? `Auffällig: ${s.sameDay.map((d) => `${d.n} Zonen wurden am selben Tag (${fmtDate(d.realisiert)}) realisiert`).join('; ')} – offenbar Sammelumsetzungen.`
    : 'Keine zwei Zonen wurden am selben Tag eröffnet.');
  set('fact-gap', s.longestGap
    ? `Längste Pause: ${fmt(s.longestGap.tage)} Tage (≈ ${(s.longestGap.tage / 365.25).toFixed(1)} Jahre) zwischen «${esc(s.longestGap.von)}» und «${esc(s.longestGap.bis)}».`
    : '');

  set('timeline', s.timeline.map((r) =>
    `<li><time>${fmtDate(r.realisiert)}</time>${esc(r.gebiet)} <em>Nr. ${esc(r.nr)}</em></li>`).join(''));
  set('fact-now', daysSince != null
    ? `Seit der jüngsten Zone (${esc(last.gebiet)}) sind ${fmt(daysSince)} Tage vergangen.`
    : '');
}

main().catch((e) => {
  document.querySelector('main').textContent = 'Daten konnten nicht geladen werden: ' + e.message;
});
