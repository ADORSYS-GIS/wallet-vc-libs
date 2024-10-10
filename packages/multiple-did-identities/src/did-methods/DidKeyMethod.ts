import * as ed from '@noble/ed25519';
import { base58btc } from 'multiformats/bases/base58';
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
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKey(privateKey);

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

    // Encode the public key using base58btc directly
    const publicKeyBase58 = base58btc.encode(publicKey);

    // Construct the DID:key identifier
    const did = `did:key:${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }
}
