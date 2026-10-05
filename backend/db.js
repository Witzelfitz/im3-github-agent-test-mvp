const { DatabaseSync } = require('node:sqlite');

function openDb(dbPath) {
  return new DatabaseSync(dbPath);
}

module.exports = { openDb };
