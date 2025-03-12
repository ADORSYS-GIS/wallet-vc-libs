import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import { EventEmitter } from 'eventemitter3';
import { DidService } from '../services/MediatorCoordination';

// Mocking dependencies
jest.mock('@adorsys-gis/multiple-did-identities/src/repository/DidRepository');
jest.mock('did-resolver-lib');
jest.mock('@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod');
jest.mock('didcomm', () => ({
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
          id: 'mock-message-id',
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

describe('DidService', () => {
  let service: DidService;
  let eventBus: EventEmitter;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus = new EventEmitter();
    const securityService = new SecurityService();
    const userPin = 123456
    service = new DidService(eventBus, securityService, userPin);
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

    it('should throw an error if the mediator DID document is missing', async () => {
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
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      const mockResolver = {
        resolve: jest.fn().mockResolvedValue(null),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Invalid mediator DID or service endpoint',
      );
    });

    it('should throw an error if the mediator DID document has no service endpoint', async () => {
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
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      const mockResolver = {
        resolve: jest.fn().mockResolvedValue({
          id: 'did:example:mediator',
          service: [], // No service endpoint
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        "Cannot read properties of undefined (reading 'serviceEndpoint')",
      );
    });

    it('should throw an error if the mediation request fails', async () => {
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
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      const mockResolver = {
        resolve: jest.fn().mockResolvedValue({
          id: 'did:example:mediator',
          service: [
            {
              type: 'DIDCommMessaging',
              serviceEndpoint: { uri: 'http://test.com' },
            },
          ],
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Failed to send Mediation Deny message: Internal Server Error',
      );
    });

    it('should throw an error if the mediation response has an unexpected message type', async () => {
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
          id: 'did:example:mediator',
          service: [
            {
              type: 'DIDCommMessaging',
              serviceEndpoint: { uri: 'http://test.com' },
            },
          ],
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      jest.spyOn(service, 'sendKeylistUpdate').mockImplementation(() => {
        throw new Error(
          'Unexpected message type received for Mediation Response',
        );
      });

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Unexpected message type received for Mediation Response',
      );
    });

    it('should throw an error if the mediation response is missing required fields', async () => {
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
          id: 'did:example:mediator',
          service: [
            {
              type: 'DIDCommMessaging',
              serviceEndpoint: { uri: 'http://test.com' },
            },
          ],
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      jest.spyOn(service, 'sendKeylistUpdate').mockImplementation(() => {
        throw new Error('Mediation Response missing required fields');
      });

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Mediation Response missing required fields',
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
          id: 'did:example:mediator',
          service: [
            {
              type: 'DIDCommMessaging',
              serviceEndpoint: { uri: 'http://test.com' },
            },
          ],
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Mock the sendKeylistUpdate method to return the new return type
      jest.spyOn(service, 'sendKeylistUpdate').mockResolvedValue({
        recipientDID: 'did:example:recipientDID',
        mediatorDID: 'did:example:mediatorDID',
      });

      const result = await service.processMediatorOOB(mockOob);

      expect(mockDidPeerMethod.generateMethod2).toHaveBeenCalled();
      expect(mockDidPeerMethod.generateMethod2RoutingKey).toHaveBeenCalled();
      expect(mockResolver.resolve).toHaveBeenCalledWith('did:peer:123');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://test.com', expect.any(Object));
      expect(service.sendKeylistUpdate).toHaveBeenCalledWith(
        'did:peer:456',
        'did:example:mediatorOldDID',
        'did:example:mediatorNewDID',
        'http://test.com',
        expect.any(Object),
        expect.any(Object),
      );

      // Verify the return value
      expect(result).toEqual({
        messagingDid: 'did:example:recipientDID',
        mediatorDid: 'did:example:mediatorOldDID',
      });
    });
  });
});

