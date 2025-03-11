import { DidService } from '@adorsys-gis/contact-exchange/';
import { EventEmitter } from 'eventemitter3';
import { MessagePickup } from '../protocols/MessagePickup'; // Import the class
import { DidEventChannel } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination'; // Import event channels
import {
  DidRepository,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import { mediatorDidTest, aliceDidTest, secretsTest } from './helpers';
import { MessageRepository } from '@adorsys-gis/message-service';

// Define the EventData interface
interface EventData {
  payload: {
    mediatorDID: string,
    recipientDID: string,
    aliceDID: string
  }
}

describe('StatusRequest', () => {
  // Create instances of dependencies
  const eventBus = new EventEmitter();
  const securityService = new SecurityService();
  const didRepository = new DidRepository(securityService); // Ensure this is correctly initialized
  const messageRepository = new MessageRepository();

  // Create an instance of DidService
  const didService = new DidService(eventBus, securityService);
  const messagePickup = new MessagePickup(
    didRepository,
    1234,
    messageRepository,
  );

  beforeEach(() => {});

  // Helper function to wait for an event
  const waitForEvent = (channel: DidEventChannel): Promise<EventData> => {
    return new Promise((resolve) => {
      eventBus.once(channel, (data: EventData) => resolve(data));
    });
  };

  // To use the playground you have to manually load the secrets inside MessagePickup
  it('processStatusRequest - local values - flow', async () => {
    // (1/2) Perform the mediation coordination:
    const oobString =
      'http://localhost:8080?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiZDViMmVlMTEtZTllOC00ODEyLWExNjUtNDkyYjk5ZWJjYjU1IiwiZnJvbSI6ImRpZDpwZWVyOjIuVno2TWtoUjhEcGdoMWtFNkR1eEdDS1RVNmdkU0pSOXV1THJ5MXBaVWpETlExNUFWei5FejZMU2tDWkFoTUhvVGJUS3lnelJYeW5XY0N2N1g0Vkd0TWhvM1NkTlRqWlNQVjVULlNleUpwWkNJNklpTmthV1JqYjIxdElpd2ljeUk2ZXlKaElqcGJJbVJwWkdOdmJXMHZkaklpWFN3aWNpSTZXMTBzSW5WeWFTSTZJbWgwZEhBNkx5OXNiMk5oYkdodmMzUTZPREE0TUNKOUxDSjBJam9pWkcwaWZRIiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdCBNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ';
    const processEvent = waitForEvent(
      DidEventChannel.MediationResponseReceived,
    );
    await didService.processMediatorOOB(oobString);
    const eventData = await processEvent;
    console.log('Event Data:', eventData); // Log the event data

    // (2/2) Perform status request
    const mediatorDid = eventData.payload.mediatorDID;
    const aliceDidForMediator = eventData.payload.aliceDID;
    const aliceRecipientDid = eventData.payload.recipientDID;

    console.log('mediatorDid:', mediatorDid);
    console.log('aliceDidForMediator:', aliceDidForMediator);
    console.log('aliceRecipientDid:', aliceRecipientDid);

    const messageCount = await messagePickup.processStatusRequest(
      mediatorDid,
      aliceDidForMediator,
      aliceRecipientDid
    );

    console.log('messageCount: ', messageCount);
  });

  it('processStatusRequest - local values', async () => {
    const mediatorDid = mediatorDidTest;
    const aliceDidForMediator = aliceDidTest;
    const aliceRecipientDid = aliceDidTest;

    const messageCount = await messagePickup.processStatusRequest(
      mediatorDid,
      aliceDidForMediator,
      aliceRecipientDid,
      true
    );
    console.log('messageCount: ', messageCount);
  });

  it('processDeliveryRequest', async () => {
    const mediatorDid = mediatorDidTest;
    const aliceDidForMediator = aliceDidTest;

    const response = await messagePickup.processDeliveryRequest(
      mediatorDid,
      aliceDidForMediator,
      true
    );
    console.log('response: ', response);

    const messages = (
      await messageRepository.getAllByContact(mediatorDid)
    );
    console.log('messages: ', messages);
  });
});
