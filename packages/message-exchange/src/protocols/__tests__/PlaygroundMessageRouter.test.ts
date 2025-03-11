import { MessageRepository } from '@adorsys-gis/message-service';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';
import nock from 'nock';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { MessageRouter } from '../MessageRouter';
import { generateIdentity, securityService } from './helpers';

describe('MessageRouter', () => {
  const aliceDid =
    'did:peer:2.Vz6Mkf7niyMQDtxo9Y6D3k2KvqNnbSCRPFvZ7711U9TByBg2w.Ez6LShKMCr4AjddtmkDrXS4UjZzumu4b8BnhAeXbpxyCDpCV5.SeyJzIjp7ImEiOlsiZGlkY29tbS92MiJdLCJyIjpbXSwidXJpIjoiZGlkOnBlZXI6Mi5WejZNa2k3TXpKaTNyTUdRdkx5bzNWUlhrN0tiUDFKblcxMkpFYWtFcldDZE1XY0ZmLkV6NkxTcnNGd3ZFY0tVMmZ4MzF6Sjk4VERoUWlKbjhocDNLQmRXbUp6N1VZbkRiVlguU2V5SnBaQ0k2SWlOa2FXUmpiMjF0SWl3aWN5STZleUpoSWpwYkltUnBaR052YlcwdmRqSWlYU3dpY2lJNlcxMHNJblZ5YVNJNkltaDBkSEE2THk5c2IyTmhiR2h2YzNRNk9EQTRNQ0o5TENKMElqb2laRzBpZlEifSwidCI6ImRtIn0';

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

    const message = 'hello!';
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
