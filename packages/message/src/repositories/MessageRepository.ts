// import { StorageFactory } from '@adorsys-gis/storage';
import { StorageFactory } from '@adorsys-gis/storage';
import { DBSchema } from 'idb';
import { Message } from '../model/Message';

interface MyDatabase extends DBSchema {
  messages: {
    key: number;
    value: Message;
  };
}

export class MessageRepository {
  private storage: StorageFactory<MyDatabase>;

  constructor() {
    this.storage = new StorageFactory<MyDatabase>('MessageDB', 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', {
            keyPath: 'id',
          });
        }
      },
    });
  }

  async create(message: Message): Promise<Message> {
    await this.storage.insert('messages', { value: message });
    return message;
  }

  async getAllByContact(contactId: string): Promise<Message[]> {
    const allMessages = await this.storage.findAll('messages');
    return allMessages
      .map((item) => item.value)
      .filter((msg) => msg.contactId === contactId);
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete('messages', id);
  }

  async deleteAllByContact(contactId: string): Promise<void> {
    const messagesToDelete = await this.getAllByContact(contactId);
    const messageIds = messagesToDelete.map((msg) => msg.id);

    if (messageIds.length > 0) {
      await this.storage.deleteMany('messages', messageIds);
    }
  }
}
