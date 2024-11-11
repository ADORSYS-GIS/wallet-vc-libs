import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { EventEmitter } from 'eventemitter3';
import { Message } from '../model/Message';
import { MessageEventChannel } from '../model/MessageEventChannel';
import { MessageRepository } from '../repositories/MessageRepository';

/**
 * MessageService manages messages and their interactions.
 * It uses the MessageRepository for data persistence and an EventEmitter
 * for event-driven communication. The service provides methods to create,
 * retrieve, delete, and delete all messages by contact.
 */
export class MessageService {
  private messageRepository: MessageRepository;

  constructor(private eventBus: EventEmitter) {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Creates a new message and stores it in the database.
   * Emits a {@link MessageEventChannel.CreateMessage} event upon successful creation.
   *
   * @param message - The message object to be created.
   */
  public createMessage(message: Message): void {
    const createMessageChannel = MessageEventChannel.CreateMessage;

    this.messageRepository
      .create(message)
      .then((createdMessage) => {
        const response: ServiceResponse<Message> = {
          status: ServiceResponseStatus.Success,
          payload: createdMessage,
        };
        this.eventBus.emit(createMessageChannel, response);
      })
      .catch(this.sharedErrorHandler(createMessageChannel));
  }

  /**
   * Retrieves all messages by contact ID.
   * Emits a {@link MessageEventChannel.GetAllByContactId} event when successful.
   *
   * @param contactId - The contact ID to filter messages.
   */
  public getAllMessagesByContact(contactId: string): void {
    const getAllByContactIdChannel = MessageEventChannel.GetAllByContactId;

    this.messageRepository
      .getAllByContact(contactId)
      .then((messages) => {
        const response: ServiceResponse<Message[]> = {
          status: ServiceResponseStatus.Success,
          payload: messages,
        };
        this.eventBus.emit(getAllByContactIdChannel, response);
      })
      .catch(this.sharedErrorHandler(getAllByContactIdChannel));
  }

  /**
   * Deletes a message by its ID from the database.
   * Emits a {@link MessageEventChannel.DeleteMessage} event upon successful deletion.
   *
   * @param id - The ID of the message to delete.
   */
  public deleteMessage(id: string): void {
    const deleteMessageChannel = MessageEventChannel.DeleteMessage;

    this.messageRepository
      .delete(id)
      .then(() => {
        const response: ServiceResponse<{ id: string }> = {
          status: ServiceResponseStatus.Success,
          payload: { id },
        };
        this.eventBus.emit(deleteMessageChannel, response);
      })
      .catch(this.sharedErrorHandler(deleteMessageChannel));
  }

  /**
   * Deletes all messages associated with a contact ID.
   * Emits a {@link MessageEventChannel.deleteAllByContactId} event upon successful deletion.
   *
   * @param contactId - The contact ID whose messages are to be deleted.
   */
  public deleteAllMessagesByContact(contactId: string): void {
    const deleteAllByContactIdChannel =
      MessageEventChannel.DeleteAllByContactId;

    this.messageRepository
      .deleteAllByContact(contactId)
      .then(() => {
        const response: ServiceResponse<{ contactId: string }> = {
          status: ServiceResponseStatus.Success,
          payload: { contactId },
        };
        this.eventBus.emit(deleteAllByContactIdChannel, response);
      })
      .catch(this.sharedErrorHandler(deleteAllByContactIdChannel));
  }

  private sharedErrorHandler(channel: MessageEventChannel) {
    return (error: unknown) => {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(channel, response);
    };
  }
}
