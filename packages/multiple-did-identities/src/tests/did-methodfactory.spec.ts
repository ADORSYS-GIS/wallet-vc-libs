import {
  DidMethodFactory,
  DIDMethodName,
  PeerGenerationMethod,
} from '../did-methods/DidMethodFactory';
import { DidKeyMethod } from '../did-methods/DidKeyMethod';
import { DidPeerMethod } from '../did-methods/DidPeerMethod';

describe('DidMethodFactory', () => {
  describe('create', () => {
    it('should create an instance of DidKeyMethod when method is key', () => {
      const didMethod = DidMethodFactory.create(DIDMethodName.Key);
      expect(didMethod).toBeInstanceOf(DidKeyMethod);
    });

    it('should create an instance of DidPeerMethod when method is peer', () => {
      const didMethod = DidMethodFactory.create(DIDMethodName.Peer);
      expect(didMethod).toBeInstanceOf(DidPeerMethod);
    });

    it('should throw an error when an unsupported method is provided', () => {
      expect(() =>
        DidMethodFactory.create('invalidMethod' as DIDMethodName),
      ).toThrow('Unsupported DID method: invalidMethod');
    });
  });

  describe('generateDid', () => {
    it('should generate a DID using DidKeyMethod when method is key', async () => {
      const result = await DidMethodFactory.generateDid(DIDMethodName.Key);

      // Type guard to check if result is DIDKeyPair
      if ('publicKey' in result && 'privateKey' in result) {
        expect(result.publicKey.kty).toBe('OKP');
        expect(result.publicKey.crv).toBe('Ed25519');
        expect(result.publicKey.x).toBeDefined();
        // Check if privateKey is defined before accessing it
        if (result.privateKey) {
          expect(result.privateKey.d).toBeDefined();
        } else {
          throw new Error("Private key is undefined");
        }
      } else {
        throw new Error(
          "Result is not of type DIDKeyPair with 'publicKey' and 'privateKey'",
        );
      }
    });

    it('should throw an error if methodType is provided with DIDMethodName.Key', async () => {
      await expect(
        DidMethodFactory.generateDid(
          DIDMethodName.Key,
          'method1' as PeerGenerationMethod,
        ),
      ).rejects.toThrow(
        'methodType should not be specified for DIDMethodName.Key',
      );
    });

    it('should throw an error if methodType is not provided with DIDMethodName.Peer', async () => {
      await expect(
        DidMethodFactory.generateDid(DIDMethodName.Peer),
      ).rejects.toThrow('methodType must be specified for DIDMethodName.Peer');
    });

    it('should create an instance of DidPeerMethod when DIDMethodName.Peer is provided', () => {
      const method = DidMethodFactory.create(DIDMethodName.Peer);
      expect(method).toBeInstanceOf(DidPeerMethod);
    });

    it('should create an instance of DidKeyMethod when DIDMethodName.Key is provided', () => {
      const method = DidMethodFactory.create(DIDMethodName.Key);
      expect(method).toBeInstanceOf(DidKeyMethod);
    });

    it('should throw an error for an unsupported DID method', () => {
      expect(() =>
        DidMethodFactory.create('unsupported' as DIDMethodName),
      ).toThrow('Unsupported DID method: unsupported');
    });

    const peerMethods: PeerGenerationMethod[] = [
      PeerGenerationMethod.Method0,
      PeerGenerationMethod.Method1,
      PeerGenerationMethod.Method2,
      PeerGenerationMethod.Method2WithMediatorRoutingKey,
      PeerGenerationMethod.Method3,
      PeerGenerationMethod.Method4,
    ];

    peerMethods.forEach((methodType) => {
      it(`should generate a DID for peer method ${methodType}`, async () => {
        // If the method is 'method2WithMediatorRoutingKey', pass routing keys as options
        const mediatorRoutingKey =
          methodType === 'method2WithMediatorRoutingKey'
            ? 'routingKey1'
            : undefined;

        const result = await DidMethodFactory.generateDid(
          DIDMethodName.Peer,
          methodType,
          mediatorRoutingKey,
        );

        // General assertion: check that 'did' is present
        expect(result.did).toContain(`did:peer:${methodType.charAt(6)}`);

        // Conditional checks based on methodType
        switch (methodType) {
          case 'method0':
            expect(result).toHaveProperty('privateKey');
            expect(result).toHaveProperty('publicKey');
            break;

          case 'method1':
            expect(result).toHaveProperty('privateKey');
            expect(result).toHaveProperty('publicKey');
            expect(result).toHaveProperty('genesisDocument');
            break;

          case 'method2':
            expect(result).toHaveProperty('didDocument');
            expect(result).toHaveProperty('privateKeyV');
            expect(result).toHaveProperty('publicKeyV');
            expect(result).toHaveProperty('privateKeyE');
            expect(result).toHaveProperty('publicKeyE');
            break;

          case 'method3':
            expect(result).toHaveProperty('didDocument');
            expect(result).toHaveProperty('privateKeyV');
            expect(result).toHaveProperty('publicKeyV');
            expect(result).toHaveProperty('privateKeyE');
            expect(result).toHaveProperty('publicKeyE');
            break;

          case 'method4':
            expect(result).toHaveProperty('didShort');
            expect(result).toHaveProperty('didDocument');
            expect(result).toHaveProperty('privateKey1');
            expect(result).toHaveProperty('publicKey1');
            expect(result).toHaveProperty('privateKey2');
            expect(result).toHaveProperty('publicKey2');
            break;

          case 'method2WithMediatorRoutingKey':
            expect(result).toHaveProperty('didDocument');
            expect(result).toHaveProperty('privateKeyV');
            expect(result).toHaveProperty('publicKeyV');
            expect(result).toHaveProperty('privateKeyE');
            expect(result).toHaveProperty('publicKeyE');
            break;
          default:
            throw new Error(`Unknown method type: ${methodType}`);
        }
      });
    });
  });
});
