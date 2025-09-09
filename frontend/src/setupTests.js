const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!global.crypto) {
  global.crypto = require('crypto').webcrypto;
}

const { TransformStream, ReadableStream, WritableStream } = require('stream/web');
if (!global.TransformStream) global.TransformStream = TransformStream;
if (!global.ReadableStream)  global.ReadableStream  = ReadableStream;
if (!global.WritableStream)  global.WritableStream  = WritableStream;

require('whatwg-fetch');
require('@testing-library/jest-dom');

// MSW AFTER polyfills
const { server } = require('./testServer');
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
