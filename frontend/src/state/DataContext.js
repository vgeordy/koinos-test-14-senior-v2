import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DataContext = createContext();

const API_BASE = 'http://localhost:3001';

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');       // server-side q
  const [page, setPage] = useState(1);          // current page (1-based)
  const [pageSize] = useState(50);              // tweak as you like
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async ({ pageArg = 1, signal } = {}) => {
    const params = new URLSearchParams({
      page: String(pageArg),
      pageSize: String(pageSize),
    });
    if (query.trim()) params.set('q', query.trim());

    const res = await fetch(`${API_BASE}/api/items?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json; // { items, total, page, pageSize, hasMore }
  }, [query, pageSize]);

  // Replace list with page 1 of current query
  const resetAndFetch = useCallback(async ({ signal } = {}) => {
    setLoading(true); setError(null);
    try {
      const data = await fetchPage({ pageArg: 1, signal });
      setItems(data.items);
      setPage(data.page);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err);
        console.error('resetAndFetch failed:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  // Append next page
  const fetchNextPage = useCallback(async ({ signal } = {}) => {
    if (!hasMore || loading) return;
    setLoading(true); setError(null);
    try {
      const next = page + 1;
      const data = await fetchPage({ pageArg: next, signal });
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err);
        console.error('fetchNextPage failed:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPage, hasMore, loading, page]);

  const value = useMemo(() => ({
    items,
    query, setQuery,
    page, pageSize, total, hasMore,
    loading, error,
    resetAndFetch,
    fetchNextPage,
  }), [items, query, page, pageSize, total, hasMore, loading, error, resetAndFetch, fetchNextPage]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
