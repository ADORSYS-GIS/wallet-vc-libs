import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';
import { DIDKeyPair, DIDKeyPairMethod1, DIDKeyPairMethod2, IDidMethod, DIDKeyPairMethod4 } from './IDidMethod';

// Declare enum for the supported DID methods
export enum DIDMethodName {
  Key = 'key',
  Peer = 'peer',
}

export enum PurposeCode {
  Assertion = 'A',
  Encryption = 'E',
  Verification = 'V',
  Capability_Invocation = 'I',
  Capability_Delegation = 'D',
  Service = 'S'
}

export type DIDKeyPairVariants = DIDKeyPair | DIDKeyPairMethod1 | DIDKeyPairMethod2 | DIDKeyPairMethod4;
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

    // Validate that methodType is only used with DIDMethodName.Peer
    if (method === DIDMethodName.Key && methodType) {
      throw new Error(`methodType should not be specified for DIDMethodName.Key`);
    }

    if (method === DIDMethodName.Peer && !methodType) {
      throw new Error(`methodType must be specified for DIDMethodName.Peer`);
    }
    
    // Call the appropriate generation method based on DID type
    if (method === DIDMethodName.Peer && methodType) {
      return (didMethod as DidPeerMethod).generate(methodType);
    }
    return didMethod.generate();
  }
}
