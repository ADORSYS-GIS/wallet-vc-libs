import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import * as didcomm from 'didcomm';
import nock from 'nock';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { MessagePickupEvent } from '../../events';
import { MessagePickupService } from '../MessagePickupService';
import {
  aliceDidTest,
  aliceMessagingDIDTest,
  eventBus,
  mediatorDidTest,
  responseFromDeliveryRequest,
  responseFromMessageReceived,
  responseFromStatusRequest,
  secretsTest,
  waitForEvent,
} from './helpers';

// Helper to create a mock Message object
const createMockMessage = (messageData: {
  id: string;
  typ: string;
  type: string;
  body: any;
  from?: string;
  to: string[];
  created_time: number;
  attachments?: any[];
}): didcomm.Message => ({
  as_value: () => ({ ...messageData }),
  pack_encrypted: vi.fn().mockResolvedValue(['encrypted', {}]),
  pack_plaintext: vi.fn().mockResolvedValue('plaintext'),
  try_parse_forward: vi.fn().mockResolvedValue(null),
  pack_signed: vi.fn().mockResolvedValue(['signed', {}]),
  free: vi.fn(),
});

// Helper to create a mock UnpackMetadata object
const createMockMetadata = (): didcomm.UnpackMetadata => ({
  encrypted: true,
  authenticated: true,
  non_repudiation: false,
  anonymous_sender: false,
  re_wrapped_in_forward: false,
  sign_from: '', // Changed from undefined to empty string
});

describe('MessagePickupService', () => {
  const secretPinNumber = 1234;

  const messagePickupService = new MessagePickupService(
    eventBus,
    secretPinNumber,
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    vi.restoreAllMocks();
  });

  test('should process status request successfully', async () => {
    /// Prepare
    const mockRetrievalOfSecrets = vi
      .spyOn(
        (messagePickupService as any)['messagePickup'],
        'retrieveSenderDidSecrets',
      )
      .mockResolvedValue(secretsTest);

    vi.spyOn(didcomm.Message, 'unpack')
      .mockResolvedValueOnce([
        createMockMessage({
          id: 'status-id',
          typ: 'application/didcomm-plain+json',
          type: 'https://didcomm.org/messagepickup/2.0/status',
          body: { message_count: 2 },
          from: mediatorDidTest,
          to: [aliceDidTest],
          created_time: Math.round(Date.now() / 1000),
        }),
        createMockMetadata(),
      ])
      .mockResolvedValueOnce([
        createMockMessage({
          id: 'delivery-id',
          typ: 'application/didcomm-plain+json',
          type: 'https://didcomm.org/messagepickup/2.0/delivery',
          body: {},
          from: mediatorDidTest,
          to: [aliceDidTest],
          created_time: Math.round(Date.now() / 1000),
          attachments: [
            {
              id: 'attach-1',
              data: {
                base64: Buffer.from(
                  JSON.stringify({ content: 'Hello' }),
                ).toString('base64'),
              },
            },
          ],
        }),
        createMockMetadata(),
      ])
      .mockResolvedValueOnce([
        createMockMessage({
          id: 'msg-1',
          typ: 'application/didcomm-plain+json',
          type: 'https://didcomm.org/basicmessage/2.0/message',
          body: { content: 'Hello' },
          from: 'did:peer:sender',
          to: [aliceMessagingDIDTest],
          created_time: Math.round(Date.now() / 1000),
        }),
        createMockMetadata(),
      ]);

    vi.spyOn(
      (messagePickupService as any)['messagePickup'].messageRepository,
      'create',
    ).mockResolvedValue({
      id: 'msg-1',
      text: 'Hello',
      sender: 'did:peer:sender',
      contactId: aliceMessagingDIDTest,
      timestamp: new Date(),
      direction: 'in',
    });

    nock('https://mediator.socious.io')
      .post(/.*/)
      .once()
      .reply(200, responseFromMessageReceived)
      .post(/.*/)
      .once()
      .reply(200, responseFromDeliveryRequest)
      .post(/.*/)
      .once()
      .reply(200, responseFromStatusRequest); // First request

    /// Act
    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

    const expectedResponse = {
      status: ServiceResponseStatus.Success,
      payload: 'Messages retrieved and stored successfully',
    };

    /// Assert
    expect(eventData).toEqual(expectedResponse);
    expect(mockRetrievalOfSecrets).toHaveBeenCalledTimes(3);
    expect(mockRetrievalOfSecrets).toHaveBeenCalledWith(aliceDidTest);
    expect(mockRetrievalOfSecrets).toHaveBeenCalledWith(aliceMessagingDIDTest);
  });

  test('should fail because there is no mock of private keys', async () => {
    const mockRetrievalOfSecrets = vi
      .spyOn(
        (messagePickupService as any)['messagePickup'],
        'retrieveSenderDidSecrets',
      )
      .mockRejectedValue(new Error('Inexistent private keys for senderDid'));

    nock('https://mediator.socious.io')
      .post(/.*/)
      .once()
      .reply(404, 'not found');

    /// Act
    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

    /// Assert
    const actual = eventData as {
      status: ServiceResponseStatus;
      payload: unknown;
    };
    expect(actual.status).toEqual(ServiceResponseStatus.Error);
    if (actual.payload instanceof Error) {
      expect(actual.payload.toString()).toEqual(
        'Error: Inexistent private keys for senderDid',
      );
    }
  });

  test('should fail because mediator is down', async () => {
    const mockRetrievalOfSecrets = vi
      .spyOn(
        (messagePickupService as any)['messagePickup'],
        'retrieveSenderDidSecrets',
      )
      .mockResolvedValue(secretsTest);

    nock('https://mediator.socious.io')
      .post(/.*/)
      .once()
      .reply(404, 'not found');

    /// Act
    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

    /// Assert
    const actual = eventData as {
      status: ServiceResponseStatus;
      payload: unknown;
    };
    expect(actual.status).toEqual(ServiceResponseStatus.Error);
    if (actual.payload instanceof Error) {
      expect(actual.payload.toString()).toEqual(
        'Error: Failed to send message: Not Found - not found',
      );
    }
  });
});
