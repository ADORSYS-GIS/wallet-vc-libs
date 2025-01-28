import {
  DIDCommMessagingService,
  DIDDoc,
  Secret,
  SecretsResolver,
  ServiceKind,
} from 'didcomm';

import { PeerDIDResolver } from 'did-resolver-lib';
import { DIDCOMM_MESSAGING_SERVICE_TYPE } from '../protocols/types/constants';
import { normalizeToArray } from './misc';

/**
 * Type guard for {@link DIDCommMessagingService}
 */
export function isDIDCommMessagingServiceEndpoint(
  arg: unknown,
): arg is DIDCommMessagingService {
  return arg != null && typeof arg == 'object' && 'uri' in arg;
}

/**
 * Implementation of a {@link SecretsResolver} for static secrets.
 */
export class StaticSecretsResolver implements SecretsResolver {
  knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) =>
      this.knownSecrets.find((secret) => secret.id === id),
    );
  }
}

/**
 * This {@link DIDResolver} implementation ensures that returned
 * DID documents are in a widely compatible format.
 */
export class StableDIDResolver extends PeerDIDResolver {
  override async resolve(did: string): Promise<DIDDoc | null> {
    const diddoc = await super.resolve(did);
    if (diddoc == null) {
      return diddoc;
    }

    // Normalize services to the array variant
    diddoc.service = normalizeToArray(diddoc.service);

    // Reducing service endpoints to the single object variant
    // If an array, service endpoints beyond the first element will be dismissed
    diddoc.service.forEach((service) => {
      if (Array.isArray(service.serviceEndpoint)) {
        service.serviceEndpoint = service.serviceEndpoint[0];
      }
    });

    // Normalize service endpoints of DIDCommMessaging services
    diddoc.service
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

    return diddoc;
  }
}
