import axios from 'axios';
import { DIDCommMessage } from './DIDCommOOBInvitation';

export async function routeDIDCommMessage(
  message: DIDCommMessage,
): Promise<void> {
  const ROUTE_URL = 'https://mediator.rootsid.cloud';

  try {
    const response = await axios.post(`${ROUTE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to route message: ${response.statusText}`);
    }

    console.log('Message successfully routed to mediator.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error routing message:', error.message);
    }
    throw error;
  }
}
