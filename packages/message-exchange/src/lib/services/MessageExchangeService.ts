import { EventEmitter } from 'eventemitter3';
import { MessageExchangeEvent } from '../events/MessageExchangeEvent';

import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';

/**
 * Handles exchange of DIDComm messages between parties.
 */
export class MessageExchangeService {
  // private contactRepository: ContactRepository;

  public constructor(private eventBus: EventEmitter) {
    // this.contactRepository = new ContactRepository();
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

    // this.contactRepository
    //   .create(contact)
    //   .then((createdContact) => {
    //     const response: ServiceResponse<Contact> = {
    //       status: ServiceResponseStatus.Success,
    //       payload: createdContact,
    //     };
    //     this.eventBus.emit(createContactChannel, response);
    //   })
    //   .catch(this.sharedErrorHandler(createContactChannel));
  }

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
