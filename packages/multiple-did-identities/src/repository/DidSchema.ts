import { DBSchema } from 'idb';
import { DIDDocument } from 'src/did-methods/IDidMethod';

export interface DidSchema extends DBSchema {
    dids: {
      key: string; // The DID string
      value: {
        did: string;
        method: string;
        document: DIDDocument;
        createdAt: number;
      };
      indexes: { 'by-method': string };
    };
  }
