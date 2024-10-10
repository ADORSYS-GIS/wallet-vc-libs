import { DidMethodFactory } from '../did-methods/DidMethodFactory';
import { DidRepository } from '../repository/DidRepository';
import { EventEmitter } from 'eventemitter3';
// import { DidEventChannel } from '../utils/DidEventChannel';

export class DIDIdentityService {
  private didRepository: DidRepository;

  constructor(private eventBus: EventEmitter) {
    this.didRepository = new DidRepository();
  }

  /**
   * Create a DID identity using the specified method ('key' or 'peer').
   * @param method - The DID method to use ('key' or 'peer').
   * @returns A Promise that resolves to the saved DID document.
   */
  public async createDidIdentity(method: string): Promise<void> {
    // const createDidIdentityChannel = DidEventChannel.CreateDidIdentity

    const didDocument = await DidMethodFactory.generateDid(method);
    this.didRepository.createDidId(didDocument,method);
  }

  /**
   * Delete a DID identity by its DID.
   * @param did - The DID to delete.
   * @returns A Promise that resolves to a boolean indicating success.
   */
  public async deleteDidIdentity(did: string): Promise<void> {
    await this.didRepository.deleteDidId(did);

  }

  /**
   * Find one DID identity by its DID.
   * @param did - The DID to find.
   * @returns A Promise that resolves to the DID document, or null if not found.
   */
  public async findDidIdentity(did: string): Promise<void> {
    this.didRepository.getADidId(did);
  }

  /**
   * Find all DID identities.
   * @returns A Promise that resolves to an array of DID documents.
   */
  public async findAllDidIdentities(): Promise<void> {
    this.didRepository.getAllDidIds();
  }
}
