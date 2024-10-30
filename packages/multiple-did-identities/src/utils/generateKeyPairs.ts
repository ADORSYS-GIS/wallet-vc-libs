import { JWKKeys } from '../did-methods/IDidMethod';
import { base64UrlEncode } from '../utils/base64UrlEncode';
import { ed25519 } from '@noble/curves/ed25519';

// Function to generate multiple key pairs and include raw and JWK format
export const generateKeyPairs = async (numKeys: number) => {
    const keys: Array<{
        rawPublicKey: Uint8Array;
        rawPrivateKey: Uint8Array;
        publicKeyJwk: JWKKeys;
        privateKeyJwk: JWKKeys;
    }> = [];

    for (let i = 0; i < numKeys; i++) {
        // Generate private and public keys
        const privateKey = ed25519.utils.randomPrivateKey();
        const publicKey = await ed25519.getPublicKey(privateKey);

        // Create JWK for public and private keys
        const publicKeyJwk: JWKKeys = {
            kty: 'OKP',
            crv: 'Ed25519',
            x: base64UrlEncode(publicKey),
        };

        const privateKeyJwk: JWKKeys = {
            ...publicKeyJwk,
            d: base64UrlEncode(privateKey),
        };

        // Push raw keys and their JWK representation into keys array
        keys.push({
            rawPublicKey: publicKey,
            rawPrivateKey: privateKey,
            publicKeyJwk,
            privateKeyJwk
        });
    }

    return keys;
};