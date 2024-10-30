import { initiateContactAndRoute } from '../services/ContactAndRoutingService';
import { requestContactExchange } from '../services/MediatorService';
import { routeDIDCommMessage } from '../services/RouteDIDCommMessage';
import { Wallet } from '../services/Wallet';
import {
  invalidOutOfBandInvitation,
  validOutOfBandInvitation,
} from '../tests/OOBTestFixtures';

// Silence console errors during tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// Mock services
jest.mock('../services/MediatorService', () => ({
  requestContactExchange: jest.fn(),
}));

jest.mock('../services/RouteDIDCommMessage', () => ({
  routeDIDCommMessage: jest.fn(),
}));

describe('initiateContactAndRoute', () => {
  let wallet: Wallet;
  const identity = 'test-identity';

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('should successfully initiate contact exchange and route DIDComm message', async () => {
    // Arrange
    (requestContactExchange as jest.Mock).mockResolvedValueOnce(undefined);
    (routeDIDCommMessage as jest.Mock).mockResolvedValueOnce(undefined);

    // Act
    await initiateContactAndRoute(wallet, validOutOfBandInvitation, identity);

    // Assert
    expect(requestContactExchange).toHaveBeenCalledWith(
      wallet,
      validOutOfBandInvitation,
      identity,
    );
    expect(routeDIDCommMessage).toHaveBeenCalled();
  });

  it('should handle errors during contact exchange and skip message routing', async () => {
    // Arrange
    (requestContactExchange as jest.Mock).mockRejectedValueOnce(
      new Error('Contact exchange failed'),
    );

    // Act
    await initiateContactAndRoute(wallet, validOutOfBandInvitation, identity);

    // Assert
    expect(requestContactExchange).toHaveBeenCalledWith(
      wallet,
      validOutOfBandInvitation,
      identity,
    );
    expect(routeDIDCommMessage).not.toHaveBeenCalled();
  });

  it('should handle errors during message routing', async () => {
    // Arrange
    (requestContactExchange as jest.Mock).mockResolvedValueOnce(undefined);
    (routeDIDCommMessage as jest.Mock).mockRejectedValueOnce(
      new Error('Routing failed'),
    );

    // Act
    await initiateContactAndRoute(wallet, validOutOfBandInvitation, identity);

    // Assert
    expect(requestContactExchange).toHaveBeenCalledWith(
      wallet,
      validOutOfBandInvitation,
      identity,
    );
    expect(routeDIDCommMessage).toHaveBeenCalled();
  });

  it('should not proceed with invalid OutOfBandInvitation', async () => {
    // Arrange
    (requestContactExchange as jest.Mock).mockResolvedValueOnce(undefined);
    (routeDIDCommMessage as jest.Mock).mockResolvedValueOnce(undefined);

    // Act
    await initiateContactAndRoute(wallet, invalidOutOfBandInvitation, identity);

    // Assert
    expect(requestContactExchange).toHaveBeenCalledWith(
      wallet,
      invalidOutOfBandInvitation,
      identity,
    );
    expect(routeDIDCommMessage).not.toHaveBeenCalled();
  });
});
