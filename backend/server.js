const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { getStats } = require('./queries');

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  res.end(body);
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api/stats') {
        return send(res, 200, 'application/json', JSON.stringify(getStats(config.dbPath)));
      }
      if (url.pathname === '/vendor/chart.js') {
        return send(res, 200, types['.js'], fs.readFileSync(config.chartJsPath));
      }
      const rel = url.pathname === '/' ? 'index.html' : path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
      const file = path.join(config.frontendDir, rel);
      if (!file.startsWith(config.frontendDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        return send(res, 404, 'text/plain', 'Not found');
      }
      return send(res, 200, types[path.extname(file)] || 'application/octet-stream', fs.readFileSync(file));
    } catch (e) {
      return send(res, 500, 'text/plain', 'Serverfehler: ' + e.message);
    }
  });
}

if (require.main === module) {
  createServer().listen(config.port, () => console.log(`http://localhost:${config.port}`));
}

module.exports = { createServer };
