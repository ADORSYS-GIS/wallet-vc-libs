// multiple-did-identities.test.ts
import { DIDManager, DIDIdentity } from '../lib/multiple-did-identities';
import { generateDidKey } from '../lib/did-key-generator';
import { encryptData, initializeEncryptionKey } from '../lib/encryption-util';
import { StorageFactory } from '@adorsys-gis/storage'; // Import StorageFactory

// Mock the necessary modules
jest.mock('../lib/did-key-generator');
jest.mock('../lib/encryption-util');
jest.mock('@adorsys-gis/storage'); //

class MockStorageFactory {
  insert = jest.fn().mockResolvedValue(undefined);
  findOne = jest.fn().mockResolvedValue(null);
  delete = jest.fn().mockResolvedValue(undefined);
}

describe('DIDManager', () => {
  const mockDidKey = {
    did: 'mock-did',
    publicKey: new Uint8Array([1, 2, 3]),
    privateKey: new Uint8Array([4, 5, 6]),
  };

  const mockEncryptedData = new ArrayBuffer(8);
  const mockIV = new Uint8Array([7, 8, 9]);

  let storage: MockStorageFactory;

  beforeEach(() => {
    storage = new MockStorageFactory();

    // Mock implementations
    (initializeEncryptionKey as jest.Mock).mockResolvedValue(undefined);
    (generateDidKey as jest.Mock).mockResolvedValue(mockDidKey);
    (encryptData as jest.Mock).mockResolvedValue({
      encryptedData: mockEncryptedData,
      iv: mockIV,
    });

    // Use jest.spyOn to mock the insert method of StorageFactory
    jest
      .spyOn(StorageFactory.prototype, 'insert')
      .mockImplementation(storage.insert);
    jest
      .spyOn(StorageFactory.prototype, 'findOne')
      .mockImplementation(storage.findOne);
    jest
      .spyOn(StorageFactory.prototype, 'delete')
      .mockImplementation(storage.delete);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore the original implementations after each test
  });

  it('should create and store a new DID identity', async () => {
    const identity: DIDIdentity = await DIDManager.createDidIdentity();

    // Assertions for the created identity
    expect(identity).toHaveProperty('id');
    expect(identity.did).toEqual(mockDidKey.did);
    expect(identity.publicKey).toEqual(mockDidKey.publicKey);
    expect(identity.encryptedPrivateKey).toEqual(mockEncryptedData);
    expect(identity.iv).toEqual(mockIV);
    expect(identity.createdAt).toBeDefined();

    // Check that insert was called with correct arguments
    expect(storage.insert).toHaveBeenCalledWith('dids', {
      key: identity.did,
      value: identity,
    });
  });

  // Test for Retrieving a DID Identity
  it('should retrieve a DID identity', async () => {
    const mockIdentity: DIDIdentity = {
      id: 'uuid-1234',
      did: 'mock-did',
      publicKey: new Uint8Array([1, 2, 3]),
      encryptedPrivateKey: mockEncryptedData,
      iv: mockIV,
      createdAt: new Date().toISOString(),
    };

    // Mock the findOne method to return the mock identity
    storage.findOne.mockResolvedValue({
      key: mockIdentity.did,
      value: mockIdentity,
    });

    const retrievedIdentity = await DIDManager.getDidIdentity('mock-did');

    // Verify that findOne was called with correct arguments
    expect(storage.findOne).toHaveBeenCalledWith('dids', 'mock-did');

    // Verify that the retrieved identity matches the mock
    expect(retrievedIdentity).toEqual(mockIdentity);
  });

  // Test for Retrieving a Non-existent DID Identity
  it('should return null when retrieving a non-existent DID identity', async () => {
    // Mock the findOne method to return null
    storage.findOne.mockResolvedValue(null);

    const retrievedIdentity =
      await DIDManager.getDidIdentity('non-existent-did');

    // Verify that findOne was called with correct arguments
    expect(storage.findOne).toHaveBeenCalledWith('dids', 'non-existent-did');

    // Verify that the retrieved identity is null
    expect(retrievedIdentity).toBeNull();
  });

  // **New Test for Deleting a DID Identity**
  it('should delete a DID identity', async () => {
    await DIDManager.deleteDidIdentity('mock-did');

    // Verify that delete was called with correct arguments
    expect(storage.delete).toHaveBeenCalledWith('dids', 'mock-did');
  });
});
