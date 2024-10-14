// OOBTestFixtures.ts

// Base64 Encoded URL fixtures
import { Buffer } from 'buffer';
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';
import { Contact } from '../services/Wallet';

// Updated OutOfBandInvitation fixture
export const validOutOfBandInvitation: OutOfBandInvitation = {
  id: 'invitation-id',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
  services: [
    {
      id: 'did:example:123456789abcdefghi',
      type: 'did-communication',
      serviceEndpoint: 'http://example.com/endpoint',
      recipientKeys: ['did:example:123456789abcdefghi#key-1'],
    },
  ],
  cid: '',
  encodedPart: '',
};

// Updated invalid OutOfBandInvitation fixture
export const invalidOutOfBandInvitation: OutOfBandInvitation = {
  id: 'invitation-id',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
  services: [
    {
      id: 'did:example:123456789abcdefghi',
      type: 'did-communication',
      serviceEndpoint: 'http://example.com/endpoint',
      recipientKeys: [],
    },
  ],
  cid: '',
  encodedPart: '',
};

// Create a JSON string from the validOutOfBandInvitation object
const validOutOfBandInvitationJson = JSON.stringify(validOutOfBandInvitation);

// Create a base64 encoded URL from the JSON string
const encodedUrl = Buffer.from(validOutOfBandInvitationJson).toString('base64');

// Updated valid encoded URL fixture
export const validEncodedUrl = `_oob=${encodedUrl}`;

// Invalid encoded URL fixture remains unchanged
export const invalidEncodedUrl = 'invalid-url';

// Contact fixtures
export const validContact: Contact = {
  did: 'did:example:123456789abcdefghi',
  label: 'Alice',
  serviceEndpoint: 'http://example.com/endpoint',
};

export const secondValidContact: Contact = {
  did: 'did:example:987654321abcdefghi',
  label: 'Bob',
  serviceEndpoint: 'http://example.com/endpoint2',
};

export const invalidContact: Contact = {
  did: 'invalid-did',
  label: 'Invalid Contact',
  serviceEndpoint: '', // Invalid service endpoint
};
