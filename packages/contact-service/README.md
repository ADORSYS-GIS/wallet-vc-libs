# Contact Service Library

The Contact Service Library provides a robust interface for managing contacts associated with Decentralized Identifiers (DIDs) using IndexedDB.
This library allows you to create, retrieve, update, and delete contacts efficiently. It was generated with [Nx](https://nx.dev) framework and utilizes a well-defined database schema.

# Dependencies

`@datev/storage`: External library for interacting with IndexedDB.

# Installation

To install the Contact Service Library, ensure you have the necessary dependencies set up in your NX workspace. If the library is part of a larger NX project, simply import it into your desired module as seen below.

```bash
npm install @datev/storage
```

# Contact Model

The library defines a interface outlining the structure of a contact object. `Contact`

```typescript
export interface Contact {
  id: string;
  name: string;
  email: string;
  did: string;
  phoneNumber: string;
}
```

# Database Schema

The library leverages IndexedDB for storing contacts. It defines a database schema specifying the structure of the database and its collections. `MyDatabase`

```typescript
interface MyDatabase extends DBSchema {
  contacts: {
    key: string;
    value: Contact;
    indexes: { 'by-did': string };
  };
}
```

The object store uses the property of the interface as its key path and creates an additional index named to allow efficient retrieval by DID.

# ContactService Class

The class serves as the central point for interacting with contacts. It implements methods for managing contacts in IndexedDB. `ContactService`

## Constructor

```typescript
constructor() {
  // Initialize storage for contacts in IndexedDB
  this.storage = new StorageFactory<MyDatabase>('ContactsDB', 1, {
    upgrade: (db) => {
      if (!db.objectStoreNames.contains('contacts')) {
        // Create an object store for contacts
        const objectStore = db.createObjectStore('contacts', { keyPath: 'id' });
        objectStore.createIndex('by-did', 'contacts', { unique: true });
      }
    },
  });
}
```

The constructor initializes the instance with the database name (), version (), and an upgrade callback. The upgrade callback ensures the creation of the object store and the index during the first database initialization.

# Usage Example

```typescript
import { ContactService } from './contact-service';

const contactService = new ContactService();

// Create a new contact
const newContact: Contact = {
  id: '123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  did: 'did:example:123456',
  phoneNumber: '+1234567890',
};

try {
  await contactService.createContact(newContact);
  console.log('Contact created successfully!');
} catch (error) {
  console.error('Failed to create contact:', error);
}
```

## Building

Run `npm run build` to build the library.

## Running unit tests

Run `npm run test` to execute the unit tests via [Jest](https://jestjs.io).
