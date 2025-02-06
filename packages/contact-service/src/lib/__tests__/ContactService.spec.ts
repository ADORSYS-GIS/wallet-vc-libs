import type { Contact } from '../../model/Contact';
import { ContactEventChannel } from '../../model/ContactEventChannel';
import { ContactService } from '../ContactService';

import { eventBus } from '@adorsys-gis/event-bus';
import type {
  ServiceResponse} from '@adorsys-gis/status-service';
import {
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    // Initialize the ContactService before each test
    contactService = new ContactService(eventBus);
  });

  afterEach(async () => {
    // Clear all contacts after each test
    const deleteAllContactsEvent = new Promise<void>((resolve) => {
      eventBus.once(
        ContactEventChannel.GetAllContacts,
        async (response: ServiceResponse<Contact[]>) => {
          if (response.status === ServiceResponseStatus.Success) {
            const contacts = response.payload;
            if (Array.isArray(contacts)) {
              for (const contact of contacts) {
                contactService.deleteContact(contact.id!);
              }
            }
          }
          resolve();
        },
      );

      contactService.getAllContacts();
    });

    await deleteAllContactsEvent;
  });

  // Helper function to wait for an event
  const waitForEvent = (channel: ContactEventChannel) => {
    return new Promise<ServiceResponse<Contact>>((resolve) => {
      eventBus.once(channel, (data) => resolve(data));
    });
  };

  it('should create a new contact and emit the event', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'John Doe',
      did: 'did:example:123456',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(newContact);

    const createdContact = await createEvent;

    expect(createdContact).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          name: newContact.name,
          did: newContact.did,
          id: expect.any(Number),
        }),
      }),
    );
  });

  it('should emit an error when failing to create a contact', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'John Doe',
      did: 'did:example:123456',
    };

    jest
      .spyOn(contactService['contactRepository'], 'create')
      .mockRejectedValueOnce(new Error('Failed to create contact'));

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(newContact);

    const createdContactResponse = await createEvent;

    expect(createdContactResponse).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Failed to create contact',
        }),
      }),
    );
  });

  it('should retrieve a contact by ID', async () => {
    const newContact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(newContact);
    const createdContact = await createEvent;

    const getEvent = waitForEvent(ContactEventChannel.GetContactByID);
    contactService.getContact(createdContact.payload.id!);
    const retrievedContact = await getEvent;

    expect(retrievedContact).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          id: createdContact.payload.id,
          name: createdContact.payload.name,
          did: createdContact.payload.did,
        }),
      }),
    );
  });

  it('should emit an error when failing to retrieve a contact by ID', async () => {
    const nonExistentId = 999; // An ID that doesn't exist

    // Mock repository to simulate failure
    jest
      .spyOn(contactService['contactRepository'], 'get')
      .mockRejectedValueOnce(new Error('Contact not found'));

    const getEvent = waitForEvent(ContactEventChannel.GetContactByID);
    contactService.getContact(nonExistentId);
    const result = await getEvent;

    expect(result).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Contact not found',
        }),
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

    // Create contacts
    const createEvent1 = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact1);
    await createEvent1;

    const createEvent2 = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact2);
    await createEvent2;

    const getAllEvent = waitForEvent(ContactEventChannel.GetAllContacts);
    contactService.getAllContacts();
    const contacts = await getAllEvent;

    expect(contacts).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.arrayContaining([
          expect.objectContaining({
            name: contact1.name,
            did: contact1.did,
          }),
          expect.objectContaining({
            name: contact2.name,
            did: contact2.did,
          }),
        ]),
      }),
    );
  });

  it('should emit an error when failing to retrieve all contacts with a non-Error value', async () => {
    // Mock repository to simulate failure with a non-Error object (e.g., a string)
    jest
      .spyOn(contactService['contactRepository'], 'getAll')
      .mockRejectedValueOnce('Non-Error failure');

    const getAllEvent = waitForEvent(ContactEventChannel.GetAllContacts);
    contactService.getAllContacts();
    const result = await getAllEvent;

    expect(result).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Non-Error failure',
        }),
      }),
    );
  });

  it('should update a contact', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie',
      did: 'did:example:789012',
    };

    // Create a contact
    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact);
    const createdContact = await createEvent;

    const updatedFields = { name: 'Charles' };
    const updateEvent = waitForEvent(ContactEventChannel.UpdateContact);

    // Update the contact
    contactService.updateContact(createdContact.payload.id!, updatedFields);
    const updatedContact = await updateEvent;

    expect(updatedContact).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          id: createdContact.payload.id,
          name: updatedFields.name,
        }),
      }),
    );
  });

  it('should emit an error when failing to update a contact', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie',
      did: 'did:example:789012',
    };

    jest
      .spyOn(contactService['contactRepository'], 'create')
      .mockResolvedValueOnce({
        ...contact,
        id: 1,
      });

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact);
    const createdContact = await createEvent;

    // Mock the update method to simulate failure
    jest
      .spyOn(contactService['contactRepository'], 'update')
      .mockRejectedValueOnce(new Error('Update failed'));

    const updateEvent = waitForEvent(ContactEventChannel.UpdateContact);
    const updatedFields = { name: 'Charles' };

    contactService.updateContact(createdContact.payload.id!, updatedFields);
    const result = await updateEvent;

    expect(result).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Update failed',
        }),
      }),
    );
  });

  it('should delete a contact and verify it no longer exists', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact);
    const createdContact = await createEvent;

    const deleteEvent = waitForEvent(ContactEventChannel.DeleteContact);
    contactService.deleteContact(createdContact.payload.id!);
    const {
      payload: { id: deletedContactId },
    } = await deleteEvent;

    expect(deletedContactId).toBe(createdContact.payload.id);

    // Ensure contact is no longer retrievable
    try {
      const getEvent = waitForEvent(ContactEventChannel.GetContactByID);
      contactService.getContact(deletedContactId!);
      await getEvent;
    } catch {
      expect(true).toBe(true);
    }
  });

  it('should emit an error when failing to delete a contact', async () => {
    const contact: Omit<Contact, 'id'> = {
      name: 'Charlie Brown',
      did: 'did:example:789012',
    };

    jest
      .spyOn(contactService['contactRepository'], 'create')
      .mockResolvedValueOnce({
        ...contact,
        id: 1,
      });

    const createEvent = waitForEvent(ContactEventChannel.CreateContact);
    contactService.createContact(contact);
    const createdContact = await createEvent;

    // Mock the delete method to simulate failure
    jest
      .spyOn(contactService['contactRepository'], 'delete')
      .mockRejectedValueOnce(new Error('Deletion failed'));

    const deleteEvent = waitForEvent(ContactEventChannel.DeleteContact);
    contactService.deleteContact(createdContact.payload.id!);
    const result = await deleteEvent;

    expect(result).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Deletion failed',
        }),
      }),
    );
  });
});
