import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { createHash } from 'crypto';
import { JWK } from 'jose';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import { DIDKeyPairVariants, DIDMethodName, PeerGenerationMethod } from './DidMethodFactory';
import { DIDKeyPair, IDidMethod } from './IDidMethod';

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
      // case 'method2':
      //   return this.generateMethod2();
      // case 'method3':
      //   return this.generateMethod3();
      // case 'method4':
      //   return this.generateMethod4();
      default:
        // Handle case when methodType is not specified or is invalid
        throw new Error(`Unsupported method type: ${methodType}`);
    }
  }


  private async generateMethod0(): Promise<DIDKeyPair> {
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

    // Define the Multicodec Prefix for Ed25519 Public Key
    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);

    // Encode the public key using bs58 directly
    const publicKeyBase58 = bs58.encode([...ED25519_PUB_CODE, ...publicKey]);

    // Construct the DID:key identifier
    const did = `did:peer:0z${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }

  private async generateMethod1(): Promise<DIDKeyPairVariants> {
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
    };

    // Create the genesis document (stored variant) without the DID
    const genesisDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      verificationMethod: [
        {
          id: '#id',
          type: 'Ed25519VerificationKey2020',
          controller: '#id',
          publicKeyJwk: publicKeyJwk,
        },
      ],
      authentication: ['#id'],
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

  // private async generateMethod2(): Promise<DIDKeyPair> {

  // }

}
