import { DidPeerMethod } from '../did-methods/DidPeerMethod'; // Adjust the import based on your file structure
import { DIDKeyPair } from '../did-methods/IDidMethod';


describe('DID Peer Method 0', () => {

    let didPeerMethod: DidPeerMethod;

    beforeEach(() => {
        didPeerMethod = new DidPeerMethod();
    });
    it('should generate a valid DID and key pair', async () => {

        const result: DIDKeyPair = await didPeerMethod.generateMethod0();

        expect(result).toHaveProperty('did');
        expect(result).toHaveProperty('privateKey');
        expect(result).toHaveProperty('publicKey');

        // Check if DID starts with 'did:peer:0z'
        expect(result.did).toMatch(/^did:peer:0z/);

        // Validate the structure of the privateKey and publicKey (JWK format)
        expect(result.privateKey).toHaveProperty('kty', 'OKP');
        expect(result.privateKey).toHaveProperty('crv', 'Ed25519');
        expect(result.publicKey).toHaveProperty('kty', 'OKP');
        expect(result.publicKey).toHaveProperty('crv', 'Ed25519');

        // Validate that the keys are not empty
        expect(result.privateKey.d).toBeDefined();
        expect(result.publicKey.x).toBeDefined();
    });
});
