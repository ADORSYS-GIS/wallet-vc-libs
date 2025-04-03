import { describe, expect, test, it } from 'vitest';
import { DIDCOMM_MESSAGING_SERVICE_TYPE } from '../../constants';
import {
  StableDIDResolver,
  PeerDIDResolverProfile,
} from '../StableDIDResolver';
import type { DIDDoc } from 'didcomm';

describe('StableDIDResolver', () => {
  const resolver = new StableDIDResolver();

  test('should resolve DIDs with default profile', async () => {
    const did =
      'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';
    const diddoc = await resolver.resolve(did);

    expect(diddoc).toBeTruthy();
    expect(diddoc?.id).toBe(did);
  });

  test('should normalize DIDComm messaging services', async () => {
    const did =
      'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';
    const diddoc = await resolver.resolve(did);

    const messagingServices = diddoc?.service.filter(
      (s) => s.type === DIDCOMM_MESSAGING_SERVICE_TYPE,
    );

    expect(messagingServices).toBeTruthy();
    messagingServices?.forEach((service) => {
      expect(service.serviceEndpoint).toHaveProperty('uri');
      expect(service.serviceEndpoint).toHaveProperty('routing_keys');
    });
  });

  test('should enforce RootsID profile when detected', async () => {
    const did =
      'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';

    // Create a custom resolver that returns a DID document with RootsID service
    class CustomResolver extends StableDIDResolver {
      override async resolve(did: string): Promise<DIDDoc | null> {
        const diddoc = await super.resolve(did);
        if (!diddoc) return null;

        // Add RootsID service endpoint
        diddoc.service.push({
          id: `${diddoc.id}#service-1`,
          type: DIDCOMM_MESSAGING_SERVICE_TYPE,
          serviceEndpoint: {
            uri: 'https://mediator.rootsid.cloud',
            routing_keys: [],
          },
        });

        return diddoc;
      }
    }

    const customResolver = new CustomResolver();
    const newResolver = await customResolver.enforceProfileForParty(did);
    expect(newResolver.getPeerDidResolverProfile()).toBe(
      PeerDIDResolverProfile.RootsID,
    );
  });

  test('should convert key IDs to RootsID format when using RootsID profile', async () => {
    const rootsidResolver = new StableDIDResolver(
      PeerDIDResolverProfile.RootsID,
    );
    const did =
      'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';
    const diddoc = await rootsidResolver.resolve(did);

    expect(diddoc).toBeTruthy();
    diddoc?.verificationMethod.forEach((method) => {
      expect(method.id).toMatch(/^did:peer:[^#]+#[^#]+$/);
    });
  });

  test('should handle non-peer DIDs without modification', async () => {
    const did = 'did:example:123';
    const diddoc = await resolver.resolve(did);
    expect(diddoc).toBeNull();
  });

  test('should handle unsupported did methods reliably', async () => {
    // did:key is not supported
    const did = 'did:key:example';
    expect(await resolver.resolve(did)).toBeNull();

    // Should resolve peer did profile to default regardless
    const enforcedResolver = await resolver.enforceProfileForParty(did);
    const profile = enforcedResolver.getPeerDidResolverProfile();
    expect(profile).toEqual(PeerDIDResolverProfile.Default);
  });

  test('should fail if unable to autocorrect structure', async () => {
    const did =
      'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOjEyMzR9';
    await expect(async () => await resolver.resolve(did)).rejects.toThrowError(
      'Failed to autocorrect malformed DIDCommMessaging service endpoint',
    );
  });
});
