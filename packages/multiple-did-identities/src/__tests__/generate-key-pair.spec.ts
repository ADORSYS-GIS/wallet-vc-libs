import { JWKKeys } from '../did-methods/IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import {
  generateKeyPairs,
  generateKeyPairsED25519,
  generateKeyPairsX25519,
} from '../utils/generateKeyPairs';

describe('generateKeyPairs', () => {
  it('should generate the correct number of key pairs', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairs(numKeys);

    expect(keys).toHaveLength(numKeys);
  });

  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairs(numKeys);
    const { rawPublicKey, rawPrivateKey, publicKeyJwk, privateKeyJwk } =
      keys[0];

    // Check that raw keys are Uint8Arrays
    expect(rawPublicKey).toBeInstanceOf(Uint8Array);
    expect(rawPrivateKey).toBeInstanceOf(Uint8Array);

    // Check JWK structure
    expect(publicKeyJwk).toMatchObject<JWKKeys>({
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(rawPublicKey),
    });
    expect(privateKeyJwk).toMatchObject<JWKKeys>({
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(rawPublicKey),
      d: base64UrlEncode(rawPrivateKey),
    });
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
  it('should generate the correct number of key pairs', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairsED25519(numKeys);

    // Check the number of generated keys
    expect(keys).toHaveLength(numKeys);
  });

  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairsED25519(numKeys);
    const { rawPublicKey, rawPrivateKey, publicKeyJwk, privateKeyJwk } =
      keys[0];

    // Check that raw keys are Uint8Arrays
    expect(rawPublicKey).toBeInstanceOf(Uint8Array);
    expect(rawPrivateKey).toBeInstanceOf(Uint8Array);

    // Validate publicKeyJwk
    expect(publicKeyJwk).toMatchObject({
      kty: 'OKP',
      crv: 'Ed25519',
      x: base64UrlEncode(rawPublicKey),
    });

    // Validate privateKeyJwk
    expect(privateKeyJwk).toMatchObject({
      id: '#key-1',
      type: 'JsonWebKey2020',
      privateKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: base64UrlEncode(rawPrivateKey),
        x: base64UrlEncode(rawPublicKey),
      },
    });
  });

  it('should produce distinct key pairs for each iteration', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairsED25519(numKeys);

    // Ensure each key pair is unique
    const [firstKeyPair, secondKeyPair] = keys;

    // Raw keys must be unique
    expect(firstKeyPair.rawPublicKey).not.toEqual(secondKeyPair.rawPublicKey);
    expect(firstKeyPair.rawPrivateKey).not.toEqual(secondKeyPair.rawPrivateKey);

    // JWK representations must also be unique
    expect(firstKeyPair.publicKeyJwk).not.toEqual(secondKeyPair.publicKeyJwk);
    expect(firstKeyPair.privateKeyJwk).not.toEqual(secondKeyPair.privateKeyJwk);
  });
});

describe('generateKeyPairsX25519', () => {
  it('should generate the correct number of key pairs', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairsX25519(numKeys);

    // Verify the correct number of keys
    expect(keys).toHaveLength(numKeys);
  });

  it('should generate valid key pairs with raw keys and JWK representations', async () => {
    const numKeys = 1;
    const keys = await generateKeyPairsX25519(numKeys);
    const { rawPublicKey, rawPrivateKey, publicKeyJwk, privateKeyJwk } =
      keys[0];

    // Verify that raw keys are Uint8Arrays
    expect(rawPublicKey).toBeInstanceOf(Uint8Array);
    expect(rawPrivateKey).toBeInstanceOf(Uint8Array);

    // Verify the structure of the publicKeyJwk
    expect(publicKeyJwk).toMatchObject({
      kty: 'OKP',
      crv: 'X25519',
      x: base64UrlEncode(rawPublicKey),
    });

    // Verify the structure of the privateKeyJwk
    expect(privateKeyJwk).toMatchObject({
      id: '#key-2',
      type: 'JsonWebKey2020',
      privateKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        d: base64UrlEncode(rawPrivateKey),
        x: base64UrlEncode(rawPublicKey),
      },
    });
  });

  it('should produce distinct key pairs for each iteration', async () => {
    const numKeys = 2;
    const keys = await generateKeyPairsX25519(numKeys);

    // Ensure distinct key pairs
    const [firstKeyPair, secondKeyPair] = keys;

    // Raw keys should be unique
    expect(firstKeyPair.rawPublicKey).not.toEqual(secondKeyPair.rawPublicKey);
    expect(firstKeyPair.rawPrivateKey).not.toEqual(secondKeyPair.rawPrivateKey);

    // JWK representations should also be unique
    expect(firstKeyPair.publicKeyJwk).not.toEqual(secondKeyPair.publicKeyJwk);
    expect(firstKeyPair.privateKeyJwk).not.toEqual(secondKeyPair.privateKeyJwk);
  });
});
