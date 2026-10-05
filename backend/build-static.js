const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { runEtl } = require('./etl/run');
const { getStats } = require('./queries');

// Statischer Export für GitHub Pages: ETL -> SQLite -> stats.json in dist/
const dist = path.join(__dirname, '..', 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'vendor'), { recursive: true });
runEtl();
for (const f of fs.readdirSync(config.frontendDir)) {
  fs.copyFileSync(path.join(config.frontendDir, f), path.join(dist, f));
}
fs.copyFileSync(config.chartJsPath, path.join(dist, 'vendor', 'chart.js'));
fs.writeFileSync(path.join(dist, 'stats.json'), JSON.stringify(getStats(config.dbPath)));
console.log('Statischer Build in dist/');
