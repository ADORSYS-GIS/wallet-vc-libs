import { JWK } from 'jose';
import { DIDKeyPairVariants, DIDMethodName } from './DidMethodFactory';

export interface Did {
  did: string;
}

export interface DIDKeyPair extends Did {
  privateKey: JWK;
  publicKey: JWK;
}

export interface IDidMethod {
  method: DIDMethodName;
  generate(): Promise<DIDKeyPairVariants>;
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

export interface DIDKeyPairMethod1 extends DIDKeyPair {
  genesisDocument: object;
}

export interface DIDKeyPairMethod2 extends Did {
  didDocument: DIDDocumentMethod2;
  privateKeyV: JWK;
  publicKeyV: JWK;
  privateKeyE: JWK;
  publicKeyE: JWK;
}

export interface DIDDocumentMethod2 {
  '@context': string[];
  id: string;
  verificationMethod?: VerificationMethod2[];
  service?: Service[];
}

export interface VerificationMethod2 {
  id: string;
  controller: string,
  type: string;
  publicKeyMultibase: string;
}

export interface Service {
  type: string;
  serviceEndpoint: {
    uri: string;
    accept?: string[];
    routingKeys?: string[];
  };
}

export interface KeyPurpose {
  purpose: string;
  publicKeyMultibase: string;
}

export interface AbbreviatedService {
  t: string;
  s: {
    uri: string;
    a: string[];
    r: string[];
  };
}