import { DidService } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination';
import { EventEmitter } from 'eventemitter3';
import { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';
import { processStatusRequest } from '../StatusRequest'; // Import the new function
import { DidEventChannel } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination'; // Import event channels
import { DidRepository } from '@adorsys-gis/multiple-did-identities/src/repository/DidRepository'; // Use the correct path

// Define the EventData interface
interface EventData {
  payload: {
    from: string;
    to: string;
    // Add other fields as necessary
  };
}

describe('StatusRequest', () => {
  // Create instances of dependencies
  const eventBus = new EventEmitter();
  const securityService = new SecurityService();
  const didRepository = new DidRepository(securityService); // Ensure this is correctly initialized

  // Create an instance of DidService
  const didService = new DidService(eventBus, securityService);

  beforeEach(() => {
  });

  // Helper function to wait for an event
  const waitForEvent = (channel: DidEventChannel): Promise<EventData> => {
    return new Promise((resolve) => {
      eventBus.once(channel, (data: EventData) => resolve(data));
    });
  };

  describe('messagepickup/3.0/status-request', () => {
    it('should work!', async () => {
      const oobString = 'https://mediator.socious.io?_oob=eyJpZCI6IjRhZDI1YjY1LWI4YmUtNDdjZi04NTUxLTdjNTgxMjEwODk0NyIsInR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzIuMC9pbnZpdGF0aW9uIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNrcDkyV2JRUThzQW5mSGJ5cGZVWHVUNkM3OHpWUnBOc0F6cFE3SE5rdHRpMy5WejZNa2pUTkRLbkV2Y3gyRXl0Zkw4QmVadmRHVWZFMTUzU2JlNFU3MjlNMnhkSDVILlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW1oMGRIQnpPaTh2YldWa2FXRjBiM0l1YzI5amFXOTFjeTVwYnlJc0ltRWlPbHNpWkdsa1kyOXRiUzkyTWlKZGZYMC5TZXlKMElqb2laRzBpTENKeklqcDdJblZ5YVNJNkluZHpjem92TDIxbFpHbGhkRzl5TG5OdlkybHZkWE11YVc4dmQzTWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDE5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdE1lZGlhdGUiLCJhY2NlcHQiOlsiZGlkY29tbS92MiJdfSwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1wbGFpbitqc29uIn0';

      const processEvent = waitForEvent(DidEventChannel.MediationResponseReceived);
      await didService.processMediatorOOB(oobString);

      const eventData = await processEvent;
      console.log('Event Data:', eventData); // Log the event data

      // follow-up call
      const mediatorDid = eventData.payload.from;
      const aliceDidForMediator = eventData.payload.to;

      console.log('mediatorDid:', mediatorDid, 'aliceDidForMediator:', aliceDidForMediator);

      // Pass the DidRepository instance to processStatusRequest
      await processStatusRequest(mediatorDid, aliceDidForMediator, didRepository);
    });
  });
});
