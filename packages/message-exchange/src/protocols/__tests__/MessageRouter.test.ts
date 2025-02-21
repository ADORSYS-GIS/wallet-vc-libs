import { MessageRepository } from '@adorsys-gis/message-service';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';
import nock from 'nock';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { MessageRouter } from '../MessageRouter';
import {
  aliceDid,
  aliceDidInvalidMediatorUri,
  aliceDidNoDeref,
  generateIdentity,
  securityService,
} from './helpers';

describe('MessageRouter', () => {
  const secretPinNumber = 1234;
  const didRepository = new DidRepository(securityService);
  const messageRepository = new MessageRepository();

  const messageRouter = new MessageRouter(
    didRepository,
    messageRepository,
    secretPinNumber,
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    vi.resetAllMocks();
  });

  test.each([aliceDid, aliceDidNoDeref])(
    'should route messages successfully',
    async (recipientDid) => {
      /// Prepare

      const message = 'Hello, World!';
      const senderDid = await generateIdentity(secretPinNumber);
      nock('https://mediator.rootsid.cloud').post('/').reply(202);

      /// Act

      const messageModel = await messageRouter.routeForwardMessage(
        message,
        recipientDid,
        senderDid,
      );

      /// Assert

      const routedMessage = (
        await messageRepository.getAllByContact(recipientDid)
      ).find((m) => m.id == messageModel.id);

      expect(routedMessage).toBeDefined();
      expect(routedMessage).toEqual(messageModel);

      expect(routedMessage).toEqual(
        expect.objectContaining({
          text: message,
          sender: senderDid,
          contactId: recipientDid,
          direction: 'out',
        }),
      );
    },
  );

  test('should fail on packing error', async () => {
    const message = 'Hello, World!';
    const senderDid = await generateIdentity(secretPinNumber);

    // Our resolver does not support this DID method, so
    // packing will fail because it depends on DID resolution
    const recipientDid = 'did:ion:alice';

    await expect(async () => {
      await messageRouter.routeForwardMessage(message, recipientDid, senderDid);
    }).rejects.toThrow('Forward message packing failed');
  });

  test('should fail if no valid mediator enpoint uri found', async () => {
    const message = 'Hello, World!';
    const senderDid = await generateIdentity(secretPinNumber);

    // The mediator's endpoint of this DID is an FTP URL,
    // which is not supported.
    const recipientDid = aliceDidInvalidMediatorUri;

    await expect(async () => {
      await messageRouter.routeForwardMessage(message, recipientDid, senderDid);
    }).rejects.toThrow(
      "No valid or supported mediator's endpoint URI was found",
    );
  });

  test('should fail if mediator does not accept routed message', async () => {
    const message = 'Hello, World!';
    const recipientDid = aliceDid;
    const senderDid = await generateIdentity(secretPinNumber);

    // The mediator will complain of a 400 bad request,
    // hence rejecting the routed message.
    nock('https://mediator.rootsid.cloud').post('/').reply(400);

    await expect(async () => {
      await messageRouter.routeForwardMessage(message, recipientDid, senderDid);
    }).rejects.toThrow('Failed to route packed message to mediator');
  });

  test('should fail if secrets cannot be found', async () => {
    const message = 'Hello, World!';
    const recipientDid = aliceDid;
    const senderDid = await generateIdentity(secretPinNumber);

    // Mock a scenario where no private keys are available
    vi.spyOn(didRepository, 'getADidWithDecryptedPrivateKeys').mockReturnValue(
      Promise.resolve(null),
    );

    await expect(async () => {
      await messageRouter.routeForwardMessage(message, recipientDid, senderDid);
    }).rejects.toThrow('Inexistent private keys for senderDid');
  });

  test('should fail if secrets cannot be found (bis)', async () => {
    const message = 'Hello, World!';
    const recipientDid = aliceDid;
    const senderDid = await generateIdentity(secretPinNumber);

    // Mock a scenario where no private keys are available
    vi.spyOn(didRepository, 'getADidWithDecryptedPrivateKeys').mockReturnValue(
      Promise.resolve({
        did: senderDid,
        createdAt: 0,
        decryptedPrivateKeys: {},
      }),
    );

    await expect(async () => {
      await messageRouter.routeForwardMessage(message, recipientDid, senderDid);
    }).rejects.toThrow('Cannot proceed with no sender secrets');
  });
});
