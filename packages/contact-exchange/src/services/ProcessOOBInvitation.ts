// processOOBInvitation.ts
import {
  OutOfBandInvitation,
  DIDCommMessage,
  OutOfBandService,
} from './DIDCommOOBInvitation';
import { parseOOBInvitation } from './OOBParser';

/**
 * Process an out-of-band invitation and return a DIDComm message.
 *
 * @param invitation - The out-of-band invitation to process, either as a string (URL) or an object.
 * @returns A DIDComm message, or null if the invitation is invalid.
 */

export function processOOBInvitation(
  invitation: OutOfBandInvitation | string,
): DIDCommMessage | null {
  try {
    let parsedInvitation: OutOfBandInvitation | null = null;

    // Check if the invitation is a URL
    if (typeof invitation === 'string') {
      const parsed = parseOOBInvitation(invitation);
      if (!parsed) {
        throw new Error('Failed to parse OOB invitation from URL.');
      }
      parsedInvitation = parsed;
    } else {
      parsedInvitation = invitation;
    }

    if (!parsedInvitation) {
      throw new Error('Invalid invitation');
    }

    // Extract the necessary fields from the parsed invitation
    const { id, type, services, label, goal } = parsedInvitation;

    // Validate that services are provided in the OOB invitation
    if (!services || services.length === 0) {
      throw new Error('No service provided in the OOB invitation.');
    }

    // Determine if the first service is a string or an object
    const service = services[0];
    if (typeof service !== 'object') {
      throw new Error('Service must be an object');
    }

    const outOfBandService = service as OutOfBandService;
    const { serviceEndpoint, recipientKeys, routingKeys } = outOfBandService;

    // Create a basic DIDComm Message structure
    const didCommMessage: DIDCommMessage = {
      type,
      from: recipientKeys[0],
      body: {
        goal,
        label,
        recipientKeys,
        routingKeys,
        serviceEndpoint,
      },
      to: [],
      created_time: new Date().toISOString(),
      id,
      serviceId: '',
    };

    return didCommMessage;
  } catch (error) {
    console.error(
      'Error processing OOB Invitation:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
