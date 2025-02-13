import { StorageFactory } from '@adorsys-gis/storage';
import type { DBSchema } from 'idb';
import type { Contact } from '../model/Contact';

/**
 * Database schema for storing contacts in IndexedDB. This schema defines
 * the structure of the database and its collections.
 */
interface MyDatabase extends DBSchema {
  contacts: {
    key: number;
    value: Contact;
    indexes: { 'by-did': string };
  };
}

/**
 * ContactRepository handles CRUD operations with the IndexedDB for
 * managing contact records. It abstracts the database layer and provides
 * a simple interface for data operations.
 */
export class ContactRepository {
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

  async create(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const id = await this.storage.insert('contacts', {
      value: { ...contact },
    });
    return { ...contact, id };
  }

  async get(id: number): Promise<Contact | null> {
    const result = await this.storage.findOne('contacts', id);
    return result ? result.value : null;
  }

  async getAll(): Promise<Contact[]> {
    const results = await this.storage.findAll('contacts');
    return results.map((item) => item.value);
  }

  async update(
    id: number,
    updatedFields: Partial<Contact>,
  ): Promise<Contact | null> {
    await this.storage.update('contacts', id, updatedFields);
    return this.get(id);
  }

  async delete(id: number): Promise<void> {
    await this.storage.delete('contacts', id);
  }
}
