import { MessageRepository } from '@adorsys-gis/message-service';
import {
  DidRepository,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import type { EventEmitter } from 'eventemitter3';
import { MessagePickup } from '../../protocols/MessagePickup';
import { MessagePickupEvent } from '../events/MessagePickupEvent';

/**
 * Handles message pickup of DIDComm messages from mediator.
 */
export class MessagePickupService {
  private readonly messagePickup: MessagePickup;

  /**
   * @param eventBus - The event bus for sending back responses.
   * @param secretPinNumber - The secret PIN number for accessing the wallet's secure storage.
   */
  public constructor(
    private readonly eventBus: EventEmitter,
    private readonly secretPinNumber: number,
  ) {
    this.messagePickup = new MessagePickup(
      new DidRepository(new SecurityService()),
      secretPinNumber,
      new MessageRepository(),
    );
  }

  /**
   * Receives messages from the mediator
   *
   * An acknowledgement is sent on {@link MessagePickupEvent.MessagePickup}.
   *
   * @param mediatorDid -  DID from the mediator
   * @param aliceDidForMediator - DID from alice to the mediator
   */
  public ReceiveMessages(
    mediatorDid: string,
    aliceDidForMediator: string,
  ): void {
    const channel = MessagePickupEvent.MessagePickup;
    let response: ServiceResponse<string>;
    this.messagePickup.processStatusRequest(mediatorDid, aliceDidForMediator, true)
      .then((messageCount) => {
        // If there are messages, call the next event
        if(messageCount > 0){
          this.messagePickup.processDeliveryRequest(mediatorDid, aliceDidForMediator)
          .then((message) => {
              response = {
              status: ServiceResponseStatus.Success,
              payload: message as unknown as string,
            }
        }).catch(this.sharedErrorHandler(channel));
          }else{
            response = {
            status: ServiceResponseStatus.Success,
            payload: 'no new messages',
          };
        }
        this.eventBus.emit(channel, response);
        }).catch(this.sharedErrorHandler(channel));
  }

  /**
   * Common handler for emitting errors.
   */
  private sharedErrorHandler(channel: MessagePickupEvent) {
    return (error: unknown) => {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(channel, response);
    };
  }
}
