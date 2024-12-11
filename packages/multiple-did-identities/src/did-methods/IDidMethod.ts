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
  method_type: string;
  document: DIDKeyPairVariants;
  createdAt: number;
}

export interface DidIdentity {
  did: string;
  method: DIDMethodName;
  method_type?: string;
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
  privateKeyV: PrivateKeyJWK;
  publicKeyV: JWK;
  privateKeyE: PrivateKeyJWK;
  publicKeyE: JWK;
}

export interface PrivateKeyJWK {
  id: string;
  type: 'JsonWebKey2020';
  privateKeyJwk: {
    crv: string; // Curve, e.g., 'P-384', 'X25519'
    d: string;   // Private key in Base64URL
    kty: string; // Key type, e.g., 'EC', 'OKP'
    x: string;   // Public key coordinate x
    y?: string;  // Public key coordinate y (optional for some curves)
  };
}

export interface DIDDocumentMethod2 {
  '@context': string[];
  id: string;
  verificationMethod?: VerificationMethod2[];
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
