const path = require('node:path');

const root = path.join(__dirname, '..');

module.exports = {
  csvPath: process.env.CSV_PATH || path.join(root, 'data', 'begegnungszonen.csv'),
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'begegnungszonen.db'),
  frontendDir: path.join(root, 'frontend'),
  chartJsPath: path.join(root, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'),
  port: Number(process.env.PORT) || 3000,
};
