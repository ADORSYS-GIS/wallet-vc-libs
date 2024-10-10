import { OutOfBandInvitation } from './DIDCommOOBInvitation';

// OOBParser.ts

export interface ParsedOOB {
  invitation: OutOfBandInvitation;
  encodedPart: string;
}
export function parseOOBInvitation(url: string): ParsedOOB | null {
  try {
    const urlPattern =
      /^(https:\/\/identity\.foundation\/didcomm-messaging\/spec\/#standard-message-encoding\?)(.*)$/;
    const match = url.match(urlPattern);
    if (!match) {
      throw new Error('Invalid URL format');
    }

    const encodedPart = match[2];
    const decodedData = atob(encodedPart); // Decoding base64
    const invitation: OutOfBandInvitation = JSON.parse(decodedData);

    // Map @cid to @id
    invitation['@id'] = invitation['@cid'];

    return { invitation, encodedPart };
  } catch (error) {
    console.error('Error parsing OOB invitation:', error);
    return null;
  }
}
