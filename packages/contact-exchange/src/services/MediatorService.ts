import axios from 'axios';
import { validEncodedUrl } from '../tests/OOBTestFixtures';
import { OutOfBandInvitation } from './DIDCommOOBInvitation';
import { Contact, Wallet } from './Wallet';

export async function requestContactExchange(
  wallet: Wallet,
  oobInvitation: OutOfBandInvitation,
  identity: string,
): Promise<void> {
  const MEDIATOR_URL = 'https://mediator.rootsid.cloud';

  try {
    const response = await axios.post(`${MEDIATOR_URL}/${validEncodedUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(oobInvitation),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to exchange contact: ${response.statusText}`);
    }

    const contactData = response.data;
    if (!contactData.id || !contactData.from || !contactData.type) {
      throw new Error('Received invalid contact data');
    }

    const contact: Contact = {
      id: contactData.id,
      from: contactData.from,
      type: contactData.type,
    };

    wallet.addContact(contact, identity);
    console.log(`Contact exchanged and added for identity ${identity}`);
  } catch (error) {
    console.error('Error in contact exchange:', error);
    throw error;
  }
}
