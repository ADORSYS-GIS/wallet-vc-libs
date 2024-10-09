import { JWK } from 'jose';

export interface DIDDocument {
  did: string;
  privateKey: JWK;
  publicKey: JWK;
}

export interface IDidMethod {
  method: string;
  generate(): Promise<DIDDocument>;
}
