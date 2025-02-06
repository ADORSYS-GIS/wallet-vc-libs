// Import fake-indexeddb
import 'fake-indexeddb/auto';

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
