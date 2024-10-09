import { Wallet, Contact } from '../services/Wallet';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should add and retrieve contacts for a specific identity', () => {
    const contact: Contact = {
      did: 'did:example:123456789abcdefghi',
      label: 'Alice',
      serviceEndpoint: 'http://example.com/endpoint',
    };

    wallet.addContact(contact, 'wallet-1');

    const retrievedContacts = wallet.getContacts('wallet-1');
    expect(retrievedContacts[0].did).toBe(contact.did);
    expect(retrievedContacts[0].label).toBe('Alice');
    expect(retrievedContacts[0].label).toBe(contact.label);
  });

  it('should return an empty array if no contacts exits for an identity', () => {
    const retrievedContacts = wallet.getContacts('wallet-1');
    expect(retrievedContacts).toEqual([]);
  });

  it('should return all contacts across all identities', () => {
    const contact1: Contact = {
      did: 'did:example:123456789abcdefghi',
      label: 'Alice',
      serviceEndpoint: 'http://example.com/endpoint',
    };

    const contact2: Contact = {
      did: 'did:example:123456789abcdefghi',
      label: 'Bob',
      serviceEndpoint: 'http://example.com/endpoint',
    };

    wallet.addContact(contact1, 'wallet-1');
    wallet.addContact(contact2, 'wallet-2');

    const allContacts = wallet.getAllContacts();

    expect(allContacts).toEqual([contact1, contact2]);
    expect.arrayContaining([contact1, contact2]);
  });
});
