import { EventEmitter } from 'eventemitter3';

import {
  DidMethodFactory,
  DIDMethodName,
} from '../did-methods/DidMethodFactory';
import type { DidIdentity, DIDKeyPair } from '../did-methods/IDidMethod';
import { DIDIdentityService } from '../lib/DIDIdentityService';
import { SecurityService } from '../security/SecurityService';
import { DidEventChannel } from '../utils/DidEventChannel';

import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';

describe('DIDIdentityService', () => {
  let didIdentityService: DIDIdentityService;
  let eventBus: EventEmitter;
  let securityService: SecurityService;

  beforeEach(() => {
    eventBus = new EventEmitter();
    securityService = new SecurityService();
    didIdentityService = new DIDIdentityService(eventBus, securityService);
  });

  afterEach(async () => {
    // Clear all DIDs after each test
    const deleteAllDIDsEvent = new Promise<void>((resolve) => {
      eventBus.once(
        DidEventChannel.GetAllDidIdentities,
        async (response: ServiceResponse<DidIdentity[]>) => {
          if (response.status === ServiceResponseStatus.Success) {
            const dids = response.payload;
            if (Array.isArray(dids)) {
              for (const did of dids) {
                await didIdentityService.deleteDidIdentity(did.did);
              }
            }
          }
          resolve();
        },
      );

      didIdentityService.findAllDidIdentities();
    });

    await deleteAllDIDsEvent;
  });

  const pin = 123456; // the authenticated user's PIN
  const waitForEvent = <T>(channel: DidEventChannel) => {
    return new Promise<ServiceResponse<T>>((resolve) => {
      eventBus.once(channel, (data: ServiceResponse<T>) => resolve(data));
    });
  };

  it('should create a DID identity and emit the event', async () => {
    const method = DIDMethodName.Key;

    const mockDIDKeyPair: DIDKeyPair = {
      did: 'did:key:z1234567890',
      privateKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
        d: 'mockPrivateKey',
      },
      publicKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDKeyPair);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin);

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDKeyPair.did,
        }),
      }),
    );
  });

  it('should emit an error when failing to create a DID identity', async () => {
    const method = DIDMethodName.Key;
    jest.spyOn(DidMethodFactory, 'generateDid').mockResolvedValueOnce({
      did: 'did:key:z1234567890',
      privateKey: {},
      publicKey: {},
    } as DIDKeyPair);

    // Mock the repository method to throw an error
    jest
      .spyOn(didIdentityService['didRepository'], 'createDidId')
      .mockRejectedValueOnce(new Error('Creation failed'));

    const errorEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin);

    const response = await errorEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          message: 'Creation failed',
        }),
      }),
    );
  });

  it('should delete a DID identity and emit the event', async () => {
    const did = 'did:key:z1234567890';
    const method = DIDMethodName.Key;

    const mockDIDKeyPair = {
      did,
      privateKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
        d: 'mockPrivateKey',
      },
      publicKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDKeyPair);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin);
    await createEvent;

    const deleteEvent = waitForEvent(DidEventChannel.DeleteDidIdentity);
    await didIdentityService.deleteDidIdentity(did);

    const response = await deleteEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          deletedDid: did,
          message: `DID identity with ID ${did} was successfully deleted.`,
        }),
      }),
    );
  });

  it('should emit an error when failing to delete a DID identity', async () => {
    const did = 'did:key:z1234567890';

    // Mock the repository method to throw an error
    jest
      .spyOn(didIdentityService['didRepository'], 'deleteDidId')
      .mockRejectedValueOnce(new Error('Deletion failed'));

    const deleteEvent = waitForEvent(DidEventChannel.DeleteDidIdentity);
    await didIdentityService.deleteDidIdentity(did);

    const response = await deleteEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          message: 'Deletion failed',
        }),
      }),
    );
  });

  it('should find a DID identity and emit the event', async () => {
    const did = 'did:key:z1234567890';
    const method = DIDMethodName.Key;
    const mockDIDKeyPair = {
      did,
      privateKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
        d: 'mockPrivateKey',
      },
      publicKey: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDKeyPair);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin);
    await createEvent;

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(did);

    const response = await findEvent;

    const expectedPayload = {
      did,
      createdAt: expect.any(Number),
    };

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining(expectedPayload),
      }),
    );
  });

  it('should emit an error when failing to find a DID identity', async () => {
    const did = 'did:key:z1234567890';

    // Mock the repository method to throw an error
    jest
      .spyOn(didIdentityService['didRepository'], 'getADidId')
      .mockRejectedValueOnce(new Error('DID not found'));

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(did);

    const response = await findEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          message: 'DID not found',
        }),
      }),
    );
  });

  it('should find all DID identities and emit the event', async () => {
    const didRecords = [
      {
        did: 'did:key:z1234567890',
        createdAt: expect.any(Number),
      },
      {
        did: 'did:key:z0987654321',
        createdAt: expect.any(Number),
      },
    ];

    jest
      .spyOn(didIdentityService['didRepository'], 'getAllDidIds')
      .mockResolvedValueOnce(didRecords);

    const findAllEvent = waitForEvent(DidEventChannel.GetAllDidIdentities);
    await didIdentityService.findAllDidIdentities();

    const response = await findAllEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.arrayContaining(didRecords),
      }),
    );
  });

  it('should emit an error when failing to find all DID identities', async () => {
    // Mock the repository method to throw an error
    jest
      .spyOn(didIdentityService['didRepository'], 'getAllDidIds')
      .mockRejectedValueOnce(new Error('Failed to retrieve DIDs'));

    const findAllEvent = waitForEvent(DidEventChannel.GetAllDidIdentities);
    await didIdentityService.findAllDidIdentities();

    const response = await findAllEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          message: 'Failed to retrieve DIDs',
        }),
      }),
    );
  });

  it('should emit an error response when the error is an instance of Error', () => {
    const error = new Error('Sample error message');
    const channel = DidEventChannel.CreateDidIdentity;

    const errorEvent = waitForEvent(channel);
    didIdentityService['sharedErrorHandler'](channel)(error);

    return errorEvent.then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          status: ServiceResponseStatus.Error,
          payload: error, // Ensure it directly uses the error instance
        }),
      );
    });
  });

  it('should emit an error response when the error is not an instance of Error', () => {
    const error = 'This is a string error';
    const channel = DidEventChannel.CreateDidIdentity;

    const errorEvent = waitForEvent(channel);
    didIdentityService['sharedErrorHandler'](channel)(error);

    return errorEvent.then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          status: ServiceResponseStatus.Error,
          payload: expect.any(Error), // Ensure it creates a new Error instance
        }),
      );
    });
  });
});
