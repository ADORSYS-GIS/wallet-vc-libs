// Wallet.test.ts
import { Wallet } from '../services/Wallet';
import {
  invalidContact,
  secondValidContact,
  validContact,
} from './OOBTestFixtures';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should add a valid contact to the wallet', () => {
    wallet.addContact(validContact, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe(validContact.id);
  });

  it('should not add an invalid contact to the wallet', () => {
    expect(() => wallet.addContact(invalidContact, 'wallet-1')).toThrowError(
      'Invalid contact: Invalid id',
    );
    expect(wallet.getContacts('wallet-1')).toEqual([]);
  });

  it('should add multiple contacts to the wallet', () => {
    wallet.addContact(validContact, 'wallet-1');
    wallet.addContact(secondValidContact, 'wallet-1');
    const contacts = wallet.getContacts('wallet-1');
    expect(contacts).toHaveLength(2);
    expect(contacts[0].id).toBe(validContact.id);
    expect(contacts[1].id).toBe(secondValidContact.id);
  });

  it('should get all contacts across identities', () => {
    wallet.addContact(validContact, 'wallet-1');
    wallet.addContact(secondValidContact, 'wallet-2');
    const allContacts = wallet.getAllContacts();
    expect(allContacts).toHaveLength(2);
    expect(allContacts[0].id).toBe(validContact.id);
    expect(allContacts[1].id).toBe(secondValidContact.id);
  });

  it('should remove a contact from the wallet', () => {
    wallet.addContact(validContact, 'wallet-1');
    wallet.removeContact(validContact, 'wallet-1');
    expect(wallet.getContacts('wallet-1')).toEqual([]);
  });

  it('should remove a contact by id from the wallet', () => {
    wallet.addContact(validContact, 'wallet-1');
    wallet.removeContactById(validContact.id, 'wallet-1');
    expect(wallet.getContacts('wallet-1')).toEqual([]);
  });
});
