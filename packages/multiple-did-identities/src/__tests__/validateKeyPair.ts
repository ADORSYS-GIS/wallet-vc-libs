import { JWKKeys, PrivateKeyJWK } from "../did-methods/IDidMethod";
import { base64UrlEncode } from "../utils/base64UrlEncode";

export function validateKeyPair({
    rawPublicKey,
    rawPrivateKey,
    publicKeyJwk,
    privateKeyJwk,
  }: {
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: JWKKeys;
  }, crv: string ) {
    // Validate raw keys
    expect(rawPublicKey).toBeInstanceOf(Uint8Array);
    expect(rawPrivateKey).toBeInstanceOf(Uint8Array);
  
    // Validate JWK structures
    expect(publicKeyJwk).toMatchObject<JWKKeys>({
      kty: 'OKP',
      crv,
      x: base64UrlEncode(rawPublicKey),
    });
  
    expect(privateKeyJwk).toMatchObject<JWKKeys>({
      kty: 'OKP',
      crv,
      x: base64UrlEncode(rawPublicKey),
      d: base64UrlEncode(rawPrivateKey),
    });
  }
  
  export function validateKeyPair2({
    rawPublicKey,
    rawPrivateKey,
    publicKeyJwk,
    privateKeyJwk,
  }: {
    rawPublicKey: Uint8Array;
    rawPrivateKey: Uint8Array;
    publicKeyJwk: JWKKeys;
    privateKeyJwk: PrivateKeyJWK;
  }, crv: string, keyId: string) {
    // Validate raw keys
    expect(rawPublicKey).toBeInstanceOf(Uint8Array);
    expect(rawPrivateKey).toBeInstanceOf(Uint8Array);
  
    // Validate JWK structures
    expect(publicKeyJwk).toMatchObject<JWKKeys>({
      kty: 'OKP',
      crv,
      x: base64UrlEncode(rawPublicKey),
    });
  
    // Additional validation for privateKeyJwk structure
    expect(privateKeyJwk).toMatchObject({
      id: keyId,
      type: 'JsonWebKey2020',
      privateKeyJwk: {
        kty: 'OKP',
        crv,
        d: base64UrlEncode(rawPrivateKey),
        x: base64UrlEncode(rawPublicKey),
      },
    });
  }