import { DidPeerMethod } from '../did-methods/DidPeerMethod';
import type { DIDKeyPairMethod3 } from '../did-methods/IDidMethod';

describe('DidPeerMethod', () => {
  let didPeerMethod: DidPeerMethod;

  beforeEach(() => {
    didPeerMethod = new DidPeerMethod();
  });

  test('should generate a valid DIDKeyPairMethod3 for method 3', async () => {
    // Generate method 3 DID
    const result: DIDKeyPairMethod3 = await didPeerMethod.generateMethod3();

    // Assertions for method 3
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKeyV');
    expect(result).toHaveProperty('publicKeyV');
    expect(result).toHaveProperty('privateKeyE');
    expect(result).toHaveProperty('publicKeyE');

    // Check the DID format
    expect(result.did).toMatch(/^did:peer:3/); // Ensure the DID starts with 'did:peer:3'

    // Validate the didDocument structure
    expect(result.didDocument).toHaveProperty(
      '@context',
      expect.arrayContaining(['https://www.w3.org/ns/did/v1']),
    );
    expect(result.didDocument).toHaveProperty('id', result.didDocument.id);

    // Verify that the verificationMethod from method 2 is included in the didDocument
    if (result.didDocument.verificationMethod) {
      expect(result.didDocument.verificationMethod).toHaveLength(2); // Should have both keys
      expect(result.didDocument.verificationMethod[0]).toHaveProperty(
        'id',
        '#key-1',
      );
      expect(result.didDocument.verificationMethod[1]).toHaveProperty(
        'id',
        '#key-2',
      );
    } else {
      fail('Services should be defined.');
    }
  });
});
