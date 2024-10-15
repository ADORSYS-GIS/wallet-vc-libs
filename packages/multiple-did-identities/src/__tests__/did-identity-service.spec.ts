import { EventEmitter } from 'eventemitter3';
import { DIDIdentityService } from '../lib/DIDIdentityService'; // adjust the path as necessary
import { DidMethodFactory } from '../did-methods/DidMethodFactory';
import { DIDKeyPair } from '../did-methods/IDidMethod';
import { DidRepository } from '../repository/DidRepository';
import { DidEventChannel } from '../utils/DidEventChannel';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';

describe('DIDIdentityService', () => {
  let service: DIDIdentityService;
  let mockEventBus: EventEmitter;

  beforeEach(() => {
    mockEventBus = new EventEmitter();
    service = new DIDIdentityService(mockEventBus);

    // Spy on static method DidMetDIDKeyPairhodFactory.generateDid
    jest.spyOn(DidMethodFactory, 'generateDid');

    // Spy on DidRepository prototype methods
    jest.spyOn(DidRepository.prototype, 'createDidId');
    jest.spyOn(DidRepository.prototype, 'deleteDidId');
    jest.spyOn(DidRepository.prototype, 'getADidId');
    jest.spyOn(DidRepository.prototype, 'getAllDidIds');
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations
  });

  describe('createDidIdentity', () => {
    it('should create a DID identity and emit a success event', async () => {
      const method = 'key';
      const mockDidKeyPair: DIDKeyPair = {
        did: 'did:key:123',
        privateKey: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'privateKeyEncoded',
        },
        publicKey: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'publicKeyEncoded',
        },
      };

      const generateDidSpy = DidMethodFactory.generateDid as jest.Mock;
      generateDidSpy.mockResolvedValue(mockDidKeyPair);

      const createDidIdSpy = DidRepository.prototype.createDidId as jest.Mock;
      createDidIdSpy.mockResolvedValue(undefined);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.CreateDidIdentity, eventListener);

      await service.createDidIdentity(method);

      expect(generateDidSpy).toHaveBeenCalledWith(method);
      expect(createDidIdSpy).toHaveBeenCalledWith(mockDidKeyPair, method);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Success,
        payload: { did: mockDidKeyPair.did },
      });
    });

    it('should handle errors and emit an error event when generateDid fails', async () => {
      const method = 'key';
      const mockError = new Error('Failed to generate DID');

      const generateDidSpy = DidMethodFactory.generateDid as jest.Mock;
      generateDidSpy.mockRejectedValue(mockError);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.CreateDidIdentity, eventListener);

      await service.createDidIdentity(method);

      expect(generateDidSpy).toHaveBeenCalledWith(method);
      expect(DidRepository.prototype.createDidId).not.toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Error,
        payload: mockError,
      });
    });

    it('should handle errors and emit an error event when createDidId fails', async () => {
      const method = 'key';
      const mockDidDocument: DIDKeyPair = {
        did: 'did:key:123',
        privateKey: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'privateKeyEncoded',
        },
        publicKey: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'publicKeyEncoded',
        },
      };
      const mockError = new Error('Failed to store DID');

      const generateDidSpy = DidMethodFactory.generateDid as jest.Mock;
      generateDidSpy.mockResolvedValue(mockDidDocument);

      const createDidIdSpy = DidRepository.prototype.createDidId as jest.Mock;
      createDidIdSpy.mockRejectedValue(mockError);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.CreateDidIdentity, eventListener);

      await service.createDidIdentity(method);

      expect(generateDidSpy).toHaveBeenCalledWith(method);
      expect(createDidIdSpy).toHaveBeenCalledWith(mockDidDocument, method);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Error,
        payload: mockError,
      });
    });
  });

  describe('deleteDidIdentity', () => {
    it('should delete a DID identity and emit success events', async () => {
      const did = 'did:key:123';

      const deleteDidIdSpy = DidRepository.prototype.deleteDidId as jest.Mock;
      deleteDidIdSpy.mockResolvedValue(undefined);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.DeleteDidIdentity, eventListener);

      await service.deleteDidIdentity(did);

      expect(deleteDidIdSpy).toHaveBeenCalledWith(did);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Success,
        payload: {
          message: `DID identity with ID ${did} was successfully deleted.`,
          deletedDid: did,
        },
      });
    });

    it('should handle errors and emit an error event when deleteDidId fails', async () => {
      const did = 'did:key:123';
      const mockError = new Error('Failed to delete DID');

      const deleteDidIdSpy = DidRepository.prototype.deleteDidId as jest.Mock;
      deleteDidIdSpy.mockRejectedValue(mockError);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.DeleteDidIdentity, eventListener);

      await service.deleteDidIdentity(did);

      expect(deleteDidIdSpy).toHaveBeenCalledWith(did);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Error,
        payload: mockError,
      });
    });
  });

  describe('findDidIdentity', () => {
    it('should find a DID identity and emit a success event', async () => {
      const did = 'did:key:123';
      const mockDidRecord = { did, method: 'key', createdAt: 1620000000000 };

      const getADidIdSpy = DidRepository.prototype.getADidId as jest.Mock;
      getADidIdSpy.mockResolvedValue(mockDidRecord);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.GetSingleDidIdentity, eventListener);

      await service.findDidIdentity(did);

      expect(getADidIdSpy).toHaveBeenCalledWith(did);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Success,
        payload: mockDidRecord,
      });
    });

    it('should handle errors and emit an error event when getADidId fails', async () => {
      const did = 'did:key:123';
      const mockError = new Error('Failed to find DID');

      const getADidIdSpy = DidRepository.prototype.getADidId as jest.Mock;
      getADidIdSpy.mockRejectedValue(mockError);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.GetSingleDidIdentity, eventListener);

      await service.findDidIdentity(did);

      expect(getADidIdSpy).toHaveBeenCalledWith(did);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Error,
        payload: mockError,
      });
    });

    it('should emit null payload if DID not found', async () => {
      const did = 'did:key:123';

      const getADidIdSpy = DidRepository.prototype.getADidId as jest.Mock;

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.GetSingleDidIdentity, eventListener);

      await service.findDidIdentity(did);

      expect(getADidIdSpy).toHaveBeenCalledWith(did);
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Success,
        payload: null,
      });
    });
  });

  describe('findAllDidIdentities', () => {
    it('should retrieve all DID identities and emit a success event', async () => {
      const mockDidRecords = [
        { did: 'did:key:123', method: 'key', createdAt: 1620000000000 },
        { did: 'did:peer:456', method: 'peer', createdAt: 1620000001000 },
      ];

      const getAllDidIdsSpy = DidRepository.prototype.getAllDidIds as jest.Mock;
      getAllDidIdsSpy.mockResolvedValue(mockDidRecords);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.GetAllDidIdentities, eventListener);

      await service.findAllDidIdentities();

      expect(getAllDidIdsSpy).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Success,
        payload: mockDidRecords,
      });
    });

    it('should handle errors and emit an error event when getAllDidIds fails', async () => {
      const mockError = new Error('Failed to retrieve DIDs');

      const getAllDidIdsSpy = DidRepository.prototype.getAllDidIds as jest.Mock;
      getAllDidIdsSpy.mockRejectedValue(mockError);

      const eventListener = jest.fn();
      mockEventBus.on(DidEventChannel.GetAllDidIdentities, eventListener);

      await service.findAllDidIdentities();

      expect(getAllDidIdsSpy).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith({
        status: ServiceResponseStatus.Error,
        payload: mockError,
      });
    });
  });
});
