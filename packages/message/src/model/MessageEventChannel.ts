/**
 * Enum representing the different event channels used by the ContactService.
 * These channels are used for emitting and listening to events related to
 * contact creation, update, deletion and retrieval.
 *
 * - CreateContact: Event triggered when a contact is created.
 * - UpdateContact: Event triggered when a contact is updated.
 * - DeleteContact: Event triggered when a contact is deleted.
 * - GetContactByID: Event triggered when a specific contact is requested by ID.
 * - GetAllContacts: Event triggered when all contacts are requested.
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
