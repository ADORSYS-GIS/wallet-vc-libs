import {
  DidMethodFactory,
  DIDMethodName,
  PeerGenerationMethod
} from '../did-methods/DidMethodFactory';
import { DidRepository } from '../repository/DidRepository';
import { EventEmitter } from 'eventemitter3';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { DidEventChannel } from '../utils/DidEventChannel';

export class DIDIdentityService {
  private didRepository: DidRepository;

  constructor(private eventBus: EventEmitter) {
    this.didRepository = new DidRepository();
  }

  /**
   * Create a DID identity using the specified method ('key' or 'peer').
   * Emits a {@link DidEventChannel.CreateDidIdentity} event upon successful creation.
   *
   * @param method - The DID method to use ('key' or 'peer').
   */
  public async createDidIdentity(method: DIDMethodName, methodType?: PeerGenerationMethod): Promise<void> {
    const createDidIdentityChannel = DidEventChannel.CreateDidIdentity;

    try {
      const didDocument = await DidMethodFactory.generateDid(method, method === DIDMethodName.Peer ? methodType : undefined);
      
      await this.didRepository.createDidId(didDocument, method);

      const response: ServiceResponse<{ did: string }> = {
        status: ServiceResponseStatus.Success,
        payload: { did: didDocument.did },
      };

      this.eventBus.emit(createDidIdentityChannel, response);
    } catch (error) {
      this.sharedErrorHandler(createDidIdentityChannel)(error);
    }
  }

  /**
   * Delete a DID identity by its DID.
   * Emits a {@link DidEventChannel.DeleteDidIdentity} event upon successful deletion.
   *
   * @param did - The DID to delete.
   */
  public async deleteDidIdentity(did: string): Promise<void> {
    const deleteDidIdentityChannel = DidEventChannel.DeleteDidIdentity;

    try {
      await this.didRepository.deleteDidId(did);

      const response: ServiceResponse<{ message: string; deletedDid: string }> =
        {
          status: ServiceResponseStatus.Success,
          payload: {
            message: `DID identity with ID ${did} was successfully deleted.`,
            deletedDid: did,
          },
        };

      this.eventBus.emit(deleteDidIdentityChannel, response);
    } catch (error) {
      this.sharedErrorHandler(deleteDidIdentityChannel)(error);
    }
  }

  /**
   * Find a DID identity by its DID.
   * Emits a {@link DidEventChannel.GetSingleDidIdentity} event upon successful retrieval.
   *
   * @param did - The DID to retrieve.
   */
  public async findDidIdentity(did: string): Promise<void> {
    const findDidIdentityChannel = DidEventChannel.GetSingleDidIdentity;

    try {
      const didRecord = await this.didRepository.getADidId(did);

      const response: ServiceResponse<{
        did: string;
        method: string;
        createdAt: number;
      }> = {
        status: ServiceResponseStatus.Success,
        payload: didRecord!,
      };

      this.eventBus.emit(findDidIdentityChannel, response);
    } catch (error) {
      this.sharedErrorHandler(findDidIdentityChannel)(error);
    }
  }

  /**
   * Find all DID identities.
   * Emits a {@link DidEventChannel.GetAllidIdentities} event upon successful retrieval.
   */
  public async findAllDidIdentities(): Promise<void> {
    const findAllDidIdentitiesChannel = DidEventChannel.GetAllDidIdentities;

    try {
      const didRecords = await this.didRepository.getAllDidIds();

      const response: ServiceResponse<
        { did: string; method: string; createdAt: number }[]
      > = {
        status: ServiceResponseStatus.Success,
        payload: didRecords,
      };

      this.eventBus.emit(findAllDidIdentitiesChannel, response);
    } catch (error) {
      this.sharedErrorHandler(findAllDidIdentitiesChannel)(error);
    }
  }

  /**
   * Shared error handler that emits an error response.
   */
  private sharedErrorHandler(channel: DidEventChannel) {
    return (error: unknown) => {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(channel, response);
    };
  }
}
