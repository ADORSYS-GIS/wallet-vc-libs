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
  pack_encrypted: vi
    .fn()
    .mockResolvedValue([
      `encrypted-${messageData.type}`,
      { to_kids: ['key-1'] },
    ]),
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
  sign_from: '',
});

describe('MessagePickupService', () => {
  const secretPinNumber = 1234;

  const messagePickupService = new MessagePickupService(
    eventBus,
    secretPinNumber,
  );

  beforeAll(() => {
    nock.disableNetConnect();
    // Mock pack_encrypted globally
    vi.spyOn(didcomm.Message.prototype, 'pack_encrypted').mockImplementation(
      function (this: didcomm.Message) {
        const type = this.as_value().type;
        console.log('Mocked pack_encrypted called with type:', type); // Debug log
        return Promise.resolve([
          `encrypted-${type}`,
          { to_kids: ['key-1'] },
        ] as [string, didcomm.PackEncryptedMetadata]);
      },
    );
  });

  afterEach(() => {
    nock.cleanAll();
    vi.restoreAllMocks();
  });

  test('should process status request successfully', async () => {
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
          type: 'https://didcomm.org/messagepickup/3.0/status',
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
          type: 'https://didcomm.org/messagepickup/3.0/delivery',
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
      .post(
        /.*/,
        'encrypted-https://didcomm.org/messagepickup/3.0/status-request',
      )
      .reply(200, responseFromStatusRequest)
      .post(
        /.*/,
        'encrypted-https://didcomm.org/messagepickup/3.0/delivery-request',
      )
      .reply(200, responseFromDeliveryRequest)
      .post(
        /.*/,
        'encrypted-https://didcomm.org/messagepickup/3.0/messages-received',
      )
      .reply(200, responseFromMessageReceived);

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

    nock('https://mediator.socious.io').post(/.*/).reply(404, 'not found');

    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

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

    nock('https://mediator.socious.io').post(/.*/).reply(404, 'not found');

    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

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

  test('should fail when acknowledgment does not result in message deletion', async () => {
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
          type: 'https://didcomm.org/messagepickup/3.0/status',
          body: { message_count: 1 },
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
          type: 'https://didcomm.org/messagepickup/3.0/delivery',
          body: {},
          from: mediatorDidTest,
          to: [aliceDidTest],
          created_time: Math.round(Date.now() / 1000),
          attachments: [
            {
              id: 'attach-1',
              data: {
                base64: Buffer.from(
                  JSON.stringify({ content: 'Test message' }),
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
          body: { content: 'Test message' },
          from: 'did:peer:sender',
          to: [aliceMessagingDIDTest],
          created_time: Math.round(Date.now() / 1000),
        }),
        createMockMetadata(),
      ])
      .mockResolvedValueOnce([
        createMockMessage({
          id: 'ack-response-id',
          typ: 'application/didcomm-plain+json',
          type: 'https://didcomm.org/messagepickup/3.0/status',
          body: { remaining: ['attach-1'] },
          from: mediatorDidTest,
          to: [aliceDidTest],
          created_time: Math.round(Date.now() / 1000),
        }),
        createMockMetadata(),
      ]);

    vi.spyOn(
      (messagePickupService as any)['messagePickup'].messageRepository,
      'create',
    ).mockResolvedValue({
      id: 'msg-1',
      text: 'Test message',
      sender: 'did:peer:sender',
      contactId: aliceMessagingDIDTest,
      timestamp: new Date(),
      direction: 'in',
    });

    console.log('Setting up nock for status-request');
    nock('https://mediator.socious.io')
      .post(/.*/, (body) => {
        console.log('Status request body:', body);
        return true; // Match any body
      })
      .reply(200, responseFromStatusRequest);

    console.log('Setting up nock for delivery-request');
    nock('https://mediator.socious.io')
      .post(/.*/, (body) => {
        console.log('Delivery request body:', body);
        return true; // Match any body
      })
      .reply(200, responseFromDeliveryRequest);

    console.log('Setting up nock for messages-received');
    nock('https://mediator.socious.io')
      .post(/.*/, (body) => {
        console.log('Ack request body:', body);
        return true; // Match any body
      })
      .reply(200, (uri, requestBody) => {
        const response = {
          id: 'ack-response-id',
          type: 'https://didcomm.org/messagepickup/3.0/status',
          body: { remaining: ['attach-1'] },
        };
        console.log('Ack response sent:', response);
        return response;
      });

    const channel = waitForEvent(MessagePickupEvent.MessagePickup);

    console.log('Calling receiveMessages');
    await messagePickupService.receiveMessages(
      mediatorDidTest,
      aliceDidTest,
      aliceMessagingDIDTest,
    );
    const eventData = await channel;

    console.log('Event data received:', eventData);

    const actual = eventData as {
      status: ServiceResponseStatus;
      payload: unknown;
    };
    expect(actual.status).toEqual(ServiceResponseStatus.Error);
    if (actual.payload instanceof Error) {
      expect(actual.payload.toString()).toContain(
        'Mediator did not delete message attach-1',
      );
    }
    expect(mockRetrievalOfSecrets).toHaveBeenCalledTimes(3);
  });
});
