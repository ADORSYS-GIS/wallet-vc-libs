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

  afterEach((done) => {
    // Listen for the emitted contacts from getAllContacts
    const getAllEvent = waitForEvent(ContactEventChannel.GetAllContacts);

    contactService.getAllContacts(); // Trigger the emission of contacts

    getAllEvent
      .then(async (contacts) => {
        for (const contact of contacts) {
          contactService.deleteContact(contact.id!);
        }
        done(); // Signal that the afterEach is complete
      })
      .catch(() => {
        done(); // If there's an error in getting contacts, just finish
      });
  });

  // Helper function to wait for an event
  const waitForEvent = (channel: ContactEventChannel) => {
    return new Promise<any[]>((resolve) => {
      // Use 'any[]' if expecting an array
      eventBus.once(channel, (data) => resolve(data));
    });
  };

  it('should create a new contact and emit the event', (done) => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'John Doe',
      did: 'did:example:123456',
    };

    // Set up the event listener for the creation event
    eventBus.once(ContactEventChannel.CreateContact, (createdContact) => {
      expect(createdContact).toEqual(
        expect.objectContaining({
          name: newContact.name,
          did: newContact.did,
          id: expect.any(Number),
        }),
      );
      done();
    });

    // Call the createContact method
    contactService.createContact(newContact);
  });

  it('should retrieve a contact by ID', (done) => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    eventBus.once(ContactEventChannel.CreateContact, async (createdContact) => {
      const getEvent = waitForEvent(ContactEventChannel.GetContactByID);
      contactService.getContact(createdContact.id!);
      const retrievedContact = await getEvent;

      expect(retrievedContact).toEqual(
        expect.objectContaining({
          id: createdContact.id,
          name: createdContact.name,
          did: createdContact.did,
        }),
      );
      done();
    });

    contactService.createContact(newContact);
  });

  it('should retrieve all contacts', (done) => {
    const contact1: Omit<Contact, 'id'> = {
      name: 'Alice',
      did: 'did:example:345678',
    };

    const contact2: Omit<Contact, 'id'> = {
      name: 'Bob',
      did: 'did:example:654321',
    };

    // Create the first contact
    eventBus.once(ContactEventChannel.CreateContact, async () => {
      // Create the second contact
      eventBus.once(ContactEventChannel.CreateContact, async () => {
        const getAllEvent = waitForEvent(ContactEventChannel.GetAllContacts);
        contactService.getAllContacts();
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
        done();
      });

      contactService.createContact(contact2);
    });

    contactService.createContact(contact1);
  });

  it('should update a contact', (done) => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie',
      did: 'did:example:789012',
    };

    eventBus.once(ContactEventChannel.CreateContact, async (createdContact) => {
      const updatedFields = { name: 'Charles' };
      const updateEvent = waitForEvent(ContactEventChannel.UpdateContact);

      contactService.updateContact(createdContact.id!, updatedFields);
      const updatedContact = await updateEvent;

      expect(updatedContact).toEqual(
        expect.objectContaining({
          id: createdContact.id,
          name: updatedFields.name,
        }),
      );
      done();
    });

    contactService.createContact(contact);
  });

  // it('should delete a contact and verify it no longer exists', (done) => {
  //   const contact: Omit<Contact, 'id'> = {
  //     name: 'Charlie Brown',
  //     did: 'did:example:789012',
  //   };

  //   eventBus.once(ContactEventChannel.CreateContact, async (createdContact) => {
  //     const deleteEvent = waitForEvent(ContactEventChannel.DeleteContact);

  //     contactService.deleteContact(createdContact.id!);
  //     const { id: deletedContactId } = await deleteEvent;

  //     expect(deletedContactId).toBe(createdContact.id);

  //     // Ensure contact is no longer retrievable
  //     contactService.getContact(deletedContactId!).catch(() => {
  //       // Contact should not be found
  //       expect(true).toBe(true);
  //       done();
  //     });
  //   });

  //   contactService.createContact(contact);
  // });
});
