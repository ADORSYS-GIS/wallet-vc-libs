// Wallet.test.ts
import { Wallet } from '../services/Wallet';
import {
  validContact,
  secondValidContact,
  invalidContact,
} from './OOBTestFixtures';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should add and retrieve valid contacts for a specific identity', () => {
    wallet.addContact(validContact, 'wallet-1');

    const retrievedContacts = wallet.getContacts('wallet-1');
    expect(retrievedContacts[0].did).toBe(validContact.did);
    expect(retrievedContacts[0].label).toBe(validContact.label);
  });

  it('should handle adding an invalid contact', () => {
    expect(() => wallet.addContact(invalidContact, 'wallet-1')).toThrowError(
      'Invalid contact',
    );
    expect(wallet.getContacts('wallet-1')).toEqual([]);
  });

  it('should return all contacts across identities', () => {
    wallet.addContact(validContact, 'wallet-1');
    wallet.addContact(secondValidContact, 'wallet-2');

    const allContacts = wallet.getAllContacts();
    expect(allContacts).toEqual([validContact, secondValidContact]);
  });
});
