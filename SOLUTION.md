## Overview

Below is a summary of the changes, approaches, and trade-offs.

---

## Backend (Express API)

### Improvements

- **Async file I/O**: Replaced blocking `fs.readFileSync` with async `fs.promises.readFile` to avoid blocking the event loop.
- **Input normalization**: Added helpers to sanitize and clamp query params (`q`, `limit`). Prevents injection and protects against excessive memory usage.
- **Error handling**: Normalized errors with HTTP status codes (`400` for bad params, `404` for not found).
- **Stats endpoint**: Implemented caching and optional invalidation to avoid recalculating on every request.

### Trade-offs

- Keeping file-based storage is simple for demo purposes, but not scalable compared to a DB.
- Caching adds complexity but improves performance for repeated reads.

---

## Frontend (React)

### Improvements

- **Memory leak fix**: Introduced `AbortController` in `Items.js` to cancel fetches on unmount. Prevents setting state on unmounted components.
- **Pagination + search**: Added query support (`q`, `page`, `pageSize`) to avoid fetching all items at once.
- **Virtualization**: Integrated `react-window` for smooth scrolling with large lists.
- **Styling**: Switched to `styled-components` with a modern font (Inter) for consistent look and feel.
- **Detail page**: Item details are fetched by ID with error fallback navigation.

### Trade-offs

- Virtualization improves performance on large lists but complicates testability (DOM only renders visible items).
- Styled-components add bundle size but provide scoped, modern styling.

---

## Testing

### Improvements

- **Jest + React Testing Library**: Added frontend tests (`Items.test.jsx`, `ItemDetail.test.jsx`).
- **Mock Service Worker (MSW)**: Used to intercept API calls in tests with realistic mocked data.
- **Backend tests**: Used `supertest` to test Express routes without hitting disk.

### Trade-offs

- MSW adds learning curve and extra setup but provides the closest real-world test behavior.
- Virtualized components are harder to test (need to account for only rendered rows).

---

## UX Enhancements

- Added loading and error states with ARIA live regions for accessibility.
- Improved navigation (links to item detail pages).
- Updated font and layout for a modern look.

---

## Summary

- **Goal**: Demonstrate best practices in React + Express for scalable lists, safe APIs, and modern UI.
- **Approach**: Incremental fixes (memory leaks, blocking I/O), performance optimizations (pagination, virtualization), and better DX (tests + MSW).
- **Trade-offs**: Some complexity added (styled-components, caching, MSW) but justified for realism and scalability.

## Credits

Development enhancements were assisted by **AI (OpenAI’s ChatGPT)** to accelerate iteration, debugging, and documentation. Final code and design decisions were reviewed and integrated manually.
