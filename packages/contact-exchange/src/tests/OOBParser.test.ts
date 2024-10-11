import { parseOOBInvitation } from '../services/OOBParser';
import { handleOOBInvitation } from '../services/HandleOOBInvitation';
import { Wallet } from '../services/Wallet';
import {
  validEncodedUrl,
  invalidEncodedUrl,
  validContact,
} from './OOBTestFixtures';

// Update the validEncodedUrl in OOBTestFixtures to match the new URL format
// For example:
// export const validEncodedUrl = 'https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiMDczODZhZTUtMjYzYi00ZjgwLWE2M2ItZmI5OTE1ODIzM2IyIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ';

describe('OOBParser', () => {
  it('should parse a valid OOB invitation URL and return the invitation', () => {
    const result = parseOOBInvitation(validEncodedUrl);
    console.log('Result:', result);
    expect(result).not.toBeNull();
    expect(result?.invitation['@id']).toBe('invitation-id');
  });

  it('should return null for an invalid URL', () => {
    const result = parseOOBInvitation(invalidEncodedUrl);
    expect(result).toBeNull();
  });

  it('should return null for a URL that is not a base64 encoded URL', () => {
    const result = parseOOBInvitation('https://example.com');
    expect(result).toBeNull();
  });

  it('should add a valid contact from a base64 encoded URL invitation', () => {
    const parsedInvitation = parseOOBInvitation(validEncodedUrl);
    if (!parsedInvitation) {
      throw new Error('Failed to parse OOB invitation');
    }

    const wallet = new Wallet();
    handleOOBInvitation(wallet, parsedInvitation.invitation, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(1);
    expect(contacts[0].did).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should not add a contact if it is already in the wallet', () => {
    const wallet = new Wallet();
    const contact = validContact;
    wallet.addContact(contact, 'wallet-1');

    const parsedInvitation = parseOOBInvitation(validEncodedUrl);
    if (parsedInvitation) {
      handleOOBInvitation(wallet, parsedInvitation.invitation, 'wallet-1');
    }
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(1);
    expect(contacts[0].did).toBe(contact.did);
  });

  it('should not add a contact for an invalid OOB invitation URL', () => {
    const wallet = new Wallet();
    handleOOBInvitation(wallet, invalidEncodedUrl, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(0);
  });
});
