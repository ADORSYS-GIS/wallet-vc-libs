import { DIDDoc, DIDResolver, Message, Secret, SecretsResolver } from 'didcomm';
import { generateUuid, currentTimestampInSecs } from '../utils';

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
  public constructor(private readonly didResolver: DIDResolver) {}

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

    // Pack into a forward message
  }

  /**
   * Wraps textual content into a basic message structure.
   *
   * @see https://didcomm.org/basicmessage/2.0/message
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
  private retrieveSenderDidSecrets(): Array<Secret> {}

  /**
   * Extracts potential service endpoints for the next hop of the forward message route.
   */
  private extractServiceEndpoints(recipientDid: string) {
    // Which service endpoint is the didcomm library considering?
  }
}
