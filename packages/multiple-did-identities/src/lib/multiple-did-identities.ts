/**
 * multiple-did-identities.ts
 * Manages the creation and storage of DID identities.
 */

import { generateDidKey } from './did-key-generator'; // DID generator function
import { encryptData, initializeEncryptionKey } from './encryption-util'; // Adjusted encryption utilities
import { StorageFactory } from '@adorsys-gis/storage'; // Import StorageFactory
import { DBSchema } from 'idb'; // For database schema typing
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// DID identity model
export interface DIDIdentity {
  id: string; // Unique identifier (UUID)
  did: string;
  publicKey: Uint8Array; // Public key as Uint8Array
  encryptedPrivateKey: ArrayBuffer; // Encrypted private key
  iv: Uint8Array; // Initialization Vector used during encryption
  createdAt: string; // ISO string
}

// Define the IndexedDB schema for DID identities
export interface DIDDatabase extends DBSchema {
  dids: {
    key: string; // DID is the key
    value: DIDIdentity;
    indexes: { 'by-did': string };
  };
}

// Initialize the storage factory for 'did-storage' with upgrade callback
export const storage = new StorageFactory<DIDDatabase>('did-storage', 1, {
  upgrade(db) {
    // Check if 'dids' store exists, if not, create it
    if (!db.objectStoreNames.contains('dids')) {
      const didsStore = db.createObjectStore('dids', { keyPath: 'did' });
      didsStore.createIndex('by-did', 'did', { unique: true });
    }
  },
});

/**
 * DIDManager class handles creation and storage of DIDs.
 */
export class DIDManager {
  /**
   * Initializes the encryption key and ensures it is ready for use.
   */
  static async initialize() {
    await initializeEncryptionKey(); // Ensure the encryption key is initialized
  }

  /**
   * Creates and stores a new DID identity.
   * @returns The created DIDIdentity object.
   */
  static async createDidIdentity(): Promise<DIDIdentity> {
    // Ensure the encryption key is initialized
    await this.initialize();

    // Generate a DID key pair
    const didKey = await generateDidKey();

    // Encrypt the private key using AES
    const { encryptedData, iv } = await encryptData(didKey.privateKey);

    // Generate a unique ID for the DID identity
    const id = uuidv4();

    // Construct the DIDIdentity object
    const identity: DIDIdentity = {
      id,
      did: didKey.did,
      publicKey: didKey.publicKey, // Public key as Uint8Array
      encryptedPrivateKey: encryptedData, // Encrypted private key as ArrayBuffer
      iv, // Initialization Vector as Uint8Array
      createdAt: new Date().toISOString(),
    };

    // Store the DID identity in IndexedDB
    await storage.insert('dids', { key: identity.did, value: identity });

    return identity;
  }

  /**
   * Retrieves a DID identity by its DID.
   * @param did The DID to retrieve.
   * @returns The DIDIdentity object if found, otherwise null.
   */
  static async getDidIdentity(did: string): Promise<DIDIdentity | null> {
    const record = await storage.findOne('dids', did);
    return record ? record.value : null;
  }

  /**
   * Deletes a DID identity by its DID.
   * @param did The DID to delete.
   */
  static async deleteDidIdentity(did: string): Promise<void> {
    await storage.delete('dids', did);
  }
}
