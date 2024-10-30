import axios from 'axios';
import { requestContactExchange } from '../services/MediatorService';
import { Wallet } from '../services/Wallet';
import {
  validContact,
  validOutOfBandInvitation,
} from '../tests/OOBTestFixtures';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('requestContactExchange', () => {
  it('should successfully exchange contact and add to wallet', async () => {
    const wallet = new Wallet();
    const oobInvitation = validOutOfBandInvitation;
    const identity = 'test-identity';
    // Mock the fetch response
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      data: validContact,
    } as unknown as Response;
    // Spy on the fetch function
    jest.spyOn(axios, 'post').mockResolvedValue(response);
    // Call the function
    await requestContactExchange(wallet, oobInvitation, identity);
    // Restore the fetch spy
    jest.restoreAllMocks();
    // Expect the contact to be added to the wallet
    expect(wallet.getContacts(identity)).toContainEqual({
      id: validContact.id,
      from: validContact.from, // Corrected here
      type: validContact.type,
    });
  });

  it('should throw an error if the response is not OK', async () => {
    const wallet = new Wallet();
    const oobInvitation = validOutOfBandInvitation;
    const identity = 'test-identity';

    // Mock the fetch response
    const response = {
      ok: false,
      statusText: 'Error message',
    } as Response;

    // Spy on the fetch function
    jest.spyOn(axios, 'post').mockResolvedValue(response);

    // Call the function
    await expect(
      requestContactExchange(wallet, oobInvitation, identity),
    ).rejects.toThrow();
  });

  it('should throw an error if the response data is invalid', async () => {
    const wallet = new Wallet();
    const oobInvitation = validOutOfBandInvitation;
    const identity = 'test-identity';

    // Mock the fetch response
    const response = {
      ok: true,
      json: async () => ({}),
    } as Response;

    // Spy on the fetch function
    jest.spyOn(axios, 'post').mockResolvedValue(response);

    // Call the function
    await expect(
      requestContactExchange(wallet, oobInvitation, identity),
    ).rejects.toThrow();
  });
});
