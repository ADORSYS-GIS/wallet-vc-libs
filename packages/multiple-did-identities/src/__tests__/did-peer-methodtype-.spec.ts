import { DidPeerMethod } from '../did-methods/DidPeerMethod';
import { PeerGenerationMethod } from '../did-methods/DidMethodFactory';

describe('DidPeerMethod', () => {
  let didPeerMethod: DidPeerMethod;

  beforeEach(() => {
    didPeerMethod = new DidPeerMethod();
  });

  it('should have the correct method name', () => {
    expect(didPeerMethod.method).toBe('peer');
  });

  it('should throw an error for unsupported method type', async () => {
    await expect(
      didPeerMethod.generate('unsupported' as PeerGenerationMethod),
    ).rejects.toThrow('Unsupported method type: unsupported');
  });

  it('should generate DIDKeyPair for method0', async () => {
    const result = await didPeerMethod.generate('method0');
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('privateKey');
    expect(result).toHaveProperty('publicKey');
  });

  it('should generate DIDKeyPair for method1', async () => {
    const result = await didPeerMethod.generate('method1');
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('privateKey');
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('genesisDocument');
  });

  it('should generate DIDKeyPair for method2', async () => {
    const result = await didPeerMethod.generate('method2');
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKeyV');
    expect(result).toHaveProperty('publicKeyV');
    expect(result).toHaveProperty('privateKeyE');
    expect(result).toHaveProperty('publicKeyE');
  });

  it('should generate DIDKeyPair for method3', async () => {
    const result = await didPeerMethod.generate('method3');
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKeyV');
    expect(result).toHaveProperty('publicKeyV');
    expect(result).toHaveProperty('privateKeyE');
    expect(result).toHaveProperty('publicKeyE');
  });

  it('should generate DIDKeyPair for method4', async () => {
    const result = await didPeerMethod.generate('method4');
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('didShort');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKey1');
    expect(result).toHaveProperty('publicKey1');
    expect(result).toHaveProperty('privateKey2');
    expect(result).toHaveProperty('publicKey2');
  });
});
