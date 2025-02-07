import { EventEmitter } from 'eventemitter3';

import {
  DidMethodFactory,
  DIDMethodName,
  PeerGenerationMethod,
} from '../did-methods/DidMethodFactory';
import type { DidIdentity, DIDKeyPair } from '../did-methods/IDidMethod';
import { DIDIdentityService } from '../lib/DIDIdentityService';
import { SecurityService } from '../security/SecurityService';
import { DidEventChannel } from '../utils/DidEventChannel';

import {
  mockDIDPeer2Fixture,
  mockDIDPeer2FixturePeerContact,
} from './testFixtures';

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

  const waitForEvent = <T>(channel: DidEventChannel) => {
    return new Promise<ServiceResponse<T>>((resolve) => {
      eventBus.once(channel, (data: ServiceResponse<T>) => resolve(data));
    });
  };

  // test pin for the user
  const pin = 28364781;

  it('should create a DID identity with did:peer:2 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method2;

    const mockDIDPeer2 = mockDIDPeer2Fixture;

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer2.did,
        }),
      }),
    );
  });

  it('should create a  valid DIDKeyPairMethod2 with mediator routing keys', async () => {
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method2WithMediatorRoutingKey;
    const mediatorRoutingKey = 'routingKey1';

    const mockDIDPeer2 = mockDIDPeer2Fixture;
    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(
      method,
      pin,
      methodType,
      mediatorRoutingKey,
    );

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer2.did,
        }),
      }),
    );
  });

  it('should delete a DID identity with did:peer:2 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method2;

    const mockDIDPeer2 = mockDIDPeer2Fixture;

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);
    await createEvent;

    // Delete the DID
    const deleteEvent = waitForEvent(DidEventChannel.DeleteDidIdentity);
    await didIdentityService.deleteDidIdentity(mockDIDPeer2.did);

    const response = await deleteEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          deletedDid: mockDIDPeer2.did,
          message: `DID identity with ID ${mockDIDPeer2.did} was successfully deleted.`,
        }),
      }),
    );
  });

  it('should find a DID identity with did:peer:2 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method2;

    const mockDIDPeer2 = mockDIDPeer2Fixture;

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);
    await createEvent;

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(mockDIDPeer2.did);

    const response = await findEvent;

    const expectedPayload = {
      did: mockDIDPeer2.did,
      createdAt: expect.any(Number),
    };

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining(expectedPayload),
      }),
    );
  });

  it('should find and return all mediator type DID identity  and emit the event', async () => {
    const method = DIDMethodName.Peer;

    // For mediator DID
    const methodTypeMeidator = PeerGenerationMethod.Method2;
    const mockDIDPeer2 = mockDIDPeer2Fixture;

    // For PeerContact DID
    const methodTypePeerContact =
      PeerGenerationMethod.Method2WithMediatorRoutingKey;
    const mockDIDPeer2PeerContact = mockDIDPeer2FixturePeerContact;

    // For mediator DID
    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    // For PeerContact DID
    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2PeerContact);

    const createEventMediator = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodTypeMeidator);
    await createEventMediator;

    const createEventPeerContact = waitForEvent(
      DidEventChannel.CreateDidIdentity,
    );
    await didIdentityService.createDidIdentity(
      method,
      pin,
      methodTypePeerContact,
    );
    await createEventPeerContact;

    const findEvent = waitForEvent(DidEventChannel.GetMediatorDidIdentities);
    await didIdentityService.findMediatorDidIdentities();

    const response = await findEvent;

    const expectedPayload = {
      createdAt: expect.any(Number),
      did: mockDIDPeer2.did,
      type: mockDIDPeer2.type,
    };

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining([expectedPayload]),
      }),
    );

    // Assert that the PeerContact DID is not included in the response payload.
    expect(response.payload).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          did: mockDIDPeer2PeerContact.did,
          type: mockDIDPeer2PeerContact.type,
        }),
      ]),
    );
  });

  it('should find and return all peer_contact type DID identity  and emit the event', async () => {
    const method = DIDMethodName.Peer;

    // For PeerContact DID
    const methodType = PeerGenerationMethod.Method2WithMediatorRoutingKey;
    const mockDIDPeer2 = mockDIDPeer2FixturePeerContact;

    // For mediator DID
    const methodTypeMeidator = PeerGenerationMethod.Method2;
    const mockDIDPeerMediator = mockDIDPeer2Fixture;

    // For PeerContact DID
    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    // For mediator DID
    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeerMediator);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);
    await createEvent;

    const createEventMediator = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodTypeMeidator);
    await createEventMediator;

    const findEvent = waitForEvent(DidEventChannel.GetPeerContactDidIdentities);
    await didIdentityService.findPeerContactDidIdentities();

    const response = await findEvent;

    const expectedPayload = {
      createdAt: expect.any(Number),
      did: mockDIDPeer2.did,
      type: mockDIDPeer2.type,
    };

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining([expectedPayload]),
      }),
    );

    // Assert that the mediator DID is not included in the response payload.
    expect(response.payload).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          did: mockDIDPeerMediator.did,
          type: mockDIDPeerMediator.type,
        }),
      ]),
    );
  });

  it('should find all DID identities and emit the event', async () => {
    // MOCK DID PEER:2
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method2;

    const mockDIDPeer2 = mockDIDPeer2Fixture;

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);
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
    await didIdentityService.createDidIdentity(methodDidKey, pin);
    await createEventDidKey;

    const didRecords = [
      {
        did: 'did:peer:2z1234567890',
        createdAt: expect.any(Number),
      },
      {
        did: 'did:key:z1234567890',
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
