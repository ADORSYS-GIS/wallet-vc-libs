import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { createHash } from 'crypto';
import { JWK } from 'jose';
import { base64UrlEncode, base64UrlEncodeService } from '../utils/base64UrlEncode';
import { concatenateKeyStrings } from '../utils/concatenateKeyStrings';
import { convertServiceToAbbreviatedFormat } from '../utils/convertServiceToAbbreviatedFormat';
import { DIDKeyPairVariants, DIDMethodName, PeerGenerationMethod, PurposeCode } from './DidMethodFactory';
import { DIDDocumentMethod2, DIDKeyPair, DIDKeyPairMethod1, DIDKeyPairMethod2, IDidMethod, Service, VerificationMethod2 } from './IDidMethod';

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
  async generate(methodType?: PeerGenerationMethod): Promise<DIDKeyPairVariants> {
    switch (methodType) {
      case 'method0':
        return this.generateMethod0();
      case 'method1':
        return this.generateMethod1();
      case 'method2':
        return this.generateMethod2();
      // case 'method3':
      //   return this.generateMethod3();
      // case 'method4':
      //   return this.generateMethod4();
      default:
        // Handle case when methodType is not specified or is invalid
        throw new Error(`Unsupported method type: ${methodType}`);
    }
  }


  public async generateMethod0(): Promise<DIDKeyPair> {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);

    // Convert keys to JWK format
    const publicKeyJwk: JWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKey),
    };

    const privateKeyJwk: JWK = {
      ...publicKeyJwk,
      d: base64UrlEncode(privateKey),
    };

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyBase58 = bs58.encode([...ED25519_PUB_CODE, ...publicKey]);

    // Construct the DID:key identifier
    const did = `did:peer:0z${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }

  public async generateMethod1(): Promise<DIDKeyPairMethod1> {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);

    const publicKeyJwk: JWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKey),
    };

    const privateKeyJwk: JWK = {
      ...publicKeyJwk,
      d: base64UrlEncode(privateKey),
    }

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyBase58 = bs58.encode([...ED25519_PUB_CODE, ...publicKey]);
    const publicKeyMultibase = `z${publicKeyBase58}`;

    // Create the genesis document (stored variant) without the DID
    const genesisDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      verificationMethod: [
        {
          id: '#id',
          type: 'Ed25519VerificationKey',
          controller: '#id',
          publicKey: publicKeyMultibase,
        },
      ],
    };

    // Hash the serialized genesis document
    const genesisDocumentString = JSON.stringify(genesisDocument);
    const hashBuffer = createHash('sha256').update(genesisDocumentString).digest();

    // Encode the hash with base58 to use in the DID
    const didNumericBasis = bs58.encode(hashBuffer);
    const did = `did:peer:1z${didNumericBasis}`;

    // Return DID, key pair, and genesis document for reference
    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
      genesisDocument: genesisDocument,
    };

  }

  public async generateMethod2(): Promise<DIDKeyPairMethod2> {
    const privateKeyV = ed25519.utils.randomPrivateKey();
    const publicKeyV = ed25519.getPublicKey(privateKeyV);

    const privateKeyE = ed25519.utils.randomPrivateKey();
    const publicKeyE = ed25519.getPublicKey(privateKeyE);

    const publicKeyJwkV: JWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKeyV),
    };

    const privateKeyJwkV: JWK = {
      ...publicKeyJwkV,
      d: base64UrlEncode(privateKeyV),
    };

    const publicKeyJwkE: JWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKeyE),
    };

    const privateKeyJwkE: JWK = {
      ...publicKeyJwkE,
      d: base64UrlEncode(privateKeyE),
    };

    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);
    const publicKeyVBase58 = bs58.encode([...ED25519_PUB_CODE, ...publicKeyV]);
    const publicKeyEBase58 = bs58.encode([...ED25519_PUB_CODE, ...publicKeyE]);

    const publicKeyMultibaseV = `z${publicKeyVBase58}`;
    const publicKeyMultibaseE = `z${publicKeyEBase58}`;

    const purposepublicKeyMultibaseV = `.${PurposeCode.Verification}${publicKeyMultibaseV}`;
    const purposepublicKeyMultibaseE = `.${PurposeCode.Encryption}${publicKeyMultibaseE}`;

    const keysArray = [purposepublicKeyMultibaseV, purposepublicKeyMultibaseE];
    const concatPurposeKeys = concatenateKeyStrings(...keysArray);

    // Define a service endpoint
    const service: Service[] = [
      {
        type: 'DIDCommMessaging',
        serviceEndpoint: {
          uri: 'http://example.com/didcomm',
          accept: ['didcomm/v2'],
          routingKeys: [`did:peer:2${concatPurposeKeys}#key-1`]
        }
      }
    ];

    const encodedServices: string[] = []
    // Iterate through each service, convert and encode
    for (const svc of service) {
      const abbreviatedService = convertServiceToAbbreviatedFormat(svc);
      const jsonString = JSON.stringify(abbreviatedService);

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
        publicKeyMultibase: publicKeyMultibaseV
      },
      {
        id: '#key-2',
        controller: did,
        type: 'Multikey',
        publicKeyMultibase: publicKeyMultibaseE
      }
    ];

    // Build the DID document
    const didDocument: DIDDocumentMethod2 = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      verificationMethod: verificationMethod,
      service: service
    };

    return {
      did: did,
      didDocument: didDocument,
      privateKeyV: privateKeyJwkV,
      publicKeyV: publicKeyJwkV,
      privateKeyE: privateKeyJwkE,
      publicKeyE: publicKeyJwkE,
    };
  }

}
