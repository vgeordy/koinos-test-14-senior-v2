import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '../state/DataContext';
import Items from '../pages/Items';

jest.mock('react-window'); // use our mock

function renderPage(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DataProvider>
        <Items />
      </DataProvider>
    </MemoryRouter>
  );
}

test('renders first page and summary', async () => {
  renderPage();

  // Wait for first item to show
  expect(await screen.findByText('Item 1')).toBeInTheDocument();

  // Shows the count summary
  expect(screen.getByText(/Showing/i)).toHaveTextContent(/Showing/);
});

test('debounced search triggers new results', async () => {
  renderPage();
  const input = screen.getByLabelText(/Search items/i);

  await userEvent.clear(input);
  await userEvent.type(input, 'Item 2'); // should match Item 2, 20, 21, 22, 23...

  // Wait for a matching item
  expect(await screen.findByText('Item 2')).toBeInTheDocument();
});

test('load more appends items', async () => {
  renderPage();

  // first page
  expect(await screen.findByText('Item 1')).toBeInTheDocument();

  const before = screen.getAllByRole('link').length;

  const btn = screen.getByRole('button', { name: /Load more/i });
  await userEvent.click(btn);

  // After load more, there should be more links
  await waitFor(() => {
    const after = screen.getAllByRole('link').length;
    expect(after).toBeGreaterThan(before);
  });
});
