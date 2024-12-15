import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { EventEmitter } from 'eventemitter3';
import {
  DidMethodFactory,
  DIDMethodName,
  PeerGenerationMethod,
} from '../did-methods/DidMethodFactory';
import { DidIdentity, DIDKeyPair } from '../did-methods/IDidMethod';
import { DIDIdentityService } from '../lib/DIDIdentityService';
import { DidEventChannel } from '../utils/DidEventChannel';
import { createMockDIDPeer1 } from './testFixtures';

describe('DIDIdentityService', () => {
  let didIdentityService: DIDIdentityService;
  let eventBus: EventEmitter;

  beforeEach(() => {
    eventBus = new EventEmitter();
    didIdentityService = new DIDIdentityService(eventBus);
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

  const waitForEvent = <T>(channel: DidEventChannel) => {
    return new Promise<ServiceResponse<T>>((resolve) => {
      eventBus.once(channel, (data: ServiceResponse<T>) => resolve(data));
    });
  };

  it('should create a DID identity with did:peer:1 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = PeerGenerationMethod.Method1;
    const did = 'did:peer:1z1234567890';

    const mockDIDPeer1 = createMockDIDPeer1(did);

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer1);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer1.did,
        }),
      }),
    );
  });

  it('should delete a DID identity with did:peer:1 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = PeerGenerationMethod.Method1;
    const did = 'did:peer:1z1234567890';

    const mockDIDPeer1 = createMockDIDPeer1(did);

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer1);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    // Delete the DID
    const deleteEvent = waitForEvent(DidEventChannel.DeleteDidIdentity);
    await didIdentityService.deleteDidIdentity(mockDIDPeer1.did);

    const response = await deleteEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          deletedDid: mockDIDPeer1.did,
          message: `DID identity with ID ${mockDIDPeer1.did} was successfully deleted.`,
        }),
      }),
    );
  });

  it('should find a DID identity with did:peer:1 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = PeerGenerationMethod.Method1;
    const didPeer1 = 'did:peer:1z1234567890';
    const did = 'did:peer:1z1234567890';

    const mockDIDPeer1 = createMockDIDPeer1(did);

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer1);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(didPeer1);

    const response = await findEvent;

    const expectedPayload = {
      did: didPeer1,
      method,
      method_type,
      createdAt: expect.any(Number),
    };

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining(expectedPayload),
      }),
    );
  });

  it('should find all DID identities and emit the event', async () => {
    // MOCK DID PEER:1
    const method = DIDMethodName.Peer;
    const method_type = PeerGenerationMethod.Method1;
    const did = 'did:peer:1z1234567890';

    const mockDIDPeer1 = createMockDIDPeer1(did);

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer1);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    // MOCK DID KEY
    const methodDidKey = DIDMethodName.Key;
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

    const createEventDidKey = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(methodDidKey);
    await createEventDidKey;

    const didRecords = [
      {
        did: 'did:peer:1z1234567890',
        method: DIDMethodName.Peer,
        method_type: method_type,
        createdAt: expect.any(Number),
      },
      {
        did: 'did:key:z1234567890',
        method: DIDMethodName.Key,
        createdAt: expect.any(Number),
      },
    ];

    jest
      .spyOn(didIdentityService['didRepository'], 'getAllDidIds')
      .mockResolvedValueOnce(didRecords);

    // Invoke the method to find all DIDs
    const findAllEvent = waitForEvent(DidEventChannel.GetAllDidIdentities);
    await didIdentityService.findAllDidIdentities();

    const response = await findAllEvent;

    // Validate the response
    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.arrayContaining(didRecords),
      }),
    );
  });
});