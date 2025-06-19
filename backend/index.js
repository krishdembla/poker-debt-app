const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const dbModule = require('./db');
const { createGame, getGame, saveGame, listGames } = dbModule;
const { calculateSettlement } = require('./utils/settlement');
const { register, login, verifyToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors()); //enable CORS for all routes
app.use(express.json());

// public routes for auth
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const token = await register(username, password);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const token = await login(username, password);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Auth middleware for below routes
app.use((req, res, next) => {
  const authHeader = req.header('authorization');
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const [, token] = authHeader.split(' ');
  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, username }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// games now persisted in SQLite via db.js



//adding route to creae a new game
app.post('/api/game', (req, res) => {
  const gameId = uuidv4(); //generate id
  createGame(gameId, req.user.id);
  res.status(201).json({ gameId }); //respond with gameId to frontend
});

// list existing games for this user
app.get('/api/games', (req, res) => {
  const games = listGames(req.user.id);
  res.json({ games });
});

app.delete('/api/game/:id', (req, res) => {
  const { id } = req.params;
  const game = getGame(id, req.user.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  db.prepare('DELETE FROM games WHERE id = ?').run(id);
  res.json({ message: 'Deleted' });
});



//adding players and buy ins
app.post('/api/game/:id/player', (req,res) => {
  const {id} = req.params; //getting game id
  const {name, buyIn} = req.body;

  //validate input
  const game = getGame(id, req.user.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  //validate player name and buyIn
  if (!name || !buyIn || isNaN(buyIn) || buyIn <= 0) {
    return res.status(400).json({ error: 'Invalid player or buy-in' });
  }
  // game fetched above
  
  //if player does not exist, create a new player, else add buyIn to existing player
  if (!game.players[name]) {
    game.players[name] = { buyIns: [buyIn], cashOut: null};
  } else{
    game.players[name].buyIns.push(buyIn);
  }

  saveGame(id, game);
  res.status(200).json({ message: `Buy-in added for ${name}`, player: game.players[name] });
})




//adding cash out for players
app.post('/api/game/:id/cashout', (req, res) => {
  const {id} = req.params;
  const {name, cashOut} = req.body;

  //validate input
  const game = getGame(id, req.user.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  if (!name || cashOut == null || isNaN(cashOut)) {
    return res.status(400).json({ error: 'Invalid player or cash out amount' });
  }

  const player = game.players[name];
  if(!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  player.cashOut = cashOut; //set cash out amount for player
  saveGame(id, game);
  res.status(200).json({ message: `Cash out recorded for ${name}`, player });
});

// Get game summary (net for each player)
app.get('/api/game/:id/summary', (req, res) => {
  const { id } = req.params;
  const game = getGame(id, req.user.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const summary = Object.entries(game.players).map(([name, player]) => {
    const totalBuyIn = player.buyIns.reduce((acc, val) => acc + val, 0);
    const cashOut = player.cashOut ?? 0;
    const net = cashOut - totalBuyIn;
    return { name, totalBuyIn, cashOut, net };
  });

  res.json({ summary });
});

// Direct settlement without game context
app.post('/api/settle', (req, res) => {
  const nets = req.body;
  if (!nets || typeof nets !== 'object') {
    return res.status(400).json({ error: 'Request body must be an object of { name: net } pairs' });
  }
  // Ensure nets sum to zero
  const total = Object.values(nets).reduce((acc, n) => acc + n, 0);
  if (Math.abs(total) > 1e-6) {
    return res.status(400).json({ error: 'Net balances must sum to zero' });
  }
  const transactions = calculateSettlement(nets);
  res.json({ transactions });
});

// Calculate optimal settlement transactions
app.get('/api/game/:id/settle', (req, res) => {
  const { id } = req.params;
  const game = getGame(id, req.user.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }


    // Ensure all players have cashed out
  const missingCashOut = Object.entries(game.players)
    .filter(([_, p]) => p.cashOut == null)
    .map(([name]) => name);
  if (missingCashOut.length > 0) {
    return res.status(400).json({ error: `Players missing cash-out: ${missingCashOut.join(', ')}` });
  }

  const netMap = {};
  for (const [name, player] of Object.entries(game.players)) {
    const totalBuyIn = player.buyIns.reduce((acc, val) => acc + val, 0);
    const net = player.cashOut - totalBuyIn;
    netMap[name] = net;
  }

  const transactions = calculateSettlement(netMap);
  res.json({ transactions });
});




app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };