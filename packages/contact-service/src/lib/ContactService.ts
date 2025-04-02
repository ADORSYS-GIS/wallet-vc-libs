import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import type { EventEmitter } from 'eventemitter3';
import type { Contact } from '../model/Contact';
import { ContactEventChannel } from '../model/ContactEventChannel';
import { ContactRepository } from '../repositories/ContactRepository';

/**
 * ContactService manages contacts and their interactions.
 * It uses the ContactRepository for data persistence and an EventEmitter
 * for event-driven communication. The service provides methods to create,
 * retrieve, update, and delete contacts.
 */
export class ContactService {
  private contactRepository: ContactRepository;

  constructor(private eventBus: EventEmitter) {
    this.contactRepository = new ContactRepository();
  }

  /**
   * Creates a new contact and stores it in the database.
   * Emits a {@link ContactEventChannel.CreateContact} event upon successful creation.
   *
   * @param contact - The contact object to be created (excluding 'id').
   */
  public createContact(contact: Omit<Contact, 'id'>): void {
    const createContactChannel = ContactEventChannel.CreateContact;

    this.contactRepository
      .create(contact)
      .then((createdContact) => {
        const response: ServiceResponse<Contact> = {
          status: ServiceResponseStatus.Success,
          payload: createdContact,
        };
        this.eventBus.emit(createContactChannel, response);
      })
      .catch(this.sharedErrorHandler(createContactChannel));
  }

  /**
   * Retrieves a contact by its ID.
   *
   * @param id - The ID of the contact to retrieve.
   * Emits a {@link ContactEventChannel.GetContactByID} event when successful.
   */
  public getContact(id: number): void {
    const getContactByIdChannel = ContactEventChannel.GetContactByID;

    this.contactRepository
      .get(id)
      .then((contact) => {
        if (contact) {
          const response: ServiceResponse<Contact> = {
            status: ServiceResponseStatus.Success,
            payload: contact,
          };
          this.eventBus.emit(getContactByIdChannel, response);
        } else {
          const response: ServiceResponse<Error> = {
            status: ServiceResponseStatus.Error,
            payload: new Error(`Contact with ID ${id} not found`),
          };
          this.eventBus.emit(getContactByIdChannel, response);
        }
      })
      .catch(this.sharedErrorHandler(getContactByIdChannel));
  }

  /**
   * Retrieves all contacts from the database and emits them via an event bus.
   *
   * This method emits the contacts
   * through the {@link ContactEventChannel.GetAllContacts} event.
   */
  public getAllContacts(): void {
    const getAllContactsChannel = ContactEventChannel.GetAllContacts;

    this.contactRepository
      .getAll()
      .then((contacts) => {
        const response: ServiceResponse<Contact[]> = {
          status: ServiceResponseStatus.Success,
          payload: contacts,
        };
        this.eventBus.emit(getAllContactsChannel, response);
      })
      .catch(this.sharedErrorHandler(getAllContactsChannel));
  }

  /**
   * Updates a contact in the database with the provided fields
   * and emits a {@link ContactEventChannel.UpdateContact} event upon successful update.
   *
   * @param id - The ID of the contact to update.
   * @param updatedFields - An object containing the fields to update.
   */
  public updateContact(id: number, updatedFields: Partial<Contact>): void {
    const updateContactChannel = ContactEventChannel.UpdateContact;

    this.contactRepository
      .update(id, updatedFields)
      .then((updatedContact) => {
        if (updatedContact) {
          // Null check added
          const response: ServiceResponse<Contact> = {
            status: ServiceResponseStatus.Success,
            payload: updatedContact,
          };
          this.eventBus.emit(updateContactChannel, response);
        } else {
          // Handle the case when updatedContact is null/undefined
          this.eventBus.emit(updateContactChannel, {
            status: ServiceResponseStatus.Error,
            error: 'Contact update failed. No contact returned.',
          });
        }
      })
      .catch(this.sharedErrorHandler(updateContactChannel));
  }

  /**
   * Deletes a contact by its ID from the database.
   * Emits a {@link ContactEventChannel.DeleteContact} event upon successful deletion.
   *
   * @param id - The ID of the contact to delete.
   */
  public deleteContact(id: number): void {
    const deleteContactChannel = ContactEventChannel.DeleteContact;

    this.contactRepository
      .delete(id)
      .then(() => {
        const response: ServiceResponse<{ id: number }> = {
          status: ServiceResponseStatus.Success,
          payload: { id },
        };
        this.eventBus.emit(deleteContactChannel, response);
      })
      .catch(this.sharedErrorHandler(deleteContactChannel));
  }

  private sharedErrorHandler(channel: ContactEventChannel) {
    return (error: unknown) => {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(channel, response);
    };
  }
}
