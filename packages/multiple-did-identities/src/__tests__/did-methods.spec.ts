import { base64UrlEncode } from '../utils/base64UrlEncode';
import { DidKeyMethod } from '../did-methods/DidKeyMethod';
import { DidPeerMethod } from '../did-methods/DidPeerMethod';
import { DidMethodFactory } from '../did-methods/DidMethodFactory';

describe('base64UrlEncode', () => {
  it('should correctly encode a known input without padding', () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
    const expected = 'SGVsbG8';
    const result = base64UrlEncode(input);
    expect(result).toBe(expected);
  });

  it('should correctly encode data that requires padding removal', () => {
    const input = new Uint8Array([102, 111, 111]); // 'foo'
    const expected = 'Zm9v';
    const result = base64UrlEncode(input);
    expect(result).toBe(expected);
  });

  it('should handle empty input', () => {
    const input = new Uint8Array([]);
    const expected = '';
    const result = base64UrlEncode(input);
    expect(result).toBe(expected);
  });

  it('should correctly encode binary data', () => {
    const input = new Uint8Array([0, 255, 128, 64, 32, 16, 8]);
    const expected = 'AP-AQCAQCA';
    const result = base64UrlEncode(input);
    expect(result).toBe(expected);
  });

  it('should encode large data correctly', () => {
    const input = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      input[i] = i;
    }
    // Expected result needs to be calculated or compared with another implementation
    const expected = Buffer.from(input)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const result = base64UrlEncode(input);
    expect(result).toBe(expected);
  });
});

describe('DidKeyMethod', () => {
  it('should generate a valid DID key pair with did:key format', async () => {
    const didKeyMethod = new DidKeyMethod();
    const keyPair = await didKeyMethod.generate();

    expect(keyPair).toHaveProperty('did');
    expect(keyPair.did.startsWith('did:key:')).toBe(true);

    expect(keyPair).toHaveProperty('privateKey');
    expect(keyPair.privateKey).toHaveProperty('d');

    expect(keyPair).toHaveProperty('publicKey');
    expect(keyPair.publicKey).toHaveProperty('x');
  });

  it('should return private and public keys in JWK format', async () => {
    const didKeyMethod = new DidKeyMethod();
    const keyPair = await didKeyMethod.generate();

    const { privateKey, publicKey } = keyPair;
    expect(privateKey.kty).toBe('OKP');
    expect(publicKey.kty).toBe('OKP');
    expect(publicKey.crv).toBe('Ed25519');
  });
});

describe('DidPeerMethod', () => {
  it('should generate a valid DID key pair with did:peer format', async () => {
    const didPeerMethod = new DidPeerMethod();
    const keyPair = await didPeerMethod.generate();

    expect(keyPair).toHaveProperty('did');
    expect(keyPair.did.startsWith('did:peer:')).toBe(true);

    expect(keyPair).toHaveProperty('privateKey');
    expect(keyPair.privateKey).toHaveProperty('d');

    expect(keyPair).toHaveProperty('publicKey');
    expect(keyPair.publicKey).toHaveProperty('x');
  });

  it('should return private and public keys in JWK format', async () => {
    const didPeerMethod = new DidPeerMethod();
    const keyPair = await didPeerMethod.generate();

    const { privateKey, publicKey } = keyPair;
    expect(privateKey.kty).toBe('OKP');
    expect(publicKey.kty).toBe('OKP');
    expect(publicKey.crv).toBe('Ed25519');
  });
});

describe('DidMethodFactory', () => {
  it('should create DidKeyMethod when method is "key"', () => {
    const method = DidMethodFactory.create('key');
    expect(method).toBeInstanceOf(DidKeyMethod);
  });

  it('should create DidPeerMethod when method is "peer"', () => {
    const method = DidMethodFactory.create('peer');
    expect(method).toBeInstanceOf(DidPeerMethod);
  });

  it('should throw an error when method is unsupported', () => {
    expect(() => DidMethodFactory.create('unsupported')).toThrow(
      'Unsupported DID method: unsupported',
    );
  });

  it('should generate a DID with the "key" method', async () => {
    const didKeyPair = await DidMethodFactory.generateDid('key');
    expect(didKeyPair.did.startsWith('did:key:')).toBe(true);
  });

  it('should generate a DID with the "peer" method', async () => {
    const didKeyPair = await DidMethodFactory.generateDid('peer');
    expect(didKeyPair.did.startsWith('did:peer:')).toBe(true);
  });
});
