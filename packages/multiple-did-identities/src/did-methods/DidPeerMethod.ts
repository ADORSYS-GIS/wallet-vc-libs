import { DIDKeyPair, IDidMethod } from './IDidMethod';

/**
 * DID:peer Method Implementation
 * Generates a DID:peer identifier using the Ed25519 public key in JWK format.
 */
export class DidPeerMethod implements IDidMethod {
  method = 'peer';

  async generate(): Promise<DIDKeyPair> {
    throw new Error("This method is unimplemented.");
  }
}
