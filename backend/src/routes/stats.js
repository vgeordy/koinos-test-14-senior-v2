const express = require("express");
const fs = require("fs").promises; // promise based fs API
const path = require("path");
const createStatsCache = require('../utils/statsCache');


const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');


const statsCache = createStatsCache(DATA_PATH);

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const { stats, lastModified, etag } = await statsCache.get();

    // Conditional GET: ETag / If-None-Match
    const inm = req.headers['if-none-match'];
    if (inm && inm === etag) return res.status(304).end();

    // Conditional GET: If-Modified-Since
    const ims = req.headers['if-modified-since'];
    if (ims && new Date(ims).getTime() >= lastModified.getTime()) {
      return res.status(304).end();
    }

    res.set('ETag', etag);
    res.set('Last-Modified', lastModified.toUTCString());
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
