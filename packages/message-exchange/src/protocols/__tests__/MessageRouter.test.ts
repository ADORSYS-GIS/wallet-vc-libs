import { describe, test } from 'vitest';

import { MessageRepository } from '@adorsys-gis/message-service';
import { ServiceResponse } from '@adorsys-gis/status-service';
import { PeerDIDResolver } from 'did-resolver-lib';
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
  const messageRouter = new MessageRouter(
    new PeerDIDResolver(),
    new DidRepository(securityService),
    new MessageRepository(),
    secretPinNumber,
  );

  const generateIdentity = async () => {
    const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
    didIdentityService.createDidIdentity(
      DIDMethodName.Peer,
      secretPinNumber,
      PeerGenerationMethod.Method2,
    );

    const data = (await createEvent) as ServiceResponse<{ did: string }>;
    return data.payload.did;
  };

  test('encrypt with security service', async () => {
    const senderDid = await generateIdentity();
    console.log(senderDid);
  });

  test('should route messages successfully', async () => {
    const senderDid = await generateIdentity();
    const messageModel = await messageRouter.routeForwardMessage(
      'Hello, World!',
      aliceDid,
      senderDid,
    );

    console.log({ messageModel });
  });
});
