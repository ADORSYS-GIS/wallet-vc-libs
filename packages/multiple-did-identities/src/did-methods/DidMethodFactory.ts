import { IDidMethod, DIDKeyPair, DIDKeyPairMethod1 } from './IDidMethod';
import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';

// Declare enum for the supported DID methods
export enum DIDMethodName {
  Key = 'key',
  Peer = 'peer',
}

export enum PurposeCode {
  Verification = 'V',
  Encryption = 'E'
}

export type DIDKeyPairVariants = DIDKeyPair | DIDKeyPairMethod1;
export type PeerGenerationMethod = 'method0' | 'method1' | 'method2' | 'method3' | 'method4';

export class DidMethodFactory {
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
   * @param methodType - The specific generation method to use for the Peer method.
   * @returns A Promise that resolves to a DIDKeyPair.
   */
  static async generateDid(method: DIDMethodName, methodType?: PeerGenerationMethod): Promise<DIDKeyPairVariants> {
    const didMethod = this.create(method);
    if (method === DIDMethodName.Peer && methodType) {
      return (didMethod as DidPeerMethod).generate(methodType);
    }
    return didMethod.generate();
  }
}
