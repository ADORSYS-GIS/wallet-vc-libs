export * from './did-methods/IDidMethod';
export { DIDIdentityService } from './lib/services';
export { DidEventChannel } from './utils/DidEventChannel';

export {
  DIDMethodName,
  PeerGenerationMethod,
} from './did-methods/DidMethodFactory';

// Exports intended for inter-service calls

export { DidPeerMethod } from './did-methods/DidPeerMethod';
export { DidRepository } from './repository/DidRepository';
export { SecurityService } from './security/SecurityService';
