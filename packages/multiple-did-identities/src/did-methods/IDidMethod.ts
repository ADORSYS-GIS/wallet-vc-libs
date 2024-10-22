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

export interface DidIdValue {
  did: string;
  method: string;
  document: DIDKeyPair;
  createdAt: number;
}

export interface DidIdentity {
  did: string;
  method: string;
  createdAt: number;
}