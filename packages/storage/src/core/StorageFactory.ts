import type {
  DBSchema,
  IDBPDatabase,
  IndexNames,
  StoreNames} from 'idb';
import {
  openDB,
  type OpenDBCallbacks,
} from 'idb';

import { StorageError } from '../lib/errors/StorageError';
import type {
  QueryStore,
  StorageTransaction,
  StoreRecord,
  StoreRecordKey,
  StoreRecordValue,
  TransactionCallback,
} from '../lib/types';

/**
 * A factory class for indexedDB's common CRUD operations
 */
export class StorageFactory<T extends DBSchema> {
  /** Opened database */
  private db: IDBPDatabase<T> | null = null;
  /**
   * Promise returning an open database
   */
  #dbPromise: Promise<IDBPDatabase<T>>;

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
  constructor(
    dbName: string,
    dbVersion = 1,
    openDBCallbacks?: OpenDBCallbacks<T>,
  ) {
    this.#dbPromise = openDB<T>(dbName, dbVersion, openDBCallbacks);
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
  async insert<S extends StoreNames<T>>(
    storeName: S,
    payload: StoreRecord<T, S>,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      if (tx) {
        const store = tx.objectStore(storeName);
        return await store.add(payload.value, payload.key);
      }
      return await this.db.add(storeName, payload.value, payload.key);
    } catch (error) {
      throw new StorageError((error as Error).message, 'insert');
    }
  }

  /**
   * Retrieves the value of the first record in a store
   *
   * @param storeName Name of the store
   * @param key record key
   * @param tx opened transaction
   * @returns an object with `key` and `value`
   */
  async findOne<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ): Promise<StoreRecord<T, S> | null> {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      let value: StoreRecordValue<T, S> | undefined;
      const storedKey = key as StoreRecordKey<T, S>;

      if (tx) value = await tx.objectStore(storeName).get(storedKey);
      else value = await this.db.get(storeName, key as StoreRecordKey<T, S>);

      if (!value) return null;
      return { key: storedKey, value } satisfies StoreRecord<T, S>;
    } catch (error) {
      throw new StorageError((error as Error).message, 'findOne');
    }
  }

  /**
   * Retrieves the records in a store
   *
   * @param storeName Name of the store
   * @param tx opened transaction
   * @returns all the records of the store
   */
  async findAll<S extends StoreNames<T>>(
    storeName: S,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      const txn = tx ?? this.db.transaction(storeName, 'readonly');
      const store = txn.objectStore(storeName);

      const allKeys = await store.getAllKeys();
      const result = await Promise.all(allKeys.map((key) => store.get(key)));

      if (!tx) await txn.done;
      return result.map(
        (value, i) =>
          ({
            key: allKeys[i],
            value: value as StoreRecord<T>['value'],
          }) satisfies StoreRecord<T>,
      );
    } catch (error) {
      throw new StorageError((error as Error).message, 'findAll');
    }
  }

  /**
   * Puts an item in the store. Replaces any item with the same key.
   *
   * @param storeName Name of the store
   * @param key key of the item to be updated
   * @param payload item to be put in the store
   * @param tx opened transaction
   */
  async update<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    payload: Partial<StoreRecordValue<T>>,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;
      const txn = tx ?? this.db.transaction(storeName, 'readwrite');
      const store = txn.objectStore(storeName);
      const hasKeyPath = Boolean(store.keyPath);

      const payloadKey = key as StoreRecordKey<T, S>;
      const value = await store.get(payloadKey);

      if (!value) throw new Error(`No such key as ${payloadKey} in store`);

      await store.put(
        { ...value, ...payload },
        hasKeyPath ? undefined : payloadKey,
      );
      if (!tx) await txn.done;
    } catch (error) {
      throw new StorageError((error as Error).message, 'update');
    }
  }

  /**
   * Deletes records in a store matching the given key.
   *
   * @param storeName Name of the store.
   * @param key
   * @param tx opened transaction
   */
  async delete<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      const storedKey = key as StoreRecordKey<T, S>;
      if (tx) await tx.objectStore(storeName).delete(storedKey);
      else await this.db.delete(storeName, storedKey);
    } catch (error) {
      throw new StorageError((error as Error).message, 'delete');
    }
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
  async deleteMany<S extends StoreNames<T>>(
    storeName: S,
    keys?: IDBValidKey[],
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      let allKeys = await this.db.getAllKeys(storeName);
      if (keys) {
        allKeys = allKeys.filter((key) =>
          (keys as StoreRecordKey<T, S>[]).includes(key),
        );
      }
      const txn = tx ?? this.db.transaction(storeName, 'readwrite');
      await Promise.all([
        ...allKeys.map((key) => {
          const store = txn.objectStore(storeName);
          return store.delete(key);
        }),
      ]);
      if (!tx) await txn.done;
    } catch (error) {
      throw new StorageError((error as Error).message, 'deleteMany');
    }
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
  async findManyByIndex<S extends StoreNames<T>>(
    storeName: S,
    indexName: IndexNames<T, S>,
    query?: Omit<QueryStore<T, S>, 'indexName'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      return await this.db.getAllFromIndex(
        storeName,
        indexName,
        query?.key,
        query?.count,
      );
    } catch (error) {
      throw new StorageError((error as Error).message, 'findManyByIndex');
    }
  }

  /**
   * Retrieves the number of records matching the given query in a store.
   *
   * @param storeName Name of the store
   * @param query query params
   * @param tx opened transaction
   * @returns number of occurrences
   */
  async count<S extends StoreNames<T>>(
    storeName: S,
    query?: QueryStore<T, S>,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      if (query?.indexName)
        return await this.db.countFromIndex(storeName, query?.indexName);
      else if (tx) {
        return await tx.objectStore(storeName).count(query?.key);
      } else return await this.db.count(storeName, query?.key);
    } catch (error) {
      throw new StorageError((error as Error).message, 'count');
    }
  }

  /**
   * Start and close new transaction.
   *
   * @param storeNames Names of the store involved in the transaction
   * @param mode "readonly" | "readwrite"
   * @param callback
   */
  async $transaction<M extends IDBTransactionMode, S extends StoreNames<T>>(
    storeNames: S[],
    mode: M,
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
    callback: TransactionCallback<T, M, S>,
  ) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      await callback(this.db.transaction(storeNames, mode));
    } catch (error) {
      throw new StorageError((error as Error).message);
    }
  }

  /**
   * Deletes all records in a store.
   *
   * @param storeName Name of the store
   */
  async clear<S extends StoreNames<T>>(storeName: S) {
    try {
      if (!this.db) this.db = await this.#dbPromise;

      await this.db.clear(storeName);
    } catch (error) {
      throw new StorageError((error as Error).message, 'clear');
    }
  }
}
