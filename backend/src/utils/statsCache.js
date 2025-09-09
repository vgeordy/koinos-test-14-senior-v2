// statsCache.js
const fs = require('fs').promises;
const fssync = require('fs');           // for fs.watch
const crypto = require('crypto');

function etagFor(mtimeMs, size, total, avg) {
  const h = crypto.createHash('sha1');
  h.update(String(mtimeMs));
  h.update('|');
  h.update(String(size));
  h.update('|');
  h.update(String(total));
  h.update('|');
  h.update(String(avg));
  return `"${h.digest('hex')}"`;
}

module.exports = function createStatsCache(DATA_PATH) {
  let cache = {
    loaded: false,
    stats: null,          // { total, averagePrice }
    lastModified: null,   // Date
    etag: null,           // string
    loading: null,        // Promise in-flight
  };

  const computeStats = (items) => {
    let count = 0;
    let sum = 0;
    for (const it of items) {
      count += 1;
      const p = Number(it?.price);
      if (Number.isFinite(p)) sum += p;
    }
    return { total: count, averagePrice: count ? sum / count : 0 };
  };

  const refresh = async () => {
    if (cache.loading) return cache.loading; // de-dupe parallel calls
    cache.loading = (async () => {
      const [st, raw] = await Promise.all([
        fs.stat(DATA_PATH),
        fs.readFile(DATA_PATH, 'utf-8'),
      ]);

      const items = JSON.parse(raw);
      const stats = computeStats(items);
      const lastModified = st.mtime;
      const etag = etagFor(st.mtimeMs, st.size, stats.total, stats.averagePrice);

      cache = {
        loaded: true,
        stats,
        lastModified,
        etag,
        loading: null,
      };
    })();
    try { await cache.loading; } finally { cache.loading = null; }
  };

  // Debounced invalidation on file changes
  let bounce;
  try {
    fssync.watch(DATA_PATH, { persistent: false }, () => {
      clearTimeout(bounce);
      bounce = setTimeout(() => { cache.loaded = false; }, 100);
    });
  } catch {
    // fs.watch may fail on some filesystems; we’ll fall back to “refresh on demand”
  }

  const get = async () => {
    if (!cache.loaded) await refresh();
    return cache;
  };

  return { get, refresh };
};
