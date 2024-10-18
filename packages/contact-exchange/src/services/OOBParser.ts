import { OutOfBandInvitation } from './DIDCommOOBInvitation';

export function parseOOBInvitation(url: string): OutOfBandInvitation | null {
  const urlPattern = /(_oob=)([A-Za-z0-9\-_+=/]+)$/;
  const match = url.match(urlPattern);

  if (!match) {
    return null;
  }

  try {
    const base64Part = match[2];
    const decoded = Buffer.from(base64Part, 'base64').toString();
    const invitation = JSON.parse(decoded) as OutOfBandInvitation;

    if (!invitation.id || !invitation.type) {
      console.error('Invalid invitation structure: Missing id or type');
      return null;
    }

    // Check if body is an object
    if (!invitation.body || typeof invitation.body !== 'object') {
      console.error('Invalid invitation structure: Body must be an object');
      return null;
    }

    return invitation;
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error(`Error parsing OOB invitation: ${typedError.message}`);
    if (typedError instanceof SyntaxError) {
      console.error('Invalid JSON format');
    } else if (typedError instanceof Error) {
      console.error(`Error: ${typedError.message}`);
    } else {
      console.error(`Unknown error: ${typedError}`);
    }
    return null;
  }
}
