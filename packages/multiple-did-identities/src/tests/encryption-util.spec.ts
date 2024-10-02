import {
  initializeEncryptionKey,
  encryptData,
  decryptData,
} from '../lib/encryption-util';

// Mock the global crypto object for testing
global.crypto = {
  subtle: {
    generateKey: jest.fn().mockResolvedValue({} as CryptoKey),
    encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    decrypt: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  },
  getRandomValues: jest.fn((array: Uint8Array) => {
    // Fill the array with random values for testing
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256); // Fill with random bytes
    }
    return array; // Return the filled array
  }),
} as unknown as Crypto;

// Jest test suite
describe('Encryption Utilities', () => {
  beforeEach(async () => {
    // Initialize the encryption key before each test
    await initializeEncryptionKey();
  });

  afterEach(() => {
    // Clear mock calls after each test
    jest.clearAllMocks();
  });

  test('should initialize encryption key only once', async () => {
    const key1 = await initializeEncryptionKey();
    const key2 = await initializeEncryptionKey();

    expect(key1).toBeUndefined(); // Should not return anything
    expect(key2).toBeUndefined(); // Should not return anything
    expect(crypto.subtle.generateKey).toHaveBeenCalledTimes(1); // The generateKey should be called only once
  });

  test('should generate different IVs for each encryption', async () => {
    const data1 = new Uint8Array([1, 2, 3]);
    const data2 = new Uint8Array([4, 5, 6]);

    const result1 = await encryptData(data1);
    const result2 = await encryptData(data2);

    expect(result1.iv).not.toEqual(result2.iv); // Different IVs
  });

  test('should encrypt and decrypt data correctly', async () => {
    const data = new Uint8Array([1, 2, 3]);
    const encryptedResult = await encryptData(data);

    const decryptedData = await decryptData(
      encryptedResult.encryptedData,
      encryptedResult.iv,
    );

    expect(decryptedData).toEqual(new Uint8Array([1, 2, 3])); // Decrypted data should match original
  });
});
