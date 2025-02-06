import nock from 'nock';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import { Message as MessageModel } from '@adorsys-gis/message-service';
import { MessageExchangeEvent } from '../../events';
import { MessageExchangeService } from '../../../index';

import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';

import {
  aliceDid,
  eventBus,
  generateIdentity,
  waitForEvent,
} from '../../../protocols/__tests__/helpers';

describe('MessageExchangeService', () => {
  const secretPinNumber = 1234;
  const messageExchangeService = new MessageExchangeService(
    eventBus,
    secretPinNumber,
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should route messages successfully', async () => {
    /// Prepare

    const message = 'Hello, World!';
    const recipientDid = aliceDid;
    const senderDid = await generateIdentity(secretPinNumber);
    nock('https://mediator.rootsid.cloud').post('/').reply(202);

    /// Act

    const channel = waitForEvent(MessageExchangeEvent.RouteForwardMessages);

    messageExchangeService.routeForwardMessage(
      message,
      recipientDid,
      senderDid,
    );

    const { status, payload: messageModel } =
      (await channel) as ServiceResponse<MessageModel>;

    /// Assert

    expect(status).toEqual(ServiceResponseStatus.Success);
    expect(messageModel).toEqual(
      expect.objectContaining({
        text: message,
        sender: senderDid,
        contactId: recipientDid,
        direction: 'out',
      }),
    );
  });

  test('should report errors reliably', async () => {
    /// Prepare

    const message = 'Hello, World!';
    const recipientDid = aliceDid;

    // The wallet cannot retrieve secrets with wrong secret PIN
    const wrongSecretPinNumber = secretPinNumber + 1;
    const senderDid = await generateIdentity(wrongSecretPinNumber);

    /// Act

    const channel = waitForEvent(MessageExchangeEvent.RouteForwardMessages);

    messageExchangeService.routeForwardMessage(
      message,
      recipientDid,
      senderDid,
    );

    const { status, payload: error } =
      (await channel) as ServiceResponse<Error>;

    /// Assert

    expect(status).toEqual(ServiceResponseStatus.Error);
    expect(error.message).toEqual(
      'Repository failure while retrieving private keys for senderDid',
    );
  });
});
