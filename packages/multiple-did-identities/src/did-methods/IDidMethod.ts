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
  genesisDocument: GenesisDocument;
}

export interface GenesisDocument {
  '@context': string[];
  verificationMethod: VerificationMethod2[];
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


export interface VerificationMethod4 {
  id: string;
  type: string;
  publicKeyMultibase: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: {
    uri: string;
    accept: string[];
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

export interface DIDDocumentMethod4 {
  '@context': string[];
  verificationMethod: VerificationMethod4[];
  authentication: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service: Service[];
}

export interface DIDKeyPairMethod4 extends Did {
  didShort: string
  didDocument: DIDDocumentMethod4;
  privateKey1: JWK;
  publicKey1: JWK;
  privateKey2: JWK;
  publicKey2: JWK;
}

export interface JWKKeys {
  kty: string;
  crv: string;
  x: string;
  d?: string;
}