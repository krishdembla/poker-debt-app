const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const dbModule = require('./db');
const { createGame, getGame, saveGame, listGames, deleteGame, renameGame } = dbModule;
const { calculateSettlement } = require('./utils/settlement');
const { validateBuyIn, validateCashOut, validateAuth, validateCreateGame, validateNameBody } = require('./validate');
const { register, login, verifyToken } = require('./auth');
const { 
  sanitizePlayerName, 
  sanitizeAmount, 
  sanitizeGameTitle, 
  sanitizeDate,
  rateLimitConfig,
  handleValidationErrors,
  commonValidations
} = require('./utils/validation');
const { body } = require('express-validator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 5051;

// WebSocket connection management
const gameConnections = new Map(); // gameId -> Set of WebSocket connections

wss.on('connection', (ws, req) => {
  let userId = null;
  let gameId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'auth') {
        // Verify token and store user info
        try {
          const payload = verifyToken(data.token);
          userId = payload.id;
          ws.userId = userId;
          ws.send(JSON.stringify({ type: 'auth', success: true }));
        } catch (e) {
          ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Invalid token' }));
        }
      } else if (data.type === 'join_game') {
        // Join a specific game room
        gameId = data.gameId;
        ws.gameId = gameId;
        
        if (!gameConnections.has(gameId)) {
          gameConnections.set(gameId, new Set());
        }
        gameConnections.get(gameId).add(ws);
        
        ws.send(JSON.stringify({ type: 'joined_game', gameId }));
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    if (gameId && gameConnections.has(gameId)) {
      gameConnections.get(gameId).delete(ws);
      if (gameConnections.get(gameId).size === 0) {
        gameConnections.delete(gameId);
      }
    }
  });
});

// Function to broadcast game updates to all connected clients
function broadcastGameUpdate(gameId, updateType, data) {
  if (gameConnections.has(gameId)) {
    const message = JSON.stringify({
      type: 'game_update',
      updateType,
      data,
      timestamp: new Date().toISOString()
    });
    
    gameConnections.get(gameId).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Allow only your frontend domain(s) in production, fallback to localhost:3000 in dev
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Apply rate limiting to all routes
const limiter = rateLimit(rateLimitConfig);
app.use(limiter);

// public routes for auth
app.post('/api/register', validateAuth, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const token = await register(username, password);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/login', validateAuth, async (req, res) => {
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



// Create game
app.post('/api/game', validateCreateGame, (req, res) => {
  const gamesCount = listGames(req.user.id).length;
  const gameId = uuidv4();
  const { currency = 'USD', date = new Date().toISOString(), title = `Game ${gamesCount + 1}`, players = [] } = req.body;
  const metadata = { currency, date, title };
  const game = createGame(gameId, req.user.id, metadata);
  players.forEach((name) => {
    if (name && !game.players[name]) {
      game.players[name] = { buyIns: [], cashOut: null };
    }
  });
  saveGame(gameId, game);
  broadcastGameUpdate(gameId, 'game_created', { gameId, title });
  res.status(201).json({ gameId, title });
  
});

// list existing games for this user
app.get('/api/games', (req, res) => {
  const games = listGames(req.user.id);
  res.json({ games });
});

// rename game title
app.patch('/api/game/:id/title', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const ok = renameGame(id, title);
  if (!ok) return res.status(404).json({ error: 'Game not found' });
  res.json({ message: 'Renamed', title });
});

// update game date
app.patch('/api/game/:id/date', (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Date required' });
  const game = getGame(id, req.user.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  game.metadata = { ...(game.metadata || {}), date };
  saveGame(id, game);
  res.json({ message: 'Date updated', date });
});

app.delete('/api/game/:id', (req, res) => {
  const { id } = req.params;
  const game = getGame(id, req.user.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  deleteGame(id);
  res.json({ message: 'Deleted' });
  
});

//adding players and buy ins
app.post('/api/game/:id/player', 
  commonValidations.gameId,
  commonValidations.playerName,
  commonValidations.amount,
  handleValidationErrors,
  (req,res) => {
    const {id} = req.params;
    let {name, buyIn} = req.body;

    try {
      // Sanitize inputs
      name = sanitizePlayerName(name);
      buyIn = sanitizeAmount(buyIn);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const game = getGame(id, req.user.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    //if player does not exist, create a new player, else add buyIn to existing player
    if (!game.players[name]) {
      game.players[name] = { buyIns: [buyIn], cashOut: null};
    } else{
      game.players[name].buyIns.push(buyIn);
    }

    saveGame(id, game);
    broadcastGameUpdate(id, 'player_updated', { name, player: game.players[name] });
    res.status(200).json({ message: `Buy-in added for ${name}`, player: game.players[name] });
  }
);




//adding cash out for players
app.post('/api/game/:id/cashout', 
  commonValidations.gameId,
  commonValidations.playerName,
  [
    body('cashOut')
      .isFloat({ min: 0, max: 999999.99 })
      .withMessage('Cash-out amount must be a positive number less than 999,999.99')
      .toFloat()
  ],
  handleValidationErrors,
  (req, res) => {
    const {id} = req.params;
    let {name, cashOut} = req.body;

    try {
      // Sanitize inputs
      name = sanitizePlayerName(name);
      cashOut = sanitizeAmount(cashOut);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const game = getGame(id, req.user.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const player = game.players[name];
    if(!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.cashOut = cashOut; //set cash out amount for player
    saveGame(id, game);
    broadcastGameUpdate(id, 'player_updated', { name, player });
    res.status(200).json({ message: `Cash out recorded for ${name}`, player });
  }
);

// Update a specific buy-in amount (index based)
app.patch('/api/game/:id/player/:name/buyin/:idx', (req,res)=>{
  const { id, name, idx } = req.params;
  const amount = Number(req.body.amount);
  if(!amount || amount <=0) return res.status(400).json({ error:'Invalid amount'});
  const game = getGame(id, req.user.id);
  if(!game) return res.status(404).json({ error:'Game not found'});
  const player = game.players[name];
  if(!player || !player.buyIns[ idx ]) return res.status(404).json({ error:'Buy-in not found'});
  player.buyIns[idx] = amount;
  saveGame(id, game);
  broadcastGameUpdate(id, 'player_updated', { name, player });
  res.json({ message:'Buy-in updated', buyIns: player.buyIns });
});

// Delete a buy-in entry
app.delete('/api/game/:id/player/:name/buyin/:idx', (req,res)=>{
  const { id, name, idx } = req.params;
  const game = getGame(id, req.user.id);
  if(!game) return res.status(404).json({ error:'Game not found'});
  const player = game.players[name];
  if(!player || !player.buyIns[idx]) return res.status(404).json({ error:'Buy-in not found'});
  player.buyIns.splice(idx,1);
  saveGame(id, game);
  broadcastGameUpdate(id, 'player_updated', { name, player });
  res.json({ message:'Buy-in deleted', buyIns: player.buyIns });
});

// Remove player via body or query
app.delete('/api/game/:id/player', (req, res) => {
  const { id } = req.params;
  const name = req.body.name || req.query.name;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const game = getGame(id, req.user.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (!game.players[name]) return res.status(404).json({ error: 'Player not found' });
  delete game.players[name];
  saveGame(id, game);
  broadcastGameUpdate(id, 'player_removed', { name });
  res.json({ message: `Removed ${name}` });
});

// Remove player via URL param (easier for clients)
app.delete('/api/game/:id/player/:name', (req, res) => {
  const { id, name } = req.params;
  const game = getGame(id, req.user.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (!game.players[name]) return res.status(404).json({ error: 'Player not found' });
  delete game.players[name];
  saveGame(id, game);
  broadcastGameUpdate(id, 'player_removed', { name });
  res.json({ message: `Removed ${name}` });
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
    return { name, buyIns: player.buyIns, totalBuyIn, cashOut, net };
  });

  res.json({ summary, metadata: { currency: 'USD', date: null, title: 'Game', ...game.metadata, settledAt: game.settledAt || null } });
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
  // Store the most recent settlement time
  game.settledAt = new Date().toISOString();
  saveGame(id, game);
  console.log('SettledAt value being returned:', game.settledAt); // Debug log
  res.json({ transactions, settledAt: game.settledAt || null });
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

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };