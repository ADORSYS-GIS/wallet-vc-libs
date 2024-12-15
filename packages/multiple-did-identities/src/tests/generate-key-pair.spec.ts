import { JWKKeys, PrivateKeyJWK } from '../did-methods/IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import {
  generateKeyPairs,
  generateKeyPairsED25519,
  generateKeyPairsX25519,
  validateNumKeys,
} from '../utils/generateKeyPairs';

 function validateKeyPair({
  rawPublicKey,
  rawPrivateKey,
  publicKeyJwk,
  privateKeyJwk,
}: {
  rawPublicKey: Uint8Array;
  rawPrivateKey: Uint8Array;
  publicKeyJwk: JWKKeys;
  privateKeyJwk: JWKKeys;
}, crv: string ) {
  // Validate raw keys
  expect(rawPublicKey).toBeInstanceOf(Uint8Array);
  expect(rawPrivateKey).toBeInstanceOf(Uint8Array);

  // Validate JWK structures
  expect(publicKeyJwk).toMatchObject<JWKKeys>({
    kty: 'OKP',
    crv,
    x: base64UrlEncode(rawPublicKey),
  });

  expect(privateKeyJwk).toMatchObject<JWKKeys>({
    kty: 'OKP',
    crv,
    x: base64UrlEncode(rawPublicKey),
    d: base64UrlEncode(rawPrivateKey),
  });
}

function validateKeyPair2({
  rawPublicKey,
  rawPrivateKey,
  publicKeyJwk,
  privateKeyJwk,
}: {
  rawPublicKey: Uint8Array;
  rawPrivateKey: Uint8Array;
  publicKeyJwk: JWKKeys;
  privateKeyJwk: PrivateKeyJWK;
}, crv: string, keyId: string) {
  // Validate raw keys
  expect(rawPublicKey).toBeInstanceOf(Uint8Array);
  expect(rawPrivateKey).toBeInstanceOf(Uint8Array);

  // Validate JWK structures
  expect(publicKeyJwk).toMatchObject<JWKKeys>({
    kty: 'OKP',
    crv,
    x: base64UrlEncode(rawPublicKey),
  });

  // Additional validation for privateKeyJwk structure
  expect(privateKeyJwk).toMatchObject({
    id: keyId,
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv,
      d: base64UrlEncode(rawPrivateKey),
      x: base64UrlEncode(rawPublicKey),
    },
  });
}

describe('generateKeyPairs', () => {
  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairs(numKeys);

    validateKeyPair(keys[0], 'Ed25519');
  });

  it('should produce distinct key pairs for each iteration', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairs(numKeys);

    // Ensure each key pair is unique
    const [firstKeyPair, secondKeyPair] = keys;
    expect(firstKeyPair.rawPublicKey).not.toEqual(secondKeyPair.rawPublicKey);
    expect(firstKeyPair.rawPrivateKey).not.toEqual(secondKeyPair.rawPrivateKey);
    expect(firstKeyPair.publicKeyJwk).not.toEqual(secondKeyPair.publicKeyJwk);
    expect(firstKeyPair.privateKeyJwk).not.toEqual(secondKeyPair.privateKeyJwk);
  });
});

describe('generateKeyPairsED25519', () => {
  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairsED25519(numKeys);

    validateKeyPair2(keys[0], 'Ed25519', '#key-1');
  });
});

describe('generateKeyPairsX25519', () => {
  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairsX25519(numKeys);

    validateKeyPair2(keys[0], 'X25519', '#key-2');
  });
});

describe('validateNumKeys', () => {
  test('throws error for negative numbers', () => {
    expect(() => validateNumKeys(-1)).toThrow('Invalid input: numKeys must be a positive integer.');
  });

  test('throws error for zero', () => {
    expect(() => validateNumKeys(0)).toThrow('Invalid input: numKeys must be a positive integer.');
  });

  test('throws error for non-integer values', () => {
    expect(() => validateNumKeys(1.5)).toThrow('Invalid input: numKeys must be a positive integer.');
  });

  test('does not throw error for positive integers', () => {
    expect(() => validateNumKeys(5)).not.toThrow();
  });
});