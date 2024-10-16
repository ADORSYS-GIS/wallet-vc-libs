import { JWK } from 'jose';

export interface DIDKeyPair {
  did: string;
  privateKey: JWK;
  publicKey: JWK;
}

export interface IDidMethod {
  method: string;
  generate(): Promise<DIDKeyPair>;
}
