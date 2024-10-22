import { IDidMethod, DIDKeyPair } from './IDidMethod';
import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';

// Declare enum for the supported DID methods
export enum DIDMethodName {
  Key = 'key',
  Peer = 'peer'
}

export class DidMethodFactory {
  // Update the 'method' argument type to use the enum
  static create(method: DIDMethodName): IDidMethod {
    switch (method) {
      case DIDMethodName.Key:
        return new DidKeyMethod();
      case DIDMethodName.Peer:
        return new DidPeerMethod();
      default:
        throw new Error(`Unsupported DID method: ${method}`);
    }
  }

  /**
   * Generates a DID using the specified method.
   * @param method - The DID method to use (DIDMethodName.Key or DIDMethodName.Peer).
   * @returns A Promise that resolves to a DIDKeyPair.
   */
  static async generateDid(method: DIDMethodName): Promise<DIDKeyPair> {
    const didMethod = this.create(method);
    return didMethod.generate();
  }
}