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
  DIDKeyPairMethod4,
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

  it('should create a DID identity with did:peer:4 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = 'method4';

    // Mock data representing the structure returned by DID Peer Method 4
    const mockDIDPeer4: DIDKeyPairMethod4 = {
      did: 'did:peer:4z123hashedDoc:encodedDoc',
      didShort: 'did:peer:4z123hashedDoc',
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2018/v1',
        ],
        verificationMethod: [
          {
            id: '#key-1',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey1',
          },
          {
            id: '#key-2',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey2',
          },
        ],
        service: [
          // Mock services here if required based on your structure
        ],
      },
      privateKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey1',
        x: 'mockPublicKey1',
      },
      publicKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey1',
      },
      privateKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey2',
        x: 'mockPublicKey2',
      },
      publicKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey2',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer4);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer4.did, // Long-form DID
        }),
      }),
    );
  });

  it('should delete a DID identity with did:peer:4 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = 'method4';

    // Mock data representing the structure returned by DID Peer Method 4
    const mockDIDPeer4: DIDKeyPairMethod4 = {
      did: 'did:peer:4z123hashedDoc:encodedDoc',
      didShort: 'did:peer:4z123hashedDoc',
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2018/v1',
        ],
        verificationMethod: [
          {
            id: '#key-1',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey1',
          },
          {
            id: '#key-2',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey2',
          },
        ],
        service: [
          // Mock services here if required based on your structure
        ],
      },
      privateKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey1',
        x: 'mockPublicKey1',
      },
      publicKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey1',
      },
      privateKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey2',
        x: 'mockPublicKey2',
      },
      publicKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey2',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer4);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    // Delete the DID
    const deleteEvent = waitForEvent(DidEventChannel.DeleteDidIdentity);
    await didIdentityService.deleteDidIdentity(mockDIDPeer4.did);

    const response = await deleteEvent;

    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          deletedDid: mockDIDPeer4.did,
          message: `DID identity with ID ${mockDIDPeer4.did} was successfully deleted.`,
        }),
      }),
    );
  });

  it('should find a DID identity with did:peer:4 and emit the event', async () => {
    const method = DIDMethodName.Peer;
    const method_type = 'method4';

    // Mock data representing the structure returned by DID Peer Method 4
    const mockDIDPeer4: DIDKeyPairMethod4 = {
      did: 'did:peer:4z123hashedDoc:encodedDoc',
      didShort: 'did:peer:4z123hashedDoc',
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2018/v1',
        ],
        verificationMethod: [
          {
            id: '#key-1',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey1',
          },
          {
            id: '#key-2',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey2',
          },
        ],
        service: [
          // Mock services here if required based on your structure
        ],
      },
      privateKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey1',
        x: 'mockPublicKey1',
      },
      publicKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey1',
      },
      privateKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey2',
        x: 'mockPublicKey2',
      },
      publicKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey2',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer4);

    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, method_type);
    await createEvent;

    const findEvent = waitForEvent(DidEventChannel.GetSingleDidIdentity);
    await didIdentityService.findDidIdentity(mockDIDPeer4.did);

    const response = await findEvent;

    const expectedPayload = {
      did: mockDIDPeer4.did,
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
    const method = DIDMethodName.Peer;
    const method_type = 'method4';

    // Mock data representing the structure returned by DID Peer Method 4
    const mockDIDPeer4: DIDKeyPairMethod4 = {
      did: 'did:peer:4z123hashedDoc:encodedDoc',
      didShort: 'did:peer:4z123hashedDoc',
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2018/v1',
        ],
        verificationMethod: [
          {
            id: '#key-1',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey1',
          },
          {
            id: '#key-2',
            controller: '#didcontroller',
            type: 'Ed25519VerificationKey2018',
            publicKeyMultibase: 'z...publicKeyMultibaseKey2',
          },
        ],
        service: [
          // Mock services here if required based on your structure
        ],
      },
      privateKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey1',
        x: 'mockPublicKey1',
      },
      publicKey1: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey1',
      },
      privateKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        d: 'mockPrivateKey2',
        x: 'mockPublicKey2',
      },
      publicKey2: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'mockPublicKey2',
      },
    };

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer4);

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
        did: 'did:peer:4z123hashedDoc:encodedDoc',
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
