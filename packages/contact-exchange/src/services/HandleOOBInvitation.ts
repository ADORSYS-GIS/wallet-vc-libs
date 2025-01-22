import { validOutOfBandInvitation } from '../tests/OOBTestFixtures';
import { OutOfBandInvitation } from './DIDCommOOBInvitation';
import { Contact, Wallet } from './Wallet';

export function handleOOBInvitation(
  wallet: Wallet,
  invitation: OutOfBandInvitation | string,
  identity: string,
): void {
  try {
    let parsedInvitation: OutOfBandInvitation | null = null;

    if (typeof invitation === 'string' && invitation.startsWith('{')) {
      try {
        parsedInvitation = JSON.parse(invitation) as OutOfBandInvitation;
      } catch (error) {
        console.error('Error parsing invitation:', error);
        return;
      }
    } else if (typeof invitation === 'object') {
      parsedInvitation = invitation as OutOfBandInvitation;
    } else {
      console.error('Invalid invitation type:', typeof invitation);
      return;
    }

    if (!parsedInvitation) {
      console.error('Invalid OOB invitation: no parsed invitation provided.');
      return;
    }

    if (!parsedInvitation.body) {
      console.error('Invalid OOB invitation: no body provided.');
      return;
    }

    const body = parsedInvitation.body as {
      goal_code: unknown;
      goal: unknown;
      accept: unknown;
    };

    if (!body.goal_code || !body.goal || !body.accept) {
      console.error('Invalid invitation body');
      return;
    }

    if (!wallet || !identity) {
      console.error('Invalid wallet or identity');
      return;
    }

    try {
      // Create a new contact object
      const contact: Contact = {
        type: validOutOfBandInvitation.type,
        id: validOutOfBandInvitation.id,
        from: validOutOfBandInvitation.from,
      };

      wallet.addContact(contact, identity);
      console.log(`Contact added for identity ${identity}`);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  } catch (error) {
    console.error('Error handling OOB invitation:', error);
  }
}
