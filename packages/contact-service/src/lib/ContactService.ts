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
   * Emits a {@link ContactEventChannel.CreateContact} event upon successful creation.
   *
   * @param contact - The contact object to be created (excluding 'id').
   */
  async createContact(contact: Omit<Contact, 'id'>): Promise<void> {
    const channel = ContactEventChannel.CreateContact;

    try {
      // Await the creation of the contact to get the created contact object
      const createdContact = await this.contactRepository.create(contact);
      this.eventBus.emit(channel, createdContact);
    } catch (error) {
      this.eventBus.emit(ContactEventChannel.Error, error);
      throw error;
    }
  }

  /**
   * Retrieves a contact by its ID.
   *
   * @param id - The ID of the contact to retrieve.
   * @returns The contact object if found, otherwise null.
   */
  async getContact(id: number): Promise<void> {
    const channel = ContactEventChannel.GetContactByID;

    try {
      const contact = await this.contactRepository.get(id);
      this.eventBus.emit(channel, contact);
    } catch (error) {
      this.eventBus.emit(ContactEventChannel.Error, error);
      throw error;
    }
  }

  /**
   * Retrieves all contacts from the database.
   *
   * @returns An array of all contact objects.
   */
  async getAllContacts(): Promise<Contact[]> {
    const channel = ContactEventChannel.GetAllContacts;

    try {
      const contacts = await this.contactRepository.getAll();
      this.eventBus.emit(channel, contacts);
      return contacts;
    } catch (error) {
      this.eventBus.emit(ContactEventChannel.Error, error);
      throw error;
    }
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

    const updatedContact = await this.contactRepository.update(
      id,
      updatedFields,
    );
    this.eventBus.emit(channel, updatedContact);
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
