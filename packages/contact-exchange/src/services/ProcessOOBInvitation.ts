import {
  OutOfBandInvitation,
  DIDCommMessage,
  OutOfBandService,
} from './DIDCommOOBInvitation';

export function processOOBInvitation(
  invitation: OutOfBandInvitation,
): DIDCommMessage | null {
  try {
    const { '@id': id, '@type': type, services, label, goal } = invitation;

    // Validate that services are provided in the OOB invitation
    if (!services || services.length === 0) {
      throw new Error('No service provided in the OOB invitation.');
    }

    // Determine if the first service is a string or an object
    const service =
      typeof services[0] === 'string' ? { id: services[0] } : services[0];

    // Cast service to OutOfBandService type
    const outOfBandService = service as OutOfBandService;

    const { serviceEndpoint, recipientKeys, routingKeys } = outOfBandService;

    // Create a basic DIDComm Message structure
    const didCommMessage: DIDCommMessage = {
      type: type,
      from: recipientKeys[0],
      body: {
        goal: goal || undefined,
        label: label || undefined,
        recipientKeys,
        routingKeys,
        serviceEndpoint,
      },
      to: [],
      created_time: new Date().toISOString(),
      id: id,
    };

    return didCommMessage;
  } catch (error) {
    // Enhanced error handling
    console.error(
      'Error processing OOB Invitation:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
