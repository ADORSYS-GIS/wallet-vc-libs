import { ContactService } from '../ContactService';
import { Contact } from '../../model/Contact';
import { eventBus } from '@adorsys-gis/event-bus';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    // Initialize the ContactService before each test
    contactService = new ContactService(eventBus);
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
      did: 'did:example:123456',
    };

    await contactService.createContact(newContact);
    const retrievedContact = await contactService.getContact(newContact.id!);

    expect(retrievedContact).toEqual(
      expect.objectContaining({
        name: newContact.name,
        did: newContact.did,
      }),
    );
  });

  it('should retrieve a contact by ID', async () => {
    const contact: Contact = {
      id: 2,
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    await contactService.createContact(contact);

    const retrievedContact = await contactService.getContact(2);

    expect(retrievedContact).toEqual(
      expect.objectContaining({
        id: contact.id,
        name: contact.name,
        did: contact.did,
      }),
    );
  });

  it('should retrieve all contacts', async () => {
    const contact1: Contact = {
      id: 3,
      name: 'Alice',
      did: 'did:example:345678',
    };

    const contact2: Contact = {
      id: 4,
      name: 'Bob',
      did: 'did:example:654321',
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
      did: 'did:example:789012',
    };

    await contactService.createContact(contact);

    const updatedFields = { name: 'Charles' };
    await contactService.updateContact(contact.id!, updatedFields);

    const updatedContact = await contactService.getContact(contact.id!);

    expect(updatedContact).toEqual(
      expect.objectContaining({
        id: contact.id,
        did: contact.did,
        name: updatedFields.name,
      }),
    );
  });

  it('should delete a contact', async () => {
    const contact: Contact = {
      id: 6,
      name: 'Diana',
      did: 'did:example:345678',
    };

    await contactService.createContact(contact);

    await contactService.deleteContact(contact.id!);

    const deletedContact = await contactService.getContact(contact.id!);
    expect(deletedContact).toBeNull();
  });
});
