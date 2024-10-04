/**
 * Enum representing the different event channels used by the ContactService.
 * These channels are used for emitting and listening to events related to
 * contact creation, update, and deletion.
 *
 * - CreateContact: Event triggered when a contact is created.
 * - UpdateContact: Event triggered when a contact is updated.
 * - DeleteContact: Event triggered when a contact is deleted.
 *
 * Each event channel has a unique string identifier, which is utilized
 * by the event bus to emit and listen to specific events.
 */
export enum ContactEventChannel {
  CreateContact = 'contact-created',
  UpdateContact = 'contact-updated',
  DeleteContact = 'contact-deleted',
}
