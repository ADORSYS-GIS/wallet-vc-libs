/**
 * Enum representing the different event channels used by the MessageService.
 * These channels are used for emitting and listening to events related to
 * message creation, deletion and retrieval.
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
