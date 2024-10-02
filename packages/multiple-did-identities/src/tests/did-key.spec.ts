import { generateDidKey } from '../lib/did-key-generator';
import * as ed from 'noble-ed25519';

describe('generateDidKey', () => {
  it('should generate a valid DID:key', async () => {
    const { did, publicKey, privateKey } = await generateDidKey();

    // Check if the DID starts with 'did:key:'
    expect(did).toMatch(/^did:key:/);

    // Check if the public key is a Buffer or Uint8Array
    expect(publicKey).toBeInstanceOf(Uint8Array);

    // Ensure the private key is also a Buffer or Uint8Array
    expect(privateKey).toBeInstanceOf(Uint8Array);
  });

  it('should generate unique keys on subsequent calls', async () => {
    const key1 = await generateDidKey();
    const key2 = await generateDidKey();

    // Ensure that two different keys are not the same
    expect(key1.did).not.toEqual(key2.did);
    expect(key1.publicKey).not.toEqual(key2.publicKey);
    expect(key1.privateKey).not.toEqual(key2.privateKey);
  });

  it('should generate a DID:key of valid length', async () => {
    const { did } = await generateDidKey();

    // Check if the DID:key has a valid length
    expect(did.length).toBeGreaterThan(20); // Adjust the length as per your requirements
  });

  it('should generate a valid key pair', async () => {
    const { publicKey, privateKey } = await generateDidKey();

    // Verify that the public key can be derived from the private key
    const derivedPublicKey = await ed.getPublicKey(privateKey);
    expect(publicKey).toEqual(derivedPublicKey);
  });
});
