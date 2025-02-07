import { DID2Type } from '../did-methods/DidMethodFactory';
import type {
  DIDKeyPair,
  DIDKeyPairMethod1,
  DIDKeyPairMethod2,
  DIDKeyPairMethod3,
  DIDKeyPairMethod4,
} from '../did-methods/IDidMethod';

export const mockDidKeyPair = (did: string): DIDKeyPair => ({
  did,
  privateKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey',
    d: 'mockPrivateKey',
  },
  publicKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey',
  },
});

export const createMockDIDPeer1 = (did: string): DIDKeyPairMethod1 => ({
  did,
  privateKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey',
    d: 'mockPrivateKey',
  },
  publicKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey',
  },
  genesisDocument: {
    '@context': ['https://www.w3.org/ns/did/v1'],
    verificationMethod: [
      {
        id: '#id',
        controller: '#id',
        type: 'Ed25519VerificationKey2018',
        publicKeyMultibase: 'ziEudjdi38RG34SWr87yrhfiweFDjFoHiR',
      },
    ],
  },
});

export const mockDIDPeer2Fixture: DIDKeyPairMethod2 = {
  did: 'did:peer:2z1234567890',
  type: DID2Type.Mediator,
  didDocument: {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
    ],
    id: 'did:peer:2z1234567890',
    verificationMethod: [
      {
        id: '#key-1',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseV',
      },
      {
        id: '#key-2',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseE',
      },
    ],
    authentication: [`#key-1`],
    keyAgreement: [`#key-2`],
    service: [
      {
        id: '#didcommmessaging',
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: 'http://example.com/didcomm',
          accept: ['didcomm/v2'],
          routingKeys: [],
        },
      },
    ],
  },
  privateKeyV: {
    id: 'did:peer:2z1234567890#key-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'Ed25519',
      d: 'mockPrivateKeyV',
      x: 'mockPublicKeyV',
    },
  },
  publicKeyV: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKeyV',
  },
  privateKeyE: {
    id: 'did:peer:2z1234567890#key-2',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'X25519',
      d: 'mockPrivateKeyE',
      x: 'mockPublicKeyE',
    },
  },
  publicKeyE: {
    kty: 'OKP',
    crv: 'X25519',
    x: 'mockPublicKeyE',
  },
};

export const mockDIDPeer2FixturePeerContact: DIDKeyPairMethod2 = {
  did: 'did:peer:2z1234567890',
  type: DID2Type.PeerContact,
  didDocument: {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
    ],
    id: 'did:peer:2z1234567890',
    verificationMethod: [
      {
        id: '#key-1',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseV',
      },
      {
        id: '#key-2',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseE',
      },
    ],
    authentication: [`#key-1`],
    keyAgreement: [`#key-2`],
    service: [
      {
        id: '#didcommmessaging',
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: 'http://example.com/didcomm',
          accept: ['didcomm/v2'],
          routingKeys: [],
        },
      },
    ],
  },
  privateKeyV: {
    id: 'did:peer:2z1234567890#key-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'Ed25519',
      d: 'mockPrivateKeyV',
      x: 'mockPublicKeyV',
    },
  },
  publicKeyV: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKeyV',
  },
  privateKeyE: {
    id: 'did:peer:2z1234567890#key-2',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'X25519',
      d: 'mockPrivateKeyE',
      x: 'mockPublicKeyE',
    },
  },
  publicKeyE: {
    kty: 'OKP',
    crv: 'X25519',
    x: 'mockPublicKeyE',
  },
};

export const mockDIDPeer3Fixture: DIDKeyPairMethod3 = {
  did: 'did:peer:3z1234567890',
  didDocument: {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
    ],
    id: 'did:peer:2z1234567890',
    verificationMethod: [
      {
        id: '#key-1',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseV',
      },
      {
        id: '#key-2',
        controller: 'did:peer:2z1234567890',
        type: 'Multikey',
        publicKeyMultibase: 'z...publicKeyMultibaseE',
      },
    ],
    authentication: [`#key-1`],
    keyAgreement: [`#key-2`],
    service: [
      {
        id: '#didcommmessaging',
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: 'http://example.com/didcomm',
          accept: ['didcomm/v2'],
          routingKeys: [],
        },
      },
    ],
  },
  privateKeyV: {
    id: 'did:peer:3z1234567890#key-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'Ed25519',
      d: 'mockPrivateKeyV',
      x: 'mockPublicKeyV',
    },
  },
  publicKeyV: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKeyV',
  },
  privateKeyE: {
    id: 'did:peer:3z1234567890#key-2',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'X25519',
      d: 'mockPrivateKeyE',
      x: 'mockPublicKeyE',
    },
  },
  publicKeyE: {
    kty: 'OKP',
    crv: 'X25519',
    x: 'mockPublicKeyE',
  },
};

export const mockDIDPeer4Fixture: DIDKeyPairMethod4 = {
  did: 'did:peer:4z123hashedDoc:encodedDoc',
  didShort: 'did:peer:4z123hashedDoc',
  didDocument: {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2018/v1',
    ],
    verificationMethod: [
      {
        id: '#key-1',
        controller: '#didcontroller',
        type: 'Ed25519VerificationKey2018',
        publicKeyMultibase: 'z...publicKeyMultibaseKey1',
      },
      {
        id: '#key-2',
        controller: '#didcontroller',
        type: 'Ed25519VerificationKey2018',
        publicKeyMultibase: 'z...publicKeyMultibaseKey2',
      },
    ],
    service: [
      // Mock services here if required based on your structure
    ],
  },
  privateKey1: {
    kty: 'OKP',
    crv: 'Ed25519',
    d: 'mockPrivateKey1',
    x: 'mockPublicKey1',
  },
  publicKey1: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey1',
  },
  privateKey2: {
    kty: 'OKP',
    crv: 'Ed25519',
    d: 'mockPrivateKey2',
    x: 'mockPublicKey2',
  },
  publicKey2: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'mockPublicKey2',
  },
};
