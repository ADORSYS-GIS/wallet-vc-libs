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

import { createMockDIDPeer1, mockDIDPeer2Fixture } from './testFixtures';
import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';

describe('Create DID Identity, Encrypt and Decrypt', () => {
  let didIdentityService: DIDIdentityService;
  let eventBus: EventEmitter;
  let securityService: SecurityService;

  beforeEach(() => {
    eventBus = new EventEmitter();
    securityService = new SecurityService();
    didIdentityService = new DIDIdentityService(eventBus, securityService);
  });

  afterEach(async () => {
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

  const pin = 28364781;

  it('should  create a DID retrieve the DID with decrypted private keys', async () => {
    const method = DIDMethodName.Peer;
    const methodType = PeerGenerationMethod.Method1;
    const did = 'did:peer:1z1234567890';

    const mockDIDPeer1 = createMockDIDPeer1(did);

    jest
      .spyOn(DidMethodFactory, 'generateDid')
      .mockResolvedValueOnce(mockDIDPeer1);

    // Create DID identity
    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    await didIdentityService.createDidIdentity(method, pin, methodType);

    const createdDid = await createEvent;

    expect(createdDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer1.did,
        }),
      }),
    );

    // Retrieve DID with decrypted private keys
    const retrieveEvent = waitForEvent(
      DidEventChannel.GetDidWithDecryptedPrivateKeys,
    );
    await didIdentityService.retrieveDidWithDecryptedKeys(did, pin);

    const retrievedDid = await retrieveEvent;

    expect(retrievedDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer1.did,
          decryptedPrivateKeys: {
            privateKey: expect.objectContaining(mockDIDPeer1.privateKey),
          },
        }),
      }),
    );
  });

  it('should create a DID Key identity Encrypt before strorage and decrypt for when retrieved', async () => {
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

    // Retrieve DID with decrypted private keys
    const retrieveEvent = waitForEvent(
      DidEventChannel.GetDidWithDecryptedPrivateKeys,
    );
    await didIdentityService.retrieveDidWithDecryptedKeys(
      mockDIDKeyPair.did,
      pin,
    );

    const retrievedDid = await retrieveEvent;

    expect(retrievedDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDKeyPair.did,
          decryptedPrivateKeys: {
            privateKey: expect.objectContaining(mockDIDKeyPair.privateKey),
          },
        }),
      }),
    );
  });

  it('should create a DID identity with did:peer:2 Encrypt before strorage and decrypt for when retrieved', async () => {
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

    // Retrieve DID with decrypted private keys
    const retrieveEvent = waitForEvent(
      DidEventChannel.GetDidWithDecryptedPrivateKeys,
    );
    await didIdentityService.retrieveDidWithDecryptedKeys(
      mockDIDPeer2.did,
      pin,
    );

    const retrievedDid = await retrieveEvent;

    expect(retrievedDid).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          did: mockDIDPeer2.did,
          decryptedPrivateKeys: {
            privateKeyV: expect.objectContaining(mockDIDPeer2.privateKeyV),
            privateKeyE: expect.objectContaining(mockDIDPeer2.privateKeyE),
          },
        }),
      }),
    );
  });
});
