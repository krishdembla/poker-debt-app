const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data.json');

/**
 * Load games object from disk. Returns an empty object if file missing or invalid.
 */
function loadGames() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[storage] Failed to load data.json, starting fresh', err);
    return {};
  }
}

/**
 * Persist games object to disk atomically.
 */
function saveGames(gamesObj) {
  try {
    const tmpPath = DATA_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(gamesObj, null, 2));
    fs.renameSync(tmpPath, DATA_PATH);
  } catch (err) {
    console.error('[storage] Failed to save data.json', err);
  }
}

module.exports = { loadGames, saveGames };
