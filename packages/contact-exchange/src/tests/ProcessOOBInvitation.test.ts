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

  it('should return a DIDComm message for a valid OOB invitation URL', () => {
    const didCommMessage = processOOBInvitation(validEncodedUrl);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(
      'https://didcomm.org/out-of-band/2.0/invitation',
    );
    expect(didCommMessage?.from).toBe('did:example:123456789abcdefghi#key-1');
  });
});
