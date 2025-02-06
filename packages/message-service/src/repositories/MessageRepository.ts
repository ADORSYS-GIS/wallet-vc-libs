import type { DBSchema } from 'idb';

import type { Message } from '../model/Message';

import { StorageFactory } from '@adorsys-gis/storage';

interface MyDatabase extends DBSchema {
  messages: {
    key: string;
    value: Message;
    indexes: {
      'by-contact-id': string;
      'by-id-contact-id': [string, string];
    };
  };
}

const objectStorename = 'messages';
export class MessageRepository {
  private storage: StorageFactory<MyDatabase>;

  constructor() {
    this.storage = new StorageFactory<MyDatabase>('MessageDB', 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(objectStorename)) {
          const objectStore = db.createObjectStore(objectStorename, {
            keyPath: 'id',
          });

          // Add index for `contactId` for efficient querying
          objectStore.createIndex('by-contact-id', 'contactId', {
            unique: false,
          });

          // Composite index for unique constraint on `[id, contactId]`
          objectStore.createIndex('by-id-contact-id', ['id', 'contactId'], {
            unique: true,
          });
        }
      },
    });
  }

  async create(message: Message): Promise<Message> {
    await this.storage.insert(objectStorename, { value: message });
    return message;
  }

  async getAllByContact(contactId: string): Promise<Message[]> {
    // Use findManyByIndex to retrieve messages by contactId
    const messages = await this.storage.findManyByIndex(
      objectStorename,
      'by-contact-id',
      { key: contactId },
    );
    return messages;
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(objectStorename, id);
  }

  async deleteAllByContact(contactId: string): Promise<void> {
    const messagesToDelete = await this.storage.findManyByIndex(
      objectStorename,
      'by-contact-id',
      { key: contactId },
    );
    const messageIds = messagesToDelete.map((msg) => msg.id);
    // If there are messages to delete, delete them by their IDs
    if (messageIds.length > 0) {
      await this.storage.deleteMany(objectStorename, messageIds);
    }
  }
}
