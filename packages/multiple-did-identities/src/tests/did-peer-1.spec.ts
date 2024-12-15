import { DidPeerMethod } from '../did-methods/DidPeerMethod'; // Adjust the import based on your file structure
import { DIDKeyPairMethod1 } from '../did-methods/IDidMethod';

describe('DID Peer Method 1', () => {
  let didPeerMethod: DidPeerMethod;

  beforeEach(() => {
    didPeerMethod = new DidPeerMethod();
  });
  it('should generate a valid DID and key pair', async () => {
    const result: DIDKeyPairMethod1 = await didPeerMethod.generateMethod1();

    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('privateKey');
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('genesisDocument');

    // Check if DID starts with 'did:peer:0z'
    expect(result.did).toMatch(/^did:peer:1z/);

    // Check genesisDocument structure and content
    const genesisDocument = result.genesisDocument;
    expect(genesisDocument).toHaveProperty('@context');
    expect(Array.isArray(genesisDocument['@context'])).toBe(true);
    expect(genesisDocument['@context']).toContain(
      'https://www.w3.org/ns/did/v1',
    );

    expect(genesisDocument).toHaveProperty('verificationMethod');
    expect(Array.isArray(genesisDocument.verificationMethod)).toBe(true);
    expect(genesisDocument.verificationMethod.length).toBe(1);

    // Validate verificationMethod entry
    const verificationMethod = genesisDocument.verificationMethod[0];
    expect(verificationMethod).toHaveProperty('id', '#id');
    expect(verificationMethod).toHaveProperty('controller', '#id');
    expect(verificationMethod).toHaveProperty(
      'type',
      'Ed25519VerificationKey2018',
    );
    expect(verificationMethod).toHaveProperty('publicKeyMultibase');

    // Check if publicKey in genesis document starts with 'z'
    expect(verificationMethod.publicKeyMultibase).toMatch(/^z/);
  });
});
