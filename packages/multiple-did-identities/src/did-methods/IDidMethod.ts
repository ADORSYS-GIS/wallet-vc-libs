import { JWK } from 'jose';
import {
  DID2Type,
  DIDKeyPairVariants,
  DIDMethodName,
} from './DidMethodFactory';

export interface Did {
  did: string;
}

export interface DIDKeyPair extends Did {
  privateKey?: JWK;
  publicKey: JWK;
  encryptedPrivateKey?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
}

export interface IDidMethod {
  method: DIDMethodName;
  generate(): Promise<DIDKeyPairVariants>;
}

export interface DidIdValue {
  did: string;
  document: DIDKeyPairVariants;
  createdAt: number;
}

export interface DidIdentity {
  did: string;
  type?: DID2Type;
  methodType?: string;
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
  type: DID2Type;
  didDocument: DIDDocumentMethod2;
  privateKeyV?: PrivateKeyJWK;
  publicKeyV: JWK;
  privateKeyE?: PrivateKeyJWK;
  publicKeyE: JWK;
  encryptedPrivateKeyV?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
  encryptedPrivateKeyE?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
}

export interface DIDKeyPairMethod3 extends Did {
  didDocument: DIDDocumentMethod2;
  privateKeyV?: PrivateKeyJWK;
  publicKeyV: JWK;
  privateKeyE?: PrivateKeyJWK;
  publicKeyE: JWK;
  encryptedPrivateKeyV?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
  encryptedPrivateKeyE?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
}

export interface DIDDocumentMethod2 {
  '@context': string[];
  id: string;
  verificationMethod?: VerificationMethod2[];
  authentication: string[];
  keyAgreement: string[];
  service?: Service[];
}

export interface VerificationMethod2 {
  id: string;
  controller: string;
  type: string;
  publicKeyMultibase: string;
}

export interface VerificationMethod4 {
  id: string;
  controller?: string;
  type: string;
  publicKeyMultibase: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: ServicesEndpoint;
}

export interface ServicesEndpoint {
  uri: string;
  accept?: string[];
  routingKeys?: string[];
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
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service: Service[];
}

export interface DIDKeyPairMethod4 extends Did {
  didShort: string;
  didDocument: DIDDocumentMethod4;
  privateKey1?: JWK;
  publicKey1: JWK;
  privateKey2?: JWK;
  publicKey2: JWK;
  encryptedPrivateKey1?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
  encryptedPrivateKey2?: {
    salt: Uint8Array;
    ciphertext: string;
    iv: Uint8Array;
  };
}

export interface JWKKeys {
  kty: string;
  crv: string;
  x: string;
  d?: string;
}

export interface PrivateKeyJWK {
  id: string;
  type: string;
  privateKeyJwk: {
    crv: string;
    d: string;
    kty: string;
    x: string;
    y?: string;
  };
}

export interface DidIdentityWithDecryptedKeys {
  did: string;
  createdAt: number;
  decryptedPrivateKeys: Record<string, JWK | PrivateKeyJWK>;
}
