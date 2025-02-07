import { describe, expect, it } from 'vitest';

import { StableDIDResolver, StaticSecretsResolver } from '../didcomm';
import { PeerDIDResolverProfile } from '../resolver/StableDIDResolver';

import {
  aliceDid,
  aliceDidInvalidServiceEndpoint,
} from '../../protocols/__tests__/helpers';

describe('utils (resolver)', () => {
  describe('StableDIDResolver', () => {
    const resolver = new StableDIDResolver();

    it('should resolve did:peer address', async () => {
      const diddoc = await resolver.resolve(aliceDid);
      expect(diddoc).toEqual(
        expect.objectContaining({
          id: aliceDid,
        }),
      );
    });

    it('should enforce did:peer profile reliably', async () => {
      // aliceDid has a RootsID mediator
      const enforcedResolver = await resolver.enforceProfileForParty(aliceDid);
      const profile = enforcedResolver.getPeerDidResolverProfile();
      const diddoc = await enforcedResolver.resolve(aliceDid);

      expect(profile).toEqual(PeerDIDResolverProfile.RootsID);
      expect(diddoc).toEqual(
        expect.objectContaining({
          id: aliceDid,
        }),
      );

      const asserter = (id: string) => expect(id).not.toContain('#key-');
      diddoc?.verificationMethod.forEach(({ id }) => asserter(id));
      diddoc?.authentication.forEach((id) => asserter(id));
      diddoc?.keyAgreement.forEach((id) => asserter(id));
    });

    it('should handle unsupported did methods reliably', async () => {
      // did:key is not supported
      const did = 'did:key:example';
      expect(await resolver.resolve(did)).toBeNull();

      // Should resolve peer did profile to default regardless
      const enforcedResolver = await resolver.enforceProfileForParty(did);
      const profile = enforcedResolver.getPeerDidResolverProfile();
      expect(profile).toEqual(PeerDIDResolverProfile.Default);
    });

    it('should fail if unable to autocorrect structure', async () => {
      await expect(
        async () => await resolver.resolve(aliceDidInvalidServiceEndpoint),
      ).rejects.toThrowError(
        'Failed to autocorrect malformed DIDCommMessaging service endpoint',
      );
    });
  });

  describe('StaticSecretsResolver', () => {
    const resolverJwkSecret = new StaticSecretsResolver([
      {
        id: 'did:peer:example#key-1',
        type: 'X25519KeyAgreementKey2019',
        privateKeyJwk: {
          kty: 'OKP',
          crv: 'X25519',
          x: 'SHSUZ6V3x355FqCzIUfgoPzrZB0BQs0JKyag4UfMqHQ',
          d: '0A8SSFkGHg3N9gmVDRnl63ih5fcwtEvnQu9912SVplY',
        },
      },
    ]);

    const resolverBase58Secret = new StaticSecretsResolver([
      {
        id: 'did:peer:example#key-1',
        type: 'X25519KeyAgreementKey2019',
        privateKeyBase58: '6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF',
      },
    ]);

    const resolverMultibaseSecret = new StaticSecretsResolver([
      {
        id: 'did:peer:example#key-1',
        type: 'X25519KeyAgreementKey2019',
        privateKeyMultibase: 'z6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF',
      },
    ]);

    it.each([
      [resolverJwkSecret],
      [resolverBase58Secret],
      [resolverMultibaseSecret],
    ])('should match secrets by ID or Base58 ID', async (resolver) => {
      const id = 'did:peer:example#key-1';
      const altId =
        'did:peer:example#6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF';

      const secret = expect.objectContaining({
        id: 'did:peer:example#key-1',
        type: 'X25519KeyAgreementKey2019',
      });

      expect(await resolver.get_secret(id)).toEqual(secret);
      expect(await resolver.get_secret(altId)).toEqual(secret);
    });

    it('should return null on unavailable secrets', async () => {
      const resolver = resolverJwkSecret;
      expect(await resolver.get_secret('did:peer:unknown')).toBeNull();
    });

    it('should discard IDs with no secrets available', async () => {
      const resolver = resolverJwkSecret;
      const res = await resolver.find_secrets([
        'did:peer:unknown',
        'did:peer:example#key-1',
        'did:peer:example#6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF',
        'did:key:unknown',
      ]);

      expect(res).toEqual([
        'did:peer:example#key-1',
        'did:peer:example#6LSgZ1d5kw5HjLuifq8tGYnG32KaY9ZFupZgEpaD54LjskF',
      ]);
    });
  });
});
