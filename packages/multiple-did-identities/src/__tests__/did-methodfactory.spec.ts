import {
  DidMethodFactory,
  DIDMethodName,
} from '../did-methods/DidMethodFactory';
import { DidKeyMethod } from '../did-methods/DidKeyMethod';

describe('DidMethodFactory', () => {
  describe('create', () => {
    it('should create an instance of DidKeyMethod when method is key', () => {
      const didMethod = DidMethodFactory.create(DIDMethodName.Key);
      expect(didMethod).toBeInstanceOf(DidKeyMethod);
    });

    it('should throw an error when an unsupported method is provided', () => {
      expect(() =>
        DidMethodFactory.create('invalidMethod' as DIDMethodName),
      ).toThrow('Unsupported DID method: invalidMethod');
    });
  });

  describe('generateDid', () => {
    it('should generate a DID using DidKeyMethod', async () => {
      const result = await DidMethodFactory.generateDid(DIDMethodName.Key);

      // Type guard to check if result is DIDKeyPair
      if ('publicKey' in result && 'privateKey' in result) {
        expect(result.publicKey.kty).toBe('OKP');
        expect(result.publicKey.crv).toBe('Ed25519');
        expect(result.publicKey.x).toBeDefined();
        expect(result.privateKey.d).toBeDefined();
      } else {
        throw new Error("Result is not of type DIDKeyPair with 'publicKey' and 'privateKey'");
      }
    });
  });
});
