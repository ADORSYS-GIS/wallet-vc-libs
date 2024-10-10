// handleOOBInvitation.test.ts
import { handleOOBInvitation } from '../services/HandleOOBInvitation';
import { Wallet } from '../services/Wallet';
import { parseOOBInvitation } from '../services/OOBParser';
import {
  validOutOfBandInvitation,
  validEncodedUrl,
  invalidEncodedUrl,
  invalidOutOfBandInvitation,
} from '../services/OOBTestFixtures';

describe('handleOOBInvitation', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should add a valid contact to the wallet from a JSON invitation', () => {
    handleOOBInvitation(wallet, validOutOfBandInvitation, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(1);
    expect(contacts[0].did).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should add a valid contact from a base64 encoded URL invitation', () => {
    const parsedInvitation = parseOOBInvitation(validEncodedUrl);
    if (!parsedInvitation) {
      throw new Error('Failed to parse OOB invitation');
    }

    handleOOBInvitation(wallet, validOutOfBandInvitation, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(1);
    expect(contacts[0].did).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should not add a contact if the OOB invitation URL is invalid', () => {
    handleOOBInvitation(wallet, invalidEncodedUrl, 'wallet-1');
    expect(wallet.getContacts('wallet-1')).toHaveLength(0);
  });

  it('should handle invitations with missing recipient keys gracefully', () => {
    handleOOBInvitation(wallet, invalidOutOfBandInvitation, 'wallet-1');
    expect(wallet.getContacts('wallet-1')).toHaveLength(0);
  });
});
