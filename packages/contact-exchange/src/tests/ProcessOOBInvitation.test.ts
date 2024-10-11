// processOOBInvitation.test.ts
import { processOOBInvitation } from '../services/ProcessOOBInvitation';
import { validEncodedUrl, validOutOfBandInvitation } from './OOBTestFixtures';

describe('processOOBInvitation', () => {
  it('should return a valid DIDCommMessage from a valid OOB invitation', () => {
    const didCommMessage = processOOBInvitation(validOutOfBandInvitation);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(
      'https://didcomm.org/out-of-band/2.0/invitation',
    );
    expect(didCommMessage?.from).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should return a valid DIDComm message from a valid OOB invitation URL', () => {
    const result = processOOBInvitation(validEncodedUrl);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('https://didcomm.org/out-of-band/2.0/invitation');
    expect(result?.from).toBe('did:example:123456789abcdefghi#key-1');
  });
});
