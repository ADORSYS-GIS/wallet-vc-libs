'use strict';
var _StorageFactory_dbPromise;
Object.defineProperty(exports, '__esModule', { value: true });
exports.StorageFactory = void 0;
const tslib_1 = require('tslib');
const idb_1 = require('idb');
const StorageError_1 = require('../lib/errors/StorageError');
/**
 * A factory class for indexedDB's common CRUD operations
 */
class StorageFactory {
  /**
   * Open a database
   *
   * It creates a new database when is called for the first time.
   *
   * This function is called by the constructor and must not be explicitly called by consumer.
   *
   * @param dbName Name of the indexedDB
   * @param [dbVersion=1] database version
   * @param openDBCallbacks Addittional callbacks
   */
  constructor(dbName, dbVersion = 1, openDBCallbacks) {
    /** Opened database */
    this.db = null;
    /**
     * Promise returning an open database
     */
    _StorageFactory_dbPromise.set(this, void 0);
    tslib_1.__classPrivateFieldSet(
      this,
      _StorageFactory_dbPromise,
      (0, idb_1.openDB)(dbName, dbVersion, openDBCallbacks),
      'f',
    );
  }
  /**
   * Insert new value to a given store of your indexedDB.
   *
   * This method will failed if the key you're trying to add already exist
   *
   * @param storeName The name of the store you want to insert data to. Stores are simalar to collections
   * @param payload Data to be stored in key/value format
   * @param tx opened transaction
   * @returns the newly added key
   */
  insert(storeName, payload, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        if (tx) {
          const store = tx.objectStore(storeName);
          return yield store.add(payload.value, payload.key);
        }
        return yield this.db.add(storeName, payload.value, payload.key);
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'insert');
      }
    });
  }
  /**
   * Retrieves the value of the first record in a store
   *
   * @param storeName Name of the store
   * @param key record key
   * @param tx opened transaction
   * @returns an object with `key` and `value`
   */
  findOne(storeName, key, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        let value;
        const storedKey = key;
        if (tx) value = yield tx.objectStore(storeName).get(storedKey);
        else value = yield this.db.get(storeName, key);
        if (!value) return null;
        return { key: storedKey, value };
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'findOne');
      }
    });
  }
  /**
   * Retrieves the records in a store
   *
   * @param storeName Name of the store
   * @param tx opened transaction
   * @returns all the records of the store
   */
  findAll(storeName, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        const txn =
          tx !== null && tx !== void 0
            ? tx
            : this.db.transaction(storeName, 'readonly');
        const store = txn.objectStore(storeName);
        const allKeys = yield store.getAllKeys();
        const result = yield Promise.all(allKeys.map((key) => store.get(key)));
        if (!tx) yield txn.done;
        return result.map((value, i) => ({
          key: allKeys[i],
          value: value,
        }));
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'findAll');
      }
    });
  }
  /**
   * Puts an item in the store. Replaces any item with the same key.
   *
   * @param storeName Name of the store
   * @param key key of the item to be updated
   * @param payload item to be put in the store
   * @param tx opened transaction
   */
  update(storeName, key, payload, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        const txn =
          tx !== null && tx !== void 0
            ? tx
            : this.db.transaction(storeName, 'readwrite');
        const store = txn.objectStore(storeName);
        const hasKeyPath = Boolean(store.keyPath);
        const payloadKey = key;
        const value = yield store.get(payloadKey);
        if (!value) throw new Error(`No such key as ${payloadKey} in store`);
        yield store.put(
          Object.assign(Object.assign({}, value), payload),
          hasKeyPath ? undefined : payloadKey,
        );
        if (!tx) yield txn.done;
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'update');
      }
    });
  }
  /**
   * Deletes records in a store matching the given key.
   *
   * @param storeName Name of the store.
   * @param key
   * @param tx opened transaction
   */
  delete(storeName, key, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        const storedKey = key;
        if (tx) yield tx.objectStore(storeName).delete(storedKey);
        else yield this.db.delete(storeName, storedKey);
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'delete');
      }
    });
  }
  /**
   * Delete all records in a store matching the given keys.
   *
   * In case no key is provided, all records of the store are deleted
   *
   * @param storeName Name of the store
   * @param keys keys to delete
   * @param tx opened transaction
   */
  deleteMany(storeName, keys, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        let allKeys = yield this.db.getAllKeys(storeName);
        if (keys) {
          allKeys = allKeys.filter((key) => keys.includes(key));
        }
        const txn =
          tx !== null && tx !== void 0
            ? tx
            : this.db.transaction(storeName, 'readwrite');
        yield Promise.all([
          ...allKeys.map((key) => {
            const store = txn.objectStore(storeName);
            return store.delete(key);
          }),
        ]);
        if (!tx) yield txn.done;
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'deleteMany');
      }
    });
  }
  /**
   * Retrieves values in an index that match the query.
   *
   * @param storeName Name of the store
   * @param indexName Name of the index in the store
   * @param count Number of occurrences you want to retrieve
   * @param query
   * @returns records with the given index
   */
  findManyByIndex(storeName, indexName, query) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        return yield this.db.getAllFromIndex(
          storeName,
          indexName,
          query === null || query === void 0 ? void 0 : query.key,
          query === null || query === void 0 ? void 0 : query.count,
        );
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'findManyByIndex');
      }
    });
  }
  /**
   * Retrieves the number of records matching the given query in a store.
   *
   * @param storeName Name of the store
   * @param query query params
   * @param tx opened transaction
   * @returns number of occurrences
   */
  count(storeName, query, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        if (query === null || query === void 0 ? void 0 : query.indexName)
          return yield this.db.countFromIndex(
            storeName,
            query === null || query === void 0 ? void 0 : query.indexName,
          );
        else if (tx) {
          return yield tx
            .objectStore(storeName)
            .count(query === null || query === void 0 ? void 0 : query.key);
        } else
          return yield this.db.count(
            storeName,
            query === null || query === void 0 ? void 0 : query.key,
          );
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'count');
      }
    });
  }
  /**
   * Start and close new transaction.
   *
   * @param storeNames Names of the store involved in the transaction
   * @param mode "readonly" | "readwrite"
   * @param callback
   */
  $transaction(
    storeNames,
    mode,
    /**
       * Callback to be executed within the context of the transaction.
       *
       * Only await the `StorageFactory` methods supporting the `tx` parameter in this callback
       *
       * @example
       * const transactionCallback: TransactionCallback<DBSchema, 'readwrite'> =
          async (transaction) => {
            const records = storageFactory.findAll('testStore', transaction);
            if(records.length > 0)
              await storageFactory.update('testStore', records[0].key, 'tx_value_2', transaction);
            else await storageFactory.insert(
              'testStore',
              {
                key: 'tx_key_1',
                value: 'tx_value_1',
              },
              transaction
            );
          };
       */
    callback,
  ) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        yield callback(this.db.transaction(storeNames, mode));
      } catch (error) {
        throw new StorageError_1.StorageError(error.message);
      }
    });
  }
  /**
   * Deletes all records in a store.
   *
   * @param storeName Name of the store
   */
  clear(storeName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      try {
        if (!this.db)
          this.db = yield tslib_1.__classPrivateFieldGet(
            this,
            _StorageFactory_dbPromise,
            'f',
          );
        yield this.db.clear(storeName);
      } catch (error) {
        throw new StorageError_1.StorageError(error.message, 'clear');
      }
    });
  }
}
exports.StorageFactory = StorageFactory;
_StorageFactory_dbPromise = new WeakMap();
//# sourceMappingURL=StorageFactory.js.map
