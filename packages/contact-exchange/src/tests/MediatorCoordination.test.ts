import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import * as didcomm from 'didcomm';
import { EventEmitter } from 'eventemitter3';
import { MessageType } from '../services/DIDCommOOBInvitation';
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
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');

      const mockDidPeerMethod = {
        generateMethod2: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          privateKeyE: { id: 'key1' },
          privateKeyV: { id: 'key2' },
        }),
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      const mockDidRepository = {
        createDidId: jest.fn(),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'type1', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'type2', privateKeyJwk: {} },
          },
        }),
      };
      (service as any).didRepository = mockDidRepository;

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
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');

      // Mock DidPeerMethod
      const mockDidPeerMethod = {
        generateMethod2: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          privateKeyE: { id: 'key1' },
          privateKeyV: { id: 'key2' },
        }),
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      // Mock PeerDIDResolver
      const mockResolver = {
        resolve: jest.fn().mockResolvedValue({
          id: 'did:example:mediator',
          service: [], // Empty array, triggers TypeError
        }),
      };
      (PeerDIDResolver as jest.Mock).mockImplementation(() => mockResolver);

      // Mock DidRepository with minimal implementation
      const mockDidRepository = {
        createDidId: jest.fn().mockResolvedValue(undefined),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'Ed25519', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'X25519', privateKeyJwk: {} },
          },
        }),
      };

      // Mock SecurityService with encrypt method
      const mockSecurityService = {
        encrypt: jest.fn().mockResolvedValue('encrypted-key'), // Mock encrypt method
      } as unknown as SecurityService;

      // Create DidService instance
      const mockEventBus = { emit: jest.fn() } as unknown as EventEmitter;
      const service = new DidService(mockEventBus, mockSecurityService, 1234);

      // Use reflection to override the private didRepository property
      Object.defineProperty(service, 'didRepository', {
        value: mockDidRepository,
        writable: true,
      });

      // expecting the runtime TypeError
      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        "Cannot read properties of undefined (reading 'serviceEndpoint')",
      );
    });

    it('should throw an error if the mediation request fails', async () => {
      const mockOob =
        'oob=' +
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');

      // Mock DidPeerMethod
      const mockDidPeerMethod = {
        generateMethod2: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          privateKeyE: { id: 'key1' },
          privateKeyV: { id: 'key2' },
        }),
      };
      (DidPeerMethod as jest.Mock).mockImplementation(() => mockDidPeerMethod);

      // Mock PeerDIDResolver
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

      // Mock DidRepository with minimal implementation
      const mockDidRepository = {
        createDidId: jest.fn().mockResolvedValue(undefined),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'Ed25519', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'X25519', privateKeyJwk: {} },
          },
        }),
      };

      // Mock SecurityService with encrypt method
      const mockSecurityService = {
        encrypt: jest.fn().mockResolvedValue('encrypted-key'), // Mock encrypt method
      } as unknown as SecurityService;

      // Mock fetch to simulate mediation request failure
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      // Create DidService instance
      const mockEventBus = { emit: jest.fn() } as unknown as EventEmitter;
      const service = new DidService(mockEventBus, mockSecurityService, 1234);

      // Use reflection to override the private didRepository property
      Object.defineProperty(service, 'didRepository', {
        value: mockDidRepository,
        writable: true,
      });

      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Failed to send Mediation Deny message: Internal Server Error',
      );
    });

    it('should throw an error if the mediation response has an unexpected message type', async () => {
      const mockOob =
        'oob=' +
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');

      // Mock DidPeerMethod
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

      // Mock PeerDIDResolver
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

      // Mock DidRepository
      const mockDidRepository = {
        createDidId: jest.fn().mockResolvedValue(undefined),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'Ed25519', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'X25519', privateKeyJwk: {} },
          },
        }),
      };

      // Mock SecurityService
      const mockSecurityService = {
        encrypt: jest.fn().mockResolvedValue('encrypted-key'),
      } as unknown as SecurityService;

      // Mock fetch response for mediation request
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'mocked-didcomm-message' }),
      });

      // Create DidService instance
      const mockEventBus = { emit: jest.fn() } as unknown as EventEmitter;
      const service = new DidService(mockEventBus, mockSecurityService, 1234);

      // Inject mock DidRepository
      Object.defineProperty(service, 'didRepository', {
        value: mockDidRepository,
        writable: true,
      });

      // Mock Message.unpack with a tuple [Message, UnpackMetadata]
      jest.spyOn(didcomm.Message, 'unpack').mockResolvedValueOnce([
        {
          as_value: () => ({
            id: 'mock-id',
            typ: 'didcomm-msg',
            type: 'UnexpectedType', // Triggers the error
            from: 'did:example:mediator',
            to: ['did:peer:456'],
            body: { routing_did: 'did:example:routing' },
            created_time: Math.round(Date.now() / 1000),
          }),
          pack_encrypted: jest.fn(),
          pack_plaintext: jest.fn(),
          try_parse_forward: jest.fn(),
          pack_signed: jest.fn(),
          free: jest.fn(),
        },
        {}, // Minimal UnpackMetadata stub
      ] as [any, any]); // Type assertion for tuple

      // Run the test
      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Unexpected message type received for Mediation Response',
      );
    });

    it('should throw an error if the mediation response is missing required fields', async () => {
      const mockOob =
        'oob=' +
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');

      // Mock DidPeerMethod
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

      // Mock PeerDIDResolver
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

      // Mock DidRepository
      const mockDidRepository = {
        createDidId: jest.fn().mockResolvedValue(undefined),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'Ed25519', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'X25519', privateKeyJwk: {} },
          },
        }),
      };

      // Mock SecurityService
      const mockSecurityService = {
        encrypt: jest.fn().mockResolvedValue('encrypted-key'),
      } as unknown as SecurityService;

      // Mock fetch response for mediation request
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'mocked-didcomm-message' }),
      });

      // Create DidService instance
      const mockEventBus = { emit: jest.fn() } as unknown as EventEmitter;
      const service = new DidService(mockEventBus, mockSecurityService, 1234);

      // Inject mock DidRepository
      Object.defineProperty(service, 'didRepository', {
        value: mockDidRepository,
        writable: true,
      });

      // Mock Message.unpack with correct type and missing fields
      jest.spyOn(didcomm.Message, 'unpack').mockResolvedValueOnce([
        {
          as_value: () => ({
            id: 'mock-id',
            typ: 'didcomm-msg',
            type: MessageType.MediationResponse,
            from: 'did:example:mediator',
            to: ['did:peer:456'],
            body: {}, // Missing routing_did to trigger the error
            created_time: Math.round(Date.now() / 1000),
          }),
          pack_encrypted: jest.fn(),
          pack_plaintext: jest.fn(),
          try_parse_forward: jest.fn(),
          pack_signed: jest.fn(),
          free: jest.fn(),
        },
        {}, // Minimal UnpackMetadata stub
      ] as [any, any]);

      // Run the test
      await expect(service.processMediatorOOB(mockOob)).rejects.toThrow(
        'Mediation Response missing required fields',
      );
    });

    it('should successfully process valid OOB and handle keylist update', async () => {
      const mockOob =
        'oob=' +
        Buffer.from(JSON.stringify({ from: 'did:peer:123' })).toString('base64url');
    
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
    
      const mockDidRepository = {
        createDidId: jest.fn().mockResolvedValue(undefined),
        getADidWithDecryptedPrivateKeys: jest.fn().mockResolvedValue({
          did: 'did:peer:456',
          decryptedPrivateKeys: {
            privateKeyE: { id: 'key1', type: 'Ed25519', privateKeyJwk: {} },
            privateKeyV: { id: 'key2', type: 'X25519', privateKeyJwk: {} },
          },
        }),
      };
    
      const mockEventBus = { emit: jest.fn() } as unknown as EventEmitter;
      const mockSecurityService = {
        encrypt: jest.fn().mockResolvedValue('encrypted-key'),
      } as unknown as SecurityService;
    
      const service = new DidService(mockEventBus, mockSecurityService, 1234);
      Object.defineProperty(service, 'didRepository', {
        value: mockDidRepository,
        writable: true,
      });
    
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
    
      jest.spyOn(didcomm.Message, 'unpack').mockResolvedValue([
        {
          as_value: () => ({
            id: 'mock-id',
            typ: 'didcomm-msg',
            type: MessageType.MediationResponse,
            from: 'did:example:mediator',
            to: ['did:peer:456'],
            body: { routing_did: 'did:example:routing' },
            created_time: Math.round(Date.now() / 1000),
          }),
          pack_encrypted: jest.fn(),
          pack_plaintext: jest.fn(),
          try_parse_forward: jest.fn(),
          pack_signed: jest.fn(),
          free: jest.fn(),
        },
        {},
      ] as [any, any]);
    
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
        'did:example:mediator',
        'did:example:mediatorNewDID',
        'http://test.com',
        expect.any(Object),
        expect.any(Object),
      );
    
      expect(result).toEqual({
        messagingDid: 'did:example:recipientDID',
        mediatorDid: 'did:example:mediator',
      });
    });
  });
});

