import { DidService, DidEventChannel } from '../services/MediatorCoordination';
import { EventEmitter } from 'eventemitter3';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import { Message } from 'didcomm-node';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';

// Mocking the dependencies
jest.mock('cross-fetch');
jest.mock('did-resolver-lib');
jest.mock('didcomm-node', () => ({
  ...jest.requireActual('didcomm-node'),
  Message: {
    unpack: jest.fn(),
    pack_encrypted: jest.fn(),
  },
}));
jest.mock('eventemitter3', () => ({
  EventEmitter: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
}));

describe('DidService', () => {
  let didService: DidService;
  let eventBus: EventEmitter;
  let resolver: PeerDIDResolver;
  let secretsResolver: unknown;

  beforeEach(() => {
    eventBus = new EventEmitter();
    didService = new DidService(eventBus);
    resolver = new PeerDIDResolver();
    secretsResolver = {
      get_secret: jest.fn(),
      find_secrets: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('processMediatorOOB - success flow', async () => {
    const mockOob = 'key=base64urlencodedOOB';

    // Mocking the DID Peer Method generation and resolution
    const mockDidPeer = {
      did: 'did:peer:123',
      privateKeyE: { id: 'key1' },
      privateKeyV: { id: 'key2' },
    };
    jest.spyOn(PeerDIDResolver.prototype, 'resolve').mockResolvedValueOnce({
      service: [
        { type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com' },
      ],
    });
    jest
      .spyOn(DidPeerMethod.prototype, 'generateMethod2')
      .mockResolvedValue(mockDidPeer);
    jest
      .spyOn(Message.prototype, 'pack_encrypted')
      .mockResolvedValueOnce([Buffer.from('packed')]);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ type: 'MediationResponse' }),
    });

    const result = await didService.processMediatorOOB(mockOob);

    expect(result).toBeDefined();
    expect(fetch).toHaveBeenCalledWith('https://example.com', {
      method: 'POST',
      body: expect.any(Buffer),
      headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    });
    expect(eventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.ProcessMediatorOOB,
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.any(Buffer),
      }),
    );
  });

  test('processMediatorOOB - invalid OOB format', async () => {
    const invalidOob = 'invalidFormat';

    await expect(didService.processMediatorOOB(invalidOob)).rejects.toThrow(
      'Invalid OOB format. Missing encoded payload.',
    );
    expect(eventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.Error,
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.any(Error),
      }),
    );
  });

  test('processMediatorOOB - error in resolving DID', async () => {
    const mockOob = 'key=base64urlencodedOOB';
    const mockDidPeer = {
      did: 'did:peer:123',
      privateKeyE: { id: 'key1' },
      privateKeyV: { id: 'key2' },
    };
    jest
      .spyOn(PeerDIDResolver.prototype, 'resolve')
      .mockRejectedValueOnce(new Error('DID resolution failed'));
    jest
      .spyOn(DidPeerMethod.prototype, 'generateMethod2')
      .mockResolvedValue(mockDidPeer);

    await expect(didService.processMediatorOOB(mockOob)).rejects.toThrow(
      'DID resolution failed',
    );
    expect(eventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.Error,
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.any(Error),
      }),
    );
  });

  test('handleKeylistUpdate - success', async () => {
    const mockDidTo = 'did:peer:456';
    const mockDidPeer = { did: 'did:peer:123' };
    const mockNewDid = { did: 'did:peer:789' };
    const mediatorEndpoint = { uri: 'https://example.com' };
    const mockKeylistUpdateResponse = {
      type: 'KeylistUpdateResponse',
      body: {
        updated: [
          { recipient_did: mockNewDid.did, action: 'add', result: 'success' },
        ],
      },
    };

    // Mocking the packing and API call
    jest
      .spyOn(Message.prototype, 'pack_encrypted')
      .mockResolvedValueOnce([Buffer.from('packed-keylist')]);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockKeylistUpdateResponse),
    });

    const result = await didService['handleKeylistUpdate'](
      mockDidTo,
      mockDidPeer,
      mockNewDid,
      resolver,
      secretsResolver,
      mediatorEndpoint,
    );

    expect(result).toEqual(mockKeylistUpdateResponse.body);
    expect(fetch).toHaveBeenCalledWith(mediatorEndpoint.uri, {
      method: 'POST',
      body: expect.any(Buffer),
      headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    });
  });

  test('handleKeylistUpdate - error', async () => {
    const mockDidTo = 'did:peer:456';
    const mockDidPeer = { did: 'did:peer:123' };
    const mockNewDid = { did: 'did:peer:789' };
    const mediatorEndpoint = { uri: 'https://example.com' };
    const mockKeylistUpdateResponse = {
      type: 'KeylistUpdateResponse',
      body: {
        updated: [
          { recipient_did: mockNewDid.did, action: 'add', result: 'failed' },
        ],
      },
    };

    // Mocking the packing and API call
    jest
      .spyOn(Message.prototype, 'pack_encrypted')
      .mockResolvedValueOnce([Buffer.from('packed-keylist')]);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockKeylistUpdateResponse),
    });

    await expect(
      didService['handleKeylistUpdate'](
        mockDidTo,
        mockDidPeer,
        mockNewDid,
        resolver,
        secretsResolver,
        mediatorEndpoint,
      ),
    ).rejects.toThrow('Unexpected response in Keylist Update');
  });

  test('prependDidToSecretIds', () => {
    const secrets = [{ id: 'key1' }, { id: 'key2' }];
    const did = 'did:peer:123';

    const updatedSecrets = didService['prependDidToSecretIds'](secrets, did);

    expect(updatedSecrets[0].id).toBe('did:peer:123key1');
    expect(updatedSecrets[1].id).toBe('did:peer:123key2');
  });
});
