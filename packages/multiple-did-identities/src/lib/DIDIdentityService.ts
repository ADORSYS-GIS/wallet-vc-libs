import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import type { EventEmitter } from 'eventemitter3';
import type {
  DIDMethodName,
  PeerGenerationMethod,
} from '../did-methods/DidMethodFactory';
import { DidMethodFactory } from '../did-methods/DidMethodFactory';
import { DidRepository } from '../repository/DidRepository';
import type { SecurityService } from '../security/SecurityService';
import { DidEventChannel } from '../utils/DidEventChannel';
import { encryptPrivateKeys } from '../utils/encryptPrivateKeys';

export class DIDIdentityService {
  private didRepository: DidRepository;

  constructor(
    private eventBus: EventEmitter,
    private securityService: SecurityService,
  ) {
    this.didRepository = new DidRepository(securityService);
  }

  /**
   * Create a DID identity using the specified method ('key' or 'peer').
   * Emits a {@link DidEventChannel.CreateDidIdentity} event upon successful creation.
   *
   * @param method - The DID method to use ('key' or 'peer').
   * @param pin - The user's PIN for encryption(only after succesfull authentication at the front end).
   * @param methodType - Optional method type for 'peer'.
   * @param mediatorRoutingKey - Optional routing key for mediation.
   */
  public async createDidIdentity(
    method: DIDMethodName,
    pin: number, // the authenticated user's PIN
    methodType?: PeerGenerationMethod,
    mediatorRoutingKey?: string,
  ): Promise<void> {
    const createDidIdentityChannel = DidEventChannel.CreateDidIdentity;

    try {
      const didDocument = await DidMethodFactory.generateDid(
        method,
        methodType,
        mediatorRoutingKey,
      );

      // Call method to encrypt private keys based on the DID document
      await encryptPrivateKeys(
        didDocument,
        pin,
        [
          'privateKey',
          'privateKeyV',
          'privateKeyE',
          'privateKey1',
          'privateKey2',
        ],
        this.securityService,
      );

      await this.didRepository.createDidId(didDocument);

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

      // Define response payload with conditional structure
      const responsePayload = {
        did: didRecord.did,
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

      // Process each record to return only did and createdAt
      const processedRecords = didRecords.map((record) => ({
        did: record.did,
        createdAt: record.createdAt,
      }));

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
   * Retrieves all mediator DID identities from the repository and emits the result on the designated event channel.
   *
   * This method queries the DID repository for identities that are classified as "mediator" (i.e., for communication with a mediator).
   * It then constructs a service response with the retrieved data and emits that response on the DidEventChannel.GetMediatorDidIdentities channel.
   *
   * @returns {Promise<void>} A promise that resolves when the mediator DID identities event has been emitted.
   */
  public async findMediatorDidIdentities(): Promise<void> {
    const findMediatorDidIdentitiesChannel =
      DidEventChannel.GetMediatorDidIdentities;
    try {
      const didRecords = await this.didRepository.getMediatorDidIds();
      const response: ServiceResponse<typeof didRecords> = {
        status: ServiceResponseStatus.Success,
        payload: didRecords,
      };
      this.eventBus.emit(findMediatorDidIdentitiesChannel, response);
    } catch (error) {
      this.sharedErrorHandler(findMediatorDidIdentitiesChannel)(error);
    }
  }

  /**
   * Retrieves all peer contact DID identities from the repository and emits the result on the designated event channel.
   *
   * This method queries the DID repository for identities that are classified as "peer_contact" (i.e., identities used for peer-to-peer communication,
   * typically including a routing key for QR code generation on the frontend).
   * It then constructs a service response with the retrieved data and emits that response on the DidEventChannel.GetPeerContactDidIdentities channel.
   *
   * @returns {Promise<void>} A promise that resolves when the peer contact DID identities event has been emitted.
   */
  public async findPeerContactDidIdentities(): Promise<void> {
    const findPeerContactDidIdentitiesChannel =
      DidEventChannel.GetPeerContactDidIdentities;
    try {
      const didRecords = await this.didRepository.getPeerContactDidIds();
      const response: ServiceResponse<typeof didRecords> = {
        status: ServiceResponseStatus.Success,
        payload: didRecords,
      };
      this.eventBus.emit(findPeerContactDidIdentitiesChannel, response);
    } catch (error) {
      this.sharedErrorHandler(findPeerContactDidIdentitiesChannel)(error);
    }
  }

  /**
   * Retrieve a DID identity with decrypted private keys and emit it via the event bus.
   * Emits a {@link DidEventChannel.GetDidWithDecryptedPrivateKeys} event upon successful retrieval.
   *
   * @param did - The DID to retrieve.
   * @param pin - The PIN used for decrypting private keys.
   */
  public async retrieveDidWithDecryptedKeys(
    did: string,
    pin: number,
  ): Promise<void> {
    const didEventChannel = DidEventChannel.GetDidWithDecryptedPrivateKeys;

    try {
      const didWithDecryptedKeys =
        await this.didRepository.getADidWithDecryptedPrivateKeys(did, pin);

      if (!didWithDecryptedKeys) {
        // Handle case where no DID identity is found
        const response: ServiceResponse<null> = {
          status: ServiceResponseStatus.Error,
          payload: null,
        };
        this.eventBus.emit(didEventChannel, response);
        return;
      }

      // Define response payload
      const responsePayload = {
        did: didWithDecryptedKeys.did,
        decryptedPrivateKeys: didWithDecryptedKeys.decryptedPrivateKeys,
      };

      // Create the response
      const response: ServiceResponse<typeof responsePayload> = {
        status: ServiceResponseStatus.Success,
        payload: responsePayload,
      };

      this.eventBus.emit(didEventChannel, response);
    } catch (error) {
      this.sharedErrorHandler(didEventChannel)(error);
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
