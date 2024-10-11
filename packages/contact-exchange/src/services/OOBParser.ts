import { OutOfBandInvitation } from './DIDCommOOBInvitation';

export interface ParsedOOB {
  invitation: OutOfBandInvitation;
  encodedPart: string;
}

export function parseOOBInvitation(url: string): ParsedOOB | null {
  const urlPattern = /^(https:\/\/mediator\.rootsid\.cloud\?_oob=)(.*)$/;
  const match = url.match(urlPattern);
  if (!match) {
    return null;
  }

  const encodedPart = match[2];
  try {
    const decodedData = atob(encodedPart); // Decoding base64
    const invitation: OutOfBandInvitation = JSON.parse(decodedData);

    // Validate the invitation object
    if (!invitation['@id'] || !invitation['@type']) {
      throw new Error('Invalid invitation object');
    }

    // Map @cid to @id if present
    if (invitation['@cid'] && !invitation['@id']) {
      invitation['@id'] = invitation['@cid'];
    }

    return { invitation, encodedPart };
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'InvalidCharacterError'
    ) {
      throw new Error('Invalid base64 encoding');
    } else if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON');
    } else {
      throw error;
    }
  }
}
