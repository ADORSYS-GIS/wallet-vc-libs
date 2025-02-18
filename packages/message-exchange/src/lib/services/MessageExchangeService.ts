import type { Message as MessageModel } from '@adorsys-gis/message-service';
import { MessageRepository } from '@adorsys-gis/message-service';
import {
  DidRepository,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import type { EventEmitter } from 'eventemitter3';
import { MessageRouter } from '../../protocols/MessageRouter';
import { MessageExchangeEvent } from '../events/MessageExchangeEvent';

/**
 * Handles exchange of DIDComm messages between parties.
 */
export class MessageExchangeService {
  private readonly messageRouter: MessageRouter;

  /**
   * @param eventBus - The event bus for sending back responses.
   * @param secretPinNumber - The secret PIN number for accessing the wallet's secure storage.
   */
  public constructor(
    private readonly eventBus: EventEmitter,
    private readonly secretPinNumber: number,
  ) {
    this.messageRouter = new MessageRouter(
      new DidRepository(new SecurityService()),
      new MessageRepository(),
      secretPinNumber,
    );
  }

  /**
   * Sends a basic message to another party, routing it through its mediator.
   *
   * An acknowledgement is sent on {@link MessageExchangeEvent.RouteForwardMessages}.
   *
   * @param message - The textual content of the message to send.
   * @param recipientDid - The DID address of the recipient.
   * @param senderDid - The specific wallet identity for sending this message.
   */
  public routeForwardMessage(
    message: string,
    recipientDid: string,
    senderDid: string,
  ): void {
    const channel = MessageExchangeEvent.RouteForwardMessages;

    this.messageRouter
      .routeForwardMessage(message, recipientDid, senderDid)
      .then((persistedMessage) => {
        const response: ServiceResponse<MessageModel> = {
          status: ServiceResponseStatus.Success,
          payload: persistedMessage,
        };

        this.eventBus.emit(channel, response);
      })
      .catch(this.sharedErrorHandler(channel));
  }

  /**
   * Common handler for emitting errors.
   */
  private sharedErrorHandler(channel: MessageExchangeEvent) {
    return (error: unknown) => {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(channel, response);
    };
  }
}
