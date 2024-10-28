import { JWK } from 'jose';
import { DIDMethodName } from './DidMethodFactory';

export interface DIDKeyPair {
  did: string;
  privateKey: JWK;
  publicKey: JWK;
}

export interface IDidMethod {
  method: DIDMethodName;
  generate(): Promise<DIDKeyPair>;
}

export interface DidIdValue {
  did: string;
  method: DIDMethodName;
  document: DIDKeyPair;
  createdAt: number;
}

export interface DidIdentity {
  did: string;
  method: DIDMethodName;
  createdAt: number;
}

export interface DIDKeyPairMethod1 extends DIDKeyPair{
  genesisDocument: object;
}