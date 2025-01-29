import { PeerDIDResolver } from 'did-resolver-lib';
import { DIDDoc, Service } from 'didcomm';
import { DIDCOMM_MESSAGING_SERVICE_TYPE } from '../../protocols/types/constants';
import { isDIDCommMessagingServiceEndpoint } from '../didcomm';
import { normalizeToArray } from '../misc';

/**
 * Key ID profiles for did:peer resolution.
 *
 * The did:peer specification rules that key IDs must be relative, assigned
 * in ascending numerical order as per the template "#key-{}". However, this
 * creates issues as cross-did keys become difficult to manage.
 *
 * Vendors disobey the rule with different absolute formats that we consider
 * for establishing operability.
 */
export enum PeerDIDResolverProfile {
  // Simply prepends the did so the key ID is absolute: {did}#key-{}.
  Default,
  // Roots ID's current implementations swaps "#key-{}" for the base58
  // value of the key. Of course, the did is prepended so the key ID is
  // absolute. (Was this just an old version of the specs?)
  RootsID,
}

/**
 * This {@link DIDResolver} implementation ensures that returned
 * DID documents are opting for widely compatible format variants.
 */
export class StableDIDResolver extends PeerDIDResolver {
  /**
   * Preconfigure mappings of matching DID documents to preset profiles.
   * DID documents are matched based on an exposed service endpoint URI
   * that includes the key in the map.
   */
  private readonly peerDidDocPresetProfiles = {
    rootsid: PeerDIDResolverProfile.RootsID,
  };

  /**
   * Resolves a DID document by the given DID.
   */
  override async resolve(did: string): Promise<DIDDoc | null> {
    const diddoc = await super.resolve(did);
    if (diddoc == null) {
      return diddoc;
    }

    // Normalize services to compatible variants
    diddoc.service = this.normalizeServices(diddoc.service);

    // Convert key IDs into the enabled profile
    this.conformKeyIdFormatToProfile(diddoc);

    return diddoc;
  }

  /**
   * Reformats services, opting for structure variants compatible
   * with the didcomm library.
   */
  private normalizeServices(services: Service[]): Service[] {
    // Normalize services to the array variant
    services = normalizeToArray(services);

    // Reducing service endpoints to the single object variant.
    // If an array, service endpoints beyond the first element
    // will be dismissed
    services.forEach((service) => {
      if (Array.isArray(service.serviceEndpoint)) {
        service.serviceEndpoint = service.serviceEndpoint[0];
      }
    });

    // Normalize service endpoints of DIDCommMessaging services
    services
      .filter((service) => service.type == DIDCOMM_MESSAGING_SERVICE_TYPE)
      .forEach((service) => {
        let serviceEndpoint = service.serviceEndpoint;

        // Attempt to autocorrect malformed service endpoint
        if (!isDIDCommMessagingServiceEndpoint(serviceEndpoint)) {
          if (typeof serviceEndpoint === 'string') {
            serviceEndpoint = { uri: serviceEndpoint };
          } else {
            throw new Error(
              'Failed to autocorrect malformed DIDCommMessaging service endpoint',
            );
          }
        }

        // Duplicate routingKeys to routing_keys for compatibility
        const routingKeys = serviceEndpoint.routingKeys;
        if (!Array.isArray(serviceEndpoint.routing_keys)) {
          serviceEndpoint.routing_keys = normalizeToArray(routingKeys);
        }

        service.serviceEndpoint = serviceEndpoint;
      });

    return services;
  }

  /**
   * Conforms key IDs to the format defined by the enabled profile.
   */
  private conformKeyIdFormatToProfile(diddoc: DIDDoc): void {
    if (!diddoc.id.startsWith('did:peer:')) {
      return;
    }

    const profile = this.resolvePeerDIDResolverProfile(diddoc);

    if (profile == PeerDIDResolverProfile.RootsID) {
      const keyMapping = new Map();

      diddoc.verificationMethod.forEach((method) => {
        const baseValue =
          method.publicKeyBase58 ??
          method.publicKeyMultibase?.replace(/^z/, '');

        if (!baseValue) {
          throw new Error(`No base value could be read for key ${method.id}`);
        }

        const newId = `${diddoc.id}#${baseValue}`;
        keyMapping.set(method.id, newId);
        method.id = newId;
      });

      diddoc.authentication = diddoc.authentication.map((key) =>
        keyMapping.get(key),
      );

      diddoc.keyAgreement = diddoc.keyAgreement.map((key) =>
        keyMapping.get(key),
      );
    }
  }

  /**
   * Resolves PeerDIDResolverProfile from preset mappings.
   */
  private resolvePeerDIDResolverProfile(
    diddoc: DIDDoc,
  ): PeerDIDResolverProfile {
    const serviceEndpointUris = diddoc.service
      .map((s) => s.serviceEndpoint)
      .filter(isDIDCommMessagingServiceEndpoint)
      .map((s) => s.uri);

    const presetKeys = Object.keys(this.peerDidDocPresetProfiles) as Array<
      keyof StableDIDResolver['peerDidDocPresetProfiles']
    >;

    const matchingPresetKey = presetKeys.find((presetKey) =>
      serviceEndpointUris.some((uri) => uri.includes(presetKey)),
    );

    return matchingPresetKey
      ? this.peerDidDocPresetProfiles[matchingPresetKey]
      : PeerDIDResolverProfile.Default;
  }
}
