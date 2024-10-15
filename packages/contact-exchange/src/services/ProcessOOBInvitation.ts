// processOOBInvitation.ts
import { OutOfBandInvitation, DIDCommMessage } from './DIDCommOOBInvitation';
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
    if (
      !parsedInvitation ||
      !parsedInvitation.body ||
      !parsedInvitation.body.goal_code
    ) {
      return null;
    }

    // Extract the necessary fields from the parsed invitation
    const { id, type, body } = parsedInvitation;

    // Create a basic DIDComm Message structure
    const didCommMessage: DIDCommMessage = {
      type,
      from: '',
      body: {
        goal: body.goal,
        goal_code: body.goal_code,
        accept: body.accept,
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
