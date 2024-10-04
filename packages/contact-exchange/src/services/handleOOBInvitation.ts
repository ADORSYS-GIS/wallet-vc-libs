// process OOB invitations and add contacts to the wallet

import { Wallet, Contact } from './wallet';
import { processOOBInvitation } from './processOOBInvitation';
import { OutOfBandInvitation } from './didcomm-oobInvitation';

const wallet = new Wallet();

function handleOOBInvitation(
  wallet: Wallet,
  invitation: OutOfBandInvitation,
  walletIdentity: string,
) {
  try {
    const didCommMessage = processOOBInvitation(invitation);

    if (didCommMessage !== null && didCommMessage !== undefined) {
      const contact: Contact = {
        did: didCommMessage.from,
        label: (didCommMessage.body as { label: string }).label || '',
        serviceEndpoint:
          (didCommMessage.body as { serviceEndpoint: string })
            .serviceEndpoint || '',
      };

      wallet.addContact(contact, walletIdentity);
    } else {
      console.log('No DIDComm message received from the OOB invitation');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error handling OOB invitation: ${error.message}`);
    } else {
      console.log('Unknown error occurred');
    }
  }
}

// Example use case
const exampleOOBInvitation: OutOfBandInvitation = {
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

const walletIdentity = 'wallet-1';
handleOOBInvitation(wallet, exampleOOBInvitation, walletIdentity);

// Retrieve contacts for a specific identity
console.log('Contacts for wallet-1:', wallet.getContacts(walletIdentity));

// Retrieve all contacts across all identities
console.log('All contacts:', wallet.getAllContacts());

export { OutOfBandInvitation, handleOOBInvitation };
