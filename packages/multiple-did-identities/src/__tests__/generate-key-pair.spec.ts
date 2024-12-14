import {
  generateKeyPairs,
  generateKeyPairsED25519,
  generateKeyPairsX25519,
} from '../utils/generateKeyPairs';
import { validateKeyPair, validateKeyPair2 } from './validateKeyPair';

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
