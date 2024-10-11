// OOBTestFixtures.ts
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';
import { Contact } from '../services/Wallet';

/**
 * A valid OutOfBandInvitation fixture.
 */
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

/**
 * An invalid OutOfBandInvitation fixture, with no recipient keys.
 */
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
import { Buffer } from 'buffer';

const validOutOfBandInvitationJson = JSON.stringify(validOutOfBandInvitation);
const encodedUrl = Buffer.from(validOutOfBandInvitationJson).toString('base64');

/**
 * A valid encoded URL fixture.
 */
export const validEncodedUrl = `https://mediator.rootsid.cloud?_oob=${encodedUrl}`;

/**
 * An invalid encoded URL fixture.
 */
export const invalidEncodedUrl = 'invalid-url';

// Contact fixtures

/**
 * A valid Contact fixture.
 */
export const validContact: Contact = {
  did: 'did:example:123456789abcdefghi',
  label: 'Alice',
  serviceEndpoint: 'http://example.com/endpoint',
};

/**
 * A second valid Contact fixture.
 */
export const secondValidContact: Contact = {
  did: 'did:example:987654321abcdefghi',
  label: 'Bob',
  serviceEndpoint: 'http://example.com/endpoint',
};

/**
 * An invalid Contact fixture, with empty values.
 */
export const invalidContact: Contact = {
  did: ' invalid-did',
  label: ' label-too-long'.repeat(100),
  serviceEndpoint: 'not-a-url',
};
