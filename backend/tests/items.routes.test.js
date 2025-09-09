// items.routes.test.js
const request = require('supertest');
const express = require('express');

// --- Mock fs.promises so no real disk I/O happens ---
jest.mock('fs', () => {
  const promises = {
    readFile: jest.fn(),
  };
  return { promises };
});

const { promises: fs } = require('fs');


// e.g. const router = require('../src/routes/api/items');
const router = require('../src/routes/items'); 

// Build a tiny express app to mount the router
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/items', router);

  // Test-friendly error handler
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
      error: {
        message: err.message,
        status,
      },
    });
  });

  return app;
}

describe('/api/items routes', () => {
  // Each item includes a category field (like your items.json)
  const sampleItems = [
    { id: 1, name: 'Apple',  category: 'Fruit', price: 3 },
    { id: 2, name: 'Banana', category: 'Fruit', price: 1 },
    { id: 3, name: 'Grape',  category: 'Fruit', price: 5 },
  ];

  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
    fs.readFile.mockResolvedValue(JSON.stringify(sampleItems));
  });

  // ---------- GET /api/items ----------
  it('GET /api/items returns all items (default limit applies but larger than data)', async () => {
    const res = await request(app).get('/api/items').expect(200);
    expect(res.body).toEqual(sampleItems);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
  });

  it('GET /api/items filters by q (case-insensitive substring on name) and applies limit', async () => {
    const res = await request(app)
      .get('/api/items')
      .query({ q: 'ap', limit: '1' }) // matches "Apple" and "Grape"; limit to 1
      .expect(200);

    expect(res.body).toEqual([{ id: 1, name: 'Apple', category: 'Fruit', price: 3 }]);
  });

  it('GET /api/items ignores bad limit and falls back to default', async () => {
    const res = await request(app)
      .get('/api/items')
      .query({ limit: 'not-a-number' })
      .expect(200);

    expect(res.body.length).toBe(3);
  });

  // ---------- GET /api/items/:id ----------
  it('GET /api/items/:id returns item when found', async () => {
    const res = await request(app).get('/api/items/2').expect(200);
    expect(res.body).toEqual({ id: 2, name: 'Banana', category: 'Fruit', price: 1 });
  });

  it('GET /api/items/:id returns 400 on invalid id', async () => {
    const res = await request(app).get('/api/items/abc').expect(400);
    expect(res.body.error.message).toMatch(/invalid id/i);
  });

  it('GET /api/items/:id returns 404 when not found', async () => {
    const res = await request(app).get('/api/items/999').expect(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});
