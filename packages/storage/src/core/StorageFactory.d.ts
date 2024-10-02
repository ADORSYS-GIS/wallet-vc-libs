import { DBSchema, IndexNames, StoreNames, type OpenDBCallbacks } from 'idb';
import {
  StoreRecord,
  StoreRecordValue,
  QueryStore,
  StorageTransaction,
  TransactionCallback,
} from '../lib/types';
/**
 * A factory class for indexedDB's common CRUD operations
 */
export declare class StorageFactory<T extends DBSchema> {
  #private;
  /** Opened database */
  private db;
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
    dbVersion?: number,
    openDBCallbacks?: OpenDBCallbacks<T>,
  );
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
  insert<S extends StoreNames<T>>(
    storeName: S,
    payload: StoreRecord<T, S>,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ): Promise<import('idb').StoreKey<T, S>>;
  /**
   * Retrieves the value of the first record in a store
   *
   * @param storeName Name of the store
   * @param key record key
   * @param tx opened transaction
   * @returns an object with `key` and `value`
   */
  findOne<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ): Promise<StoreRecord<T, S> | null>;
  /**
   * Retrieves the records in a store
   *
   * @param storeName Name of the store
   * @param tx opened transaction
   * @returns all the records of the store
   */
  findAll<S extends StoreNames<T>>(
    storeName: S,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ): Promise<
    {
      key: import('idb').StoreKey<T, S>;
      value: StoreRecord<T>['value'];
    }[]
  >;
  /**
   * Puts an item in the store. Replaces any item with the same key.
   *
   * @param storeName Name of the store
   * @param key key of the item to be updated
   * @param payload item to be put in the store
   * @param tx opened transaction
   */
  update<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    payload: Partial<StoreRecordValue<T>>,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ): Promise<void>;
  /**
   * Deletes records in a store matching the given key.
   *
   * @param storeName Name of the store.
   * @param key
   * @param tx opened transaction
   */
  delete<S extends StoreNames<T>>(
    storeName: S,
    key: IDBValidKey,
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ): Promise<void>;
  /**
   * Delete all records in a store matching the given keys.
   *
   * In case no key is provided, all records of the store are deleted
   *
   * @param storeName Name of the store
   * @param keys keys to delete
   * @param tx opened transaction
   */
  deleteMany<S extends StoreNames<T>>(
    storeName: S,
    keys?: IDBValidKey[],
    tx?: StorageTransaction<T, S, 'readwrite'>,
  ): Promise<void>;
  /**
   * Retrieves values in an index that match the query.
   *
   * @param storeName Name of the store
   * @param indexName Name of the index in the store
   * @param count Number of occurrences you want to retrieve
   * @param query
   * @returns records with the given index
   */
  findManyByIndex<S extends StoreNames<T>>(
    storeName: S,
    indexName: IndexNames<T, S>,
    query?: Omit<QueryStore<T, S>, 'indexName'>,
  ): Promise<import('idb').StoreValue<T, S>[]>;
  /**
   * Retrieves the number of records matching the given query in a store.
   *
   * @param storeName Name of the store
   * @param query query params
   * @param tx opened transaction
   * @returns number of occurrences
   */
  count<S extends StoreNames<T>>(
    storeName: S,
    query?: QueryStore<T, S>,
    tx?: StorageTransaction<T, S, 'readonly' | 'readwrite'>,
  ): Promise<number>;
  /**
   * Start and close new transaction.
   *
   * @param storeNames Names of the store involved in the transaction
   * @param mode "readonly" | "readwrite"
   * @param callback
   */
  $transaction<M extends IDBTransactionMode, S extends StoreNames<T>>(
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
  ): Promise<void>;
  /**
   * Deletes all records in a store.
   *
   * @param storeName Name of the store
   */
  clear<S extends StoreNames<T>>(storeName: S): Promise<void>;
}
