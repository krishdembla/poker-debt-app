const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createUser, getUserByUsername } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function register(username, password) {
  if (!/^.{8,}$/.test(password) || !/\d/.test(password)) {
    throw new Error('Password must be at least 8 characters and include a number');
  }
  const existing = getUserByUsername(username);
  if (existing) throw new Error('User exists');
  const hash = await bcrypt.hash(password, 10);
  const user = createUser(username, hash);
  return generateToken(user.id, username);
}

async function login(username, password) {
  const user = getUserByUsername(username);
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  return generateToken(user.id, username);
}

function generateToken(id, username) {
  return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, verifyToken };
