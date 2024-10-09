import { IDidMethod } from './IDidMethod';
import { DidKeyMethod } from './DidKeyMethod';
import { DidPeerMethod } from './DidPeerMethod';

/**
 * DIDMethodFactory is responsible for registering and creating instances of DID methods.
 */
export class DidMethodFactory {
  // A map to hold method name to DID method instance
  private static methods: Map<string, IDidMethod> = new Map();

  /**
   * Registers a new DID method.
   * @param method An instance of a class that implements IDidMethod.
   */
  static registerMethod(method: IDidMethod): void {
    if (this.methods.has(method.method)) {
      throw new Error(`DID method '${method.method}' is already registered.`);
    }
    this.methods.set(method.method, method);
  }

  /**
   * Retrieves a registered DID method by its name.
   * @param methodName The name of the DID method (e.g., 'key', 'peer').
   * @returns An instance of the requested DID method.
   */
  static getMethod(methodName: string): IDidMethod {
    const method = this.methods.get(methodName);
    if (!method) {
      throw new Error(`DID method '${methodName}' is not registered.`);
    }
    return method;
  }

  /**
   * Lists all registered DID methods.
   * @returns An array of method names.
   */
  static listMethods(): string[] {
    return Array.from(this.methods.keys());
  }
}

// Register the existing DID methods
DidMethodFactory.registerMethod(new DidKeyMethod());
DidMethodFactory.registerMethod(new DidPeerMethod());
