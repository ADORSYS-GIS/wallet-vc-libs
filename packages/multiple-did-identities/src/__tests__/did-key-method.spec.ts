import { DidKeyMethod } from '../did-methods/DidKeyMethod';

describe('DidKeyMethod', () => {
    it('should generate a valid DID:key identifier and JWK keys', async () => {

        const didKeyMethod = new DidKeyMethod();

        const didKeyPair = await didKeyMethod.generate();

        // Check if the DID and key pair are generated
        expect(didKeyPair).toHaveProperty('did');

        // Log the generated DID
        console.log('Generated DID:', didKeyPair.did);

        // Validate that the DID is in the correct format
        expect(didKeyPair.did).toMatch(/^did:key:z[1-9A-HJ-NP-Za-km-z]+$/);

        // Validate the publicKey JWK format
        const publicKey = didKeyPair.publicKey;
        expect(publicKey).toHaveProperty('kty', 'OKP');
        expect(publicKey).toHaveProperty('crv', 'Ed25519');
        expect(publicKey).toHaveProperty('x');
        expect(typeof publicKey.x).toBe('string');

        // Validate the privateKey JWK format
        const privateKey = didKeyPair.privateKey;
        expect(privateKey).toHaveProperty('kty', 'OKP');
        expect(privateKey).toHaveProperty('crv', 'Ed25519');
        expect(privateKey).toHaveProperty('x');
        expect(privateKey).toHaveProperty('d');
        expect(typeof privateKey.x).toBe('string');
        expect(typeof privateKey.d).toBe('string');

        // Log the public and private JWK keys for further inspection
        console.log('Public Key JWK:', JSON.stringify(publicKey, null, 2));
        console.log('Private Key JWK:', JSON.stringify(privateKey, null, 2));
    });
});
