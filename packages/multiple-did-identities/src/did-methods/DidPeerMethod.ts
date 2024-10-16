import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { JWK } from 'jose';
import { IDidMethod, DIDKeyPair } from './IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';

/**
 * DID:peer Method Implementation
 * Generates a DID:peer identifier using the Ed25519 public key in JWK format.
 */
export class DidPeerMethod implements IDidMethod {
  method = 'peer';

  async generate(): Promise<DIDKeyPair> {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);

    // Convert keys to JWK format
    const publicKeyJwk: JWK = {
      kty: 'OKP', //key type which is the Octet Key type
      crv: 'Ed25519',
      x: base64UrlEncode(publicKey),
    };

    const privateKeyJwk: JWK = {
      ...publicKeyJwk,
      d: base64UrlEncode(privateKey),
    };

    // Define the Multicodec Prefix for Ed25519 Public Key
    const ED25519_PUB_CODE = 0xed; // Multicodec code for Ed25519 public key

    // Prepend the multicodec prefix to the public key
    const prefixedPublicKey = new Uint8Array([ED25519_PUB_CODE, ...publicKey]);

    // Encode the prefixed public key using bs58
    const publicKeyBase58 = bs58.encode(prefixedPublicKey);

    // Construct the DID:peer identifier
    const did = `did:peer:${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }
}
