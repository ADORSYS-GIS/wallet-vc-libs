import axios from 'axios';
import { DIDCommMessage } from '../services/DIDCommOOBInvitation';
import { routeDIDCommMessage } from '../services/RouteDIDCommMessage';

jest.mock('axios');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('routeDIDCommMessage', () => {
  const validMessage: DIDCommMessage = {
    serviceId: 'serviceId',
    id: 'id',
    type: 'type',
    from: 'from',
    to: ['to'],
    created_time: 'created_time',
    body: {
      goal: 'goal',
      goal_code: 'goal_code',
      accept: 'accept',
    },
    attachments: [],
  };

  it('should successfully route the message to the mediator', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      data: 'Message successfully routed to mediator.',
    };

    jest
      .spyOn(axios, 'post')
      .mockImplementation(() => Promise.resolve(mockResponse));

    const consoleSpy = jest.spyOn(console, 'log');

    await routeDIDCommMessage(validMessage);

    expect(axios.post).toHaveBeenCalledWith(`https://mediator.rootsid.cloud`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessage),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Message successfully routed to mediator.',
    );
  });

  it('should throw an error if the response status is not OK', async () => {
    const mockResponse = {
      status: 404,
      statusText: 'Bad Request',
    };

    jest
      .spyOn(axios, 'post')
      .mockImplementation(() => Promise.resolve(mockResponse));

    const consoleSpy = jest.spyOn(console, 'error');

    await expect(routeDIDCommMessage(validMessage)).rejects.toThrow(
      'Failed to route message: Bad Request',
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error routing message:',
      expect.stringContaining('Bad Request'),
    );
  });
});
