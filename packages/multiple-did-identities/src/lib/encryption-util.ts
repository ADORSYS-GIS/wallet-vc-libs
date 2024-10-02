// src/lib/encryption-util.ts

/**
 * encryption-util.ts
 * Provides encryption and decryption utilities using the Web Crypto API.
 */

export type EncryptionResult = {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
};

// The AES encryption key, generated once and reused for all encryption operations.
let encryptionKey: CryptoKey | null = null;

/**
 * Generates random bytes for salt or IV.
 * @param length The number of bytes to generate. Default is 16.
 * @returns A Uint8Array containing random bytes.
 */
export function generateRandomBytes(length: number = 16): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Initializes the encryption key using AES-CBC.
 * This function generates a new AES key only once.
 * Must be called before performing any encryption or decryption.
 */
export async function initializeEncryptionKey(): Promise<void> {
  if (!encryptionKey) {
    encryptionKey = await crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256, // 256-bit key length
      },
      true, // The key is extractable (could be false if you don't want to export the key)
      ['encrypt', 'decrypt'],
    );
  }
}

/**
 * Encrypts data using AES-CBC.
 * @param data The data to encrypt as Uint8Array.
 * @returns An object containing the encrypted data and the IV used.
 */
export async function encryptData(data: Uint8Array): Promise<EncryptionResult> {
  if (!encryptionKey) {
    throw new Error(
      'Encryption key not initialized. Call initializeEncryptionKey first.',
    );
  }

  const iv = generateRandomBytes(); // Generate a random IV for each encryption operation
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    encryptionKey,
    data,
  );

  return { encryptedData, iv };
}

/**
 * Decrypts data using AES-CBC.
 * @param encryptedData The encrypted data as an ArrayBuffer.
 * @param iv The Initialization Vector used during encryption.
 * @returns The decrypted data as Uint8Array.
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
): Promise<Uint8Array> {
  if (!encryptionKey) {
    throw new Error(
      'Encryption key not initialized. Call initializeEncryptionKey first.',
    );
  }

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    encryptionKey,
    encryptedData,
  );

  return new Uint8Array(decryptedData);
}
