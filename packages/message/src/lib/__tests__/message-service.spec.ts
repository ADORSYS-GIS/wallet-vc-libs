import { eventBus } from '@adorsys-gis/event-bus';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import { Message } from '../../model/Message';
import { MessageEventChannel } from '../../model/MessageEventChannel';
import { MessageService } from '../MessageService';
import { v4 as uuidv4 } from 'uuid';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    // Initialize the MessageService before each test
    messageService = new MessageService(eventBus);
  });

  afterEach(async () => {
    // Clear all messages after each test
    const deleteAllMessagesEvent = new Promise<void>((resolve) => {
      eventBus.once(
        MessageEventChannel.GetAllByContactId,
        async (response: ServiceResponse<Message[]>) => {
          if (response.status === ServiceResponseStatus.Success) {
            const messages = response.payload;
            if (Array.isArray(messages)) {
              for (const message of messages) {
                messageService.deleteMessage(message.id!);
              }
            }
          }
          resolve();
        },
      );

      messageService.getAllMessagesByContact('did:key:zKAJCbjwdhuhJBJWHBDSIs');
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
        payload: expect.objectContaining({
          id: newMessage.id,
          text: 'Hello, how are you',
          sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
          contactId: newMessage.contactId,
          timestamp: newMessage.timestamp,
        }),
      }),
    );
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
    const newMessage1: Message = {
      id: uuidv4(),
      text: 'Hello, how are you',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
      timestamp: new Date(),
    };

    const newMessage2: Message = {
      id: uuidv4(),
      text: 'Hello, how are you now?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIsqwasqwqw',
      timestamp: new Date(),
    };

    const newMessage3: Message = {
      id: uuidv4(),
      text: 'Hello, how are you today?',
      sender: 'did:key:z92389jqjdNJAWOJNSWDDjies',
      contactId: 'did:key:zKAJCbjwdhuhJBJWHBDSIs',
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

    // Retrieve all messages by contactId
    const getAllEvent = waitForEvent(MessageEventChannel.GetAllByContactId);
    messageService.getAllMessagesByContact(newMessage1.contactId);
    const messages = await getAllEvent;

    // expecting just message 1 and message 3
    expect(messages).toEqual(
      expect.objectContaining({
        status: ServiceResponseStatus.Success,
        payload: expect.arrayContaining([
          expect.objectContaining({
            id: newMessage1.id,
            text: newMessage1.text,
            sender: newMessage1.sender,
            contactId: newMessage1.contactId,
            timestamp: newMessage1.timestamp,
          }),
          expect.objectContaining({
            id: newMessage3.id,
            text: newMessage3.text,
            sender: newMessage3.sender,
            contactId: newMessage3.contactId,
            timestamp: newMessage3.timestamp,
          }),
        ]),
      }),
    );
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
