const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  
  } catch (err) {
    console.error("Error reading file: ", err);
    throw err;
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData(); // array of items

    // helpers
    const asStr = (v) => (typeof v === 'string' ? v.trim() : undefined);
    const asIntClamped = (v, def, min, max) => {
      const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
      const val = Number.isFinite(n) ? n : def;
      return Math.max(min, Math.min(max, val));
    };

    const q = (asStr(req.query.q) || '').toLowerCase();
    const page = asIntClamped(req.query.page, 1, 1, 1_000_000);
    const pageSize = asIntClamped(req.query.pageSize, 50, 1, 100);

    let filtered = data;
    if (q) {
      filtered = filtered.filter(
        (item) =>
          typeof item?.name === 'string' &&
          item.name.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const pageItems = start < total ? filtered.slice(start, end) : [];
    const hasMore = end < total;

    res.json({ items: pageItems, total, page, pageSize, hasMore });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    // non-blocking read
    const data = await readData();

    // normalize and validate `id` param
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      const err = new Error('Invalid ID parameter');
      err.status = 400; 
      throw err;
    }

    const item = data.find((i) => i.id === id);
    
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }

    
    res.json(item);
  } catch (err) {
    next(err);
  }
  
});

// Objectives does not specify adding items as one of the requirments so I will be ignoring this
// POST /api/items
router.post('/', (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;