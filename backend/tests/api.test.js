const request = require('supertest');
const { app } = require('../index');

describe('Poker Debt API integration', () => {
  const username = `user_${Date.now()}`;
  const password = 'password123';
  let token;
  let gameId;

  it('registers a new user', async () => {
    const res = await request(app).post('/api/register').send({ username, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('rejects invalid register payload', async () => {
    const res = await request(app).post('/api/register').send({ username: 'x' });
    expect(res.statusCode).toBe(422);
  });

  it('logs in existing user', async () => {
    const res = await request(app).post('/api/login').send({ username, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token; // fresh token
  });

  it('creates a new game', async () => {
    const res = await request(app)
      .post('/api/game')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toBe(201);
    expect(res.body.gameId).toBeDefined();
    gameId = res.body.gameId;
  });

  it('rejects invalid buy-in payload', async () => {
    const res = await request(app)
      .post(`/api/game/${gameId}/player`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', buyIn: -10 });
    expect(res.statusCode).toBe(422);
  });

  it('adds buy-in for Alice', async () => {
    const res = await request(app)
      .post(`/api/game/${gameId}/player`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice', buyIn: 100 });
    expect(res.statusCode).toBe(200);
  });

  it('adds buy-in for Bob', async () => {
    const res = await request(app)
      .post(`/api/game/${gameId}/player`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bob', buyIn: 50 });
    expect(res.statusCode).toBe(200);
  });

  it('adds cash-out for Alice', async () => {
    const res = await request(app)
      .post(`/api/game/${gameId}/cashout`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice', cashOut: 150 });
    expect(res.statusCode).toBe(200);
  });

    it('adds cash-out for Bob', async () => {
    const res = await request(app)
      .post(`/api/game/${gameId}/cashout`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bob', cashOut: 0 });
    expect(res.statusCode).toBe(200);
  });

  it('settles game', async () => {
    const res = await request(app)
      .get(`/api/game/${gameId}/settle`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.transactions.length).toBeGreaterThan(0);
  });
});
