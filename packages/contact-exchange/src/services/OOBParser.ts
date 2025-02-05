import { OOBServiceError } from '../lib/errors-logs/OOBServiceError';
import { OutOfBandInvitationError } from '../lib/errors-logs/OutOfBandInvitation.errors';
import { OutOfBandInvitation } from './DIDCommOOBInvitation';

export function parseOOBInvitation(url: string): OutOfBandInvitation | null {
  const urlPattern = /(_oob=)([A-Za-z0-9\-_+=/]+)$/;
  const match = url.match(urlPattern);

  if (!match) {
    throw new OOBServiceError(OutOfBandInvitationError.MissingQueryString);
  }

  const base64Part = match[2];
  let decoded: string;
  let invitation: OutOfBandInvitation;

  try {
    // Decode Base64
    decoded = Buffer.from(base64Part, 'base64').toString();
  } catch (error) {
    if (error instanceof Error && error.message === 'Unknown error') {
      throw new OOBServiceError(OutOfBandInvitationError.Generic);
    }
    throw new OOBServiceError(OutOfBandInvitationError.InvalidJson);
  }

  try {
    // Parse JSON
    invitation = JSON.parse(decoded) as OutOfBandInvitation;
  } catch {
    throw new OOBServiceError(OutOfBandInvitationError.InvalidJson);
  }

  // Validate `id` and `type`
  if (!invitation.id || !invitation.type) {
    throw new OOBServiceError(OutOfBandInvitationError.MissingIdOrType);
  }

  // Validate `body`
  if (!invitation.body || typeof invitation.body !== 'object') {
    throw new OOBServiceError(OutOfBandInvitationError.InvalidBody);
  }

  return invitation;
}
