# Contact Service Library

The Contact Service Library provides a robust interface for managing contacts associated with Decentralized Identifiers (DIDs) using IndexedDB. This library allows you to create, retrieve, update, and delete contacts efficiently and utilizes a well-defined database schema.

# Installation

To install the Contact Service Library, use the command below.

```bash
npm install @adorsys-gis/contact-service
```

# Contact Model

The library defines a interface outlining the structure of a contact object.

```typescript
export interface Contact {
  id: number;
  name: string;
  did: string;
}
```

# Usage Example

```typescript
import { ContactService } from '@adorsys-gis/contact-service';

const contactService = new ContactService();

// Create a new contact (no need to include 'id', as it will be generated)
try {
  await contactService.createContact({
    name: 'John Doe',
    did: 'did:example:123456',
  });
  console.log('Contact created successfully!');
} catch (error) {
  console.error('Failed to create contact:', error);
}
```
