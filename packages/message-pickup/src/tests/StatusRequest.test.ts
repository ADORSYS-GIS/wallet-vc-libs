import { DidService } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination';
import { EventEmitter } from 'eventemitter3';
import { processDeliveryRequest, processStatusRequest } from '../StatusRequest'; // Import the new function
import { DidEventChannel } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination'; // Import event channels
import { DidRepository, SecurityService } from '@adorsys-gis/multiple-did-identities'; 
import { mediatorDidTest, aliceDidTest } from '../utils/helpers';
// Define the EventData interface
interface EventData {
  payload: {
    from: string;
    to: string;
    body: {
      updated: {
        recipient_did: string;
      }[];
    };
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

  it('processStatusRequest - local values - flow', async () => {
    // (1/2) Perform the mediation coordination:
    // const oobString = 'https://didcomm-mediator.eudi-adorsys.com?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNGEyODI1YjktYzJjNi00ZmVlLThjODMtY2Y1NmVmMjU5ODBiIiwiZnJvbSI6ImRpZDpwZWVyOjIuVno2TWtrakJzSlAzcFR4TFF6Q0xBVlIxQVdZbnhaQUFtWW5wNGl2cHlrVzlBeGtuUC5FejZMU2JqUFpUMUNpeTlpaVlUV2J1eUpEdWlNanZtU0xIZmJMeWhEdndQcHRNeTVXLlNleUpwWkNJNklpTmthV1JqYjIxdElpd2ljeUk2ZXlKaElqcGJJbVJwWkdOdmJXMHZkaklpWFN3aWNpSTZXMTBzSW5WeWFTSTZJbWgwZEhCek9pOHZaR2xrWTI5dGJTMXRaV1JwWVhSdmNpNWxkV1JwTFdGa2IzSnplWE11WTI5dEluMHNJblFpT2lKa2JTSjkiLCJib2R5Ijp7ImdvYWxfY29kZSI6InJlcXVlc3QtbWVkaWF0ZSIsImdvYWwiOiJSZXF1ZXN0IE1lZGlhdGUiLCJsYWJlbCI6Ik1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXX19';
    const oobString = 'https://mediator.socious.io?_oob=eyJpZCI6IjQ3MzVmMjIwLWVlYTEtNDRjYi1hMTc0LTZhNGI2NTA3NmI2NiIsInR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzIuMC9pbnZpdGF0aW9uIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNrcDkyV2JRUThzQW5mSGJ5cGZVWHVUNkM3OHpWUnBOc0F6cFE3SE5rdHRpMy5WejZNa2pUTkRLbkV2Y3gyRXl0Zkw4QmVadmRHVWZFMTUzU2JlNFU3MjlNMnhkSDVILlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW1oMGRIQnpPaTh2YldWa2FXRjBiM0l1YzI5amFXOTFjeTVwYnlJc0ltRWlPbHNpWkdsa1kyOXRiUzkyTWlKZGZYMC5TZXlKMElqb2laRzBpTENKeklqcDdJblZ5YVNJNkluZHpjem92TDIxbFpHbGhkRzl5TG5OdlkybHZkWE11YVc4dmQzTWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDE5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdE1lZGlhdGUiLCJhY2NlcHQiOlsiZGlkY29tbS92MiJdfSwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1wbGFpbitqc29uIn0';
    const processEvent = waitForEvent(DidEventChannel.MediationResponseReceived);
    await didService.processMediatorOOB(oobString);
    const eventData = await processEvent;
    console.log('Event Data:', eventData.payload); // Log the event data

    // (2/2) Perform status request 
    const mediatorDid = eventData.payload.from;
    const aliceDidForMediator = eventData.payload.to[0];
    const aliceRecipientDid =  eventData.payload.body.updated[0].recipient_did;

    console.log('mediatorDid:', mediatorDid);
    console.log('aliceDidForMediator:', aliceDidForMediator);
    console.log('aliceRecipientDid:', aliceRecipientDid);

    await processStatusRequest(mediatorDid, aliceDidForMediator, didRepository, false, aliceRecipientDid);
  });

  it.only('processStatusRequest - local values', async () => {

    const mediatorDid = mediatorDidTest;
    const aliceDidForMediator = aliceDidTest;

    console.log('mediatorDid:', mediatorDid);
    console.log('aliceDidForMediator:', aliceDidForMediator);

    await processStatusRequest(mediatorDid, aliceDidForMediator, didRepository, true);
  });

  it.only('processDeliveryRequest', async () => {
    const mediatorDid = mediatorDidTest;
    const aliceDidForMediator = aliceDidTest;

    console.log('mediatorDid:', mediatorDid);
    console.log('aliceDidForMediator:', aliceDidForMediator);

    await processDeliveryRequest(mediatorDid, aliceDidForMediator, didRepository);
  });

});
