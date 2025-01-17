import { EventEmitter } from 'eventemitter3';
import { logError } from '../lib/errors-logs/logger';
import { validOutOfBandInvitation } from '../tests/OOBTestFixtures';
import { OutOfBandInvitation } from './DIDCommOOBInvitation';
import { Contact, Wallet } from './Wallet';

const messageEmitter = new EventEmitter();

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
        logError(
          error as Error,
          'Error parsing invitation: invalid JSON format.',
        );
        messageEmitter.emit(
          'error',
          'The invitation format is invalid. Please check the data.',
        );
      }
    } else if (typeof invitation === 'object') {
      parsedInvitation = invitation as OutOfBandInvitation;
    } else {
      const error = new Error(`Invalid invitation type: ${typeof invitation}`);
      logError(error, 'Invalid invitation type provided.');
      messageEmitter.emit(
        'error',
        'Invalid invitation type. Please provide valid data.',
      );
    }

    if (!parsedInvitation) {
      const error = new Error('No parsed invitation provided.');
      logError(error, 'Invalid OOB invitation.');
      messageEmitter.emit(
        'error',
        'No invitation data found. Please check your input.',
      );
      return;
    }

    if (!parsedInvitation.body) {
      const error = new Error('No body provided in the invitation.');
      logError(error, 'Invalid OOB invitation body.');
      messageEmitter.emit(
        'error',
        'The invitation body is missing. Please check your input.',
      );
    }

    const body = parsedInvitation.body as {
      goal_code: unknown;
      goal: unknown;
      accept: unknown;
    };

    if (!body.goal_code || !body.goal || !body.accept) {
      const error = new Error('Invalid invitation body structure.');
      logError(error, 'Missing required fields in invitation body.');
      messageEmitter.emit(
        'error',
        'The invitation body structure is invalid. Missing required fields.',
      );
    }

    if (!wallet || !identity) {
      const error = new Error('Wallet or identity is missing.');
      logError(error, 'Invalid wallet or identity.');
      messageEmitter.emit(
        'error',
        'The wallet or identity information is missing. Please check your setup.',
      );
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
      logError(error as Error, 'Error adding contact to the wallet.');
      messageEmitter.emit('error', 'Failed to add the contact to the wallet.');
    }
  } catch (error) {
    logError(error as Error, 'Unhandled error in handleOOBInvitation.');
    messageEmitter.emit(
      'error',
      'An unexpected error occurred. Please try again later.',
    );
  }
}
