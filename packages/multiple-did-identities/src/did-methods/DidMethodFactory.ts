import { IDidMethod, DIDKeyPair } from './IDidMethod';
import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';

export class DidMethodFactory {
  static create(method: string): IDidMethod {
    switch (method) {
      case 'key':
        return new DidKeyMethod();
      case 'peer':
        return new DidPeerMethod();
      default:
        throw new Error(`Unsupported DID method: ${method}`);
    }
  }

  /**
   * Generates a DID using the specified method.
   * @param method - The DID method to use ('key' or 'peer').
   * @returns A Promise that resolves to a DIDDocument.
   */
  static async generateDid(method: string): Promise<DIDKeyPair> {
    const didMethod = this.create(method);
    return didMethod.generate();
  }
}
