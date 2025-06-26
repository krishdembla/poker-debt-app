const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'poker.db');
const firstTime = !fs.existsSync(dbPath);
const db = new Database(dbPath);

// ensure users table exists
 db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`).run();

if (firstTime) {

  db.prepare(`CREATE TABLE games (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`).run();
} else {
  const cols = db.prepare(`PRAGMA table_info(games)`).all().map(c => c.name);
  if (!cols.includes('owner_id')) {
    db.prepare(`ALTER TABLE games ADD COLUMN owner_id TEXT`).run();
  }
}

function createUser(username, password_hash) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, password_hash);
  return { id, username };
}

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function createGame(id, owner_id, metadata = {}) {
  const gameObj = { players: {}, metadata };
  db.prepare('INSERT INTO games (id, owner_id, data) VALUES (?, ?, ?)').run(id, owner_id, JSON.stringify(gameObj));
  return gameObj;
}

function getGame(id, owner_id) {
  const row = db.prepare('SELECT data, owner_id FROM games WHERE id = ?').get(id);
  if (!row) return null;
  if (owner_id && row.owner_id !== owner_id) return null;
  return JSON.parse(row.data);
}

function saveGame(id, gameObj) {
  db.prepare('UPDATE games SET data = ? WHERE id = ?').run(JSON.stringify(gameObj), id);
}

function deleteGame(id) {
  db.prepare('DELETE FROM games WHERE id = ?').run(id);
}

function listGames(owner_id) {
  return db.prepare('SELECT id, data FROM games WHERE owner_id = ?').all(owner_id).map(r => {
    const meta = JSON.parse(r.data).metadata || {};
    return { id: r.id, title: meta.title || r.id, date: meta.date || null };
  });
}

function renameGame(id, newTitle) {
  const row = db.prepare('SELECT data FROM games WHERE id = ?').get(id);
  if (!row) return false;
  const gameObj = JSON.parse(row.data);
  gameObj.metadata = { ...(gameObj.metadata || {}), title: newTitle };
  db.prepare('UPDATE games SET data = ? WHERE id = ?').run(JSON.stringify(gameObj), id);
  return true;
}

module.exports = { createUser, getUserByUsername, createGame, getGame, saveGame, listGames, deleteGame, renameGame };
