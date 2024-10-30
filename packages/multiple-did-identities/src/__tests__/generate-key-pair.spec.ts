import { generateKeyPairs } from '../utils/generateKeyPairs';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import { JWKKeys } from '../did-methods/IDidMethod';

describe('generateKeyPairs', () => {
    it('should generate the correct number of key pairs', async () => {
        const numKeys = 2;
        const keys = await generateKeyPairs(numKeys);
        
        expect(keys).toHaveLength(numKeys);
    });

    it('should generate valid key pairs with raw keys and JWK representations', async () => {
        const numKeys = 1;
        const keys = await generateKeyPairs(numKeys);
        const { rawPublicKey, rawPrivateKey, publicKeyJwk, privateKeyJwk } = keys[0];

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
