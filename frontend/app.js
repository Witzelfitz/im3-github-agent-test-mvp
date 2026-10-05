const COLOR = '#0b6e4f';
const fmt = (n) => Number(n).toLocaleString('de-CH');

function chart(id, labels, data, label, type = 'bar') {
  new Chart(document.getElementById(id), {
    type,
    data: { labels, datasets: [{ label, data, backgroundColor: COLOR, borderColor: COLOR }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
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

async function main() {
  const s = await loadStats();
  const year = (d) => d.slice(0, 4);

  document.getElementById('kpi').textContent = s.oldest
    ? `${fmt(s.total)} Begegnungszonen. Die älteste: ${s.oldest.gebiet} (${year(s.oldest.realisiert)}).`
    : `${fmt(s.total)} Begegnungszonen.`;

  const peak = s.perYear.reduce((a, b) => (b.anzahl > a.anzahl ? b : a), { jahr: '-', anzahl: 0 });
  document.getElementById('text-year').textContent =
    `Das Jahr mit den meisten neuen Zonen: ${peak.jahr} (${peak.anzahl}).`;
  chart('chart-year', s.perYear.map((r) => r.jahr), s.perYear.map((r) => r.anzahl), 'Neue Zonen');
  chart('chart-cumulative', s.cumulative.map((r) => r.jahr), s.cumulative.map((r) => r.anzahl), 'Total', 'line');
  chart('chart-decade', s.perDecade.map((r) => `${r.dekade}er`), s.perDecade.map((r) => r.anzahl), 'Zonen');

  const ul = document.getElementById('latest');
  for (const r of s.latest) {
    const li = document.createElement('li');
    li.textContent = `${r.gebiet} (Nr. ${r.nr}) – ${new Date(r.realisiert).toLocaleDateString('de-CH')}`;
    ul.appendChild(li);
  }
}

main().catch((e) => {
  document.querySelector('main').textContent = 'Daten konnten nicht geladen werden: ' + e.message;
});
