import ContactService from '../contact-service';
import 'fake-indexeddb/auto';
import { Contact } from '../model/contact';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    // Initialize the ContactService before each test
    contactService = new ContactService();
  });

  afterEach(async () => {
    // Clear all contacts after each test
    const allContacts = await contactService.getAllContacts();
    for (const contact of allContacts) {
      await contactService.deleteContact(contact.id!);
    }
  });

  it('should create a new contact', async () => {
    const newContact: Contact = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      did: 'did:example:123456',
      phoneNumber: '+237695412345',
    };

    await contactService.createContact(newContact);
    const retrievedContact = await contactService.getContact(newContact.id!);

    expect(retrievedContact).toHaveProperty('value.name', newContact.name);
    expect(retrievedContact).toHaveProperty('value.email', newContact.email);
  });

  it('should retrieve a contact by ID', async () => {
    const contact: Contact = {
      id: 2,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      did: 'did:example:789012',
      phoneNumber: '+237674567890',
    };

    await contactService.createContact(contact);

    const retrievedContact = await contactService.getContact(2);
    expect(retrievedContact).toHaveProperty('value.id', contact.id);
    expect(retrievedContact).toHaveProperty('value.name', contact.name);
  });

  it('should retrieve all contacts', async () => {
    const contact1: Contact = {
      id: 3,
      name: 'Alice',
      email: 'alice@example.com',
      did: 'did:example:345678',
      phoneNumber: '+237623876543',
    };

    const contact2: Contact = {
      id: 4,
      name: 'Bob',
      email: 'bob@example.com',
      did: 'did:example:654321',
      phoneNumber: '+23767654321',
    };

    await contactService.createContact(contact1);
    await contactService.createContact(contact2);

    const contacts = await contactService.getAllContacts();
    expect(contacts).toHaveLength(2);
    expect(contacts).toEqual([contact1, contact2]);
  });

  it('should update a contact', async () => {
    const contact: Contact = {
      id: 5,
      name: 'Charlie',
      email: 'charlie@example.com',
      did: 'did:example:789012',
      phoneNumber: '+237674567890',
    };

    await contactService.createContact(contact);

    const updatedFields = { name: 'Charles' };
    await contactService.updateContact(contact.id!, updatedFields);

    const updatedContact = await contactService.getContact(contact.id!);
    expect(updatedContact).toHaveProperty('value.name', updatedFields.name);
  });

  it('should delete a contact', async () => {
    const contact: Contact = {
      id: 6,
      name: 'Diana',
      email: 'diana@example.com',
      did: 'did:example:345678',
      phoneNumber: '+237623876543',
    };

    await contactService.createContact(contact);

    await contactService.deleteContact(contact.id!);

    const deletedContact = await contactService.getContact(contact.id!);
    expect(deletedContact).toBeNull();
  });
});
