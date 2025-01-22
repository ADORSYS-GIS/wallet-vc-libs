import { DIDDoc, DIDResolver, Message, Secret, SecretsResolver } from 'didcomm';
import { generateUuid, currentTimestampInSecs } from '../utils';
import { DidRepository, PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities';
import { StaticSecretsResolver } from '../utils/didcomm';

import {
  BASIC_MESSAGE_TYPE_URI,
  PLAIN_DIDCOMM_MESSAGE_TYP,
} from '../lib/constants';

/**
 * Routes messages as governed by the DIDComm Routing Protocol.
 *
 * @see https://identity.foundation/didcomm-messaging/spec/#routing-protocol-20
 */
export class MessageRouter {
  /**
   * @param didResolver - A DID resolver for resolving DID addresses.
   * @param didRepository - A repository for retrieving wallet's secret keys.
   * @param secretPinNumber - The secret PIN number for decrypting data from safe storage.
   */
  public constructor(
    private readonly didResolver: DIDResolver,
    private readonly didRepository: DidRepository,
    private readonly secretPinNumber: number,
  ) {}

  /**
   * Sends a basic message to another party, routing it through its mediator.
   *
   * @param message - The textual content of the message to send.
   * @param recipientDid - The DID address of the receiving party.
   * @param senderDid - The DID address of the sending party.
   */
  public async routeForwardMessage(
    message: string,
    recipientDid: string,
    senderDid: string,
  ): Promise<void> {
    // Construct formal basic message
    const basicMessage = this.buildBasicMessage(
      message,
      recipientDid,
      senderDid,
    );

    // Prepare secrets resolver
    const secrets = await this.retrieveSenderDidSecrets(senderDid);
    const secretsResolver = new StaticSecretsResolver(secrets);

    // Identify DIDComm endpoints of the recipient's mediator
    const urls = await this.extractServiceEndpoints(recipientDid);

    // Pack into a forward message
    const packedMessage = await basicMessage.pack_encrypted(
      recipientDid,
      senderDid,
      null,
      this.didResolver,
      secretsResolver,
      {},
    );

    // Route message to mediator
    for (const url of urls) {
      //
    }

    // Save sent message
  }

  /**
   * Wraps textual content into a basic message structure.
   *
   * @see https://didcomm.org/basicmessage/2.0
   */
  private buildBasicMessage(
    message: string,
    recipientDid: string,
    senderDid: string,
  ): Message {
    return new Message({
      id: generateUuid(),
      typ: PLAIN_DIDCOMM_MESSAGE_TYP,
      type: BASIC_MESSAGE_TYPE_URI,
      from: senderDid,
      to: [recipientDid],
      created_time: currentTimestampInSecs(),
      body: { content: message },
    });
  }

  /**
   * Retrieves the private keys of the sender DID.
   */
  private async retrieveSenderDidSecrets(senderDid: string): Promise<Secret[]> {
    const privateKeys =
      await this.didRepository.getADidWithDecryptedPrivateKeys(
        senderDid,
        this.secretPinNumber,
      );

    if (!privateKeys) {
      throw new Error('Could not retrieve private keys for senderDid');
    }

    const secrets = Object.values(privateKeys.decryptedPrivateKeys).filter(
      (key): key is PrivateKeyJWK => 'privateKeyJwk' in key,
    );

    return secrets;
  }

  /**
   * Extracts potential service endpoints for the next hop of the forward message route.
   */
  private async extractServiceEndpoints(
    recipientDid: string,
  ): Promise<string[]> {
    // TODO: Which service endpoint is the didcomm library considering?
    return [];
  }
}
