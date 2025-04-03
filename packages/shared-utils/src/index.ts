// Export the StableDIDResolver
export {
  StableDIDResolver,
  PeerDIDResolverProfile,
} from './resolver/StableDIDResolver';

// Export constants
export { DIDCOMM_MESSAGING_SERVICE_TYPE } from './constants';

// Export utilities
export { normalizeToArray } from './utils/misc';
export {
  isDIDCommMessagingServiceEndpoint,
  jwkToPublicKeyBase58,
} from './utils/didcomm';
