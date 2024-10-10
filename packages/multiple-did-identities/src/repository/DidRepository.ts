import { StorageFactory } from '@adorsys-gis/storage';
import { DidSchema } from './DidSchema';
import { DIDKeyPair } from '../did-methods/IDidMethod';
import { StorageError } from '@adorsys-gis/storage/src/lib/errors/StorageError';

export class DidRepository {
  private storageFactory: StorageFactory<DidSchema>;
  private readonly storeName = 'dids' as const;

  constructor(dbName: string = 'did-storage', dbVersion: number = 1) {
    this.storageFactory = new StorageFactory<DidSchema>(dbName, dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dids')) {
          const store = db.createObjectStore('dids', { keyPath: 'did' });
          store.createIndex('by-method', 'method');
        }
      },
    });
  }

  /**
   * Creates and stores a new DID identity.
   * @param didDoc The DIDDocument to store.
   * @param method The DID method ('key' or 'peer').
   * @returns The stored DIDDocument.
   */
  async createDidId(didDoc: DIDKeyPair, method: string): Promise<void> {
    const payload = {
      did: didDoc.did,
      method,
      document: didDoc,
      createdAt: Date.now(),
    };

    try {
      await this.storageFactory.insert('dids', {
        key: didDoc.did,
        value: payload,
      });
    } catch (error) {
      throw new StorageError((error as Error).message, 'insert');
    }
  }

  /**
   * Deletes a DID identity by its DID string.
   * @param did The DID string to delete.
   * @returns void
   */
  async deleteDidId(did: string): Promise<void> {
    try {
      await this.storageFactory.delete('dids', did);
    } catch (error) {
      throw new StorageError((error as Error).message, 'delete');
    }
  }

  /**
   * Finds a DID identity by its DID string.
   * @param did The DID string to find.
   * @returns The corresponding DIDDocument or null if not found.
   */
  async getADidId(
    did: string,
  ): Promise<{ did: string; method: string; createdAt: number } | null> {
    try {
      const record = await this.storageFactory.findOne('dids', did);
      if (record) {
        const { did, method, createdAt } = record.value;
        return { did, method, createdAt };
      }
      return null; // Return null if no record is found
    } catch (error) {
      throw new StorageError((error as Error).message, 'findOne');
    }
  }

  /**
   * Retrieves all stored DID identities.
   * @returns An array of objects containing did, method, and createdAt for each identity.
   */
  async getAllDidIds(): Promise<
    { did: string; method: string; createdAt: number }[]
  > {
    try {
      const records = await this.storageFactory.findAll('dids');
      // Map to return only the required fields
      return records.map((record) => {
        const { did, method, createdAt } = record.value;
        return { did, method, createdAt };
      });
    } catch (error) {
      throw new StorageError((error as Error).message, 'findAll');
    }
  }
}
