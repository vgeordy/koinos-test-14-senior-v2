// src/__tests__/ItemDetail.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ItemDetail from '../pages/ItemDetail';
import { DataProvider } from '../state/DataContext';

jest.mock('react-window'); // not used here but safe

function renderDetail(path = '/items/3') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DataProvider>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </DataProvider>
    </MemoryRouter>
  );
}

test('shows item detail when item exists', async () => {
  renderDetail('/items/3');
  // ItemDetail uses fetch; wait for name to appear
  expect(await screen.findByRole('heading', { name: /Item 3/i })).toBeInTheDocument();
  expect(screen.getByText(/Category:/i)).toBeInTheDocument();
  expect(screen.getByText(/\$10[2-9]|11\d/)).toBeInTheDocument(); // price around 100+
});

test('navigates home on 404', async () => {
  renderDetail('/items/999'); // not in test dataset
  // Should redirect to Home route
  expect(await screen.findByText('Home')).toBeInTheDocument();
});
