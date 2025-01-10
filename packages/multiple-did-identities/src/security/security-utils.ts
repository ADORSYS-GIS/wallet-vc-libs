import { JWK } from 'jose';
import { PrivateKeyJWK } from "../did-methods/IDidMethod";
import { base64ToArrayBuffer } from '../utils/base64ToArrayBuffer';

export async function deriveKey(pin: number, salt: Uint8Array) {
    const encoder = new TextEncoder();
    const passphraseBuffer = encoder.encode(JSON.stringify(pin));
    const saltBuffer = salt;

    const key = await crypto.subtle.importKey(
        'raw',
        passphraseBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}


export async function encryptData(pin: number, secrets: JWK | PrivateKeyJWK): Promise<{ salt: Uint8Array, ciphertext: string, iv: Uint8Array }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encryptionKey = await deriveKey(pin, salt);

    // Encode the secrets data into an ArrayBuffer
    const encodedData = new TextEncoder().encode(JSON.stringify(secrets));

    // Generate a random IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));  // AES-GCM typically uses a 12-byte IV

    // Encrypt the data using AES-GCM
    const ciphertextBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        encryptionKey,
        encodedData
    );

    // Convert ciphertext to Base64
    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));

    return { salt, ciphertext, iv };
}

export async function decryptData(
    pin: number,
    salt: Uint8Array,
    iv: Uint8Array,
    ciphertext: string // Base64 string
): Promise<JWK|PrivateKeyJWK> {
    // Derive the decryption key using the PIN and salt
    const decryptionKey = await deriveKey(pin, salt);

    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

    // Decrypt the data using AES-GCM
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        decryptionKey,
        ciphertextBuffer
    );

    // Decode the decrypted data into a JSON object
    const decodedData = new TextDecoder().decode(decryptedData);
    return JSON.parse(decodedData);
}
