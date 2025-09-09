import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Page,
  Container,
  Label,
  SearchInput,
  StatusLine,
  RowContainer,
  ItemLink,
  Skeleton,
  LoadMoreButton,
} from './Items.styles';
import { useData } from '../state/DataContext';

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Row renderer (must be a component/function reference)
const Row = ({ index, style, data }) => {
  const it = data.items[index];
  return (
    <RowContainer style={style}>
      {it ? <ItemLink to={'/items/' + it.id}>{it.name}</ItemLink> : <Skeleton />}
    </RowContainer>
  );
};

function Items() {
  const {
    items,
    query,
    setQuery,
    pageSize,
    total,
    hasMore,
    loading,
    error,
    resetAndFetch,
    fetchNextPage,
  } = useData();

  const [searchText, setSearchText] = useState(query);
  const debounced = useDebouncedValue(searchText, 300);

  useEffect(() => {
    const controller = new AbortController();
    if (debounced !== query) setQuery(debounced);
    resetAndFetch({ signal: controller.signal });
    return () => controller.abort();
  }, [debounced, query, setQuery, resetAndFetch]);

  return (
    <Page>
      <Container>
        <Label htmlFor="search">Search items</Label>
        <SearchInput
          id="search"
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Type to search..."
          aria-label="Search items by name"
        />

        <StatusLine $error={!!error} aria-live="polite">
          {loading && 'Loading… '}
          {error && `Error: ${String(error.message || error)}`}
          {!loading && !error && (
            <>Showing {items.length} of {total} items {query ? `(search: “${query}”)` : ''}</>
          )}
        </StatusLine>

        <List
          height={400}
          itemCount={items?.length ?? 0}
          itemSize={48}
          width="100%"
          itemData={{ items }}
          itemKey={(index, data) => data.items[index]?.id ?? index}
        >
          {Row}
        </List>

        <LoadMoreButton
          type="button"
          onClick={() => fetchNextPage()}
          disabled={!hasMore || loading}
        >
          {loading ? 'Loading…' : hasMore ? `Load more (next ${pageSize})` : 'No more results'}
        </LoadMoreButton>
      </Container>
    </Page>
  );
}

export default Items;
