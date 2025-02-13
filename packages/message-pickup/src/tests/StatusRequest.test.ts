import { DidService } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination';
import { EventEmitter } from 'eventemitter3';
import { processStatusRequest } from '../StatusRequest'; // Import the new function
import { DidEventChannel } from '@adorsys-gis/contact-exchange/src/services/MediatorCoordination'; // Import event channels
import { DidRepository, SecurityService } from '@adorsys-gis/multiple-did-identities'; 
import { mediatorDidTest, aliceDidTest } from './helpers';
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

  it('should work!', async () => {
    // const oobString = 'https://didcomm-mediator.eudi-adorsys.com?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNDc3MDkwOWQtZjg5YS00MDRmLTk5NzMtN2Q3ZWU1ZjIxNjE0IiwiZnJvbSI6ImRpZDpwZWVyOjIuVno2TWt3OVRNeTIxVGhwNkdKcEpBalVqVmFnNm5uWXgyb0RMU2tKSmV0bXNYR1VkTC5FejZMU2dnV1d0OXhVUTdtOVFEbVJyWm94cTZvU3lCSmNtd0Z4VWpiOVpLTUpQekh0LlNleUpwWkNJNklpTmthV1JqYjIxdElpd2ljeUk2ZXlKaElqcGJJbVJwWkdOdmJXMHZkaklpWFN3aWNpSTZXMTBzSW5WeWFTSTZJbWgwZEhCek9pOHZaR2xrWTI5dGJTMXRaV1JwWVhSdmNpNWxkV1JwTFdGa2IzSnplWE11WTI5dEluMHNJblFpT2lKa2JTSjkiLCJib2R5Ijp7ImdvYWxfY29kZSI6InJlcXVlc3QtbWVkaWF0ZSIsImdvYWwiOiJSZXF1ZXN0IE1lZGlhdGUiLCJsYWJlbCI6Ik1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXX19';
    // console.log('Start!');
    
    // const processEvent = waitForEvent(DidEventChannel.MediationResponseReceived);
    // await didService.processMediatorOOB(oobString);

    // const eventData = await processEvent;
    // console.log('Event Data:', eventData); // Log the event data

    // // follow-up call
    // const mediatorDid = eventData.payload.from;
    // const aliceDidForMediator = eventData.payload.to[0];

    const mediatorDid = mediatorDidTest;
    const aliceDidForMediator = aliceDidTest;

    // console.log('mediatorDid:', mediatorDid);
    // console.log('aliceDidForMediator:', aliceDidForMediator);
    // Pass the DidRepository instance to processStatusRequest
    await processStatusRequest(mediatorDid, aliceDidForMediator, didRepository);
  });

});
