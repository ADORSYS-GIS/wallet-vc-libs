import {
  DidMethodFactory,
  DIDMethodName,
  PeerGenerationMethod,
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
  public async createDidIdentity(
    method: DIDMethodName,
    methodType?: PeerGenerationMethod,
    options?: string[]
  ): Promise<void> {
    const createDidIdentityChannel = DidEventChannel.CreateDidIdentity;

    try {
      const didDocument = await DidMethodFactory.generateDid(
        method,
        methodType,
        options
      );

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

      const isDidPeer = didRecord.did.startsWith('did:peer');

      // Define response payload with conditional structure
      const responsePayload = isDidPeer
        ? {
            did: didRecord.did,
            method: didRecord.method,
            method_type: didRecord.method_type,
            createdAt: didRecord.createdAt,
          }
        : {
            did: didRecord.did,
            method: didRecord.method,
            createdAt: didRecord.createdAt,
          };

      // Create the response
      const response: ServiceResponse<typeof responsePayload> = {
        status: ServiceResponseStatus.Success,
        payload: responsePayload,
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

      // Process each record to conditionally include methodType
      const processedRecords = didRecords.map((record) => {
        // Determine if the DID is of type 'peer'
        const isDidPeer = record.did.startsWith('did:peer');

        return isDidPeer
          ? {
              did: record.did,
              method: record.method,
              method_type: record.method_type,
              createdAt: record.createdAt,
            }
          : {
              did: record.did,
              method: record.method,
              createdAt: record.createdAt,
            };
      });

      // Construct the response
      const response: ServiceResponse<typeof processedRecords> = {
        status: ServiceResponseStatus.Success,
        payload: processedRecords,
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
