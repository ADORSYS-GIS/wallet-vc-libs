import { describe, expect, test } from 'vitest';

import { MessageRepository } from '@adorsys-gis/message-service';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';
import { MessageRouter } from '../MessageRouter';
import { generateIdentity, securityService } from './helpers';

describe('MessageRouter', () => {
  const aliceDid =
    'did:peer:2.Vz6MkrYmGmdm69Sc5bFG1ZmNx7sKZLjqyeBUokCsGR38zKxoG.Ez6LSircgD2VpE9VbU7TfeE8DCZKd1Jp4jnvmNL5me5EGL6Kp.SeyJzIjp7ImEiOlsiZGlkY29tbS92MiJdLCJyIjpbXSwidXJpIjoiZGlkOnBlZXI6Mi5FejZMU2twOTJXYlFROHNBbmZIYnlwZlVYdVQ2Qzc4elZScE5zQXpwUTdITmt0dGkzLlZ6Nk1ralROREtuRXZjeDJFeXRmTDhCZVp2ZEdVZkUxNTNTYmU0VTcyOU0yeGRINUguU2V5SjBJam9pWkcwaUxDSnpJanA3SW5WeWFTSTZJbWgwZEhCek9pOHZiV1ZrYVdGMGIzSXVjMjlqYVc5MWN5NXBieUlzSW1FaU9sc2laR2xrWTI5dGJTOTJNaUpkZlgwLlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW5kemN6b3ZMMjFsWkdsaGRHOXlMbk52WTJsdmRYTXVhVzh2ZDNNaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMTkifSwidCI6ImRtIn0';

  const secretPinNumber = 1234;
  const didRepository = new DidRepository(securityService);
  const messageRepository = new MessageRepository();

  const messageRouter = new MessageRouter(
    didRepository,
    messageRepository,
    secretPinNumber,
  );

  test('should route messages successfully', async () => {
    // Prepare

    const message = 'Hello, World2222!';
    const recipientDid = aliceDid;
    const senderDid = await generateIdentity(secretPinNumber);

    // Act

    const messageModel = await messageRouter.routeForwardMessage(
      message,
      recipientDid,
      senderDid,
    );

    // Assert

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
  }, 50e3);
});