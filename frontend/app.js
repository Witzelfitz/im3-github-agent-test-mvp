const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const COLOR = '#0b6e4f';
const fmt = (n) => Number(n).toLocaleString('de-CH');

function bar(id, labels, data, label, type = 'bar') {
  new Chart(document.getElementById(id), {
    type,
    data: { labels, datasets: [{ label, data, backgroundColor: COLOR, borderColor: COLOR }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
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

  document.getElementById('kpi').textContent =
    `${fmt(s.total)} gezählte Passanten, Spitzentag: ${s.peakDay.datum} (${fmt(s.peakDay.anzahl)}).`;

  bar('chart-location', s.perLocation.map((r) => r.standort), s.perLocation.map((r) => r.anzahl), 'Passanten');

  const peakHour = s.perHour.reduce((a, b) => (b.anzahl > a.anzahl ? b : a));
  document.getElementById('text-hour').textContent =
    `Durchschnittlich pro Stunde und Zählstelle – am meisten Betrieb herrscht um ${peakHour.stunde} Uhr.`;
  bar('chart-hour', s.perHour.map((r) => `${r.stunde}h`), s.perHour.map((r) => r.anzahl), 'Ø Passanten', 'line');

  bar('chart-weekday', s.perWeekday.map((r) => WEEKDAYS[r.wochentag]), s.perWeekday.map((r) => r.anzahl), 'Ø Passanten');

  const peakMonth = s.perMonth.reduce((a, b) => (b.anzahl > a.anzahl ? b : a));
  document.getElementById('text-month').textContent =
    `Der stärkste Monat ist ${MONTHS[peakMonth.monat - 1]} mit ${fmt(peakMonth.anzahl)} Passanten.`;
  bar('chart-month', s.perMonth.map((r) => MONTHS[r.monat - 1]), s.perMonth.map((r) => r.anzahl), 'Passanten');
}

main().catch((e) => {
  document.querySelector('main').textContent = 'Daten konnten nicht geladen werden: ' + e.message;
});
