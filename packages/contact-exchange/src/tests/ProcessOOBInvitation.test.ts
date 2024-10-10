// processOOBInvitation.test.ts
import { processOOBInvitation } from '../services/ProcessOOBInvitation';
import { parseOOBInvitation } from '../services/OOBParser';
import {
  validOutOfBandInvitation,
  validEncodedUrl,
  invalidEncodedUrl,
} from '../services/OOBTestFixtures';

describe('processOOBInvitation', () => {
  it('should return a valid DIDCommMessage from a valid OOB invitation', () => {
    const didCommMessage = processOOBInvitation(validOutOfBandInvitation);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(
      'https://didcomm.org/out-of-band/2.0/invitation',
    );
    expect(didCommMessage?.from).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should parse a valid OOB invitation URL and return the invitation', () => {
    const result = parseOOBInvitation(validEncodedUrl);
    expect(result).not.toBeNull();
    expect(result?.invitation['@cid']).toBe('Invitation-ID');
  });

  it('should return null for an invalid URL', () => {
    const result = parseOOBInvitation(invalidEncodedUrl);
    expect(result).toBeNull();
  });
});
