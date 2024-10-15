import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { JWK } from 'jose';
import { IDidMethod, DIDKeyPair } from './IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';

/**
 * DID:key Method Implementation
 * Generates a DID:key identifier using the Ed25519 public key.
 */
export class DidKeyMethod implements IDidMethod {
  method = 'key';

  async generate(): Promise<DIDKeyPair> {
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

    // Encode the public key using bs58 directly
    const publicKeyBase58 = bs58.encode(publicKey);

    // Construct the DID:key identifier
    const did = `did:key:${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }
}
