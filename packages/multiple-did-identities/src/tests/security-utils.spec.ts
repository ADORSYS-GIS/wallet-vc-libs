import { JWK } from 'jose';
import {
  decryptData,
  deriveKey,
  encryptData,
} from '../security/security-utils';

describe('Crypto Utilities', () => {
  const pin = 9023846872;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const sampleSecrets: JWK = {
    kty: 'oct',
    k: 'example-key',
  };

  it('should derive functionally equivalent keys with the same pin and salt', async () => {
    // Derive two keys with the same pin and salt
    const key1 = await deriveKey(pin, salt);
    const key2 = await deriveKey(pin, salt);

    // Test data to encrypt
    const testData = new TextEncoder().encode('verify key equivalence');

    // Encrypt the data using the first key
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key1,
      testData,
    );

    // Decrypt the data using the second key (key2)
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key2,
      ciphertext,
    );

    // Verify the decrypted data matches the original test data
    expect(new TextDecoder().decode(decryptedData)).toEqual(
      'verify key equivalence',
    );
  });

  it('should derive a consistent key with the same pin and salt', async () => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key1 = await deriveKey(pin, salt);
    const key2 = await deriveKey(pin, salt);

    expect(key1).toEqual(key2);
  });

  it('should encrypt and decrypt data correctly', async () => {
    const { salt, ciphertext, iv } = await encryptData(pin, sampleSecrets);
    const decryptedSecrets = await decryptData(pin, salt, iv, ciphertext);

    expect(decryptedSecrets).toEqual(sampleSecrets);
  });

  it('should fail to decrypt with an incorrect pin', async () => {
    const { salt, ciphertext, iv } = await encryptData(pin, sampleSecrets);
    const incorrectPin = 5678;

    await expect(
      decryptData(incorrectPin, salt, iv, ciphertext),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with an incorrect salt', async () => {
    const { ciphertext, iv } = await encryptData(pin, sampleSecrets);
    const incorrectSalt = crypto.getRandomValues(new Uint8Array(16));

    await expect(
      decryptData(pin, incorrectSalt, iv, ciphertext),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with an incorrect IV', async () => {
    const { salt, ciphertext } = await encryptData(pin, sampleSecrets);
    const incorrectIv = crypto.getRandomValues(new Uint8Array(12));

    await expect(
      decryptData(pin, salt, incorrectIv, ciphertext),
    ).rejects.toThrow();
  });
});
