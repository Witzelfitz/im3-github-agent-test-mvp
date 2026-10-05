const config = require('../config');
const { extract } = require('./extract');
const { transform } = require('./transform');
const { load } = require('./load');

function runEtl(csvPath = config.csvPath, dbPath = config.dbPath) {
  const raw = extract(csvPath);
  const clean = transform(raw);
  const n = load(clean, dbPath);
  return { extracted: raw.length, loaded: n };
}

if (require.main === module) {
  const r = runEtl();
  console.log(`ETL fertig: ${r.extracted} gelesen, ${r.loaded} geladen -> ${config.dbPath}`);
}

module.exports = { runEtl };
