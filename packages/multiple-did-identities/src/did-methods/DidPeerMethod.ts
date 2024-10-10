// src/did-methods/DidPeerMethod.ts
import * as ed from '@noble/ed25519';
import { base58btc } from 'multiformats/bases/base58';
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
    const privateKey = ed.utils.randomPrivateKey(); // Uint8Array
    const publicKey = await ed.getPublicKey(privateKey); // Uint8Array

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

    // Encode the prefixed public key using multibase (base58btc)
    const publicKeyBase58 = base58btc.encode(prefixedPublicKey); // Uint8Array

    // Construct the DID:peer identifier
    const did = `did:peer:${publicKeyBase58}`;

    return {
      did,
      privateKey: privateKeyJwk,
      publicKey: publicKeyJwk,
    };
  }
}
