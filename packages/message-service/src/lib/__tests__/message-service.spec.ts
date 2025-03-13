import { eventBus } from '@adorsys-gis/event-bus';
import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../../model/Message';
import { MessageEventChannel } from '../../model/MessageEventChannel';
import { MessageService } from '../MessageService';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    // Initialize the MessageService before each test
    messageService = new MessageService(eventBus);
  });

  afterEach(async () => {
    // Clear all messages after each test
    const deleteAllMessagesEvent = new Promise<void>((resolve) => {
      eventBus.once(MessageEventChannel.GetAllByContactId, (response) => {
        (async () => {
          if (response.status === ServiceResponseStatus.Success) {
            const messages = response.payload;
            if (Array.isArray(messages)) {
              for (const message of messages) {
                messageService.deleteMessage(message.id); // fixes non-null assertion
              }
            }
          }
        })().finally(resolve);
      });

      void messageService.getAllMessagesByContact(
        'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      );
    });

    await deleteAllMessagesEvent;
  });

  // Helper function to wait for an event
  const waitForEvent = (channel: MessageEventChannel) => {
    return new Promise<ServiceResponse<Message | Message[]>>((resolve) => {
      eventBus.once(channel, (data) => resolve(data));
    });
  };

  it('should create a new message and emit the event', async () => {
    const newMessage: Message = {
      id: uuidv4(),
      text: 'Hello, how are you',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    const createEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage);

    const createdMessage = await createEvent;

    expect(createdMessage).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: newMessage,
      }),
    );
  });

  it('should not add the same message with the same ID more than once', async () => {
    const message: Message = {
      id: uuidv4(),
      text: 'Hello, this is a test message',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    // First insertion should succeed
    const firstInsertEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(message);
    const firstInsertResponse = await firstInsertEvent;

    expect(firstInsertResponse).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: message,
      })
    );

    // Second insertion should return the same message without creating a duplicate
    const secondInsertEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(message);
    const secondInsertResponse = await secondInsertEvent;

    expect(secondInsertResponse).toEqual(firstInsertResponse);

    // Third insertion
    const thirdInsertEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(message);
    const thirdInsertResponse = await thirdInsertEvent;

    expect(thirdInsertResponse).toEqual(firstInsertResponse);

    // Fourth insertion
    const fourthInsertEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(message);
    const fourthInsertResponse = await fourthInsertEvent;

    expect(fourthInsertResponse).toEqual(firstInsertResponse);
  });


  it('should emit an error when failing to create a message', async () => {
    const newMessage: Message = {
      id: uuidv4(),
      text: 'Hello, how are you today',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    jest
      .spyOn(messageService['messageRepository'], 'create')
      .mockRejectedValueOnce(new Error('Failed to create message'));

    const createEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage);

    const createdMessageResponse = await createEvent;

    expect(createdMessageResponse).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Failed to create message',
        }),
      }),
    );
  });

  it('should retrieve all messages for a given contact', async () => {
    const contactId1 = 'did:key:zKAJCbjwdhuhJBJWHBDSIs';
    const contactId2 = 'did:key:zKAJCbjwdhuhJBJWHBDSej';

    const newMessage1: Message = {
      id: uuidv4(),
      text: 'Hello, how are you',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: contactId1,
      timestamp: new Date(),
    };

    const newMessage2: Message = {
      id: uuidv4(),
      text: 'Hello, how are you now?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: contactId2,
      timestamp: new Date(),
    };

    const newMessage3: Message = {
      id: uuidv4(),
      text: 'Are you there?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: contactId1,
      timestamp: new Date(),
    };

    const newMessage4: Message = {
      id: uuidv4(),
      text: 'Are you there? Hello....',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: contactId1,
      timestamp: new Date(),
    };

    const newMessage5: Message = {
      id: uuidv4(),
      text: 'Are you there? Hello....',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: contactId1,
      timestamp: new Date(),
    };

    // Create messages
    const createEvent1 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage1);
    await createEvent1;

    const createEvent2 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage2);
    await createEvent2;

    const createEvent3 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage3);
    await createEvent3;

    const createEvent4 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage4);
    await createEvent4;

    const createEvent5 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage5);
    await createEvent5;

    // Retrieve all messages by contactId1
    const getAllEvent = waitForEvent(MessageEventChannel.GetAllByContactId);
    messageService.getAllMessagesByContact(contactId1);
    const response = await getAllEvent;

    // Verify only messages with contactId1 are returned
    expect(response).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.arrayContaining([
          newMessage1,
          newMessage3,
          newMessage4,
          newMessage5,
        ]),
      }),
    );

    // Also ensure message2 is not included in the result
    expect(response.payload).not.toEqual(expect.arrayContaining([newMessage2]));
  });

  it('should emit an error when failing to retrieve messages for a contact', async () => {
    const contactId = 'nonexistentContactId';

    jest
      .spyOn(messageService['messageRepository'], 'getAllByContact')
      .mockRejectedValueOnce(new Error('Messages not found'));

    const getAllEvent = waitForEvent(MessageEventChannel.GetAllByContactId);
    messageService.getAllMessagesByContact(contactId);
    const result = await getAllEvent;

    expect(result).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Error,
        payload: expect.objectContaining({
          name: 'Error',
          message: 'Messages not found',
        }),
      }),
    );
  });

  it('should delete a message and verify it no longer exists', async () => {
    const newMessage: Message = {
      id: uuidv4(),
      text: 'Hello, how are you doing today?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    const createEvent = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage);
    await createEvent;

    const deleteEvent = waitForEvent(MessageEventChannel.DeleteMessage);
    messageService.deleteMessage(newMessage.id);
    const deletedMessageId = newMessage.id;
    await deleteEvent;

    // Ensure message is deleted by trying to fetch it again
    const getEvent = waitForEvent(MessageEventChannel.GetAllByContactId);
    messageService.getAllMessagesByContact('did:key:zKAJCbjwdhuhJBJWHBDSIs');
    const messagesAfterDelete = await getEvent;

    // Assert that the deleted message is no longer in the response
    expect(messagesAfterDelete).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.not.arrayContaining([
          expect.objectContaining({
            id: deletedMessageId, // Deleted message should not be in the list
          }),
        ]),
      }),
    );
  });

  it('should delete all messages by contact and verify they no longer exist', async () => {
    const newMessage: Message = {
      id: uuidv4(),
      text: 'Hello, how are you doing today?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    const newMessage2: Message = {
      id: uuidv4(),
      text: 'how are you doing today?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    // Create messages
    const createEvent1 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage);
    await createEvent1;

    const createEvent2 = waitForEvent(MessageEventChannel.CreateMessage);
    messageService.createMessage(newMessage2);
    await createEvent2;

    const deleteAllEvent = waitForEvent(
      MessageEventChannel.DeleteAllByContactId,
    );
    messageService.deleteAllMessagesByContact(newMessage.contactId);
    const deleteResponse = await deleteAllEvent;

    expect(deleteResponse).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.objectContaining({
          contactId: newMessage.contactId,
        }),
      }),
    );

    // Ensure all messages are deleted
    const getEvent = waitForEvent(MessageEventChannel.GetAllByContactId);
    messageService.getAllMessagesByContact(newMessage2.contactId);
    const messagesAfterDelete = await getEvent;

    expect(messagesAfterDelete).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: [],
      }),
    );
  });

  it('should emit an error response with a new Error instance when provided a non-Error input', () => {
    const channel = MessageEventChannel.CreateMessage;
    const errorMessage = 'This is a string error';

    const errorEvent = new Promise<ServiceResponse<Error>>((resolve) => {
      eventBus.once(channel, resolve);
    });

    // Trigger sharedErrorHandler with a non-Error input (string)
    messageService['sharedErrorHandler'](channel)(errorMessage);

    return errorEvent.then((response) => {
      expect(response.status).toBe(ServiceResponseStatus.Error);

      // Check if the payload is an error-like object
      expect(response.payload).toHaveProperty('message', errorMessage);
      expect(response.payload.message).toBe(errorMessage);
    });
  });
});
