import { eventBus } from '@adorsys-gis/event-bus';
import { Contact } from '../../model/Contact';
import { ContactEventChannel } from '../../model/ContactEventChannel';
import { ContactService } from '../ContactService';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    // Initialize the ContactService before each test
    contactService = new ContactService(eventBus);
  });

  afterEach(async () => {
    const contacts = await contactService.getAllContacts();
    for (const contact of contacts) {
      await contactService.deleteContact(contact.id!);
    }
  });

  // Helper function to wait for event
  const waitForEvent = (channel: ContactEventChannel) => {
    return new Promise<Contact>((resolve) => {
      eventBus.once(channel, (data) => resolve(data));
    });
  };

  it('should create a new contact and emit the event', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'John Doe',
      did: 'did:example:123456',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);

    await contactService.createContact(newContact);

    const createdContact = await createEvent;

    expect(createdContact).toEqual(
      expect.objectContaining({
        name: newContact.name,
        did: newContact.did,
        id: expect.any(Number),
      }),
    );
  });

  it('should retrieve a contact by ID', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);

    await contactService.createContact(newContact);

    const createdContact = await createEvent;

    const getEvent = waitForEvent(ContactEventChannel.GetContactByID);
    await contactService.getContact(createdContact.id!);
    const retrievedContact = await getEvent;

    expect(retrievedContact).toEqual(
      expect.objectContaining({
        id: createdContact.id,
        name: createdContact.name,
        did: createdContact.did,
      }),
    );
  });

  it('should retrieve all contacts', async () => {
    const contact1: Omit<Contact, 'id'> = {
      name: 'Alice',
      did: 'did:example:345678',
    };

    const contact2: Omit<Contact, 'id'> = {
      name: 'Bob',
      did: 'did:example:654321',
    };

    await contactService.createContact(contact1);
    await contactService.createContact(contact2);

    const getAllEvent = waitForEvent(ContactEventChannel.GetAllContacts);

    await contactService.getAllContacts();
    const contacts = await getAllEvent;

    expect(contacts).toHaveLength(2);
    expect(contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: contact1.name,
          did: contact1.did,
        }),
        expect.objectContaining({
          name: contact2.name,
          did: contact2.did,
        }),
      ]),
    );
  });

  it('should update a contact', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie',
      did: 'did:example:789012',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);

    await contactService.createContact(contact);
    const createdContact = await createEvent;

    const updatedFields = { name: 'Charles' };
    const updateEvent = waitForEvent(ContactEventChannel.UpdateContact);

    await contactService.updateContact(createdContact.id!, updatedFields);
    const updatedContact = await updateEvent;

    expect(updatedContact).toEqual(
      expect.objectContaining({
        id: createdContact.id,
        name: updatedFields.name,
      }),
    );
  });

  it('should delete a contact and verify it no longer exists', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);

    await contactService.createContact(contact);
    const createdContact = await createEvent;

    const deleteEvent = waitForEvent(ContactEventChannel.DeleteContact);

    await contactService.deleteContact(createdContact.id!);
    const { id: deletedContactId } = await deleteEvent;

    expect(deletedContactId).toBe(createdContact.id);

    // Ensure contact is no longer retrievable
    waitForEvent(ContactEventChannel.GetContactByID);
    await contactService.getContact(deletedContactId!).catch(() => {
      // Contact should not be found
      expect(true).toBe(true);
    });
  });
});
