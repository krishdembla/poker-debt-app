const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'poker.db');
const db = new Database(dbPath);

// Get the first user (assuming this is the current user)
const user = db.prepare('SELECT id FROM users LIMIT 1').get();

if (!user) {
  console.log('No users found in database. Please create a user first.');
  process.exit(1);
}

console.log(`Associating games with user: ${user.id}`);

// Update all games that don't have an owner_id
const result = db.prepare('UPDATE games SET owner_id = ? WHERE owner_id IS NULL OR owner_id = \'\'').run(user.id);

console.log(`Updated ${result.changes} games to be owned by user ${user.id}`);

// Verify the fix
const games = db.prepare('SELECT id, owner_id FROM games').all();
console.log('\nCurrent game ownership:');
games.forEach(game => {
  console.log(`Game ${game.id}: owner_id = ${game.owner_id || 'NULL'}`);
});

db.close(); 