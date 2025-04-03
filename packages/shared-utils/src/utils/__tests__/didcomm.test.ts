import { JWKKeys as JWK } from '@adorsys-gis/multiple-did-identities';
import { DIDCommMessagingService } from 'didcomm';
import { describe, expect, it } from 'vitest';
import {
  isDIDCommMessagingServiceEndpoint,
  jwkToPublicKeyBase58,
} from '../didcomm';

describe('utils (didcomm)', () => {
  describe('isDIDCommMessagingServiceEndpoint', () => {
    it('should return true for a valid DIDCommMessagingService object', () => {
      const validService: DIDCommMessagingService = {
        uri: 'https://example.com',
        routing_keys: [],
      };
      expect(isDIDCommMessagingServiceEndpoint(validService)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isDIDCommMessagingServiceEndpoint(null)).toBe(false);
      expect(isDIDCommMessagingServiceEndpoint({})).toBe(false);
      expect(isDIDCommMessagingServiceEndpoint({ uri: undefined })).toBe(false);
    });
  });

  describe('jwkToPublicKeyBase58', () => {
    it.each([
      [
        {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'O2onvM62pC1io6jQKm8Nc2UyFXcd4kOmOsBIoYtZ2ik',
        },
        '6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp',
      ],
      [
        {
          kty: 'OKP',
          crv: 'X25519',
          x: 'SHSUZ6V3x355FqCzIUfgoPzrZB0BQs0JKyag4UfMqHQ',
        },
        '6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF',
      ],
    ])(
      'should compute the Base58 representation for Ed25519/X25519 JWK',
      (jwk: JWK, publicKeyBase58) => {
        expect(jwkToPublicKeyBase58(jwk)).toEqual(publicKeyBase58);
      },
    );

    it('should throw an error for unsupported curves', () => {
      const jwk: JWK = { kty: 'EC', crv: 'P-256', x: 'mockedKeyMaterial' };
      expect(() => jwkToPublicKeyBase58(jwk)).toThrowError(
        'Unsupported curve: P-256',
      );
    });

    it('should throw an error for missing key material', () => {
      const invalidJwk: Partial<JWK> = { crv: 'Ed25519' };
      expect(() => jwkToPublicKeyBase58(invalidJwk as JWK)).toThrowError(
        'Invalid JWK: Missing key material',
      );
    });
  });
});
