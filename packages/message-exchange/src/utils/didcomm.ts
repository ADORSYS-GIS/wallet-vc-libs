export { StableDIDResolver } from './resolver/StableDIDResolver';
export { StaticSecretsResolver } from './resolver/StaticSecretsResolver';

import { PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities';
import { base58, base64urlnopad } from '@scure/base';
import { DIDCommMessagingService } from 'didcomm';

type JWK = PrivateKeyJWK['privateKeyJwk'];

/**
 * Type guard for {@link DIDCommMessagingService}
 */
export function isDIDCommMessagingServiceEndpoint(
  arg: unknown,
): arg is DIDCommMessagingService {
  return arg != null && typeof arg == 'object' && 'uri' in arg;
}

/**
 * Computes the Base58 representation of a public JWK.
 */
export function jwkToPublicKeyBase58(jwk: JWK): string {
  // Validate input
  if (!jwk || !jwk.x) {
    throw new Error('Invalid JWK: Missing key material');
  }

  // Match crv to prefix
  let prefix;
  switch (jwk.crv) {
    case 'Ed25519':
      prefix = [0xed, 0x01];
      break;
    case 'X25519':
      prefix = [0xec, 0x01];
      break;
    default:
      throw new Error(`Unsupported curve: ${jwk.crv}`);
  }

  // Decode base64url key part and append to prefix
  const keyBytes = [...prefix, ...base64urlnopad.decode(jwk.x)];

  // Encode with base58
  return base58.encode(Uint8Array.from(keyBytes));
}
