import { logError } from '../lib/errors-logs/logger';
import { OOBServiceError } from '../lib/errors-logs/OOBServiceError';
import { ProcessOOBInvitationError } from '../lib/errors-logs/ProcessOOBInvitation.errors';

import type {
  DIDCommMessage,
  OutOfBandInvitation,
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
        throw new OOBServiceError(ProcessOOBInvitationError.ParsingError);
      }
      parsedInvitation = parsed;
    } else {
      parsedInvitation = invitation;
    }

    if (!parsedInvitation) {
      throw new OOBServiceError(ProcessOOBInvitationError.InvalidInvitation);
    }
    // Handle invalid invitations
    if (!parsedInvitation) {
      throw new OOBServiceError(ProcessOOBInvitationError.InvalidInvitation);
    }

    // Check if body and goal_code are present in the invitation
    if (!parsedInvitation.body) {
      throw new OOBServiceError(ProcessOOBInvitationError.MissingBody);
    }
    if (!parsedInvitation.body.goal_code) {
      throw new OOBServiceError(ProcessOOBInvitationError.MissingGoalCode);
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
    if (error instanceof OOBServiceError) {
      logError(error, 'Processing OOB Invitation');
    } else {
      logError(
        error instanceof Error ? error : new Error('Unknown error'),
        'Unexpected Error',
      );
    }
    return null;
  }
}
