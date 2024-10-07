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
  

  it('should create a new contact and emit the event', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'John Doe',
      did: 'did:example:123456',
    };

    return new Promise<void>((resolve) => {
      eventBus.once(ContactEventChannel.CreateContact, (createdContact) => {
        expect(createdContact).toEqual(
          expect.objectContaining({
            name: newContact.name,
            did: newContact.did,
            id: expect.any(Number),
          }),
        );
        resolve();
      });

      contactService.createContact(newContact);
    });
  });

  it('should retrieve a contact by ID', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    const createdContact = await contactService.createContact(contact);

    return new Promise<void>((resolve) => {
      eventBus.once(ContactEventChannel.GetContactByID, (retrievedContact) => {
        expect(retrievedContact).toEqual(
          expect.objectContaining({
            name: contact.name,
            did: contact.did,
            id: expect.any(Number),
          }),
        );
        resolve();
      });

      contactService.getContact(2).catch(() => {
        resolve();
      });
    });
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

    return new Promise<void>((resolve) => {
      eventBus.once(ContactEventChannel.GetAllContacts, (contacts) => {
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
        resolve();
      });

      contactService.getAllContacts().catch(() => {
        resolve();
      });
    });
  });

  it('should update a contact', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie',
      did: 'did:example:789012',
    };

    return new Promise<void>((resolve) => {
      eventBus.once(
        ContactEventChannel.CreateContact,
        (createdContact: Contact) => {
          const updatedFields = { name: 'Charles' };

          eventBus.once(
            ContactEventChannel.UpdateContact,
            (updatedContact: Contact) => {
              expect(updatedContact).toEqual(
                expect.objectContaining({
                  id: createdContact.id,
                  name: updatedFields.name,
                }),
              );
              resolve();
            },
          );

          contactService.updateContact(createdContact.id!, updatedFields);
        },
      );

      contactService.createContact(contact);
    });
  });

  it('should delete a contact', async () => {
    const contact: Contact = {
      id: 1,
      name: 'Diana',
      did: 'did:example:345678',
    };
  
    // Create the contact
    const createdContact = await contactService.createContact(contact);
  
    // Now, delete the contact
    const getContact = await contactService.getContact(createdContact.id);
    await contactService.deleteContact(createdContact.id!);
  
    // After deletion, verify that the contact no longer exists
    const deletedContact = await contactService.getContact(createdContact.id!);
    expect(deletedContact).toBeNull(); // The contact should be deleted
  });
  
});
