import { describe, test, expect } from 'vitest';

import { MessageRepository } from '@adorsys-gis/message-service';
import { ServiceResponse } from '@adorsys-gis/status-service';
import { MessageRouter } from '../MessageRouter';

import {
  aliceDid,
  didIdentityService,
  waitForEvent,
  securityService,
} from './fixtures';

import {
  DidEventChannel,
  DIDMethodName,
  DidRepository,
  PeerGenerationMethod,
} from '@adorsys-gis/multiple-did-identities';

describe('MessageRouter', () => {
  const secretPinNumber = 1234;
  const didRepository = new DidRepository(securityService);
  const messageRouter = new MessageRouter(
    didRepository,
    new MessageRepository(),
    secretPinNumber,
  );

  const generateIdentity = async (secretPinNumber: number) => {
    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    didIdentityService.createDidIdentity(
      DIDMethodName.Peer,
      secretPinNumber,
      PeerGenerationMethod.Method2,
    );

    const data = (await createEvent) as ServiceResponse<{ did: string }>;
    return data.payload.did;
  };

  test('should route messages successfully', async () => {
    const senderDid = await generateIdentity(secretPinNumber);
    const messageModel = await messageRouter.routeForwardMessage(
      'Hello, World!',
      aliceDid,
      senderDid,
    );

    console.log({ messageModel });
  });
});
