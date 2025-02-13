import { ed25519, x25519 } from '@noble/curves/ed25519';
import type { JWKKeys, PrivateKeyJWK } from '../did-methods/IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';

export const validateNumKeys = (numKeys: number) => {
  if (!Number.isInteger(numKeys) || numKeys <= 0) {
    throw new Error('Invalid input: numKeys must be a positive integer.');
  }
};

// Function to generate multiple key pairs and include raw and JWK format
export const generateKeyPairs = async (numKeys: number) => {
  validateNumKeys(numKeys);
  const keys: Array<{
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: JWKKeys;
  }> = [];

  for (let i = 0; i < numKeys; i++) {
    // Generate private and public keys
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = await ed25519.getPublicKey(privateKey);

    // Create JWK for public and private keys
    const publicKeyJwk: JWKKeys = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKey),
    };

    const privateKeyJwk: JWKKeys = {
      ...publicKeyJwk,
      d: base64UrlEncode(privateKey),
    };

    // Push raw keys and their JWK representation into keys array
    keys.push({
      rawPublicKey: publicKey,
      rawPrivateKey: privateKey,
      publicKeyJwk,
      privateKeyJwk,
    });
  }

  return keys;
};

// Function to generate multiple ED25519 key pairs and include raw and JWK format
export const generateKeyPairsED25519 = async (numKeys: number) => {
  validateNumKeys(numKeys);
  const pubKeyType = 'JsonWebKey2020';
  const keys: Array<{
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: PrivateKeyJWK;
  }> = [];

  for (let i = 0; i < numKeys; i++) {
    // Generate private and public keys
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = await ed25519.getPublicKey(privateKey);

    // Create JWK for public and private keys
    const publicKeyJwk: JWKKeys = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(publicKey),
    };

    // Create the JWK representation
    const privateKeyJwk: PrivateKeyJWK = {
      id: `#key-1`,
      type: pubKeyType,
      privateKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: base64UrlEncode(privateKey),
        x: base64UrlEncode(publicKey),
      },
    };

    // Push raw keys and their JWK representation into keys array
    keys.push({
      rawPublicKey: publicKey,
      rawPrivateKey: privateKey,
      publicKeyJwk,
      privateKeyJwk,
    });
  }

  return keys;
};

// Function to generate X25519 key pairs
export const generateKeyPairsX25519 = async (numKeys: number) => {
  validateNumKeys(numKeys);
  const pubKeyType = 'JsonWebKey2020';
  const keys: Array<{
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: PrivateKeyJWK;
  }> = [];

  for (let i = 0; i < numKeys; i++) {
    // Generate an X25519 private key
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.scalarMultBase(privateKey);

    // Create JWK for public and private keys
    const publicKeyJwk: JWKKeys = {
      kty: 'OKP',
      crv: 'X25519',
      x: base64UrlEncode(publicKey),
    };

    // Create the JWK representation
    const privateKeyJwk: PrivateKeyJWK = {
      id: `#key-2`,
      type: pubKeyType,
      privateKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        d: base64UrlEncode(privateKey),
        x: base64UrlEncode(publicKey),
      },
    };

    // Add the key to the output array
    keys.push({
      rawPublicKey: publicKey,
      rawPrivateKey: privateKey,
      publicKeyJwk,
      privateKeyJwk,
    });
  }

  return keys;
};
