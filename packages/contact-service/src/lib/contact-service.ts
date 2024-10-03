import { StorageFactory } from '@adorsys-gis/storage';
import { DBSchema } from 'idb';
import { Contact } from './model/contact';

/**
 * Database schema for storing contacts in IndexedDB.
 * This schema defines the structure of the database and its collections.
 */
interface MyDatabase extends DBSchema {
  contacts: {
    key: number;
    value: Contact;
    indexes: { 'by-did': string };
  };
}

/**
 * Service class to manage contacts using IndexedDB.
 * This class provides methods for creating, retrieving, updating, and deleting contacts.
 */
class ContactService {
  private storage: StorageFactory<MyDatabase>;

  constructor() {
    // Initialize storage for contacts in IndexedDB
    this.storage = new StorageFactory<MyDatabase>('ContactsDB', 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains('contacts')) {
          // Create an object store for contacts
          const objectStore = db.createObjectStore('contacts', {
            keyPath: 'id',
            autoIncrement: true,
          });
          objectStore.createIndex('by-did', 'did', { unique: true });
        }
      },
    });
  }

  /**
   * Creates a new contact and stores it in the database.
   * @param contact - The contact object to be created
   * @throws Error if the insertion fails
   */
  async createContact(contact: Omit<Contact, 'id'>): Promise<void> {
    try {
      await this.storage.insert('contacts', { value: contact });
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw new Error('Contact creation failed');
    }
  }

  /**
   * Retrieves a contact by its ID from the database.
   * @param id - The ID of the contact to retrieve
   * @returns The contact object if found, otherwise null
   * @throws Error if the retrieval fails
   */
  async getContact(id: number): Promise<Contact | null> {
    if (id == null) {
      console.error('Cannot retrieve contact: ID is required');
      throw new Error('ID must be provided');
    }
    
    try {
      const record = await this.storage.findOne('contacts', id);
      return record as Contact | null;
    } catch (error) {
      console.error('Failed to retrieve contact:', error);
      throw new Error('Contact retrieval failed');
    }
  }

  /**
   * Retrieves all contacts from the database.
   * @returns An array of all contact objects
   * @throws Error if the retrieval fails
   */
  async getAllContacts(): Promise<Contact[]> {
    try {
      const results = await this.storage.findAll('contacts');
      return results.map((item) => item.value);
    } catch (error) {
      console.error('Failed to retrieve contacts:', error);
      throw new Error('Contact retrieval failed');
    }
  }

  /**
   * Updates an existing contact in the database.
   * @param id - The ID of the contact to update
   * @param updatedFields - The fields to update in the contact
   * @throws Error if the update fails
   */
  async updateContact(
    id: number,
    updatedFields: Partial<Contact>,
  ): Promise<void> {
    try {
      await this.storage.update('contacts', id, updatedFields);
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw new Error('Contact update failed');
    }
  }

  /**
   * Deletes a contact by its ID from the database.
   * @param id - The ID of the contact to delete
   * @throws Error if the deletion fails
   */
  async deleteContact(id: number): Promise<void> {
    try {
      await this.storage.delete('contacts', id);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw new Error('Contact deletion failed');
    }
  }
}

export default ContactService;
