import { JWKKeys, PrivateKeyJWK } from "../did-methods/IDidMethod";

export async function encryptWithWebAuthnPublicKey(
    publicKey: CryptoKey,
    privateKey: JWKKeys | PrivateKeyJWK,
) {
    const privateKeyString = JSON.stringify(privateKey);
    const encodedPrivateKey = new TextEncoder().encode(privateKeyString);
    // Encrypt the data using the WebAuthn public key
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP", // Asymmetric encryption algorithm
        },
        publicKey,
        encodedPrivateKey
    );

    return encryptedData; // encrypted data as an ArrayBuffer
}
