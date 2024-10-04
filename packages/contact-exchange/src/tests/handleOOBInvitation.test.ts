// handleOOBInvitation.test.ts
import { handleOOBInvitation } from '../services/handleOOBInvitation';
import { Wallet } from '../services/wallet';
import { OutOfBandInvitation } from '../services/didcomm-oobInvitation';

describe('handleOOBInvitation', () => {
  it('should add a contact to the wallet', () => {
    const wallet = new Wallet();
    const invitation: OutOfBandInvitation = {
      '@id': 'invitation-id',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      services: [
        {
          id: 'did:example:123456789abcdefghi',
          type: 'did-communication',
          serviceEndpoint: 'http://example.com/endpoint',
          recipientKeys: ['did:example:123456789abcdefghi#key-1'],
          routingKeys: ['did:example:123456789abcdefghi#key-2'],
        },
      ],
    };

    handleOOBInvitation(wallet, invitation, 'wallet-1');

    expect(wallet.getContacts('wallet-1')).toHaveLength(1);
    expect(wallet.getContacts('wallet-1')[0].did).toBe(
      'did:example:123456789abcdefghi#key-1',
    );
  });

  it('should not add the contact if the OOB invitation is invalid and getAllContacts should return all contacts', () => {
    const wallet = new Wallet();
    const invitation: OutOfBandInvitation = {
      '@id': 'invitation-id',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      services: [
        {
          id: 'did:example:123456789abcdefghi',
          type: 'did-communication',
          serviceEndpoint: 'http://example.com/endpoint',
          recipientKeys: ['did:example:123456789abcdefghi#key-1'],
          routingKeys: ['did:example:123456789abcdefghi#key-2'],
        },
      ],
    };

    handleOOBInvitation(wallet, invitation, 'wallet-1');

    const invalidInvitation: OutOfBandInvitation = {
      '@id': 'invitation-id',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      services: [],
    };

    handleOOBInvitation(wallet, invalidInvitation, 'identity1');

    expect(wallet.getAllContacts()).toHaveLength(1);
  });
});
