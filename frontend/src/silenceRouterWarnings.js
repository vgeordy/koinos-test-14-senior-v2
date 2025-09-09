const originalWarn = console.warn;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router Future Flag Warning') ||
        args[0].includes('Relative route resolution'))
    ) {
      return; // swallow specific warnings
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
