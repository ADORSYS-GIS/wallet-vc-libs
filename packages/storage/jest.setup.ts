// Import core-js polyfills
import 'core-js/stable/structured-clone';
// Import fake-indexeddb
import 'fake-indexeddb/auto';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
