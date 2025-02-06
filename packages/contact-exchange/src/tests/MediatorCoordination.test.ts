import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import { EventEmitter } from 'eventemitter3';

import { DidService } from '../services/MediatorCoordination';

import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';

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
    service = new DidService(eventBus, securityService);
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

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
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
