import { DBSchema } from 'idb';
import { DIDKeyPair } from 'src/did-methods/IDidMethod';

export interface DidSchema extends DBSchema {
  dids: {
    key: string; // The DID string
    value: {
      did: string;
      method: string;
      document: DIDKeyPair;
      createdAt: number;
    };
    indexes: { 'by-method': string };
  };
}
