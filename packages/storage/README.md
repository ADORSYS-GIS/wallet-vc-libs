# storage

This library was generated with purpose of building a service module for data storage and retrieval.

Considering the nature of PWAs been browser applications, access to device storage cannot be done directly. PWAs thought acting like native applications can only make use of browser storage for any relative use case. This said, our goal here is to provide a default interface module and implementation that writes to the browser storage option we'ld have chosen.
As any other web application, Here are some of the most revelant data storage options for PWAs:

1. **LocalStorage:** localStorage allows you to store key-value pairs in the client's web browser. It's synchronous, meaning it can potentially block the main thread, so it's best suited for small amounts of data (usually limited to 5-10 MB per domain). Data stored in localStorage persists even after the browser is closed and reopened.

2. **SessionStorage:** sessionStorage is similar to localStorage but scoped to the current session. Data stored in sessionStorage is cleared when the browser tab is closed. Like localStorage, it's synchronous and suitable for storing small amounts of data.

3. **IndexedDB:** IndexedDB is a low-level API for client-side storage of significant amounts of structured data. It's designed for storing larger amounts of data asynchronously, making it suitable for more complex applications. IndexedDB supports transactions and indexing, allowing for efficient querying and retrieval of data.

These three options encompass a broad spectrum of data storage use cases in PWAs, ranging from structured data storage with IndexedDB to basic key-value pair storage with LocalStorage and SessionStorage. IndexedDB emerges as the most suitable option for our needs, given its capacity for structured data, larger storage capacity, transaction support, and indexing capabilities, but most importantly, its asynchronous nature.

## Compatibility

The compatibility graph of indexedDB can be found at the following address https://developer.mozilla.org/en-US/docs/Web/API/indexedDB#browser_compatibility

## Usage

To use this libray in the app, first import

```ts
import { StorageFactory } from '@wallet/storage';
import { WalletDBSchema } from './schema';

// open a new database named `storage` following the `WalletDBSchema` schema
const storageFactory = new StorageFactory<WalletDBSchema>('storage', 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    //creating a new store `test_store`
    db.createObjectStore('test_store');
  },
  blocked(currentVersion, blockedVersion, event) {
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    // …
  },
  terminated() {
    // …
  },
});

// schema.d.ts
import type { DBSchema } from 'idb';

interface WalletDBSchema extends DBSchema {
  test_store: {
    key: string;
    value: string;
  };
}
```

## Running unit tests

Run `npm run test` to execute the unit tests via [Jest](https://jestjs.io).

## Building the library

Run `npm run build` to build the library
