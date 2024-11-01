import { EventEmitter } from 'eventemitter3';
import { DIDIdentityService } from '../lib/DIDIdentityService';
import { DidMethodFactory } from '../did-methods/DidMethodFactory';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { DidEventChannel } from '../utils/DidEventChannel';
import { DIDMethodName } from '../did-methods/DidMethodFactory';
import {
  DidIdentity,
  DIDKeyPair,
  DIDKeyPairMethod2,
} from '../did-methods/IDidMethod';

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

  it('should create a DID identity with did:peer:2 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = 'method2';

    const mockDIDPeer2: DIDKeyPairMethod2 = {
      did: 'did:peer:2z1234567890', // Use a DID format for peer:2
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
        ],
        id: 'did:peer:2z1234567890',
        verificationMethod: [
          {
            id: '#key-1',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseV', // Replace with appropriate mock data
          },
          {
            id: '#key-2',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseE', // Replace with appropriate mock data
          },
        ],
        service: [
          {
            id: '#didcommmessaging',
            type: 'DIDCommMessaging',
            serviceEndpoint: {
              uri: 'http://example.com/didcomm',
              accept: ['didcomm/v2'],
              routingKeys: [],
            },
          },
        ],
      },
      privateKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyV',
        x: 'mockPublicKeyV',
      },
      publicKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyV',
      },
      privateKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyE',
        x: 'mockPublicKeyE',
      },
      publicKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyE',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);

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
    const method_type = 'method2';

    const mockDIDPeer2: DIDKeyPairMethod2 = {
      did: 'did:peer:2z1234567890', // Use a DID format for peer:2
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
        ],
        id: 'did:peer:2z1234567890',
        verificationMethod: [
          {
            id: '#key-1',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseV', // Replace with appropriate mock data
          },
          {
            id: '#key-2',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseE', // Replace with appropriate mock data
          },
        ],
        service: [
          {
            id: '#didcommmessaging',
            type: 'DIDCommMessaging',
            serviceEndpoint: {
              uri: 'http://example.com/didcomm',
              accept: ['didcomm/v2'],
              routingKeys: [],
            },
          },
        ],
      },
      privateKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyV',
        x: 'mockPublicKeyV',
      },
      publicKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyV',
      },
      privateKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyE',
        x: 'mockPublicKeyE',
      },
      publicKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyE',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
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
    const method_type = 'method2';

    const mockDIDPeer2: DIDKeyPairMethod2 = {
      did: 'did:peer:2z1234567890', // Use a DID format for peer:2
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
        ],
        id: 'did:peer:2z1234567890',
        verificationMethod: [
          {
            id: '#key-1',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseV', // Replace with appropriate mock data
          },
          {
            id: '#key-2',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseE', // Replace with appropriate mock data
          },
        ],
        service: [
          {
            id: '#didcommmessaging',
            type: 'DIDCommMessaging',
            serviceEndpoint: {
              uri: 'http://example.com/didcomm',
              accept: ['didcomm/v2'],
              routingKeys: [],
            },
          },
        ],
      },
      privateKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyV',
        x: 'mockPublicKeyV',
      },
      publicKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyV',
      },
      privateKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyE',
        x: 'mockPublicKeyE',
      },
      publicKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyE',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(mockDIDPeer2.did);

    const response = await findEvent;

    const expectedPayload = {
      did: mockDIDPeer2.did,
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
    // MOCK DID PEER:2
    const method = DIDMethodName.Peer;
    const method_type = 'method2';

    const mockDIDPeer2: DIDKeyPairMethod2 = {
      did: 'did:peer:2z1234567890', // Use a DID format for peer:2
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
        ],
        id: 'did:peer:2z1234567890',
        verificationMethod: [
          {
            id: '#key-1',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseV', // Replace with appropriate mock data
          },
          {
            id: '#key-2',
            controller: 'did:peer:2z1234567890',
            type: 'Multikey',
            publicKeyMultibase: 'z...publicKeyMultibaseE', // Replace with appropriate mock data
          },
        ],
        service: [
          {
            id: '#didcommmessaging',
            type: 'DIDCommMessaging',
            serviceEndpoint: {
              uri: 'http://example.com/didcomm',
              accept: ['didcomm/v2'],
              routingKeys: [],
            },
          },
        ],
      },
      privateKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyV',
        x: 'mockPublicKeyV',
      },
      publicKeyV: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyV',
      },
      privateKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKeyE',
        x: 'mockPublicKeyE',
      },
      publicKeyE: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKeyE',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer2);

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
        did: 'did:peer:2z1234567890',
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
