import { describe, expect, test } from 'vitest';

import { MessageRepository } from '@adorsys-gis/message-service';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';
import { MessageRouter } from '../MessageRouter';
import { generateIdentity, securityService } from './helpers';

describe('MessageRouter', () => {
  const aliceDid =
    'did:peer:2.Vz6Mkuu4RDj8sTSuFWq94JQe8fiFkyomXtbdWFZ7ms3E2LeHV.Ez6LSnx35fi634iqzeFZMdABMVtRYwf7vcV7zrkFxVXetxPSP.SeyJzIjp7ImEiOlsiZGlkY29tbS92MiJdLCJyIjpbXSwidXJpIjoiZGlkOnBlZXI6Mi5WejZNa2drNGFCVTRDWUh2S3libXFyM002a2pxMVRYZE15NXB3UnZwa2R3QzJRSFFjLkV6NkxTbmdOOUtTenNibmtrbjFwdDlDc3VNelpuZ1FXVjM5WXZVbzZ0OXp4Z2doUlMuU2V5SnBaQ0k2SWlOa2FXUmpiMjF0SWl3aWN5STZleUpoSWpwYkltUnBaR052YlcwdmRqSWlYU3dpY2lJNlcxMHNJblZ5YVNJNkltaDBkSEJ6T2k4dlpHbGtZMjl0YlMxdFpXUnBZWFJ2Y2k1bGRXUnBMV0ZrYjNKemVYTXVZMjl0SW4wc0luUWlPaUprYlNKOSJ9LCJ0IjoiZG0ifQ';

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