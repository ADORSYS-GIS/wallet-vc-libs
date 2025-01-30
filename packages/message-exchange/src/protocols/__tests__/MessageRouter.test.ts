import { describe, expect, test } from 'vitest';

import { MessageRepository } from '@adorsys-gis/message-service';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';
import { MessageRouter } from '../MessageRouter';
import { generateIdentity, securityService } from './helpers';

describe('MessageRouter', () => {
  const aliceDid =
    'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';

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

    const message = 'Hello, World!';
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
