import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';
import type {
  DIDKeyPair,
  DIDKeyPairMethod1,
  DIDKeyPairMethod2,
  DIDKeyPairMethod4,
  IDidMethod,
} from './IDidMethod';

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
  Service = 'S',
}

export type DIDKeyPairVariants =
  | DIDKeyPair
  | DIDKeyPairMethod1
  | DIDKeyPairMethod2
  | DIDKeyPairMethod4;

export enum PeerGenerationMethod {
  Method0 = 'method0',
  Method1 = 'method1',
  Method2 = 'method2',
  Method3 = 'method3',
  Method4 = 'method4',
  Method2WithMediatorRoutingKey = 'method2WithMediatorRoutingKey',
}

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
  static async generateDid(
    method: DIDMethodName,
    methodType?: PeerGenerationMethod,
    mediatorRoutingKey?: string,
  ): Promise<DIDKeyPairVariants> {
    const didMethod = this.create(method);

    // Validate that methodType is only used with DIDMethodName.Peer
    if (method === DIDMethodName.Key && methodType) {
      throw new Error(
        `methodType should not be specified for DIDMethodName.Key`,
      );
    }

    if (method === DIDMethodName.Peer && !methodType) {
      throw new Error(`methodType must be specified for DIDMethodName.Peer`);
    }

    // Call the appropriate generation method based on DID type
    if (method === DIDMethodName.Peer && methodType) {
      return (didMethod as DidPeerMethod).generate(
        methodType,
        mediatorRoutingKey,
      );
    }
    return didMethod.generate();
  }
}
