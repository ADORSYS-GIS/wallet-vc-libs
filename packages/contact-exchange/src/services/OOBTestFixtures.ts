// OOBTestFixtures.ts
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';
import { Contact } from '../services/Wallet';

// OutOfBandInvitation fixtures
export const validOutOfBandInvitation: OutOfBandInvitation = {
  '@id': 'invitation-id',
  '@type': 'https://didcomm.org/out-of-band/2.0/invitation',
  services: [
    {
      id: 'did:example:123456789abcdefghi',
      type: 'did-communication',
      serviceEndpoint: 'http://example.com/endpoint',
      recipientKeys: ['did:example:123456789abcdefghi#key-1'],
    },
  ],
  '@cid': '',
};

export const invalidOutOfBandInvitation: OutOfBandInvitation = {
  '@id': 'invitation-id',
  '@type': 'https://didcomm.org/out-of-band/2.0/invitation',
  services: [
    {
      id: 'did:example:123456789abcdefghi',
      type: 'did-communication',
      serviceEndpoint: 'http://example.com/endpoint',
      recipientKeys: [],
    },
  ],
  '@cid': '',
};

// Base64 Encoded URL fixtures
export const validEncodedUrl =
  'https://identity.foundation/didcomm-messaging/spec/#standard-message-encoding?eyJAY2lkIjoiSW52aXRhdGlvbi1JRCIsIkB0eXBlIjoiIHRlc3QifQ==';

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
  serviceEndpoint: 'http://example.com/endpoint',
};

export const invalidContact: Contact = {
  did: '',
  label: '',
  serviceEndpoint: '',
};
