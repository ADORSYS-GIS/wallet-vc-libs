export {
  DID2Type,
  DIDMethodName,
  PeerGenerationMethod,
} from './did-methods/DidMethodFactory';
export { DidPeerMethod } from './did-methods/DidPeerMethod';
export * from './did-methods/IDidMethod';
export { PrivateKeyJWK } from './did-methods/IDidMethod';
export { DIDIdentityService } from './lib/services';
export { DidRepository } from './repository/DidRepository';
export { SecurityService } from './security/SecurityService';
export { DidEventChannel } from './utils/DidEventChannel';
