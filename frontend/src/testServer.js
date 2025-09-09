import { setupServer } from 'msw/node';
import { rest } from 'msw';

const API_BASE = 'http://localhost:3001';

// Large in-memory dataset so pagination tests can "Load more"
const ALL_ITEMS = Array.from({ length: 120 }).map((_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  category: i % 2 ? 'Electronics' : 'Furniture',
  price: 100 + i,
}));

function filterAndPage({ q = '', page = 1, pageSize = 10 }) {
  let filtered = ALL_ITEMS;
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((it) => it.name.toLowerCase().includes(needle));
  }
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const hasMore = start + pageSize < total;
  return { items, total, page, pageSize, hasMore };
}

function listHandler(req, res, ctx) {
  const q = req.url.searchParams.get('q') || '';
  const page = Number(req.url.searchParams.get('page') || 1);
  const pageSize = Number(req.url.searchParams.get('pageSize') || 10);
  return res(ctx.json(filterAndPage({ q, page, pageSize })));
}

function detailHandler(req, res, ctx) {
  const id = Number(req.params.id);
  const it = ALL_ITEMS.find((x) => x.id === id);
  if (!it) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  // prevent 304s in tests
  return res(ctx.set('Cache-Control', 'no-store'), ctx.json(it));
}

export const server = setupServer(
  // Relative handlers
  rest.get('/api/items', listHandler),
  rest.get('/api/items/:id', detailHandler),

  // Absolute handlers (DataContext uses http://localhost:3001 in dev/tests)
  rest.get(`${API_BASE}/api/items`, listHandler),
  rest.get(`${API_BASE}/api/items/:id`, detailHandler)
);
