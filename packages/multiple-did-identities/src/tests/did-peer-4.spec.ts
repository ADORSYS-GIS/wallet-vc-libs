import { DidPeerMethod } from '../did-methods/DidPeerMethod';
import type { DIDKeyPairMethod4 } from '../did-methods/IDidMethod';
describe('DidPeerMethod', () => {
  let didPeerMethod: DidPeerMethod;

  beforeEach(() => {
    didPeerMethod = new DidPeerMethod();
  });

  test('should generate a valid DIDKeyPairMethod4', async () => {
    // Generate method 4 key pair
    const result: DIDKeyPairMethod4 = await didPeerMethod.generateMethod4();

    // Assertions for method 4
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('didShort');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKey1');
    expect(result).toHaveProperty('publicKey1');
    expect(result).toHaveProperty('privateKey2');
    expect(result).toHaveProperty('publicKey2');

    // Check the long form DID format
    expect(result.did).toMatch(/^did:peer:4/); // Ensure the DID starts with 'did:peer:4'
    expect(result.didShort).toMatch(/^did:peer:4/); // Ensure the short DID also starts with 'did:peer:4'

    // Validate the didDocument structure
    expect(result.didDocument).toHaveProperty(
      '@context',
      expect.arrayContaining([
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2018/v1',
      ]),
    );
    expect(result.didDocument).toHaveProperty('verificationMethod');
    expect(result.didDocument.verificationMethod).toHaveLength(2); // Should have two verification methods
    expect(result.didDocument.verificationMethod[0]).toHaveProperty(
      'id',
      '#key-1',
    );
    expect(result.didDocument.verificationMethod[1]).toHaveProperty(
      'id',
      '#key-2',
    );
    expect(result.didDocument.verificationMethod[0]).toHaveProperty(
      'type',
      'Ed25519VerificationKey2018',
    );
    expect(result.didDocument.verificationMethod[1]).toHaveProperty(
      'type',
      'Ed25519VerificationKey2018',
    );
  });
});
