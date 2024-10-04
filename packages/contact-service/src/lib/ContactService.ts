import { EventEmitter } from 'eventemitter3';
import { Contact } from '../model/Contact';
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
   * Emits a 'contact.created' event upon successful creation.
   *
   * @param contact - The contact object to be created (excluding 'id').
   */
  async createContact(contact: Omit<Contact, 'id'>): Promise<void> {
    const channel = ContactEventChannel.CreateContact;

    await this.contactRepository.create(contact);
    this.eventBus.emit(channel, contact);
  }

  /**
   * Retrieves a contact by its ID.
   *
   * @param id - The ID of the contact to retrieve.
   * @returns The contact object if found, otherwise null.
   */
  async getContact(id: number): Promise<Contact | null> {
    return await this.contactRepository.get(id);
  }

  /**
   * Retrieves all contacts from the database.
   *
   * @returns An array of all contact objects.
   */
  async getAllContacts(): Promise<Contact[]> {
    return await this.contactRepository.getAll();
  }

  /**
   * Updates an existing contact in the database.
   * Emits a 'contact.updated' event upon successful update.
   *
   * @param id - The ID of the contact to update.
   * @param updatedFields - The fields to update in the contact.
   */
  async updateContact(
    id: number,
    updatedFields: Partial<Contact>,
  ): Promise<void> {
    const channel = ContactEventChannel.UpdateContact;

    await this.contactRepository.update(id, updatedFields);
    this.eventBus.emit(channel, { id, updatedFields });
  }

  /**
   * Deletes a contact by its ID from the database.
   * Emits a 'contact.deleted' event upon successful deletion.
   *
   * @param id - The ID of the contact to delete.
   */
  async deleteContact(id: number): Promise<void> {
    const channel = ContactEventChannel.DeleteContact;
    await this.contactRepository.delete(id);
    this.eventBus.emit(channel, { id });
  }
}
