/**
 * Enum representing the different event channels used by the MessageService.
 * These channels are used for emitting and listening to events related to
 * message creation, deletion and retrieval.
 *
 * - CreateMessag: Event triggered when a contact is created.
 * - DeleteMessage: Event triggered when a contact is deleted.
 * - DeleteAllByContactId: Event triggered when we want to delete all messages to a given contact.
 * - GetAllByContactId: Event triggered when we want all messages sent to a given contact
 *
 * Each event channel has a unique string identifier, which is utilized
 * by the event bus to emit and listen to specific events.
 */
export enum MessageEventChannel {
  CreateMessage = 'message-created',
  DeleteMessage = 'message-deleted',
  DeleteAllByContactId = 'deleted-all-messages-by-conntact',
  GetAllByContactId = 'get-all-messages-by-contact',
}
