// OOBTestFixtures.ts
// Base64 Encoded URL fixtures
import { Buffer } from 'buffer';
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';
import { Contact } from '../services/Wallet';

// Update the validEncodedUrl in OOBTestFixtures to match the new URL format
// For example:
// export const validEncodedUrl = 'https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiMDczODZhZTUtMjYzYi00ZjgwLWE2M2ItZmI5OTE1ODIzM2IyIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ';

// Updated OutOfBandInvitation fixture
export const validOutOfBandInvitation: OutOfBandInvitation = {
  id: 'invitation-id',
  from: 'did:example:sender',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
  encodedPart: '',
  body: {
    goal_code: 'issue-vc',
    goal: 'To issue a Faber College Graduate credential',
    accept: ['didcomm/v2', 'didcomm/aip2;env=rfc587'],
  },
};

// Updated invalid OutOfBandInvitation fixture
export const invalidOutOfBandInvitation: OutOfBandInvitation = {
  id: 'invitation-id',
  from: 'did:example:sender',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
  encodedPart: '',
  body: {
    goal_code: 'invalid-goal-code',
    goal: 'Invalid goal',
    accept: [],
  },
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
  id: 'did:example:123456789abcdefghi',
  from: 'did:example:sender',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
};

export const secondValidContact: Contact = {
  id: 'did:example:987654321abcdefghi',
  from: 'did:example:sender',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
};

export const invalidContact: Contact = {
  id: 'invalid-did',
  from: 'did:example:sender',
  type: 'https://didcomm.org/out-of-band/2.0/invitation',
};
