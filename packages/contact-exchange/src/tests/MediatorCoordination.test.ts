import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { DidService } from '../services/MediatorCoordination';

// Mocking dependencies
jest.mock('@adorsys-gis/multiple-did-identities/src/repository/DidRepository');
jest.mock('did-resolver-lib');
jest.mock('@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod');
jest.mock('didcomm-node', () => ({
  Message: class {
    static unpack = jest.fn().mockResolvedValue([
      {
        as_value: jest.fn().mockReturnValue({
          type: 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
          body: {
            message_type:
              'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
            routing_did: 'did:example:mediatorRoutingKey',
            from: 'did:example:mediatorNewDID',
          },
          from: 'did:example:mediatorOldDID',
          to: 'did:example:mediatorNewDID',
        }),
      },
    ]);
    static pack_encrypted = jest
      .fn()
      .mockResolvedValue([{ packedMediationRequest: 'mock-value' }]);
    constructor() {
      return {
        pack_encrypted: jest
          .fn()
          .mockResolvedValue([{ packedMediationRequest: 'mock-value' }]),
      };
    }
  },
}));

jest.mock('cross-fetch', () => jest.fn());
jest.mock('uuid', () => ({ v4: jest.fn() }));

// Mocking TextEncoder and TextDecoder
global.TextEncoder = class {
  encoding: string = 'utf-8';
  encode(input: string) {
    return Buffer.from(input);
  }
  encodeInto(source: string, destination: Uint8Array) {
    const encoded = this.encode(source);
    destination.set(encoded);
    return {
      read: encoded.length,
      written: encoded.length,
    };
  }
};

global.TextDecoder = class {
  encoding: string = 'utf-8';
  fatal: boolean = false;
  ignoreBOM: boolean = false;
  decode(input: Buffer) {
    return input.toString();
  }
};

describe('DidService', () => {
  let service: DidService;
  let eventBus: EventEmitter;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus = new EventEmitter();
    const securityService = new SecurityService();
    service = new DidService(eventBus, securityService);
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
  });

  describe('processMediatorOOB', () => {
    it('should throw an error for invalid OOB format', async () => {
      await expect(service.processMediatorOOB('invalid-oob')).rejects.toThrow(
        'Invalid OOB format. Missing encoded payload.',
      );
    });

    it('should throw an error if the decoded OOB lacks "from" field', async () => {
      const mockOob =
        'oob=' + Buffer.from(JSON.stringify({})).toString('base64url');
      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Invalid OOB content. Missing "from" field.',
      );
    });

    it('should successfully process valid OOB and handle keylist update', async () => {
      const mockOob =
        'oob=' +
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString(
          'base64url',
        );

      const mockDidPeerMethod = {
        generateMethod2: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          privateKeyE: { id: 'key1' },
          privateKeyV: { id: 'key2' },
        }),
        generateMethod2RoutingKey: jest.fn().mockResolvedValue({
          did: 'did:example:mediatorNewDID',
          privateKeyE: { id: 'key3' },
          privateKeyV: { id: 'key4' },
        }),
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      const mockResolver = {
        resolve: jest.fn().mockResolvedValue({
          service: [
            {
              type: 'DIDCommMessaging',
              serviceEndpoint: { uri: 'http://test.com' },
            },
          ],
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            '@type':
              'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
            body: {
              message_type:
                'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
              routing_did: 'did:example:mediatorRoutingKey',
              from: 'did:example:mediatorNewDID',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            type: 'https://didcomm.org/coordinate-mediation/2.0/keylist-update-response',
            body: {
              updated: [
                {
                  recipient_did: 'did:example:mediatorNewDID',
                  action: 'add',
                  result: 'success',
                },
              ],
            },
          }),
        });

      await service.processMediatorOOB(mockOob);

      expect(mockDidPeerMethod.generateMethod2).toHaveBeenCalled();
      expect(mockDidPeerMethod.generateMethod2RoutingKey).toHaveBeenCalled();
      expect(mockResolver.resolve).toHaveBeenCalledWith('did:peer:123');
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith('http://test.com', expect.any(Object));
    });
  });
});

// describe('DIDCommRoutingService', () => {
//   let eventBus: EventEmitter;
//   let didService: DidService;

//   beforeEach(async () => {
//     const securityService = new SecurityService();
//     eventBus = new EventEmitter();
//     didService= new DidService(eventBus, securityService);
//   });

//   it('should do the mediator coordination dance from an OOB', async () => {
//     const oob =
//       'https://mediator.socious.io?_oob=eyJpZCI6IjFkNjc5NzBlLTNjOGMtNDAxNy05M2VkLTY5ODVhZGQ5MWM1YyIsInR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzIuMC9pbnZpdGF0aW9uIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNrcDkyV2JRUThzQW5mSGJ5cGZVWHVUNkM3OHpWUnBOc0F6cFE3SE5rdHRpMy5WejZNa2pUTkRLbkV2Y3gyRXl0Zkw4QmVadmRHVWZFMTUzU2JlNFU3MjlNMnhkSDVILlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW1oMGRIQnpPaTh2YldWa2FXRjBiM0l1YzI5amFXOTFjeTVwYnlJc0ltRWlPbHNpWkdsa1kyOXRiUzkyTWlKZGZYMC5TZXlKMElqb2laRzBpTENKeklqcDdJblZ5YVNJNkluZHpjem92TDIxbFpHbGhkRzl5TG5OdlkybHZkWE11YVc4dmQzTWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDE5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdE1lZGlhdGUiLCJhY2NlcHQiOlsiZGlkY29tbS92MiJdfSwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1wbGFpbitqc29uIn0';
//   await didService.processMediatorOOB(oob);
//   }, 2000);
// });
