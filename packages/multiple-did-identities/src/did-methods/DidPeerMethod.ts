import bs58 from 'bs58';
import { createHash } from 'crypto';
import { canonicalize } from 'json-canonicalize';
import { base64UrlEncodeService } from '../utils/base64UrlEncode';
import { concatenateKeyStrings } from '../utils/concatenateKeyStrings';
import { convertServiceToAbbreviatedFormat } from '../utils/convertServiceToAbbreviatedFormat';
import {
  generateKeyPairs,
  generateKeyPairsED25519,
  generateKeyPairsX25519,
} from '../utils/generateKeyPairs';
import {
  DIDKeyPairVariants,
  DIDMethodName,
  PeerGenerationMethod,
  PurposeCode,
} from './DidMethodFactory';
import {
  DIDDocumentMethod2,
  DIDDocumentMethod4,
  DIDKeyPair,
  DIDKeyPairMethod1,
  DIDKeyPairMethod2,
  DIDKeyPairMethod4,
  GenesisDocument,
  IDidMethod,
  Service,
  VerificationMethod2,
  VerificationMethod4,
} from './IDidMethod';

/**
 * DID:peer Method Implementation
 * Generates a DID:peer identifier using the Ed25519 public key in JWK format.
 */
export class DidPeerMethod implements IDidMethod {
  method = DIDMethodName.Peer;

  /**
   * Generates a DIDKeyPair based on the specified generation method.
   * @param methodType - The specific generation method to use for Peer.
   * @returns A Promise that resolves to a DIDKeyPair.
   */
  async generate(
    methodType?: PeerGenerationMethod,
    mediatorRoutingKey?: string,
  ): Promise<DIDKeyPairVariants> {
    const finalmediatorRoutingKey = mediatorRoutingKey ?? '';

    switch (methodType) {
      case 'method0':
        return this.generateMethod0();
      case 'method1':
        return this.generateMethod1();
      case 'method2':
        return this.generateMethod2();
      case 'method2WithMediatorRoutingKey':
        return this.generateMethod2RoutingKey(finalmediatorRoutingKey);
      case 'method3':
        return this.generateMethod3();
      case 'method4':
        return this.generateMethod4();
      default:
        throw new Error(`Unsupported method type: ${methodType}`);
    }
  }

  // DID PEER METHOD 0 (did:peer:0) --------RESOLVABLE
  public async generateMethod0(): Promise<DIDKeyPair> {
    const keyPair = await generateKeyPairs(1);
    const key = keyPair[0];

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyBase58 = bs58.encode([
      ...ED25519_PUB_CODE,
      ...key.rawPublicKey,
    ]);

    // Construct the DID:key identifier
    const did = `did:peer:0z${publicKeyBase58}`;

    return {
      did,
      privateKey: key.privateKeyJwk,
      publicKey: key.publicKeyJwk,
    };
  }

  // DID PEER METHOD 1 (did:peer:1)
  public async generateMethod1(): Promise<DIDKeyPairMethod1> {
    const keyPair = await generateKeyPairs(1);
    const key = keyPair[0];

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyBase58 = bs58.encode([
      ...ED25519_PUB_CODE,
      ...key.rawPublicKey,
    ]);
    const publicKeyMultibase = `z${publicKeyBase58}`;

    // Create the genesis document (stored variant) without the DID
    const genesisDocument: GenesisDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      verificationMethod: [
        {
          id: '#id',
          controller: '#id',
          type: 'Ed25519VerificationKey2018',
          publicKeyMultibase: publicKeyMultibase,
        },
      ],
    };

    // Canonicalize the JSON document to ensure consistent structure for hashing
    const canonicalizedGenesisDocument = canonicalize(genesisDocument);

    // Calculate SHA256 hash
    const hash = createHash('sha256');
    hash.update(canonicalizedGenesisDocument);
    const sha256Hash = hash.digest();

    // Convert SHA256 hash to base58
    const multicodecDescriptor = new Uint8Array([0x12, 0x20]);
    const base58Encoded = bs58.encode([...multicodecDescriptor, ...sha256Hash]);
    const did = `did:peer:1z${base58Encoded}`;

    // Return DID, key pair, and genesis document for reference
    return {
      did: did,
      privateKey: key.privateKeyJwk,
      publicKey: key.publicKeyJwk,
      genesisDocument: genesisDocument,
    };
  }

  // DID PEER METHOD 2 (did:peer:2)-------RESOLVABLE
  public async generateMethod2(): Promise<DIDKeyPairMethod2> {
    const KeyV = (await generateKeyPairsED25519(1))[0];
    const KeyE = (await generateKeyPairsX25519(1))[0];

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const X25519_PUB_CODE = new Uint8Array([0xec, 0x01]);

    const publicKeyMultibaseV = `z${bs58.encode([...ED25519_PUB_CODE, ...KeyV.rawPublicKey])}`;
    const publicKeyMultibaseE = `z${bs58.encode([...X25519_PUB_CODE, ...KeyE.rawPublicKey])}`;

    const purposepublicKeyMultibaseV = `.${PurposeCode.Verification}${publicKeyMultibaseV}`;
    const purposepublicKeyMultibaseE = `.${PurposeCode.Encryption}${publicKeyMultibaseE}`;

    const keysArray = [purposepublicKeyMultibaseV, purposepublicKeyMultibaseE];
    const concatPurposeKeys = concatenateKeyStrings(...keysArray);

    // Define a service endpoint
    const service: Service[] = [
      {
        id: '#didcommmessaging',
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: 'http://example.com/didcomm',
          accept: ['didcomm/v2'],
          routingKeys: [],
        },
      },
    ];

    const encodedServices: string[] = [];
    // Iterate through each service, convert and encode
    for (const svc of service) {
      const abbreviatedService = convertServiceToAbbreviatedFormat(svc);
      const jsonString = canonicalize(abbreviatedService);

      // Encode each abbreviated service individually
      const encodedService = `.${PurposeCode.Service}${base64UrlEncodeService(jsonString)}`;

      // Add the encoded service to the array
      encodedServices.push(encodedService);
    }

    // Concatenate all encoded services into a single string
    const finalEncodedServices = encodedServices.join('');
    const did = `did:peer:2${concatPurposeKeys}${finalEncodedServices}`;

    // Define verification methods
    const verificationMethod: VerificationMethod2[] = [
      {
        id: '#key-1',
        controller: did,
        type: 'Multikey',
        publicKeyMultibase: publicKeyMultibaseV,
      },
      {
        id: '#key-2',
        controller: did,
        type: 'Multikey',
        publicKeyMultibase: publicKeyMultibaseE,
      },
    ];

    // Build the DID document
    const didDocument: DIDDocumentMethod2 = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
      ],
      id: did,
      verificationMethod: verificationMethod,
      authentication: [`#key-1`],
      keyAgreement: [`#key-2`],
      service: service,
    };

    return {
      did: did,
      didDocument: didDocument,
      privateKeyV: KeyV.privateKeyJwk,
      publicKeyV: KeyV.publicKeyJwk,
      privateKeyE: KeyE.privateKeyJwk,
      publicKeyE: KeyE.publicKeyJwk,
    };
  }

  // DID PEER METHOD 2 WITH ROUTING KEY INPUT (did:peer:2)-------RESOLVABLE
  public async generateMethod2RoutingKey(
    mediatorRoutingKey: string,
  ): Promise<DIDKeyPairMethod2> {
    const KeyV = (await generateKeyPairsED25519(1))[0];
    const KeyE = (await generateKeyPairsX25519(1))[0];

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const X25519_PUB_CODE = new Uint8Array([0xec, 0x01]);

    const publicKeyMultibaseV = `z${bs58.encode([...ED25519_PUB_CODE, ...KeyV.rawPublicKey])}`;
    const publicKeyMultibaseE = `z${bs58.encode([...X25519_PUB_CODE, ...KeyE.rawPublicKey])}`;

    const purposepublicKeyMultibaseV = `.${PurposeCode.Verification}${publicKeyMultibaseV}`;
    const purposepublicKeyMultibaseE = `.${PurposeCode.Encryption}${publicKeyMultibaseE}`;

    const keysArray = [purposepublicKeyMultibaseV, purposepublicKeyMultibaseE];
    const concatPurposeKeys = concatenateKeyStrings(...keysArray);

    // Define a service endpoint
    const service: Service[] = [
      {
        id: '#didcommmessaging',
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: mediatorRoutingKey,
          accept: ['didcomm/v2'],
          routingKeys: [],
        },
      },
    ];

    const encodedServices: string[] = [];
    // Iterate through each service, convert and encode
    for (const svc of service) {
      const abbreviatedService = convertServiceToAbbreviatedFormat(svc);
      const jsonString = canonicalize(abbreviatedService);

      // Encode each abbreviated service individually
      const encodedService = `.${PurposeCode.Service}${base64UrlEncodeService(jsonString)}`;

      // Add the encoded service to the array
      encodedServices.push(encodedService);
    }

    // Concatenate all encoded services into a single string
    const finalEncodedServices = encodedServices.join('');
    const did = `did:peer:2${concatPurposeKeys}${finalEncodedServices}`;

    // Define verification methods
    const verificationMethod: VerificationMethod2[] = [
      {
        id: '#key-1',
        controller: did,
        type: 'Multikey',
        publicKeyMultibase: publicKeyMultibaseV,
      },
      {
        id: '#key-2',
        controller: did,
        type: 'Multikey',
        publicKeyMultibase: publicKeyMultibaseE,
      },
    ];

    // Build the DID document
    const didDocument: DIDDocumentMethod2 = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
      ],
      id: did,
      verificationMethod: verificationMethod,
      authentication: [`#key-1`],
      keyAgreement: [`#key-2`],
      service: service,
    };

    return {
      did: did,
      didDocument: didDocument,
      privateKeyV: KeyV.privateKeyJwk,
      publicKeyV: KeyV.publicKeyJwk,
      privateKeyE: KeyE.privateKeyJwk,
      publicKeyE: KeyE.publicKeyJwk,
    };
  }

  // DID PEER METHOD 3 (did:peer:3)
  public async generateMethod3(): Promise<DIDKeyPairMethod2> {
    const method2Result = await this.generateMethod2();
    const didMethod2 = method2Result.did;

    const didWithoutPrefix = didMethod2.replace(/^did:peer:2/, '');
    const hashBuffer = createHash('sha256').update(didWithoutPrefix).digest();
    const encodedHash = `z${bs58.encode(hashBuffer)}`;
    const didMethod3 = `did:peer:3${encodedHash}`;

    return {
      did: didMethod3,
      didDocument: method2Result.didDocument,
      privateKeyV: method2Result.privateKeyV,
      publicKeyV: method2Result.publicKeyV,
      privateKeyE: method2Result.privateKeyE,
      publicKeyE: method2Result.publicKeyE,
    };
  }

  // DID PEER METHOD 4 (did:peer:4)-------RESOLVABLE
  public async generateMethod4(): Promise<DIDKeyPairMethod4> {
    // Generate the specified number of key pairs
    const keyPairs = await generateKeyPairs(2);
    const Key1 = keyPairs[0];
    const Key2 = keyPairs[1];

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyMultibaseKey1 = `z${bs58.encode([...ED25519_PUB_CODE, ...Key1.rawPublicKey])}`;
    const publicKeyMultibaseKey2 = `z${bs58.encode([...ED25519_PUB_CODE, ...Key2.rawPublicKey])}`;

    // Define a service or services
    const service: Service[] = [
      //all services needed will provided here following the structure found in the IDidMethod.ts file
    ];

    const verificationMethod: VerificationMethod4[] = [
      {
        id: '#key-1',
        controller: '#didcontroller',
        type: 'Ed25519VerificationKey2018',
        publicKeyMultibase: publicKeyMultibaseKey1,
      },
      {
        id: '#key-2',
        controller: '#didcontroller',
        type: 'Ed25519VerificationKey2018',
        publicKeyMultibase: publicKeyMultibaseKey2,
      },
    ];

    // Build the DID document
    const didDocument: DIDDocumentMethod4 = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2018/v1',
      ],
      verificationMethod: verificationMethod,
      service: service,
    };

    // Build the long and short form DID
    // Encode the Document
    const didDocumentString = canonicalize(didDocument);
    const jsonBytes = new TextEncoder().encode(didDocumentString);
    const prefixedBytes = new Uint8Array([0x80, 0x04, ...jsonBytes]);
    const encodedDocument = bs58.encode(prefixedBytes);
    const prefixedEncodedDocument = `z${encodedDocument}`; // encoded document

    // Hash the Dcocument
    const hashedDocument = createHash('sha256')
      .update(prefixedEncodedDocument)
      .digest();
    const prefixedHash = new Uint8Array([0x12, 0x20, ...hashedDocument]);
    const encodedHashedDocument = bs58.encode(prefixedHash);
    const prefixedEncodedHashedDocument = `z${encodedHashedDocument}`; // hashed document

    const didLongForm = `did:peer:4${prefixedEncodedHashedDocument}:${prefixedEncodedDocument}`;
    const didShortForm = `did:peer:4${prefixedEncodedHashedDocument}`;
    return {
      did: didLongForm,
      didShort: didShortForm,
      didDocument: didDocument,
      privateKey1: Key1.privateKeyJwk,
      publicKey1: Key1.publicKeyJwk,
      privateKey2: Key2.privateKeyJwk,
      publicKey2: Key2.publicKeyJwk,
    };
  }
}
