// handleOOBInvitation.test.ts
import { handleOOBInvitation } from '../services/HandleOOBInvitation';
import { Wallet } from '../services/Wallet';
import {
  invalidEncodedUrl,
  validOutOfBandInvitation,
} from '../utils/OOBTestFixtures';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleOOBInvitation', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should add a valid contact to the wallet from a JSON invitation', () => {
    handleOOBInvitation(wallet, validOutOfBandInvitation, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');

    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe(validOutOfBandInvitation.id);
  });

  it('should not add a contact if the OOB invitation URL is invalid', () => {
    handleOOBInvitation(wallet, invalidEncodedUrl, 'wallet-1');
    expect(wallet.getContacts('wallet-1')).toHaveLength(0);
  });

  it('should handle an OOB invitation as a string', () => {
    const invitationString = JSON.stringify(validOutOfBandInvitation);
    handleOOBInvitation(wallet, invitationString, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe(validOutOfBandInvitation.id);
  });
});
