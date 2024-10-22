import { DidMethodFactory, DIDMethodName } from '../did-methods/DidMethodFactory';
import { DidKeyMethod } from '../did-methods/DidKeyMethod';

describe('DidMethodFactory', () => {
    describe('create', () => {
        it('should create an instance of DidKeyMethod when method is key', () => {
            const didMethod = DidMethodFactory.create(DIDMethodName.Key);
            expect(didMethod).toBeInstanceOf(DidKeyMethod);
        });

        it('should throw an error when an unsupported method is provided', () => {
            expect(() => DidMethodFactory.create('invalidMethod' as DIDMethodName)).toThrow(
                'Unsupported DID method: invalidMethod'
            );
        });
    });

    describe('generateDid', () => {
        it('should generate a DID using DidKeyMethod', async () => {
            const result = await DidMethodFactory.generateDid(DIDMethodName.Key);

            // Check that the generated DID is in the expected format
            expect(result.did).toMatch(/^did:key:z[1-9A-HJ-NP-Za-km-z]+$/);
            expect(result.publicKey.kty).toBe('OKP');
            expect(result.publicKey.crv).toBe('Ed25519');
            expect(result.publicKey.x).toBeDefined();
            expect(result.privateKey.d).toBeDefined();
        });

    });
});