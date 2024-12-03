import { JWKKeys } from '../did-methods/IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import { ed25519 } from '@noble/curves/ed25519';

export const generateKeyPairs = async (numKeys: number) => {
  const keys: Array<{
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: JWKKeys;
  }> = [];

  for (let i = 0; i < numKeys; i++) {
    // Generate private key
    const privateKey = ed25519.utils.randomPrivateKey();

    // Generate corresponding public key (synchronously)
    const publicKey = ed25519.getPublicKey(privateKey);

    // Convert keys to JWK format
    const publicKeyJwk: JWKKeys = {
      kty: 'OKP', // Key Type
      crv: 'Ed25519', // Curve
      x: base64UrlEncode(publicKey), // Public key in Base64 URL-safe encoding
    };

    const privateKeyJwk: JWKKeys = {
      ...publicKeyJwk,
      d: base64UrlEncode(privateKey), // Private key in Base64 URL-safe encoding
    };

    // Store raw and JWK representations
    keys.push({
      rawPublicKey: publicKey,
      rawPrivateKey: privateKey,
      publicKeyJwk,
      privateKeyJwk,
    });
  }

  return keys;
};