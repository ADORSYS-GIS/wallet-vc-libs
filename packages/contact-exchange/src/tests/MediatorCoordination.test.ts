import { EventEmitter } from 'eventemitter3';
import { DidService, DidEventChannel } from '../services/MediatorCoordination';
import fetch from 'cross-fetch';

// Mock dependencies
jest.mock('cross-fetch');
jest.mock(
  '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod',
  () => {
    return {
      DidPeerMethod: jest.fn().mockImplementation(() => ({
        generateMethod2: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          privateKeyE: { id: 'key1', kty: 'OKP' },
          privateKeyV: { id: 'key2', kty: 'OKP' },
        }),
      })),
    };
  },
);

jest.mock('did-resolver-lib', () => {
  return {
    PeerDIDResolver: jest.fn().mockImplementation(() => ({
      resolve: jest.fn().mockResolvedValue({
        service: [
          {
            type: 'DIDCommMessaging',
            serviceEndpoint: { uri: 'https://mediator.example.com' },
          },
        ],
      }),
    })),
  };
});

// Mock the didcomm-node module
jest.mock('didcomm-node', () => {
  return {
    Message: jest.fn().mockImplementation(() => ({
      pack_encrypted: jest.fn().mockResolvedValue(['packedMessage']),
      unpack: jest.fn().mockResolvedValue([
        {
          as_value: jest.fn().mockReturnValue({
            type: 'MediationResponse',
            body: { routing_did: 'did:example:789' },
          }),
        },
        {},
      ]),
    })),
  };
});

const mockEventBus = new EventEmitter();

describe('DidService', () => {
  let didService: DidService;

  beforeEach(() => {
    jest.resetModules();
    didService = new DidService(mockEventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process a valid OOB and emit events', async () => {
    const mockOOB =
      'someprefix=' +
      Buffer.from(JSON.stringify({ from: 'did:example:123' })).toString(
        'base64url',
      );

    // Mock the fetch function
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'MediationResponse',
        body: { routing_did: 'did:example:789' },
        from: 'did:example:123',
      }),
    });

    // Call the method
    await didService.processMediatorOOB(mockOOB);

    // Check that the appropriate events were emitted
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.ProcessMediatorOOB,
      expect.any(Object),
    );
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.MediationResponseReceived,
      expect.objectContaining({
        status: 'success',
        payload: expect.objectContaining({
          routing_did: 'did:example:789',
        }),
      }),
    );
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      DidEventChannel.KeylistUpdateResponseReceived,
      expect.any(Object),
    );
  });

  it('should throw an error for invalid OOB format', async () => {
    const invalidOOB = 'invalidOOBFormat';

    await expect(didService.processMediatorOOB(invalidOOB)).rejects.toThrow(
      'Invalid OOB format. Missing encoded payload.',
    );
  });

  it('should throw an error if the mediator service endpoint is missing', async () => {
    const mockOOB =
      'someprefix=' +
      Buffer.from(JSON.stringify({ from: 'did:example:123' })).toString(
        'base64url',
      );

    // Mock the fetch function to simulate a missing service endpoint
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        type: 'MediationResponse',
        body: { routing_did: 'did:example:789' },
        from: 'did:example:123',
      }),
    });

    // Mock the resolver to return an invalid DID document
    jest.mock('did-resolver-lib', () => {
      return {
        PeerDIDResolver: jest.fn().mockImplementation(() => ({
          resolve: jest.fn().mockResolvedValue({
            service: [], // No service endpoint
          }),
        })),
      };
    });

    await expect(didService.processMediatorOOB(mockOOB)).rejects.toThrow(
      'Invalid mediator service endpoint format',
    );
  });
});

// const EventBus = new EventEmitter();
// describe('DIDCommRoutingService', () => {
//   let didService: DidService;

//   beforeEach(async () => {
//     didService = new DidService(EventBus);
//   });

//   it('should do the mediator coordination dance from an OOB', async () => {
//     const oob =
//       'https://mediator.socious.io?_oob=eyJpZCI6IjFkNjc5NzBlLTNjOGMtNDAxNy05M2VkLTY5ODVhZGQ5MWM1YyIsInR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzIuMC9pbnZpdGF0aW9uIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNrcDkyV2JRUThzQW5mSGJ5cGZVWHVUNkM3OHpWUnBOc0F6cFE3SE5rdHRpMy5WejZNa2pUTkRLbkV2Y3gyRXl0Zkw4QmVadmRHVWZFMTUzU2JlNFU3MjlNMnhkSDVILlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW1oMGRIQnpPaTh2YldWa2FXRjBiM0l1YzI5amFXOTFjeTVwYnlJc0ltRWlPbHNpWkdsa1kyOXRiUzkyTWlKZGZYMC5TZXlKMElqb2laRzBpTENKeklqcDdJblZ5YVNJNkluZHpjem92TDIxbFpHbGhkRzl5TG5OdlkybHZkWE11YVc4dmQzTWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDE5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdE1lZGlhdGUiLCJhY2NlcHQiOlsiZGlkY29tbS92MiJdfSwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1wbGFpbitqc29uIn0';
//     const result = await didService.processMediatorOOB(oob);
//     console.log(result);
//   }, 2000);
// });
