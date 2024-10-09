import { processOOBInvitation } from '../services/ProcessOOBInvitation';
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';

describe('processOOBInvitation', () => {
  it('should return a DIDCommMessage from a valid OOB invitation', () => {
    const invitation: OutOfBandInvitation = {
      '@id': 'invitation-id',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      services: [
        {
          id: 'did:example:123456789abcdefghi',
          type: 'did-communication',
          serviceEndpoint: 'http://example.com/endpoint',
          recipientKeys: ['did:example:123456789abcdefghi#key-1'],
          routingKeys: ['did:example:123456789abcdefghi#key-2'],
        },
      ],
    };

    const didCommMessage = processOOBInvitation(invitation);

    expect(didCommMessage).not.toBeNull();
    expect(didCommMessage?.type).toBe(
      'https://didcomm.org/out-of-band/1.0/invitation',
    );
    expect(didCommMessage?.from).toBe('did:example:123456789abcdefghi#key-1');
  });

  it('should return null for an invalid OOB invitation', () => {
    const invitation: OutOfBandInvitation = {
      '@id': 'invitation-id',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      services: [],
    };

    const didCommMessage = processOOBInvitation(invitation);

    expect(didCommMessage).toBeNull();
  });
});
