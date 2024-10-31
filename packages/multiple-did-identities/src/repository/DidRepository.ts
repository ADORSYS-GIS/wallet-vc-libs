import { StorageFactory } from '@adorsys-gis/storage';
import { DBSchema } from 'idb';
import { DidIdValue, DidIdentity } from '../did-methods/IDidMethod';
import { DIDMethodName, DIDKeyPairVariants } from '../did-methods/DidMethodFactory';

interface DidSchema extends DBSchema {
  dids: {
    key: string; // DID string
    value: DidIdValue;
    indexes: { 'by-method': string };
  };
}

export class DidRepository {
  private storageFactory: StorageFactory<DidSchema>;
  private readonly storeName = 'dids' as const;

  constructor(dbName: string = 'did-storage', dbVersion: number = 1) {
    this.storageFactory = new StorageFactory<DidSchema>(dbName, dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dids')) {
          const store = db.createObjectStore('dids', { keyPath: 'did' });
          store.createIndex('by-method', 'method', { unique: true });
        }
      },
    });
  }

  /**
   * Creates and stores a new DID identity.
   * @param didDoc The DIDKeypair to store.
   * @param method The DID method ('key' or 'peer').
   * @returns The stored DIDIdentity.
   */
  async createDidId(didDoc: DIDKeyPairVariants, method: DIDMethodName): Promise<void> {
    let methodType;

    // Check the DID to determine its type based on the prefix
    if (method === DIDMethodName.Peer) {
      const did = didDoc.did;

      if (did.startsWith('did:peer:0')) {
        methodType = 'Method0';
      } else if (did.startsWith('did:peer:1')) {
        methodType = 'Method1';
      } else if (did.startsWith('did:peer:2')) {
        methodType = 'Method2';
      } else if (did.startsWith('did:peer:3')) {
        methodType = 'Method3';
      } else if (did.startsWith('did:peer:4')) {
        methodType = 'Method4';
      } else {
        methodType = 'Unknown Method type';
      }
    } else {
      methodType = '';
    }

    const payload: DidIdValue = {
      did: didDoc.did,
      method: method,
      method_type: methodType,
      document: didDoc,
      createdAt: Date.now(),
    };
    await this.storageFactory.insert('dids', {
      value: payload,
    });
  }

  /**
   * Deletes a DID identity by its DID string.
   * @param did The DID string to delete.
   * @returns void
   */
  async deleteDidId(did: string): Promise<void> {
    await this.storageFactory.delete('dids', did);
  }

  /**
   * Finds a DID identity by its DID string.
   * @param did The DID string to find.
   * @returns The corresponding DIDDocument or null if not found.
   */
  async getADidId(did: string): Promise<DidIdentity> {
    const record = await this.storageFactory.findOne('dids', did);

    const { did: storedDid, method, createdAt } = record.value;
    return { did: storedDid, method, createdAt };
  }

  /**
   * Retrieves all stored DID identities.
   * @returns An array of objects containing did, method, and createdAt for each identity.
   */
  async getAllDidIds(): Promise<DidIdentity[]> {
    const records = await this.storageFactory.findAll('dids');
    return records.map((record) => {
      const { did, method, createdAt } = record.value;
      return { did, method, createdAt };
    });
  }
}
