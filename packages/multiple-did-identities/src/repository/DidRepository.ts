import { StorageFactory } from '@adorsys-gis/storage';
import { DBSchema } from 'idb';
import { DidIdValue, DidIdentity, DidIdentityWithDecryptedKeys, PrivateKeyJWK } from '../did-methods/IDidMethod';
import {
  DIDMethodName,
  DIDKeyPairVariants,
  PeerGenerationMethod,
} from '../did-methods/DidMethodFactory';
import { decryptData } from '../security/security-utils';
import { JWK } from 'jose';

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
  async createDidId(
    didDoc: DIDKeyPairVariants,
    method: DIDMethodName,
  ): Promise<void> {
    let methodType;

    // Check the DID to determine its type based on the prefix
    if (method === DIDMethodName.Peer) {
      const did = didDoc.did;

      if (did.startsWith('did:peer:0')) {
        methodType = PeerGenerationMethod.Method0;
      } else if (did.startsWith('did:peer:1')) {
        methodType = PeerGenerationMethod.Method1;
      } else if (did.startsWith('did:peer:2')) {
        methodType = PeerGenerationMethod.Method2;
      } else if (did.startsWith('did:peer:3')) {
        methodType = PeerGenerationMethod.Method3;
      } else if (did.startsWith('did:peer:4')) {
        methodType = PeerGenerationMethod.Method4;
      } else {
        throw new Error('Unknown Method type');
      }
    } else {
      methodType = '';
    }

    // Replace private keys with encrypted keys in the document
    const sanitizedDidDoc = { ...didDoc };
    if ('encryptedPrivateKey' in sanitizedDidDoc) {
      delete sanitizedDidDoc.privateKey;
    }
    if ('encryptedPrivateKeyV' in sanitizedDidDoc && 'encryptedPrivateKeyE' in sanitizedDidDoc) {
      delete sanitizedDidDoc.privateKeyV;
      delete sanitizedDidDoc.privateKeyE;
    }
    if ('encryptedPrivateKey1' in sanitizedDidDoc && 'encryptedPrivateKey2' in sanitizedDidDoc) {
      delete sanitizedDidDoc.privateKey1;
      delete sanitizedDidDoc.privateKey2;
    }

    const payload: DidIdValue = {
      did: sanitizedDidDoc.did,
      method: method,
      method_type: methodType,
      document: sanitizedDidDoc,
      createdAt: Date.now(),
    };

    console.log(JSON.stringify(payload.document)); //debug output

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

    const { did: storedDid, method, method_type, createdAt } = record.value;

    // Check if the DID starts with "did:key" to determine whether to include methodType
    const didIdentity: DidIdentity = storedDid.startsWith('did:key')
      ? { did: storedDid, method, createdAt }
      : { did: storedDid, method, method_type, createdAt };

    return didIdentity;
  }

  /**
   * Retrieves all stored DID identities.
   * @returns An array of objects containing did, method, and createdAt for each identity.
   */
  async getAllDidIds(): Promise<DidIdentity[]> {
    const records = await this.storageFactory.findAll('dids');
    return records.map((record) => {
      const { did, method, method_type, createdAt } = record.value;

      // Return an object including method_type if it exists for any DID
      return {
        did,
        method,
        method_type: method_type, // Return method_type for all records if it exists
        createdAt,
      };
    });
  }

  /**
 * Finds a DID identity by its DID string and decrypts the private keys.
 * @param did The DID string to find.
 * @param pin The pin used for decryption after successful authentication
 * @returns The corresponding DIDDocument with decrypted private keys, or null if not found.
 */
  async getADidWithDecryptedPrivateKeys(did: string, pin: number): Promise<DidIdentityWithDecryptedKeys | null> {
    const record = await this.storageFactory.findOne('dids', did);

    const { did: storedDid, method, method_type, createdAt, document } = record.value;

    // Initialize the decrypted private keys object
    const decryptedPrivateKeys: Record<string, JWK | PrivateKeyJWK> = {};

    // Check for different encrypted private keys in the document and decrypt them
    if (document.encryptedPrivateKey) {
      const { salt, ciphertext, iv } = document.encryptedPrivateKey;
      decryptedPrivateKeys['privateKey'] = await decryptData(pin, salt, iv, ciphertext);
    }

    if (document.encryptedPrivateKeyV && document.encryptedPrivateKeyE) {
      const { salt, ciphertext, iv } = document.encryptedPrivateKeyV;
      decryptedPrivateKeys['privateKeyV'] = await decryptData(pin, salt, iv, ciphertext);

      const { salt: saltE, ciphertext: ciphertextE, iv: ivE } = document.encryptedPrivateKeyE;
      decryptedPrivateKeys['privateKeyE'] = await decryptData(pin, saltE, ivE, ciphertextE);
    }

    if (document.encryptedPrivateKey1 && document.encryptedPrivateKey2) {
      const { salt, ciphertext, iv } = document.encryptedPrivateKey1;
      decryptedPrivateKeys['privateKey1'] = await decryptData(pin, salt, iv, ciphertext);

      const { salt: salt2, ciphertext: ciphertext2, iv: iv2 } = document.encryptedPrivateKey2;
      decryptedPrivateKeys['privateKey2'] = await decryptData(pin, salt2, iv2, ciphertext2);
    }

    // Return the DID identity with decrypted private keys
    const didIdentityWithDecryptedKeys: DidIdentityWithDecryptedKeys = {
      did: storedDid,
      method,
      method_type,
      createdAt,
      decryptedPrivateKeys,
    };

    return didIdentityWithDecryptedKeys;
  }
}
