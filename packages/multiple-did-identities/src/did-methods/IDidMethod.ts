import { JWK } from 'jose';
import { DIDMethodName, PurposeCode } from './DidMethodFactory';

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

export interface DIDKeyPairMethod2 {
  did: string;
  didDocument: DIDDocumentMethod2;
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