import { parseOOBInvitation } from '../services/OOBParser';
import { processOOBInvitation } from '../services/ProcessOOBInvitation';
import {
  invalidEncodedUrl,
  validEncodedUrl,
  validOutOfBandInvitation,
} from './OOBTestFixtures';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('processOOBInvitation', () => {
  it('should return a valid DIDCommMessage from a valid OOB invitation', () => {
    const didCommMessage = processOOBInvitation(validOutOfBandInvitation);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(validOutOfBandInvitation.type);
    expect(didCommMessage?.from).toBe('');
    expect(didCommMessage?.to).toEqual([]);
    expect(didCommMessage?.body).toEqual(validOutOfBandInvitation.body);
    expect(typeof didCommMessage?.created_time).toBe('string');
    expect(didCommMessage?.id).toBe(validOutOfBandInvitation.id);
    expect(didCommMessage?.serviceId).toBe('');
  });

  it('should return a valid DIDCommMessage from a valid encoded URL', () => {
    const didCommMessage = processOOBInvitation(validEncodedUrl);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(validOutOfBandInvitation.type);
    expect(didCommMessage?.from).toBe('');
    expect(didCommMessage?.body).toEqual(validOutOfBandInvitation.body);
    expect(didCommMessage?.to).toEqual([]);
    expect(typeof didCommMessage?.created_time).toBe('string');
    expect(didCommMessage?.id).toBe(validOutOfBandInvitation.id);
    expect(didCommMessage?.serviceId).toBe('');
  });

  it('should return null for an invalid encoded URL', () => {
    const didCommMessage = processOOBInvitation(invalidEncodedUrl);

    expect(didCommMessage).toBeNull();
  });

  it('should process a valid OOB invitation and return a valid DIDCommMessage', () => {
    const url = validEncodedUrl;
    const invitation = parseOOBInvitation(url);

    const didCommMessage = invitation && processOOBInvitation(invitation);

    if (didCommMessage) {
      expect(didCommMessage).not.toBeNull();
      expect(didCommMessage?.type).toBe(invitation?.type);
      expect(didCommMessage?.from).toBe('');
      expect(didCommMessage?.to).toEqual([]);
      expect(didCommMessage?.body).toEqual(invitation?.body);
      expect(typeof didCommMessage?.created_time).toBe('string');
      expect(didCommMessage?.id).toBe(invitation?.id);
      expect(didCommMessage?.serviceId).toBe('');
    } else {
      // Handle the case where invitation is null
      expect(invitation).toBeNull();
    }
  });
});
