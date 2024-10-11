import { Wallet } from './Wallet';
import { OutOfBandInvitation, OutOfBandService } from './DIDCommOOBInvitation';

export function handleOOBInvitation(
  wallet: Wallet,
  invitation: OutOfBandInvitation | string,
  identity: string,
): void {
  try {
    let parsedInvitation: OutOfBandInvitation | null = null;

    if (typeof invitation === 'string' && invitation.startsWith('{')) {
      try {
        parsedInvitation = JSON.parse(invitation);
      } catch (error) {
        console.error('Error parsing invitation:', error);
        return;
      }
    } else if (typeof invitation === 'object') {
      parsedInvitation = invitation;
    } else {
      console.error('Invalid invitation type:', typeof invitation);
      return;
    }

    // Validate the parsed invitation
    if (!parsedInvitation?.services || parsedInvitation.services.length === 0) {
      console.error('Invalid OOB invitation: no services provided.');
      return;
    }

    // Handle contact addition based on the parsed services
    parsedInvitation.services.forEach((service: string | OutOfBandService) => {
      if (
        typeof service === 'object' &&
        service.recipientKeys &&
        service.recipientKeys.length > 0
      ) {
        const contact = {
          did: service.recipientKeys[0], // Use the first recipient key
          label: parsedInvitation.label || 'Unknown', // Use the label from the invitation or default to 'Unknown'
          serviceEndpoint: service.serviceEndpoint || '', // Service endpoint
        };

        // Add the contact to the wallet
        wallet.addContact(contact, identity);
        console.log(`Contact added for identity ${identity}`);
      } else {
        console.error('No recipient keys provided in the service.');
      }
    });
  } catch (error) {
    console.error('Error handling OOB invitation:', error);
  }
}
