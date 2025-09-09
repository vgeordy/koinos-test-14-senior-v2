const React = require('react');

function FixedSizeList({ itemCount, itemData, children, width, height, itemSize, itemKey }) {
  // Render a simple div with all rows for test determinism
  const items = Array.from({ length: itemCount });
  return (
    <div data-testid="mock-list" style={{ width, height }}>
      {items.map((_, index) => {
        const style = {}; // ignore positioning in tests
        const data = itemData ?? {};
        const key = itemKey ? itemKey(index, data) : index;
        return (
          <div key={key} data-testid={`row-${index}`}>
            {typeof children === 'function'
              ? children({ index, style, data })
              : children}
          </div>
        );
      })}
    </div>
  );
}

module.exports = { FixedSizeList };
