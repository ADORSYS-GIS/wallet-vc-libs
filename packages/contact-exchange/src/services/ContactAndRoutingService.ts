import { validContact } from '../tests/OOBTestFixtures';
import { DIDCommMessage, OutOfBandInvitation } from './DIDCommOOBInvitation';
import { handleOOBInvitation } from './HandleOOBInvitation';
import { requestContactExchange } from './MediatorService';
import { routeDIDCommMessage } from './RouteDIDCommMessage';
import { Wallet } from './Wallet';

export async function initiateContactAndRoute(
  wallet: Wallet,
  oobInvitation: OutOfBandInvitation,
  identity: string,
): Promise<void> {
  try {
    // Handle OutOfBandInvitation
    handleOOBInvitation(wallet, oobInvitation, identity);

    // Step 1: Contact Exchange
    await requestContactExchange(wallet, oobInvitation, identity);

    // Step 2: Check if the invitation is valid before routing the message
    if (isValidOutOfBandInvitation(oobInvitation)) {
      const didCommMessage: DIDCommMessage = {
        serviceId: 'serviceId',
        id: validContact.id,
        type: validContact.type,
        from: oobInvitation.from,
        to: [],
        created_time: new Date().toISOString(),
        body: {
          goal: oobInvitation.body.goal,
          goal_code: oobInvitation.body.goal_code,
          accept: oobInvitation.body.accept,
        },
        attachments: oobInvitation.attachments,
      };

      // Step 3: Route DIDComm Message
      await routeDIDCommMessage(didCommMessage);
    }
  } catch (error) {
    console.error('Error in contact and routing flow:', error);
  }
}

// Function to check the validity of the OutOfBandInvitation
function isValidOutOfBandInvitation(
  oobInvitation: OutOfBandInvitation,
): boolean {
  return oobInvitation.body.goal !== 'Invalid goal';
}
