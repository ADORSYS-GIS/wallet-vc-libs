import { EventEmitter } from 'eventemitter3';

import { logError } from '../lib/errors-logs/logger';
import { validOutOfBandInvitation } from '../tests/OOBTestFixtures';

import type { OutOfBandInvitation } from './DIDCommOOBInvitation';
import type { Contact, Wallet } from './Wallet';

const messageEmitter = new EventEmitter();

// Registering listeners for events
messageEmitter.on('error', (errorMessage: string, error?: Error) => {
  logError(error || new Error('Unknown error'), errorMessage);
});

messageEmitter.on('success', (successMessage: string) => {
  console.log(`Success: ${successMessage}`);
});

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
        messageEmitter.emit(
          'error',
          'Error parsing invitation: invalid JSON format.',
          error as Error,
        );
        return;
      }
    } else if (typeof invitation === 'object') {
      parsedInvitation = invitation as OutOfBandInvitation;
    } else {
      messageEmitter.emit(
        'error',
        `Invalid invitation type: ${typeof invitation}. Please provide valid data.`,
      );
      return;
    }

    if (!parsedInvitation) {
      messageEmitter.emit(
        'error',
        'No parsed invitation provided. Please check your input.',
      );
      return;
    }

    if (!parsedInvitation.body) {
      messageEmitter.emit(
        'error',
        'No body provided in the invitation. Please check your input.',
      );
      return;
    }

    const body = parsedInvitation.body as {
      goal_code: unknown;
      goal: unknown;
      accept: unknown;
    };

    if (!body.goal_code || !body.goal || !body.accept) {
      messageEmitter.emit(
        'error',
        'The invitation body structure is invalid. Missing required fields.',
      );
      return;
    }

    if (!wallet || !identity) {
      messageEmitter.emit(
        'error',
        'Invalid wallet or identity, The wallet or identity information is missing. Please check your setup.',
      );
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
      messageEmitter.emit(
        'success',
        `Contact successfully added for identity ${identity}`,
      );
    } catch (error) {
      messageEmitter.emit(
        'error',
        'Failed to add the contact to the wallet.',
        error as Error,
      );
    }
  } catch (error) {
    messageEmitter.emit(
      'error',
      'An unexpected error occurred. Please try again later.',
      error as Error,
    );
  }
}
